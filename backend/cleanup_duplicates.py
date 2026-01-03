"""
One-time script to cleanup duplicate expense types in MongoDB
Run this with: python cleanup_duplicates.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME = "bano_meat_inventory"

async def cleanup_duplicates():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]

    print("🔍 Fetching all expense types...")
    all_types = await db.expense_types.find({}, {"_id": 0}).to_list(length=None)
    print(f"   Found {len(all_types)} expense types")

    # Group by name
    types_by_name = {}
    for expense_type in all_types:
        name = expense_type["name"]
        if name not in types_by_name:
            types_by_name[name] = []
        types_by_name[name].append(expense_type)

    # Find and remove duplicates
    deleted_count = 0
    kept_types = []

    print("\n🧹 Cleaning up duplicates...")
    for name, types_list in types_by_name.items():
        if len(types_list) > 1:
            # Sort by created_at to keep the oldest
            types_list.sort(key=lambda x: x["created_at"])
            # Keep the first (oldest), delete the rest
            kept_types.append(types_list[0])
            print(f"   '{name}': Found {len(types_list)} duplicates, keeping oldest")
            for duplicate in types_list[1:]:
                await db.expense_types.delete_one({"id": duplicate["id"]})
                deleted_count += 1
                print(f"      ❌ Deleted duplicate (id: {duplicate['id'][:8]}...)")
        else:
            kept_types.append(types_list[0])

    print(f"\n✅ Cleanup completed!")
    print(f"   Deleted: {deleted_count} duplicates")
    print(f"   Remaining: {len(kept_types)} unique expense types")

    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_duplicates())
