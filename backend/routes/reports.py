from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from database import reports_collection
from utils.jwt_handler import get_current_user
from services.cloudinary_service import upload_file, delete_file
import time
from bson import ObjectId

router = APIRouter()

@router.post("/upload")
async def upload_report(file: UploadFile = File(...), title: str = "", report_type: str = "Lab Report", current_user: dict = Depends(get_current_user)):
    content = await file.read()
    url = await upload_file(content, f"{current_user['sub']}_{int(time.time())}")
    
    if not url:
        raise HTTPException(status_code=500, detail="Failed to upload to Cloudinary")
    
    report_data = {
        "user_id": current_user["sub"],
        "title": title or file.filename,
        "report_type": report_type,
        "cloudinary_url": url,
        "upload_date": time.time()
    }
    
    result = await reports_collection.insert_one(report_data)
    return {"id": str(result.inserted_id), "url": url}

@router.get("/")
async def get_reports(current_user: dict = Depends(get_current_user)):
    cursor = reports_collection.find({"user_id": current_user["sub"]}).sort("upload_date", -1)
    reports = []
    async for report in cursor:
        report["_id"] = str(report["_id"])
        reports.append(report)
    return reports

@router.delete("/{report_id}")
async def remove_report(report_id: str, current_user: dict = Depends(get_current_user)):
    report = await reports_collection.find_one({"_id": ObjectId(report_id), "user_id": current_user["sub"]})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Optional: Delete from Cloudinary using public ID extracted from URL
    # For now, just delete from DB
    await reports_collection.delete_one({"_id": ObjectId(report_id)})
    return {"message": "Report deleted"}
