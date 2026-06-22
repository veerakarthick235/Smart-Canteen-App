from pymongo import MongoClient
from config import Config

_client = None
_db = None

def get_db():
    """
    Return the MongoDB database instance.
    Lazily connects to the database on first call.
    """
    global _client, _db
    if _db is None:
        try:
            _client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000, tls=True, tlsAllowInvalidCertificates=True)
            _client.admin.command("ping")
            _db = _client[Config.DB_NAME]
            print("[OK] MongoDB lazily connected successfully via get_db()")
        except Exception as e:
            print(f"[ERROR] MongoDB lazy connect failed: {e}")
    return _db
