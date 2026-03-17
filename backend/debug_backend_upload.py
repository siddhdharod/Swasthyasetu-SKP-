import sys
import os
import asyncio
import io

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import Config
from services.cloudinary_service import upload_file
import cloudinary

async def debug_upload():
    print(f"--- Backend Diagnostics ---")
    print(f"Cloud Name: {Config.CLOUDINARY_CLOUD_NAME}")
    print(f"API Key: {Config.CLOUDINARY_API_KEY}")
    print(f"API Secret: {Config.CLOUDINARY_API_SECRET}")
    print(f"Cloudinary URL: {Config.CLOUDINARY_URL}")
    
    print("\nTesting Cloudinary configuration...")
    # The service layer already calls cloudinary.config() on import, but we can check values
    print(f"Current Config Cloud Name: {cloudinary.config().cloud_name}")
    
    print("\nAttempting upload...")
    test_content = b"debug test content " + os.urandom(8)
    url = await upload_file(test_content, "debug_test_file")
    
    if url:
        print(f"SUCCESS: {url}")
    else:
        print("FAILED: upload_file returned None. Check server logs for DEBUG statements.")

if __name__ == "__main__":
    asyncio.run(debug_upload())
