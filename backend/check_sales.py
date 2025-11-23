from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import asyncio

load_dotenv('.env')

async def check_sales():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]

    # Get one sale to check the format
    sales = await db.pos_sales.find({}).limit(3).to_list(3)

    if sales:
        print("Sample sales found:")
        for sale in sales:
            print(f"\nSale ID: {sale.get('id')}")
            print(f"Sale Date Type: {type(sale.get('sale_date'))}")
            print(f"Sale Date Value: {sale.get('sale_date')}")
            print(f"Created At Type: {type(sale.get('created_at'))}")
            print(f"Created At Value: {sale.get('created_at')}")
    else:
        print("No sales found in database")

    await client.close()

asyncio.run(check_sales())
