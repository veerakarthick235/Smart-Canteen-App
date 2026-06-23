from datetime import datetime, timezone
from bson import ObjectId
from db import get_db

VALID_STATUSES = {"pending", "paid", "completed", "cancelled"}


def _serialize(doc: dict) -> dict:
    if doc is None:
        return None
    d = dict(doc)
    d["_id"] = str(d["_id"])
    if "userId" in d and isinstance(d["userId"], ObjectId):
        d["userId"] = str(d["userId"])
    for field in ("createdAt", "collectedAt"):
        if field in d and isinstance(d[field], datetime):
            d[field] = d[field].isoformat()
            
    # Dynamically attach product image to items if not present
    if "items" in d and d["items"]:
        try:
            from db import get_db
            db = get_db()
            product_ids = [ObjectId(item["productId"]) for item in d["items"] if "productId" in item and "image" not in item]
            if product_ids:
                products = list(db.products.find({"_id": {"$in": product_ids}}, {"image": 1}))
                img_map = {str(p["_id"]): p.get("image", "") for p in products}
                for item in d["items"]:
                    if "image" not in item and "productId" in item:
                        item["image"] = img_map.get(str(item["productId"]), "")
        except Exception:
            pass
            
    return d


def create_order(user_id: str, user_details: dict, items: list,
                 total_amount: float, razorpay_order_id: str) -> dict:
    db = get_db()
    doc = {
        "userId": ObjectId(user_id),
        "userDetails": user_details,        # {fullName, email, studentId, department, year}
        "items": items,                      # [{productId, name, category, price, quantity, subtotal}]
        "totalAmount": float(total_amount),
        "razorpayOrderId": razorpay_order_id,
        "status": "pending",
        "createdAt": datetime.now(timezone.utc),
        "collectedAt": None,
    }
    result = db.orders.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def find_by_id(order_id: str) -> dict | None:
    db = get_db()
    try:
        doc = db.orders.find_one({"_id": ObjectId(order_id)})
        return _serialize(doc)
    except Exception:
        return None


def find_by_user_id(user_id: str, page: int = 1, limit: int = 10) -> tuple[list, int]:
    db = get_db()
    query = {"userId": ObjectId(user_id)}
    skip = (page - 1) * limit
    cursor = db.orders.find(query, {"qrCode": 0}).sort("createdAt", -1).skip(skip).limit(limit)
    total = db.orders.count_documents(query)
    return [_serialize(o) for o in cursor], total


def find_by_qr_token(token: str) -> dict | None:
    db = get_db()
    doc = db.orders.find_one({"qrToken": token})
    return _serialize(doc)


def find_all(status: str = None, search: str = None,
             page: int = 1, limit: int = 20) -> tuple[list, int]:
    db = get_db()
    query = {}
    if status and status in VALID_STATUSES:
        query["status"] = status
    if search:
        query["$or"] = [
            {"userDetails.fullName": {"$regex": search, "$options": "i"}},
            {"userDetails.studentId": {"$regex": search, "$options": "i"}},
            {"userDetails.email": {"$regex": search, "$options": "i"}},
        ]
    skip = (page - 1) * limit
    cursor = db.orders.find(query, {"qrCode": 0}).sort("createdAt", -1).skip(skip).limit(limit)
    total = db.orders.count_documents(query)
    return [_serialize(o) for o in cursor], total


def update_status(order_id: str, status: str, extra_fields: dict = None) -> dict | None:
    db = get_db()
    if status not in VALID_STATUSES:
        return None
    update = {"$set": {"status": status}}
    if extra_fields:
        update["$set"].update(extra_fields)
    try:
        db.orders.update_one({"_id": ObjectId(order_id)}, update)
        return find_by_id(order_id)
    except Exception:
        return None


def set_payment_info(order_id: str, payment_id: str,
                     qr_token: str, qr_code_base64: str) -> dict | None:
    """Mark order as paid and attach QR token and code."""
    db = get_db()
    try:
        db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {
                "status": "paid",
                "paymentId": payment_id,
                "qrToken": qr_token,
                "qrCode": qr_code_base64,
            }}
        )
        return find_by_id(order_id)
    except Exception:
        return None


