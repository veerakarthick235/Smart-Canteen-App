from flask import Blueprint, request, jsonify
import models.order as order_model
from middleware.auth_middleware import admin_required

qr_bp = Blueprint("qr", __name__)


@qr_bp.route("/scan", methods=["POST"])
@admin_required
def scan_qr():
    """
    Admin scans QR code to collect an order.
    Uses atomic findOneAndUpdate to prevent duplicate collection.
    """
    try:
        data = request.get_json()
        if not data or not data.get("token"):
            return jsonify({"success": False, "message": "QR token is required"}), 400

        token = data["token"].strip()
        if not token:
            return jsonify({"success": False, "message": "Token cannot be empty"}), 400

        result = order_model.atomic_collect(token)

        if result["success"]:
            order = result["order"]
            return jsonify({
                "success": True,
                "errorCode": None,
                "message": "Order collected successfully",
                "data": {
                    "order": order,
                    "student": order.get("userDetails", {}),
                    "items": order.get("items", []),
                    "totalAmount": order.get("totalAmount"),
                    "paymentId": order.get("paymentId"),
                    "collectedAt": order.get("collectedAt"),
                }
            }), 200
        else:
            error_code = result["error_code"]
            http_status = 400

            if error_code == "INVALID_QR_CODE":
                http_status = 404
            elif error_code == "ALREADY_COLLECTED":
                http_status = 409
            elif error_code == "PAYMENT_NOT_COMPLETED":
                http_status = 402

            response_data = {
                "success": False,
                "errorCode": error_code,
                "message": result["message"],
            }
            if result.get("order"):
                response_data["data"] = result["order"]

            return jsonify(response_data), http_status

    except Exception as e:
        return jsonify({"success": False, "message": "QR scan failed", "error": str(e)}), 500
