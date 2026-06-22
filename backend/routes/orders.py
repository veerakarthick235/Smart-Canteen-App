from flask import Blueprint, request, jsonify
import models.order as order_model
from middleware.auth_middleware import jwt_required_custom, get_current_user_id

orders_bp = Blueprint("orders", __name__)


@orders_bp.route("/my-orders", methods=["GET"])
@jwt_required_custom
def my_orders():
    """Get current student's orders (without QR codes for list view)."""
    try:
        user_id = get_current_user_id()
        page = max(1, int(request.args.get("page", 1)))
        limit = min(20, max(1, int(request.args.get("limit", 10))))
        orders, total = order_model.find_by_user_id(user_id, page=page, limit=limit)
        return jsonify({
            "success": True,
            "data": {
                "orders": orders,
                "total": total,
                "page": page,
                "limit": limit,
                "totalPages": -(-total // limit),
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to fetch orders", "error": str(e)}), 500


@orders_bp.route("/<order_id>", methods=["GET"])
@jwt_required_custom
def get_order(order_id: str):
    """Get single order including QR code (must belong to current user)."""
    try:
        user_id = get_current_user_id()
        order = order_model.find_by_id(order_id)
        if not order:
            return jsonify({"success": False, "message": "Order not found"}), 404

        # Security: ensure order belongs to requesting user
        if order.get("userId") != user_id:
            return jsonify({"success": False, "message": "Access denied"}), 403

        return jsonify({"success": True, "data": order}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to fetch order", "error": str(e)}), 500