def atomic_collect(token: str) -> dict:
    """
    Atomically collect an order via QR token.
    Uses findOneAndUpdate with status='paid' filter to prevent race conditions.
    Returns: {success, order, error_code, message}
    """
    db = get_db()

    # First check if token exists at all
    existing = db.orders.find_one({"qrToken": token})
    if existing is None:
        return {
            "success": False,
            "error_code": "INVALID_QR_CODE",
            "message": "QR code is invalid or not found",
            "order": None,
        }

    existing_status = existing.get("status")

    if existing_status == "completed":
        return {
            "success": False,
            "error_code": "ALREADY_COLLECTED",
            "message": "Items have already been collected for this order",
            "order": _serialize(existing),
        }

    if existing_status in ("pending", "cancelled"):
        return {
            "success": False,
            "error_code": "PAYMENT_NOT_COMPLETED",
            "message": "Payment has not been completed for this order",
            "order": None,
        }

    # Atomically update: only succeeds if status is still 'paid'
    now = datetime.now(timezone.utc)
    updated = db.orders.find_one_and_update(
        {"qrToken": token, "status": "paid"},
        {"$set": {"status": "completed", "collectedAt": now}},
        return_document=True,
    )

    if updated is None:
        # Race condition: another request already collected it
        return {
            "success": False,
            "error_code": "ALREADY_COLLECTED",
            "message": "Items have already been collected for this order",
            "order": None,
        }

    return {
        "success": True,
        "error_code": None,
        "message": "Order collected successfully",
        "order": _serialize(updated),
    }


def get_dashboard_stats() -> dict:
    db = get_db()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    pipeline_revenue = [
        {"$match": {"status": {"$in": ["paid", "completed"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}},
    ]
    revenue_result = list(db.orders.aggregate(pipeline_revenue))
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    total_orders = db.orders.count_documents({})
    today_orders = db.orders.count_documents({"createdAt": {"$gte": today_start}})
    paid_orders = db.orders.count_documents({"status": "paid"})
    completed_orders = db.orders.count_documents({"status": "completed"})
    pending_orders = db.orders.count_documents({"status": "pending"})
    cancelled_orders = db.orders.count_documents({"status": "cancelled"})

    return {
        "totalRevenue": round(total_revenue, 2),
        "totalOrders": total_orders,
        "todayOrders": today_orders,
        "paidOrders": paid_orders,
        "completedOrders": completed_orders,
        "pendingOrders": pending_orders,
        "cancelledOrders": cancelled_orders,
    }


def get_revenue_analytics(days: int = 30) -> list:
    """Return daily revenue for last N days."""
    db = get_db()
    from datetime import timedelta
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    pipeline = [
        {"$match": {
            "status": {"$in": ["paid", "completed"]},
            "createdAt": {"$gte": start_date},
        }},
        {"$group": {
            "_id": {
                "year": {"$year": "$createdAt"},
                "month": {"$month": "$createdAt"},
                "day": {"$dayOfMonth": "$createdAt"},
            },
            "revenue": {"$sum": "$totalAmount"},
            "orders": {"$sum": 1},
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}},
    ]
    result = list(db.orders.aggregate(pipeline))
    return [
        {
            "date": f"{r['_id']['year']}-{r['_id']['month']:02d}-{r['_id']['day']:02d}",
            "revenue": round(r["revenue"], 2),
            "orders": r["orders"],
        }
        for r in result
    ]


def get_top_products(limit: int = 10) -> list:
    """Return top N most ordered products by quantity."""
    db = get_db()
    pipeline = [
        {"$match": {"status": {"$in": ["paid", "completed"]}}},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.productId",
            "name": {"$first": "$items.name"},
            "category": {"$first": "$items.category"},
            "totalQuantity": {"$sum": "$items.quantity"},
            "totalRevenue": {"$sum": "$items.subtotal"},
        }},
        {"$sort": {"totalQuantity": -1}},
        {"$limit": limit},
    ]
    return list(db.orders.aggregate(pipeline))


def get_category_sales() -> list:
    """Return sales breakdown by category."""
    db = get_db()
    pipeline = [
        {"$match": {"status": {"$in": ["paid", "completed"]}}},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.category",
            "totalRevenue": {"$sum": "$items.subtotal"},
            "totalOrders": {"$sum": 1},
            "totalQuantity": {"$sum": "$items.quantity"},
        }},
        {"$sort": {"totalRevenue": -1}},
    ]
    result = list(db.orders.aggregate(pipeline))
    return [{"category": r["_id"], "revenue": round(r["totalRevenue"], 2),
             "orders": r["totalOrders"], "quantity": r["totalQuantity"]} for r in result]
