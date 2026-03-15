from fastapi import APIRouter, Depends, HTTPException
from database import profile_collection
from utils.jwt_handler import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ProfileUpdate(BaseModel):
    name: str
    age: int
    dob: str
    mobile: str
    gender: str
    blood_group: str
    allergies: Optional[str] = ""
    diseases: Optional[str] = ""
    medications: Optional[str] = ""
    emergency_contact: str

@router.get("/")
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await profile_collection.find_one({"email": current_user["sub"]})
    if not profile:
        return {"email": current_user["sub"]}
    profile["_id"] = str(profile["_id"])
    return profile

@router.put("/")
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    await profile_collection.update_one(
        {"email": current_user["sub"]},
        {"$set": profile_data.dict()},
        upsert=True
    )
    return {"message": "Profile updated successfully"}
