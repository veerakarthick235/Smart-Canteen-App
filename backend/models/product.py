from datetime import datetime, timezone
from bson import ObjectId
from db import get_db

VALID_CATEGORIES = {"Food", "Beverages", "Stationery"}


def _serialize(doc: dict) -> dict:
    if doc is None:
        return None
    d = dict(doc)
    d["_id"] = str(d["_id"])
    if "createdAt" in d and isinstance(d["createdAt"], datetime):
        d["createdAt"] = d["createdAt"].isoformat()
    return d


def create_product(name: str, category: str, description: str,
                   price: float, stock: int, image: str = "") -> dict:
    db = get_db()
    doc = {
        "name": name.strip(),
        "category": category,
        "description": description.strip(),
        "price": float(price),
        "stock": int(stock),
        "image": image,
        "isActive": True,
        "createdAt": datetime.now(timezone.utc),
    }
    result = db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def find_all(category: str = None, search: str = None,
             page: int = 1, limit: int = 20) -> tuple[list, int]:
    db = get_db()
    query = {"isActive": True}
    if category and category in VALID_CATEGORIES:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    skip = (page - 1) * limit
    cursor = db.products.find(query).sort("name", 1).skip(skip).limit(limit)
    total = db.products.count_documents(query)
    return [_serialize(p) for p in cursor], total


def find_by_id(product_id: str) -> dict | None:
    db = get_db()
    try:
        doc = db.products.find_one({"_id": ObjectId(product_id), "isActive": True})
        return _serialize(doc)
    except Exception:
        return None


def find_by_id_raw(product_id: str) -> dict | None:
    """Find without isActive filter (for admin)."""
    db = get_db()
    try:
        doc = db.products.find_one({"_id": ObjectId(product_id)})
        return _serialize(doc)
    except Exception:
        return None


def update_product(product_id: str, updates: dict) -> dict | None:
    db = get_db()
    allowed_fields = {"name", "category", "description", "price", "stock", "image", "isActive"}
    safe_updates = {k: v for k, v in updates.items() if k in allowed_fields}
    if not safe_updates:
        return find_by_id(product_id)
    try:
        db.products.update_one({"_id": ObjectId(product_id)}, {"$set": safe_updates})
        return find_by_id_raw(product_id)
    except Exception:
        return None


def delete_product(product_id: str) -> bool:
    """Soft delete."""
    db = get_db()
    try:
        result = db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"isActive": False}}
        )
        return result.modified_count > 0
    except Exception:
        return False


def update_stock(product_id: str, quantity_delta: int) -> bool:
    """Decrement stock atomically. Returns False if insufficient stock."""
    db = get_db()
    try:
        result = db.products.update_one(
            {"_id": ObjectId(product_id), "stock": {"$gte": abs(quantity_delta)}},
            {"$inc": {"stock": quantity_delta}}
        )
        return result.modified_count > 0
    except Exception:
        return False


def find_by_category(category: str) -> list:
    db = get_db()
    cursor = db.products.find({"category": category, "isActive": True})
    return [_serialize(p) for p in cursor]
