import cloudinary
import cloudinary.uploader
from config import Config

cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET
)

async def upload_file(file_content, filename: str):
    try:
        result = cloudinary.uploader.upload(file_content, public_id=filename, resource_type="auto")
        return result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None

async def delete_file(public_id: str):
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False
