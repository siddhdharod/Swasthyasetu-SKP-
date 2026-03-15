from motor.motor_asyncio import AsyncIOMotorClient
from config import Config

client = AsyncIOMotorClient(Config.MONGODB_URI)
db = client.get_database("swasthyasetu")

def get_database():
    return db

# Collections
users_collection = db.get_collection("users")
otp_collection = db.get_collection("otp_codes")
reports_collection = db.get_collection("reports")
claims_collection = db.get_collection("claims")
profile_collection = db.get_collection("profiles")
disease_reports_collection = db.get_collection("disease_reports")
