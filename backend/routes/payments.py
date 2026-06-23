import uuid
from flask import Blueprint, request, jsonify, current_app
import models.product as product_model
import models.order as order_model
import models.user as user_model
from middleware.auth_middleware import jwt_required_custom, get_current_user_id
from utils.razorpay_client import create_order as create_razorpay_order, verify_signature as verify_razorpay_signature
from utils.qr_generator import generate_qr_code

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("/create-order", methods=["POST"])
@jwt_required_custom
def create_order():
    """
    Create a Razorpay order for checkout.
    Validates products, checks stock, calculates total.
    """
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data or not data.get("items"):
            return jsonify({"success": False, "message": "Items are required"}), 400

        items_input = data["items"]
        if not isinstance(items_input, list) or len(items_input) == 0:
            return jsonify({"success": False, "message": "Items must be a non-empty list"}), 400

        # Validate and build order items
        order_items = []
        total_amount = 0.0

        for item in items_input:
            product_id = item.get("productId", "").strip()
            try:
                quantity = int(item.get("quantity", 0))
            except (ValueError, TypeError):
                return jsonify({"success": False, "message": "Invalid quantity"}), 400

            if not product_id:
                return jsonify({"success": False, "message": "productId is required for each item"}), 400
            if quantity <= 0:
                return jsonify({"success": False, "message": f"Quantity must be positive for product {product_id}"}), 400

            product = product_model.find_by_id(product_id)
            if not product:
                return jsonify({"success": False, "message": f"Product {product_id} not found"}), 404

            if product["stock"] < quantity:
                return jsonify({
                    "success": False,
                    "message": f"Insufficient stock for '{product['name']}'. Available: {product['stock']}"
                }), 400

            subtotal = product["price"] * quantity
            total_amount += subtotal

            order_items.append({
                "productId": product_id,
                "name": product["name"],
                "category": product["category"],
                "price": product["price"],
                "quantity": quantity,
                "subtotal": round(subtotal, 2),
                "image": product.get("image", "")
            })

        # Get user details
        user = user_model.find_by_id(user_id)
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        # Create Razorpay order (amount in paise)
        amount_in_paise = int(round(total_amount * 100))
        receipt = f"receipt_{uuid.uuid4().hex[:12]}"

        razorpay_order = create_razorpay_order(
            amount_in_paise=amount_in_paise,
            receipt=receipt,
        )

        # Create pending order in DB
        user_details = {
            "fullName": user["fullName"],
            "email": user["email"],
            "studentId": user.get("studentId", ""),
            "department": user.get("department", ""),
            "year": user.get("year", ""),
        }

        order = order_model.create_order(
            user_id=user_id,
            user_details=user_details,
            items=order_items,
            total_amount=round(total_amount, 2),
            razorpay_order_id=razorpay_order["id"],
        )

        return jsonify({
            "success": True,
            "message": "Order created",
            "data": {
                "orderId": order["_id"],
                "razorpayOrderId": razorpay_order["id"],
                "amount": amount_in_paise,
                "currency": "INR",
                "totalAmount": round(total_amount, 2),
                "keyId": current_app.config.get("RAZORPAY_KEY_ID", ""),
            }
        }), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to create order", "error": str(e)}), 500


@payments_bp.route("/verify", methods=["POST"])
@jwt_required_custom
def verify_payment():
    """
    Verify Razorpay payment signature.
    On success: generate UUID token, generate QR code, mark order as paid.
    """
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "Request body is required"}), 400

        required_fields = ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature", "order_id"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "message": f"{field} is required"}), 400

        razorpay_order_id = data["razorpay_order_id"]
        razorpay_payment_id = data["razorpay_payment_id"]
        razorpay_signature = data["razorpay_signature"]
        order_id = data["order_id"]

        # Fetch the order and ensure it belongs to the requesting user
        order = order_model.find_by_id(order_id)
        if not order:
            return jsonify({"success": False, "message": "Order not found"}), 404
        if order.get("userId") != user_id:
            return jsonify({"success": False, "message": "Access denied"}), 403
        if order.get("status") != "pending":
            return jsonify({"success": False, "message": "Order is already processed"}), 400

        # Verify Razorpay signature (HMAC-SHA256)
        is_valid = verify_razorpay_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )

        if not is_valid:
            # Mark order as cancelled on signature failure
            order_model.update_status(order_id, "cancelled")
            return jsonify({"success": False, "message": "Payment verification failed. Invalid signature."}), 400

        # Decrement stock for each item
        for item in order.get("items", []):
            product_model.update_stock(item["productId"], -item["quantity"])

        # Generate QR token and code
        qr_token = str(uuid.uuid4())
        qr_code_base64 = generate_qr_code(qr_token)

        # Update order: paid + QR info
        updated_order = order_model.set_payment_info(
            order_id=order_id,
            payment_id=razorpay_payment_id,
            qr_token=qr_token,
            qr_code_base64=qr_code_base64,
        )

        return jsonify({
            "success": True,
            "message": "Payment verified successfully",
            "data": updated_order,
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Payment verification failed", "error": str(e)}), 500
