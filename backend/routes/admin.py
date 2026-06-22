from flask import Blueprint, request, jsonify
import models.order as order_model
import models.user as user_model
from middleware.auth_middleware import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def dashboard():
    """Admin dashboard summary statistics."""
    try:
        stats = order_model.get_dashboard_stats()
        return jsonify({"success": True, "data": stats}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to get dashboard data", "error": str(e)}), 500


@admin_bp.route("/orders", methods=["GET"])
@admin_required
def list_orders():
    """List all orders with optional status filter and search."""
    try:
        status = request.args.get("status", "").strip().lower()
        search = request.args.get("search", "").strip()
        page = max(1, int(request.args.get("page", 1)))
        limit = min(50, max(1, int(request.args.get("limit", 20))))

        orders, total = order_model.find_all(
            status=status or None,
            search=search or None,
            page=page,
            limit=limit,
        )

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


@admin_bp.route("/orders/<order_id>", methods=["GET"])
@admin_required
def get_order(order_id: str):
    """Get full order details."""
    try:
        order = order_model.find_by_id(order_id)
        if not order:
            return jsonify({"success": False, "message": "Order not found"}), 404
        return jsonify({"success": True, "data": order}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to fetch order", "error": str(e)}), 500


@admin_bp.route("/orders/<order_id>/cancel", methods=["PUT"])
@admin_required
def cancel_order(order_id: str):
    """Cancel a pending order."""
    try:
        order = order_model.find_by_id(order_id)
        if not order:
            return jsonify({"success": False, "message": "Order not found"}), 404
        if order["status"] not in ("pending",):
            return jsonify({"success": False, "message": "Only pending orders can be cancelled"}), 400

        updated = order_model.update_status(order_id, "cancelled")
        return jsonify({"success": True, "message": "Order cancelled", "data": updated}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to cancel order", "error": str(e)}), 500


@admin_bp.route("/analytics/revenue", methods=["GET"])
@admin_required
def revenue_analytics():
    """Daily revenue for last 30 days."""
    try:
        days = min(90, max(7, int(request.args.get("days", 30))))
        data = order_model.get_revenue_analytics(days=days)
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to get revenue analytics", "error": str(e)}), 500


@admin_bp.route("/analytics/products", methods=["GET"])
@admin_required
def products_analytics():
    """Top products by quantity ordered."""
    try:
        limit = min(20, max(5, int(request.args.get("limit", 10))))
        data = order_model.get_top_products(limit=limit)
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to get product analytics", "error": str(e)}), 500


@admin_bp.route("/analytics/categories", methods=["GET"])
@admin_required
def categories_analytics():
    """Sales breakdown by category."""
    try:
        data = order_model.get_category_sales()
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to get category analytics", "error": str(e)}), 500


@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    """List all students."""
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(50, max(1, int(request.args.get("limit", 20))))
        students = user_model.find_all_students(page=page, limit=limit)
        total = user_model.count_students()
        return jsonify({
            "success": True,
            "data": {
                "users": students,
                "total": total,
                "page": page,
                "limit": limit,
                "totalPages": -(-total // limit),
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to fetch users", "error": str(e)}), 500
