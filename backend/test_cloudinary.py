import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Check credentials from .env
cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")
cloudinary_url = os.getenv("CLOUDINARY_URL")

print(f"Cloud Name: {cloud_name}")
print(f"API Key: {api_key}")
print(f"API Secret: {'*' * len(api_secret) if api_secret else 'None'}")
print(f"Cloudinary URL: {cloudinary_url}")

# Always use explicit config
cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret,
    secure=True
)

try:
    print("Attempting to upload a test file...")
    # Upload a small pixel
    result = cloudinary.uploader.upload(
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        public_id="test_pixel"
    )
    print("Upload Success!")
    print(f"URL: {result.get('secure_url')}")
except Exception as e:
    print(f"Upload Failed: {str(e)}")
