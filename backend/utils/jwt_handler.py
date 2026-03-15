import jwt
import datetime
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from config import Config

security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(seconds=Config.JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        return payload if payload["exp"] >= datetime.datetime.utcnow().timestamp() else None
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    token = None
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        token = request.cookies.get("access_token")
        
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token missing")
        
    return decode_access_token(token)
