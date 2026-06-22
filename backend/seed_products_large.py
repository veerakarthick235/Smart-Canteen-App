import sys
from datetime import datetime, timezone
import random

# Ensure we can import from the backend directory
from db import get_db

def seed_products():
    db = get_db()
    if db is None:
        print("[ERROR] Could not connect to database.")
        sys.exit(1)

    print("Connected to database. Seeding products...")

    products = [
        # Food (25 items)
        {"name": "Veg Samosa", "category": "Food", "description": "Crispy pastry filled with spiced potatoes and peas.", "price": 15, "stock": 50},
        {"name": "Vada Pav", "category": "Food", "description": "Classic Mumbai street food - spicy potato filling deep fried in gram flour batter.", "price": 20, "stock": 50},
        {"name": "Masala Dosa", "category": "Food", "description": "Crispy rice crepe stuffed with spiced potato filling.", "price": 40, "stock": 30},
        {"name": "Idli Sambhar", "category": "Food", "description": "Steamed rice cakes served with hot lentil soup.", "price": 30, "stock": 40},
        {"name": "Bread Pakora", "category": "Food", "description": "Bread slices dipped in spiced gram flour batter and deep fried.", "price": 15, "stock": 40},
        {"name": "Veg Sandwich", "category": "Food", "description": "Fresh vegetables layered between bread slices with mint chutney.", "price": 25, "stock": 30},
        {"name": "Grilled Cheese Sandwich", "category": "Food", "description": "Toasted sandwich with melted cheese and spices.", "price": 35, "stock": 30},
        {"name": "Veg Burger", "category": "Food", "description": "Vegetarian patty with lettuce, tomato, and mayo in a soft bun.", "price": 45, "stock": 25},
        {"name": "French Fries", "category": "Food", "description": "Crispy golden fried potato strips salted to perfection.", "price": 40, "stock": 30},
        {"name": "Paneer Puff", "category": "Food", "description": "Flaky pastry filled with spicy paneer tikka mix.", "price": 25, "stock": 40},
        {"name": "Veg Puff", "category": "Food", "description": "Flaky pastry filled with mixed vegetables.", "price": 15, "stock": 50},
        {"name": "Maggi Noodles", "category": "Food", "description": "Everyone's favorite instant noodles cooked with masala.", "price": 25, "stock": 50},
        {"name": "Cheese Maggi", "category": "Food", "description": "Hot Maggi noodles topped with melted cheese.", "price": 35, "stock": 40},
        {"name": "Chole Bhature", "category": "Food", "description": "Spicy chickpea curry served with fried flatbreads.", "price": 50, "stock": 20},
        {"name": "Pav Bhaji", "category": "Food", "description": "Mashed vegetable curry served with soft buttery bread rolls.", "price": 45, "stock": 25},
        {"name": "Poha", "category": "Food", "description": "Flattened rice cooked with onions, peanuts, and spices.", "price": 20, "stock": 40},
        {"name": "Upma", "category": "Food", "description": "Savory semolina porridge cooked with vegetables.", "price": 20, "stock": 30},
        {"name": "Aloo Paratha", "category": "Food", "description": "Whole wheat flatbread stuffed with spiced mashed potatoes.", "price": 30, "stock": 30},
        {"name": "Gobi Paratha", "category": "Food", "description": "Whole wheat flatbread stuffed with spiced grated cauliflower.", "price": 30, "stock": 25},
        {"name": "Veg Fried Rice", "category": "Food", "description": "Stir-fried rice with mixed vegetables and soy sauce.", "price": 45, "stock": 20},
        {"name": "Veg Manchurian", "category": "Food", "description": "Deep fried vegetable balls in a spicy soy-based gravy.", "price": 45, "stock": 20},
        {"name": "Chana Masala", "category": "Food", "description": "Spicy and tangy chickpea curry.", "price": 30, "stock": 25},
        {"name": "Veg Thali (Mini)", "category": "Food", "description": "Mini meal with rice, dal, one vegetable curry, and chapati.", "price": 50, "stock": 15},
        {"name": "Onion Pakoda", "category": "Food", "description": "Crispy deep-fried onion fritters.", "price": 20, "stock": 40},
        {"name": "Mixed Veg Roll", "category": "Food", "description": "Spicy mixed vegetables wrapped in a soft flatbread.", "price": 35, "stock": 30},

        # Beverages (25 items)
        {"name": "Hot Tea", "category": "Beverages", "description": "Classic Indian hot tea brewed with milk.", "price": 10, "stock": 100},
        {"name": "Masala Chai", "category": "Beverages", "description": "Hot tea brewed with aromatic Indian spices.", "price": 15, "stock": 100},
        {"name": "Hot Coffee", "category": "Beverages", "description": "Instant hot coffee with milk and sugar.", "price": 15, "stock": 100},
        {"name": "Cold Coffee", "category": "Beverages", "description": "Chilled blended coffee with milk and ice.", "price": 35, "stock": 40},
        {"name": "Lemon Tea", "category": "Beverages", "description": "Refreshing black tea with a dash of lemon.", "price": 15, "stock": 50},
        {"name": "Green Tea", "category": "Beverages", "description": "Healthy hot green tea.", "price": 15, "stock": 50},
        {"name": "Sweet Lassi", "category": "Beverages", "description": "Sweetened yogurt-based summer drink.", "price": 25, "stock": 30},
        {"name": "Salted Lassi", "category": "Beverages", "description": "Salted and spiced yogurt drink.", "price": 20, "stock": 30},
        {"name": "Buttermilk / Chaas", "category": "Beverages", "description": "Spiced thin yogurt drink, great for digestion.", "price": 15, "stock": 50},
        {"name": "Fresh Lime Soda", "category": "Beverages", "description": "Soda mixed with fresh lemon juice, salt, and sugar.", "price": 20, "stock": 40},
        {"name": "Nimbu Pani", "category": "Beverages", "description": "Traditional Indian lemonade.", "price": 15, "stock": 50},
        {"name": "Orange Juice", "category": "Beverages", "description": "Freshly squeezed orange juice.", "price": 40, "stock": 20},
        {"name": "Mosambi Juice", "category": "Beverages", "description": "Freshly squeezed sweet lime juice.", "price": 40, "stock": 20},
        {"name": "Mango Milkshake", "category": "Beverages", "description": "Thick milkshake made with mango pulp.", "price": 45, "stock": 25},
        {"name": "Banana Milkshake", "category": "Beverages", "description": "Energy-boosting milkshake made with fresh bananas.", "price": 35, "stock": 30},
        {"name": "Vanilla Milkshake", "category": "Beverages", "description": "Classic vanilla flavored milkshake.", "price": 40, "stock": 30},
        {"name": "Chocolate Milkshake", "category": "Beverages", "description": "Rich and creamy chocolate milkshake.", "price": 45, "stock": 25},
        {"name": "Strawberry Milkshake", "category": "Beverages", "description": "Sweet and fruity strawberry milkshake.", "price": 45, "stock": 25},
        {"name": "Bottled Water (500ml)", "category": "Beverages", "description": "Packaged drinking water.", "price": 10, "stock": 200},
        {"name": "Coca Cola (250ml)", "category": "Beverages", "description": "Chilled Coca Cola soft drink.", "price": 20, "stock": 100},
        {"name": "Sprite (250ml)", "category": "Beverages", "description": "Chilled Sprite soft drink.", "price": 20, "stock": 100},
        {"name": "Thums Up (250ml)", "category": "Beverages", "description": "Chilled Thums Up soft drink.", "price": 20, "stock": 100},
        {"name": "Fanta (250ml)", "category": "Beverages", "description": "Chilled Fanta soft drink.", "price": 20, "stock": 100},
        {"name": "Frooti (Small)", "category": "Beverages", "description": "Mango flavored juice drink.", "price": 15, "stock": 80},
        {"name": "Mazza (Small)", "category": "Beverages", "description": "Mango fruit drink.", "price": 15, "stock": 80},

        # Stationery (25 items)
        {"name": "Blue Ball Pen", "category": "Stationery", "description": "Standard blue ballpoint pen.", "price": 5, "stock": 200},
        {"name": "Black Ball Pen", "category": "Stationery", "description": "Standard black ballpoint pen.", "price": 5, "stock": 200},
        {"name": "Red Ball Pen", "category": "Stationery", "description": "Standard red ballpoint pen.", "price": 5, "stock": 100},
        {"name": "Blue Gel Pen", "category": "Stationery", "description": "Smooth writing blue gel pen.", "price": 10, "stock": 150},
        {"name": "Black Gel Pen", "category": "Stationery", "description": "Smooth writing black gel pen.", "price": 10, "stock": 150},
        {"name": "HB Pencil", "category": "Stationery", "description": "Standard HB wooden pencil.", "price": 5, "stock": 300},
        {"name": "Eraser", "category": "Stationery", "description": "Dust-free non-toxic eraser.", "price": 5, "stock": 200},
        {"name": "Sharpener", "category": "Stationery", "description": "Standard pencil sharpener.", "price": 5, "stock": 150},
        {"name": "15cm Plastic Ruler", "category": "Stationery", "description": "Transparent 15cm measurement scale.", "price": 10, "stock": 100},
        {"name": "30cm Plastic Ruler", "category": "Stationery", "description": "Transparent 30cm measurement scale.", "price": 20, "stock": 80},
        {"name": "Geometry Box", "category": "Stationery", "description": "Mathematical drawing instruments box.", "price": 50, "stock": 30},
        {"name": "A4 Notebook (100 Pages)", "category": "Stationery", "description": "A4 size ruled notebook with 100 pages.", "price": 30, "stock": 100},
        {"name": "A4 Notebook (200 Pages)", "category": "Stationery", "description": "A4 size ruled notebook with 200 pages.", "price": 50, "stock": 100},
        {"name": "Small Notepad", "category": "Stationery", "description": "Pocket-sized spiral notepad.", "price": 15, "stock": 120},
        {"name": "Rough Record Book", "category": "Stationery", "description": "Hardbound book for rough notes.", "price": 40, "stock": 50},
        {"name": "Practical Record Book", "category": "Stationery", "description": "One-side ruled practical record book.", "price": 50, "stock": 40},
        {"name": "Graph Paper Pad", "category": "Stationery", "description": "Pad containing standard graph papers.", "price": 20, "stock": 60},
        {"name": "Highlighters (Pack of 2)", "category": "Stationery", "description": "Fluorescent yellow and green highlighters.", "price": 30, "stock": 40},
        {"name": "Whiteboard Marker (Black)", "category": "Stationery", "description": "Dry erase black whiteboard marker.", "price": 25, "stock": 50},
        {"name": "Whiteboard Marker (Blue)", "category": "Stationery", "description": "Dry erase blue whiteboard marker.", "price": 25, "stock": 50},
        {"name": "Correction Pen (Whitener)", "category": "Stationery", "description": "Fluid correction pen.", "price": 20, "stock": 80},
        {"name": "Glue Stick (Small)", "category": "Stationery", "description": "Paper adhesive glue stick.", "price": 15, "stock": 100},
        {"name": "Fevicol (Small)", "category": "Stationery", "description": "White synthetic resin adhesive.", "price": 10, "stock": 100},
        {"name": "Cello Tape (Small)", "category": "Stationery", "description": "Transparent adhesive tape.", "price": 10, "stock": 150},
        {"name": "Sticky Notes (Small)", "category": "Stationery", "description": "Yellow self-adhesive notes.", "price": 35, "stock": 60},
    ]

    count = 0
    now = datetime.now(timezone.utc)
    
    try:
        db.products.delete_many({})
        print("Cleared existing products.")

        for p in products:
            p["isActive"] = True
            p["createdAt"] = now
            p["image"] = ""

        result = db.products.insert_many(products)
        print(f"Successfully seeded {len(result.inserted_ids)} products!")
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_products()
