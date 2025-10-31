#!/usr/bin/env python3
"""
Database Cleanup Script for Bano Fresh
Keeps: users and main_categories
Removes: Everything else (purchases, sales, waste, pieces, etc.)
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def clear_database():
    """Clear all collections except users and main_categories"""
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("❌ Error: MONGO_URL or DB_NAME not found in environment")
        return
    
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Collections to KEEP (will not be deleted)
        keep_collections = ['users', 'main_categories']
        
        # Get all collection names
        all_collections = await db.list_collection_names()
        
        print(f"\n📋 Collections found in database '{db_name}':")
        for coll in all_collections:
            status = "✅ KEEP" if coll in keep_collections else "🗑️  DELETE"
            print(f"  {status}: {coll}")
        
        # Ask for confirmation
        print(f"\n⚠️  WARNING: This will DELETE all data except users and main_categories!")
        confirm = input("Type 'YES' to confirm deletion: ")
        
        if confirm != 'YES':
            print("❌ Operation cancelled")
            return
        
        # Delete data from collections (except the ones we want to keep)
        deleted_collections = []
        for collection_name in all_collections:
            if collection_name not in keep_collections:
                count_before = await db[collection_name].count_documents({})
                result = await db[collection_name].delete_many({})
                deleted_collections.append(f"  - {collection_name}: {result.deleted_count} documents")
                print(f"✅ Cleared {collection_name} ({result.deleted_count} documents)")
        
        # Summary
        print(f"\n✅ Database cleanup complete!")
        print(f"\n📊 Summary:")
        print(f"  Kept collections: {', '.join(keep_collections)}")
        print(f"  Cleared collections:")
        for item in deleted_collections:
            print(item)
        
        # Show remaining data counts
        print(f"\n📈 Remaining data:")
        for coll in keep_collections:
            count = await db[coll].count_documents({})
            print(f"  - {coll}: {count} documents")
    
    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(clear_database())
