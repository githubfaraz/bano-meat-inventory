#!/usr/bin/env python3
"""
Minimal MongoDB connection test
"""
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

async def test_connection():
    try:
        mongo_url = os.environ['MONGO_URL']
        print(f"Attempting to connect to MongoDB Atlas...")
        
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=10000)
        db = client[os.environ['DB_NAME']]
        
        # Try to list collections
        print("Trying to list collections...")
        collections = await db.list_collection_names()
        print(f"✅ SUCCESS! Found collections: {collections}")
        
        # Try to count users
        user_count = await db.users.count_documents({})
        print(f"✅ User count: {user_count}")
        
        client.close()
        print("\n✅ MongoDB connection test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ MongoDB connection test FAILED")
        print(f"Error type: {type(e).__name__}")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_connection())
    exit(0 if result else 1)
