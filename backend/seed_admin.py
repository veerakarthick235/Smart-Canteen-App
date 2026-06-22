#!/usr/bin/env python3
"""
Seed script: Creates the admin user and sample products.
Run once after setting up the database.
Usage: python seed_admin.py
"""

import os
import sys
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")
if not MONGO_URI:
    print("ERROR: MONGO_URI not set in .env file")
    sys.exit(1)

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("[OK] Connected to MongoDB")
except Exception as e:
    print(f"[ERROR] Cannot connect to MongoDB: {e}")
    print("  Make sure MongoDB is running or check your MONGO_URI in .env")
    sys.exit(1)

db = client["smart_canteen"]

# ── Admin User ──────────────────────────────────────────────────────────────
admin_email = "admin@canteen.com"
existing = db.users.find_one({"email": admin_email})

if existing:
    print(f"[SKIP] Admin already exists: {admin_email}")
else:
    password_hash = bcrypt.hashpw("Admin@123".encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
    db.users.insert_one({
        "fullName": "Canteen Admin",
        "email": admin_email,
        "studentId": "ADMIN001",
        "department": "Administration",
        "year": "N/A",
        "passwordHash": password_hash,
        "role": "admin",
        "createdAt": datetime.now(timezone.utc),
    })
    print(f"[OK] Admin created: {admin_email} / Admin@123")

# ── Sample Products ─────────────────────────────────────────────────────────
sample_products = [
    # Food
    {"name": "Veg Biryani", "category": "Food", "description": "Aromatic basmati rice cooked with fresh vegetables and spices", "price": 80, "stock": 50, "image": "", "isActive": True},
    {"name": "Chicken Biryani", "category": "Food", "description": "Tender chicken pieces cooked with fragrant basmati rice", "price": 120, "stock": 30, "image": "", "isActive": True},
    {"name": "Masala Dosa", "category": "Food", "description": "Crispy dosa served with potato masala, sambar and chutney", "price": 50, "stock": 40, "image": "", "isActive": True},
    {"name": "Idli Sambar", "category": "Food", "description": "Soft steamed idlis served with hot sambar and coconut chutney", "price": 35, "stock": 60, "image": "", "isActive": True},
    {"name": "Veg Fried Rice", "category": "Food", "description": "Wok-tossed rice with mixed vegetables and sauces", "price": 70, "stock": 45, "image": "", "isActive": True},
    {"name": "Chicken Sandwich", "category": "Food", "description": "Grilled chicken with lettuce, tomato in toasted bread", "price": 55, "stock": 25, "image": "", "isActive": True},
    {"name": "Samosa (2 pcs)", "category": "Food", "description": "Crispy pastry filled with spiced potatoes and peas", "price": 20, "stock": 100, "image": "", "isActive": True},
    {"name": "Pav Bhaji", "category": "Food", "description": "Spiced mashed vegetables served with buttered pav bread", "price": 60, "stock": 35, "image": "", "isActive": True},
    # Beverages
    {"name": "Masala Chai", "category": "Beverages", "description": "Traditional Indian spiced milk tea", "price": 15, "stock": 200, "image": "", "isActive": True},
    {"name": "Cold Coffee", "category": "Beverages", "description": "Chilled blended coffee with milk and ice cream", "price": 45, "stock": 80, "image": "", "isActive": True},
    {"name": "Fresh Lime Soda", "category": "Beverages", "description": "Refreshing lime juice with soda water", "price": 25, "stock": 100, "image": "", "isActive": True},
    {"name": "Mango Lassi", "category": "Beverages", "description": "Thick yogurt-based mango drink", "price": 40, "stock": 60, "image": "", "isActive": True},
    {"name": "Mineral Water (500ml)", "category": "Beverages", "description": "Packaged drinking water", "price": 20, "stock": 150, "image": "", "isActive": True},
    {"name": "Fruit Juice (Mixed)", "category": "Beverages", "description": "Freshly squeezed mixed fruit juice", "price": 35, "stock": 70, "image": "", "isActive": True},
    # Stationery
    {"name": "A4 Ruled Notebook", "category": "Stationery", "description": "200-page ruled notebook for college use", "price": 60, "stock": 100, "image": "", "isActive": True},
    {"name": "Ball Point Pen (Pack of 5)", "category": "Stationery", "description": "Smooth writing blue ink pens", "price": 25, "stock": 150, "image": "", "isActive": True},
    {"name": "Highlighter Set (4 colors)", "category": "Stationery", "description": "Fluorescent highlighters for study notes", "price": 45, "stock": 80, "image": "", "isActive": True},
    {"name": "Scientific Calculator", "category": "Stationery", "description": "Casio FX-991 compatible scientific calculator", "price": 350, "stock": 30, "image": "", "isActive": True},
    {"name": "Geometry Box", "category": "Stationery", "description": "Complete geometry set with compass, protractor and scale", "price": 85, "stock": 50, "image": "", "isActive": True},
    {"name": "A4 Graph Sheet (10 pcs)", "category": "Stationery", "description": "Graph sheets for lab records and assignments", "price": 15, "stock": 200, "image": "", "isActive": True},
]

existing_count = db.products.count_documents({})
if existing_count > 0:
    print(f"[SKIP] Products already exist ({existing_count} found). Skipping seed.")
else:
    now = datetime.now(timezone.utc)
    for p in sample_products:
        p["createdAt"] = now
    db.products.insert_many(sample_products)
    print(f"[OK] Created {len(sample_products)} sample products")

# ── Indexes ──────────────────────────────────────────────────────────────────
print("\nCreating indexes...")
try:
    db.users.create_index("email", unique=True)
    db.users.create_index("studentId", unique=True)
    db.orders.create_index("qrToken", unique=True, sparse=True)
    db.orders.create_index("userId")
    db.products.create_index("category")
    db.products.create_index([("name", "text"), ("description", "text")])
    print("[OK] Indexes created")
except Exception as e:
    print(f"[WARN] Index creation: {e}")

print("\n=== Database seeded successfully! ===")
print("  Admin Email   : admin@canteen.com")
print("  Admin Password: Admin@123")
print("\n[IMPORTANT] Change the admin password after first login!")

client.close()
