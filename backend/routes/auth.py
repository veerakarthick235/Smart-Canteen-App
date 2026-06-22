import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, verify_jwt_in_request
import models.user as user_model
from utils.password import hash_password, verify_password
from middleware.auth_middleware import jwt_required_custom, get_current_user_id

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
VALID_DEPARTMENTS = {
    "CSE", "ECE", "EEE", "ME", "CE", "IT", "MBA", "MCA",
    "Civil", "Architecture", "Pharmacy", "BCA", "BSc", "Administration"
}
VALID_YEARS = {"1st Year", "2nd Year", "3rd Year", "4th Year", "PG", "N/A"}


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Request body is required"}), 400

        # Validate required fields
        required = ["fullName", "email", "studentId", "department", "year", "password"]
        for field in required:
            if not data.get(field) or not str(data[field]).strip():
                return jsonify({"success": False, "message": f"{field} is required"}), 400

        full_name = data["fullName"].strip()
        email = data["email"].strip().lower()
        student_id = data["studentId"].strip().upper()
        department = data["department"].strip()
        year = data["year"].strip()
        password = data["password"]

        # Validate email format
        if not EMAIL_RE.match(email):
            return jsonify({"success": False, "message": "Invalid email format"}), 400

        # Validate password strength
        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

        # Validate full name
        if len(full_name) < 2:
            return jsonify({"success": False, "message": "Full name must be at least 2 characters"}), 400

        # Check duplicate email
        if user_model.find_by_email(email):
            return jsonify({"success": False, "message": "Email already registered"}), 409

        # Check duplicate student ID
        if user_model.find_by_student_id(student_id):
            return jsonify({"success": False, "message": "Student ID already registered"}), 409

        # Hash password and create user
        password_hash = hash_password(password)
        user = user_model.create_user(
            full_name=full_name,
            email=email,
            student_id=student_id,
            department=department,
            year=year,
            password_hash=password_hash,
            role="student",
        )

        # Generate JWT
        access_token = create_access_token(
            identity=user["_id"],
            additional_claims={
                "role": "student",
                "email": email,
                "fullName": full_name,
                "studentId": student_id,
            }
        )

        return jsonify({
            "success": True,
            "message": "Registration successful",
            "data": {
                "token": access_token,
                "user": user,
            }
        }), 201

    except Exception as e:
        return jsonify({"success": False, "message": "Registration failed", "error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Request body is required"}), 400

        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        # Find user (includes passwordHash)
        user_raw = user_model.find_by_email(email)
        if not user_raw:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        # Verify password
        if not verify_password(password, user_raw.get("passwordHash", "")):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        user_id = str(user_raw["_id"])
        role = user_raw.get("role", "student")

        access_token = create_access_token(
            identity=user_id,
            additional_claims={
                "role": role,
                "email": user_raw["email"],
                "fullName": user_raw["fullName"],
                "studentId": user_raw.get("studentId", ""),
            }
        )

        # Serialize user (strips passwordHash)
        safe_user = user_model.find_by_id(user_id)

        return jsonify({
            "success": True,
            "message": "Login successful",
            "data": {
                "token": access_token,
                "user": safe_user,
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Login failed", "error": str(e)}), 500


@auth_bp.route("/me", methods=["GET"])
@jwt_required_custom
def get_me():
    try:
        user_id = get_current_user_id()
        user = user_model.find_by_id(user_id)
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        return jsonify({"success": True, "data": user}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to get profile", "error": str(e)}), 500


@auth_bp.route("/me", methods=["PUT"])
@jwt_required_custom
def update_me():
    try:
        user_id = get_current_user_id()
        data = request.get_json() or {}
        updated = user_model.update_user(user_id, data)
        return jsonify({"success": True, "message": "Profile updated", "data": updated}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Update failed", "error": str(e)}), 500

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask import current_app

@auth_bp.route("/google", methods=["POST"])
def google_login():
    try:
        data = request.get_json()
        token = data.get("credential")
        if not token:
            return jsonify({"success": False, "message": "Missing Google credential"}), 400

        client_id = current_app.config.get("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)

        email = idinfo.get("email").lower().strip()
        full_name = idinfo.get("name", "Google User")

        user_raw = user_model.find_by_email(email)
        if not user_raw:
            user_raw = user_model.create_user(
                full_name=full_name,
                email=email,
                role="student"
            )

        user_id = str(user_raw["_id"])
        role = user_raw.get("role", "student")

        access_token = create_access_token(
            identity=user_id,
            additional_claims={
                "role": role,
                "email": user_raw["email"],
                "fullName": user_raw["fullName"],
                "studentId": user_raw.get("studentId", ""),
            }
        )

        safe_user = user_model.find_by_id(user_id)

        return jsonify({
            "success": True,
            "message": "Google login successful",
            "data": {
                "token": access_token,
                "user": safe_user,
            }
        }), 200

    except ValueError:
        return jsonify({"success": False, "message": "Invalid Google token"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": "Google login failed", "error": str(e)}), 500
