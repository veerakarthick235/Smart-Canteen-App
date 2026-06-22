from flask import Blueprint, request, jsonify
import models.product as product_model
from middleware.auth_middleware import jwt_required_custom, admin_required

products_bp = Blueprint("products", __name__)

VALID_CATEGORIES = {"Food", "Beverages", "Stationery"}


@products_bp.route("/", methods=["GET"])
def list_products():
    """Public: list products with optional category/search/pagination."""
    try:
        category = request.args.get("category", "").strip()
        search = request.args.get("search", "").strip()
        page = max(1, int(request.args.get("page", 1)))
        limit = min(50, max(1, int(request.args.get("limit", 20))))

        if category and category not in VALID_CATEGORIES:
            category = ""

        products, total = product_model.find_all(
            category=category or None,
            search=search or None,
            page=page,
            limit=limit,
        )

        return jsonify({
            "success": True,
            "data": {
                "products": products,
                "total": total,
                "page": page,
                "limit": limit,
                "totalPages": -(-total // limit),  # ceiling division
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Failed to fetch products", "error": str(e)}), 500


@products_bp.route("/<product_id>", methods=["GET"])
def get_product(product_id: str):
    try:
        product = product_model.find_by_id(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404
        return jsonify({"success": True, "data": product}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to fetch product", "error": str(e)}), 500


@products_bp.route("/", methods=["POST"])
@admin_required
def create_product():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Request body is required"}), 400

        required = ["name", "category", "description", "price", "stock"]
        for field in required:
            if data.get(field) is None or str(data[field]).strip() == "":
                return jsonify({"success": False, "message": f"{field} is required"}), 400

        if data["category"] not in VALID_CATEGORIES:
            return jsonify({"success": False, "message": f"Category must be one of: {', '.join(VALID_CATEGORIES)}"}), 400

        try:
            price = float(data["price"])
            stock = int(data["stock"])
            if price <= 0:
                raise ValueError("Price must be positive")
            if stock < 0:
                raise ValueError("Stock cannot be negative")
        except (ValueError, TypeError) as e:
            return jsonify({"success": False, "message": str(e)}), 400

        product = product_model.create_product(
            name=data["name"],
            category=data["category"],
            description=data["description"],
            price=price,
            stock=stock,
            image=data.get("image", ""),
        )

        return jsonify({"success": True, "message": "Product created", "data": product}), 201

    except Exception as e:
        return jsonify({"success": False, "message": "Failed to create product", "error": str(e)}), 500


@products_bp.route("/<product_id>", methods=["PUT"])
@admin_required
def update_product(product_id: str):
    try:
        data = request.get_json() or {}

        if "category" in data and data["category"] not in VALID_CATEGORIES:
            return jsonify({"success": False, "message": "Invalid category"}), 400

        if "price" in data:
            try:
                data["price"] = float(data["price"])
                if data["price"] <= 0:
                    return jsonify({"success": False, "message": "Price must be positive"}), 400
            except (ValueError, TypeError):
                return jsonify({"success": False, "message": "Invalid price"}), 400

        if "stock" in data:
            try:
                data["stock"] = int(data["stock"])
                if data["stock"] < 0:
                    return jsonify({"success": False, "message": "Stock cannot be negative"}), 400
            except (ValueError, TypeError):
                return jsonify({"success": False, "message": "Invalid stock"}), 400

        updated = product_model.update_product(product_id, data)
        if not updated:
            return jsonify({"success": False, "message": "Product not found"}), 404

        return jsonify({"success": True, "message": "Product updated", "data": updated}), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Failed to update product", "error": str(e)}), 500


@products_bp.route("/<product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id: str):
    try:
        success = product_model.delete_product(product_id)
        if not success:
            return jsonify({"success": False, "message": "Product not found"}), 404
        return jsonify({"success": True, "message": "Product deleted"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to delete product", "error": str(e)}), 500


@products_bp.route("/<product_id>/stock", methods=["PUT"])
@admin_required
def update_stock(product_id: str):
    try:
        data = request.get_json() or {}
        stock = data.get("stock")
        if stock is None:
            return jsonify({"success": False, "message": "stock is required"}), 400
        try:
            stock = int(stock)
            if stock < 0:
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({"success": False, "message": "Invalid stock value"}), 400

        updated = product_model.update_product(product_id, {"stock": stock})
        if not updated:
            return jsonify({"success": False, "message": "Product not found"}), 404
        return jsonify({"success": True, "message": "Stock updated", "data": updated}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to update stock", "error": str(e)}), 500
