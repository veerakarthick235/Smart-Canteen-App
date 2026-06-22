import urllib.request
import json
import time

products = [
    # Food
    {"name": "Veg Samosa", "category": "Food", "description": "Crispy pastry filled with spiced potatoes.", "price": 15, "stock": 50},
    {"name": "Vada Pav", "category": "Food", "description": "Classic Mumbai street food.", "price": 20, "stock": 50},
    {"name": "Masala Dosa", "category": "Food", "description": "Crispy rice crepe stuffed with potato filling.", "price": 40, "stock": 30},
    {"name": "Idli Sambhar", "category": "Food", "description": "Steamed rice cakes served with lentil soup.", "price": 30, "stock": 40},
    {"name": "Bread Pakora", "category": "Food", "description": "Bread slices dipped in gram flour batter.", "price": 15, "stock": 40},
    {"name": "Veg Sandwich", "category": "Food", "description": "Fresh vegetables layered between bread slices.", "price": 25, "stock": 30},
    {"name": "Grilled Cheese Sandwich", "category": "Food", "description": "Toasted sandwich with melted cheese.", "price": 35, "stock": 30},
    {"name": "Veg Burger", "category": "Food", "description": "Vegetarian patty with lettuce and tomato.", "price": 45, "stock": 25},
    {"name": "French Fries", "category": "Food", "description": "Crispy golden fried potato strips.", "price": 40, "stock": 30},
    {"name": "Paneer Puff", "category": "Food", "description": "Flaky pastry filled with spicy paneer.", "price": 25, "stock": 40},
    {"name": "Veg Puff", "category": "Food", "description": "Flaky pastry filled with mixed vegetables.", "price": 15, "stock": 50},
    {"name": "Maggi Noodles", "category": "Food", "description": "Instant noodles cooked with masala.", "price": 25, "stock": 50},
    {"name": "Cheese Maggi", "category": "Food", "description": "Hot Maggi noodles topped with cheese.", "price": 35, "stock": 40},
    {"name": "Chole Bhature", "category": "Food", "description": "Spicy chickpea curry with fried flatbreads.", "price": 50, "stock": 20},
    {"name": "Pav Bhaji", "category": "Food", "description": "Mashed vegetable curry with soft rolls.", "price": 45, "stock": 25},
    {"name": "Poha", "category": "Food", "description": "Flattened rice cooked with onions and peanuts.", "price": 20, "stock": 40},
    {"name": "Upma", "category": "Food", "description": "Savory semolina porridge.", "price": 20, "stock": 30},
    {"name": "Aloo Paratha", "category": "Food", "description": "Flatbread stuffed with mashed potatoes.", "price": 30, "stock": 30},
    {"name": "Gobi Paratha", "category": "Food", "description": "Flatbread stuffed with grated cauliflower.", "price": 30, "stock": 25},
    {"name": "Veg Fried Rice", "category": "Food", "description": "Stir-fried rice with mixed vegetables.", "price": 45, "stock": 20},
    {"name": "Veg Manchurian", "category": "Food", "description": "Fried vegetable balls in spicy gravy.", "price": 45, "stock": 20},
    {"name": "Chana Masala", "category": "Food", "description": "Spicy and tangy chickpea curry.", "price": 30, "stock": 25},
    {"name": "Veg Thali (Mini)", "category": "Food", "description": "Mini meal with rice, dal, and chapati.", "price": 50, "stock": 15},
    {"name": "Onion Pakoda", "category": "Food", "description": "Crispy deep-fried onion fritters.", "price": 20, "stock": 40},
    {"name": "Mixed Veg Roll", "category": "Food", "description": "Spicy mixed vegetables wrapped in flatbread.", "price": 35, "stock": 30},

    # Beverages
    {"name": "Hot Tea", "category": "Beverages", "description": "Classic hot tea brewed with milk.", "price": 10, "stock": 100},
    {"name": "Masala Chai", "category": "Beverages", "description": "Hot tea brewed with Indian spices.", "price": 15, "stock": 100},
    {"name": "Hot Coffee", "category": "Beverages", "description": "Instant hot coffee with milk.", "price": 15, "stock": 100},
    {"name": "Cold Coffee", "category": "Beverages", "description": "Chilled blended coffee with milk.", "price": 35, "stock": 40},
    {"name": "Lemon Tea", "category": "Beverages", "description": "Refreshing black tea with lemon.", "price": 15, "stock": 50},
    {"name": "Green Tea", "category": "Beverages", "description": "Healthy hot green tea.", "price": 15, "stock": 50},
    {"name": "Sweet Lassi", "category": "Beverages", "description": "Sweetened yogurt-based drink.", "price": 25, "stock": 30},
    {"name": "Salted Lassi", "category": "Beverages", "description": "Salted and spiced yogurt drink.", "price": 20, "stock": 30},
    {"name": "Buttermilk", "category": "Beverages", "description": "Spiced thin yogurt drink.", "price": 15, "stock": 50},
    {"name": "Fresh Lime Soda", "category": "Beverages", "description": "Soda mixed with fresh lemon juice.", "price": 20, "stock": 40},
    {"name": "Nimbu Pani", "category": "Beverages", "description": "Traditional Indian lemonade.", "price": 15, "stock": 50},
    {"name": "Orange Juice", "category": "Beverages", "description": "Freshly squeezed orange juice.", "price": 40, "stock": 20},
    {"name": "Mosambi Juice", "category": "Beverages", "description": "Freshly squeezed sweet lime juice.", "price": 40, "stock": 20},
    {"name": "Mango Milkshake", "category": "Beverages", "description": "Thick milkshake made with mango.", "price": 45, "stock": 25},
    {"name": "Banana Milkshake", "category": "Beverages", "description": "Energy-boosting banana milkshake.", "price": 35, "stock": 30},
    {"name": "Vanilla Milkshake", "category": "Beverages", "description": "Classic vanilla flavored milkshake.", "price": 40, "stock": 30},
    {"name": "Chocolate Milkshake", "category": "Beverages", "description": "Rich chocolate milkshake.", "price": 45, "stock": 25},
    {"name": "Strawberry Milkshake", "category": "Beverages", "description": "Sweet strawberry milkshake.", "price": 45, "stock": 25},
    {"name": "Bottled Water (500ml)", "category": "Beverages", "description": "Packaged drinking water.", "price": 10, "stock": 200},
    {"name": "Coca Cola (250ml)", "category": "Beverages", "description": "Chilled soft drink.", "price": 20, "stock": 100},
    {"name": "Sprite (250ml)", "category": "Beverages", "description": "Chilled soft drink.", "price": 20, "stock": 100},
    {"name": "Thums Up (250ml)", "category": "Beverages", "description": "Chilled soft drink.", "price": 20, "stock": 100},
    {"name": "Fanta (250ml)", "category": "Beverages", "description": "Chilled soft drink.", "price": 20, "stock": 100},
    {"name": "Frooti", "category": "Beverages", "description": "Mango flavored juice drink.", "price": 15, "stock": 80},
    {"name": "Mazza", "category": "Beverages", "description": "Mango fruit drink.", "price": 15, "stock": 80},

    # Stationery
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
    {"name": "Geometry Box", "category": "Stationery", "description": "Mathematical drawing instruments.", "price": 50, "stock": 30},
    {"name": "A4 Notebook (100 Pages)", "category": "Stationery", "description": "Ruled notebook with 100 pages.", "price": 30, "stock": 100},
    {"name": "A4 Notebook (200 Pages)", "category": "Stationery", "description": "Ruled notebook with 200 pages.", "price": 50, "stock": 100},
    {"name": "Small Notepad", "category": "Stationery", "description": "Pocket-sized spiral notepad.", "price": 15, "stock": 120},
    {"name": "Rough Record Book", "category": "Stationery", "description": "Hardbound book for rough notes.", "price": 40, "stock": 50},
    {"name": "Practical Record Book", "category": "Stationery", "description": "One-side ruled practical book.", "price": 50, "stock": 40},
    {"name": "Graph Paper Pad", "category": "Stationery", "description": "Pad containing standard graph papers.", "price": 20, "stock": 60},
    {"name": "Highlighters (Pack of 2)", "category": "Stationery", "description": "Fluorescent highlighters.", "price": 30, "stock": 40},
    {"name": "Whiteboard Marker (Black)", "category": "Stationery", "description": "Dry erase black marker.", "price": 25, "stock": 50},
    {"name": "Whiteboard Marker (Blue)", "category": "Stationery", "description": "Dry erase blue marker.", "price": 25, "stock": 50},
    {"name": "Correction Pen", "category": "Stationery", "description": "Fluid correction pen.", "price": 20, "stock": 80},
    {"name": "Glue Stick", "category": "Stationery", "description": "Paper adhesive glue stick.", "price": 15, "stock": 100},
    {"name": "Fevicol", "category": "Stationery", "description": "White synthetic resin adhesive.", "price": 10, "stock": 100},
    {"name": "Cello Tape", "category": "Stationery", "description": "Transparent adhesive tape.", "price": 10, "stock": 150},
    {"name": "Sticky Notes", "category": "Stationery", "description": "Yellow self-adhesive notes.", "price": 35, "stock": 60},
]

# 1. Login as admin
login_data = json.dumps({"email": "admin@college.edu", "password": "admin"}).encode()
req = urllib.request.Request('http://localhost:5000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        token = res["data"]["token"]
except Exception as e:
    print("Login failed:", e)
    exit(1)

print("Logged in successfully. Inserting products...")

# 2. Insert products one by one
success_count = 0
for p in products:
    p_data = json.dumps(p).encode()
    preq = urllib.request.Request('http://localhost:5000/api/products', data=p_data, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    })
    try:
        with urllib.request.urlopen(preq) as presp:
            if presp.status == 201:
                success_count += 1
    except Exception as e:
        print("Failed to insert", p["name"], str(e))
        pass
    # small delay to not overwhelm the server
    time.sleep(0.1)

print(f"Successfully inserted {success_count} products!")
