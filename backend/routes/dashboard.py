from fastapi import APIRouter, Depends, HTTPException
from database import reports_collection, claims_collection, profile_collection
from utils.jwt_handler import get_current_user
import time

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    
    # Count uploaded reports
    reports_count = await reports_collection.count_documents({"user_id": user_id})
    
    # Count claims analyzed
    claims_count = await claims_collection.count_documents({"user_id": user_id})
    
    # Check profile completion for health score simulation
    profile = await profile_collection.find_one({"user_id": user_id})
    profile_completion = 0
    if profile:
        # Simple heuristic for profile completion
        fields = ["full_name", "blood_group", "emergency_contact", "allergies", "conditions"]
        completed = sum(1 for field in fields if profile.get(field))
        profile_completion = (completed / len(fields)) * 100
    
    # Generic Health Score (based on activity and profile)
    health_score = 70 + (profile_completion * 0.2) + (min(reports_count, 5) * 2)
    
    return {
        "reports_count": reports_count,
        "claims_count": claims_count,
        "health_score": round(min(health_score, 100), 1),
        "status": "Verified" if claims_count > 0 else "Pending"
    }

@router.get("/activity")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    
    activities = []
    
    # Fetch recent reports
    reports_cursor = reports_collection.find({"user_id": user_id}).sort("upload_date", -1).limit(5)
    async for report in reports_cursor:
        activities.append({
            "type": "report_upload",
            "title": f"Report Uploaded: {report.get('title')}",
            "description": f"New {report.get('report_type')} added to vault.",
            "timestamp": report.get("upload_date"),
            "status": "Verified"
        })
        
    # Fetch recent claims
    claims_cursor = claims_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(5)
    async for claim in claims_cursor:
        activities.append({
            "type": "claim_analysis",
            "title": f"Claim Analyzed: {claim.get('filename')}",
            "description": f"AI Audit completed with {round(claim.get('internal_similarity', 0)*100, 1)}% similarity.",
            "timestamp": claim.get("timestamp"),
            "status": "Processed"
        })
        
    # Sort and return latest 5
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:5]
