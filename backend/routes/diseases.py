from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
import time
from database import disease_reports_collection, users_collection
from utils.jwt_handler import get_current_user
from services.gemini_service import GeminiService
from bson import ObjectId

router = APIRouter()

class UpdateLocationRequest(BaseModel):
    latitude: float
    longitude: float

class DiseaseReportRequest(BaseModel):
    disease_name: str
    description: Optional[str] = ""
    severity: str = "Moderate" # Mild, Moderate, Severe

@router.post("/update-location")
async def update_location(request: UpdateLocationRequest, current_user: dict = Depends(get_current_user)):
    try:
        await users_collection.update_one(
            {"email": current_user["sub"]},
            {
                "$set": {
                    "latitude": request.latitude,
                    "longitude": request.longitude,
                    "location_updated_at": time.time()
                }
            }
        )
        return {"message": "Location updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/report")
async def report_disease(request: DiseaseReportRequest, current_user: dict = Depends(get_current_user)):
    # Get user's current location from users collection
    user = await users_collection.find_one({"email": current_user["sub"]})
    if not user or "latitude" not in user:
        raise HTTPException(status_code=400, detail="Location permission required to report a disease.")

    report_doc = {
        "disease_name": request.disease_name,
        "description": request.description,
        "severity": request.severity,
        "latitude": user["latitude"],
        "longitude": user["longitude"],
        "location": {
            "type": "Point",
            "coordinates": [user["longitude"], user["latitude"]]
        },
        "timestamp": time.time()
    }
    
    result = await disease_reports_collection.insert_one(report_doc)
    return {"message": "Disease reported successfully.", "id": str(result.inserted_id)}

@router.get("/nearby")
async def get_nearby_diseases(
    lat: float = Query(...), 
    lng: float = Query(...), 
    radius: float = Query(2000), # radius in meters
    time_filter: Optional[int] = Query(None) # in days
):
    try:
        # Create 2dsphere index if not exists (proactive)
        await disease_reports_collection.create_index([("location", "2dsphere")])
        
        query = {
            "location": {
                "$nearSphere": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    },
                    "$maxDistance": radius
                }
            }
        }
        
        if time_filter:
            cutoff = time.time() - (time_filter * 86400)
            query["timestamp"] = {"$gte": cutoff}
            
        cursor = disease_reports_collection.find(query).limit(100)
        reports = []
        async for report in cursor:
            report["_id"] = str(report["_id"])
            # Calculate approximate distance (MongoDB $nearSphere returns results sorted by distance)
            reports.append(report)
            
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/outbreaks")
async def detect_outbreaks(lat: float, lng: float):
    # Fetch recent reports within 5km for outbreak detection
    cutoff = time.time() - (7 * 86400) # last 7 days
    query = {
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "$maxDistance": 5000 
            }
        },
        "timestamp": {"$gte": cutoff}
    }
    
    reports = []
    cursor = disease_reports_collection.find(query).limit(50)
    async for report in cursor:
        reports.append({
            "disease_name": report["disease_name"],
            "latitude": report["latitude"],
            "longitude": report["longitude"],
            "timestamp": report["timestamp"]
        })
    
    analysis = await GeminiService.detect_outbreaks(reports)
    return {"analysis": analysis}

@router.get("/suggestions")
async def disease_suggestions(q: str):
    if not q or len(q) < 2:
        return {"suggestions": []}
    suggestions = await GeminiService.suggest_diseases(q)
    return {"suggestions": suggestions}
