from fastapi import APIRouter, HTTPException, BackgroundTasks, Response, Request, Depends, Body
from pydantic import BaseModel, EmailStr
import bcrypt
import random
import time
import hashlib
from database import users_collection, otp_collection, profile_collection
from services.email_service import send_otp_email
from utils.jwt_handler import create_access_token, get_current_user
from config import Config

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    age: int
    gender: str
    password: str
    role: str = "patient" # patient or doctor

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

def hash_otp(otp: str):
    return hashlib.sha256(otp.encode()).hexdigest()

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False

@router.post("/register")
async def register(request: RegisterRequest, background_tasks: BackgroundTasks):
    # Check if user exists
    existing = await users_collection.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=400, detail="Identity already registered in the mesh.")
    
    # Store registration data temporarily in OTP collection or similar
    otp = str(random.randint(100000, 999999))
    hashed_otp = hash_otp(otp)
    expiry = int(time.time()) + 600 # 10 minutes
    
    pending_user = {
        "email": request.email,
        "otp": hashed_otp,
        "expiry": expiry,
        "data": {
            "name": request.name,
            "phone": request.phone,
            "age": request.age,
            "gender": request.gender,
            "role": request.role,
            "password_hash": hash_password(request.password)
        }
    }
    
    await otp_collection.update_one(
        {"email": request.email},
        {"$set": pending_user},
        upsert=True
    )
    
    background_tasks.add_task(send_otp_email, request.email, otp)
    return {"message": "Verification code dispatched to your workstation."}

@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest, response: Response):
    record = await otp_collection.find_one({"email": request.email})
    
    if not record or "data" not in record:
        raise HTTPException(status_code=400, detail="Verification session not found.")
    
    if int(time.time()) > record["expiry"]:
        raise HTTPException(status_code=400, detail="Verification code expired.")
    
    if hash_otp(request.otp) != record["otp"]:
        raise HTTPException(status_code=400, detail="Authorization code mismatch.")
    
    # Finalize Registration
    user_data = record["data"]
    user_doc = {
        "email": request.email,
        "password_hash": user_data["password_hash"],
        "role": user_data.get("role", "patient"),
        "created_at": time.time()
    }
    await users_collection.insert_one(user_doc)
    
    # Create Profile
    profile_doc = {
        "email": request.email,
        "name": user_data["name"],
        "phone": user_data["phone"],
        "age": user_data["age"],
        "gender": user_data["gender"],
        "dob": "Not Set",
        "mobile": user_data["phone"],
        "blood_group": "Not Set",
        "emergency_contact": "Not Set"
    }
    await profile_collection.insert_one(profile_doc)
    
    # Clear session
    await otp_collection.delete_one({"email": request.email})
    
    return {"message": "Account synthesized successfully."}

@router.post("/login")
async def login(request: LoginRequest, response: Response):
    user = await users_collection.find_one({"email": request.email})
    print(f"[LOGIN] user found: {user is not None}")
    if user:
        stored_hash = user.get("password_hash", "")
        print(f"[LOGIN] stored_hash prefix: {stored_hash[:15] if stored_hash else 'EMPTY'}")
        pwd_result = verify_password(request.password, stored_hash)
        print(f"[LOGIN] verify_password result: {pwd_result}")
    if not user or not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credential matrix.")
    
    # Get profile for name
    profile = await profile_collection.find_one({"email": request.email})
    name = profile["name"] if profile else request.email.split("@")[0]
    
    role = user.get("role", "patient")
    token = create_access_token({"sub": request.email, "name": name, "role": role})
    
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=Config.JWT_EXPIRATION,
        expires=Config.JWT_EXPIRATION,
        samesite="lax",
        secure=False,
        path="/"
    )
    
    return {
        "message": "Neural link established.",
        "name": name,
        "email": request.email,
        "role": role,
        "user_id": str(user["_id"]),
        "token": token
    }

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user = await users_collection.find_one({"email": request.email})
    if not user:
        # Don't reveal if user exists for security, but we'll return success anyway
        return {"message": "If the account exists, a reset code has been sent."}
    
    otp = str(random.randint(100000, 999999))
    hashed_otp = hash_otp(otp)
    expiry = int(time.time()) + 300
    
    await otp_collection.update_one(
        {"email": request.email},
        {"$set": {"otp": hashed_otp, "expiry": expiry}},
        upsert=True
    )
    
    background_tasks.add_task(send_otp_email, request.email, otp)
    return {"message": "Recovery sequence initiated. Check your mail."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    record = await otp_collection.find_one({"email": request.email})
    if not record or hash_otp(request.otp) != record["otp"] or int(time.time()) > record["expiry"]:
         raise HTTPException(status_code=400, detail="Invalid or expired reset code.")
    
    new_hash = hash_password(request.new_password)
    await users_collection.update_one({"email": request.email}, {"$set": {"password_hash": new_hash}})
    await otp_collection.delete_one({"email": request.email})
    
    return {"message": "Vault credentials updated successfully."}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["sub"],
        "name": current_user.get("name", "User")
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Neural link terminated."}
