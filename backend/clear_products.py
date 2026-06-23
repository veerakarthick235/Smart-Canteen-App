from dotenv import load_dotenv
load_dotenv()
from db import get_db
from utils.cloudinary_helpers import delete_image
import time

db = get_db()
products = list(db.products.find({}))
print(f"Found {len(products)} products to delete.")

deleted_count = 0
for p in products:
    img = p.get('image', '')
    if img and img.startswith('http') and 'res.cloudinary.com' in img:
        try:
            delete_image(img)
            print(f"Deleted Cloudinary image for: {p.get('name')}")
            time.sleep(0.2)
        except Exception as e:
            print(f"Failed to delete image: {e}")
            
    db.products.delete_one({'_id': p['_id']})
    deleted_count += 1
    
print(f"Successfully deleted {deleted_count} products.")
