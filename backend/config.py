import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # MongoDB
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/smart_canteen")
    DB_NAME = "smart_canteen"

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds

    # Razorpay
    RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")

    # Flask
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() == "true"
    
    # Google Auth
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

    # CORS — supports comma-separated list of origins
    # e.g. CORS_ORIGIN=http://localhost:5173,http://localhost:5174
    _cors_raw = os.environ.get("CORS_ORIGIN", "http://localhost:5173")
    CORS_ORIGINS = [o.strip() for o in _cors_raw.split(",") if o.strip()]


config = Config()
