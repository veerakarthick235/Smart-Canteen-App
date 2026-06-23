from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

dbs_to_test = ["smart_canteen", "test", "smart-canteen", "myFirstDatabase", "canteen"]

for db_name in dbs_to_test:
    try:
        db = client[db_name]
        count = db.products.count_documents({})
        if count > 0:
            print(f"Database '{db_name}' has {count} products.")
    except Exception as e:
        print(f"Error accessing {db_name}: {e}")
