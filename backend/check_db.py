import sys
import os
import asyncio

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import db, reports_collection

async def check_db():
    print("--- Database Health Check ---")
    try:
        # Check connection
        await db.command("ping")
        print("SUCCESS: MongoDB connection verified.")
        
        # Test write
        test_doc = {"test": "health_check", "time": asyncio.get_event_loop().time()}
        result = await reports_collection.insert_one(test_doc)
        print(f"SUCCESS: Write test passed. Inserted ID: {result.inserted_id}")
        
        # Cleanup
        await reports_collection.delete_one({"_id": result.inserted_id})
        print("SUCCESS: Cleanup passed.")
        
    except Exception as e:
        print(f"FAILED: Database error: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
