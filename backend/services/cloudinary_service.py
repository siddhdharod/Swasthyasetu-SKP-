import cloudinary
import cloudinary.uploader
from config import Config

# Always use explicit config for better reliability
cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET,
    secure=True
)
print(f"DEBUG: Cloudinary configured for {Config.CLOUDINARY_CLOUD_NAME}")

import asyncio

async def upload_file(file_content, filename: str):
    try:
        # Run blocking upload in a separate thread to keep event loop free
        # Using resource_type="raw" for documents ensures they are served as-is
        result = await asyncio.to_thread(
            cloudinary.uploader.upload, 
            file_content, 
            public_id=filename, 
            resource_type="raw"
        )
        return {
            "secure_url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }
    except Exception as e:
        print(f"DEBUG: Cloudinary upload error: {str(e)}")
        return None

async def delete_file(public_id: str):
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False
