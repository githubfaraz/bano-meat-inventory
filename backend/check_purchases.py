"""
Script to check how purchase dates are stored in MongoDB
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import pytz
from dotenv import load_dotenv

async def check_purchases():
    # Load .env file
    load_dotenv()

    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")

    if not mongo_url or not db_name:
        print("ERROR: Environment variables not loaded!")
        print(f"MONGO_URL: {mongo_url}")
        print(f"DB_NAME: {db_name}")
        return

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    # Fetch a few recent purchases
    purchases = await db.inventory_purchases.find({}, {"_id": 0}).sort("purchase_date", -1).limit(3).to_list(3)

    print("=" * 80)
    print("RECENT PURCHASES:")
    print("=" * 80)

    for i, p in enumerate(purchases, 1):
        pd = p.get('purchase_date', 'N/A')
        print(f"\nPurchase #{i}:")
        print(f"  Category: {p.get('main_category_name', 'N/A')}")
        print(f"  Purchase Date: {pd}")
        print(f"  Type: {type(pd).__name__}")
        print(f"  Total Cost: ₹{p.get('total_cost', 0)}")

    # Check for 2026-01-02 purchases
    print("\n" + "=" * 80)
    print("CHECKING FOR 2026-01-02 PURCHASES:")
    print("=" * 80)

    # Try string match
    try:
        query1 = {"purchase_date": {"$regex": "^2026-01-02"}}
        count1 = await db.inventory_purchases.count_documents(query1)
        print(f"String regex match: {count1} purchases")
    except Exception as e:
        print(f"String regex match: Failed ({str(e)})")

    # Try datetime match
    IST = pytz.timezone("Asia/Kolkata")
    start_dt = IST.localize(datetime(2026, 1, 2, 0, 0, 0))
    end_dt = IST.localize(datetime(2026, 1, 2, 23, 59, 59))
    query2 = {"purchase_date": {"$gte": start_dt, "$lte": end_dt}}
    count2 = await db.inventory_purchases.count_documents(query2)
    print(f"Datetime range match: {count2} purchases")

    # Show actual purchases
    if count2 > 0:
        purchases_jan2 = await db.inventory_purchases.find(query2, {"_id": 0}).to_list(10)
        print(f"\nFound {len(purchases_jan2)} purchases on 2026-01-02:")
        for p in purchases_jan2:
            print(f"  - {p.get('main_category_name')}: ₹{p.get('total_cost')} on {p.get('purchase_date')}")

    client.close()

if __name__ == "__main__":
    asyncio.run(check_purchases())
