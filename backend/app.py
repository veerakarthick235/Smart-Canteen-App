from datetime import timedelta
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
from config import Config

# Mongo is handled via db.py


def create_app(config_class=Config) -> Flask:
    """
    Flask application factory.
    Creates the Flask app, connects to MongoDB, and registers all blueprints.
    """
    global _client, _db

    app = Flask(__name__)
    app.url_map.strict_slashes = False

    # ── Configuration ──────────────────────────────────────────────────────────
    app.config["JWT_SECRET_KEY"] = config_class.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=config_class.JWT_ACCESS_TOKEN_EXPIRES)
    app.config["DEBUG"] = config_class.DEBUG
    app.config["RAZORPAY_KEY_ID"] = config_class.RAZORPAY_KEY_ID
    app.config["RAZORPAY_KEY_SECRET"] = config_class.RAZORPAY_KEY_SECRET

    # ── Extensions ─────────────────────────────────────────────────────────────
    jwt = JWTManager(app)

    CORS(
        app,
        origins=config_class.CORS_ORIGINS,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # ── MongoDB connection ──────────────────────────────────────────────────────
    from db import get_db
    _db = get_db()

    # ── Create MongoDB indexes ─────────────────────────────────────────────────
    if _db is not None:
        try:
            _db.users.create_index("email", unique=True)
            _db.users.create_index("studentId", unique=True)
            _db.orders.create_index("qrToken", unique=True, sparse=True)
            _db.orders.create_index("userId")
            _db.products.create_index("category")
            _db.products.create_index([("name", "text"), ("description", "text")])
        except Exception as e:
            print(f"[WARN] Index creation warning: {e}")

    # ── Register blueprints ────────────────────────────────────────────────────
    from routes.auth import auth_bp
    from routes.products import products_bp
    from routes.orders import orders_bp
    from routes.payments import payments_bp
    from routes.qr import qr_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(qr_bp, url_prefix="/api/qr")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # ── JWT error handlers ─────────────────────────────────────────────────────
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Session expired. Please log in again.", "error": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"success": False, "message": "Invalid authentication token.", "error": "invalid_token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"success": False, "message": "Authorization token is missing.", "error": "authorization_required"}), 401

    # ── Global HTTP error handlers ─────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource not found.", "error": str(e)}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "message": "Internal server error.", "error": str(e)}), 500

    # ── Health check ───────────────────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        db_ok = get_db() is not None
        return jsonify({
            "success": True,
            "message": "Smart Canteen API is running.",
            "version": "1.0.0",
            "db": "connected" if db_ok else "disconnected",
        }), 200

    return app


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    application = create_app(Config)
    application.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
