from datetime import datetime, timezone
from bson import ObjectId
from db import get_db


def _serialize(user: dict) -> dict:
    """Convert MongoDB document to JSON-safe dict."""
    if user is None:
        return None
    u = dict(user)
    u["_id"] = str(u["_id"])
    if "createdAt" in u and isinstance(u["createdAt"], datetime):
        u["createdAt"] = u["createdAt"].isoformat()
    u.pop("passwordHash", None)
    return u

import uuid

def create_user(full_name: str, email: str, student_id: str = "",
                department: str = "N/A", year: str = "N/A", password_hash: str = "", role: str = "student") -> dict:
    db = get_db()
    
    if not student_id:
        student_id = f"G-{uuid.uuid4().hex[:6].upper()}"

    doc = {
        "fullName": full_name,
        "email": email.lower().strip(),
        "studentId": student_id.strip(),
        "department": department,
        "year": year,
        "passwordHash": password_hash,
        "role": role,
        "createdAt": datetime.now(timezone.utc),
    }
    result = db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def find_by_email(email: str) -> dict | None:
    db = get_db()
    return db.users.find_one({"email": email.lower().strip()})


def find_by_id(user_id: str) -> dict | None:
    db = get_db()
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        return _serialize(user)
    except Exception:
        return None


def find_by_student_id(student_id: str) -> dict | None:
    db = get_db()
    return db.users.find_one({"studentId": student_id.strip()})


def update_user(user_id: str, updates: dict) -> dict | None:
    db = get_db()
    allowed = {k: v for k, v in updates.items() if k in ("fullName", "department", "year")}
    if not allowed:
        return find_by_id(user_id)
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": allowed})
    return find_by_id(user_id)


def find_all_students(page: int = 1, limit: int = 20) -> list:
    db = get_db()
    skip = (page - 1) * limit
    cursor = db.users.find({"role": "student"}, {"passwordHash": 0}).skip(skip).limit(limit)
    return [_serialize(u) for u in cursor]


def count_students() -> int:
    db = get_db()
    return db.users.count_documents({"role": "student"})
