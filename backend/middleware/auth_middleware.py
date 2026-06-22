from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
import models.user as user_model


def jwt_required_custom(fn):
    """Verify JWT and inject current user into kwargs."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({"success": False, "message": "Authentication required", "error": str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    """Require admin role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != "admin":
                return jsonify({"success": False, "message": "Admin access required"}), 403
        except Exception as e:
            return jsonify({"success": False, "message": "Authentication required", "error": str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper


def student_required(fn):
    """Require student role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != "student":
                return jsonify({"success": False, "message": "Student access required"}), 403
        except Exception as e:
            return jsonify({"success": False, "message": "Authentication required", "error": str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper


def get_current_user_id() -> str:
    """Get the current user's ID from JWT identity."""
    return get_jwt_identity()


def get_current_role() -> str:
    """Get the current user's role from JWT claims."""
    claims = get_jwt()
    return claims.get("role", "")
