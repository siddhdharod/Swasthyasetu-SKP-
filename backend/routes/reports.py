from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from database import reports_collection
from utils.jwt_handler import get_current_user
from services.cloudinary_service import upload_file, delete_file
from utils.document_processor import DocumentProcessor
import time
from bson import ObjectId

router = APIRouter()

@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...), 
    title: str = Form(""), 
    report_type: str = Form("Lab Report"), 
    current_user: dict = Depends(get_current_user)
):
    if not current_user or "sub" not in current_user:
        raise HTTPException(status_code=401, detail="Unauthorized access to healthcare vault.")
        
    print(f"DEBUG: Starting upload for user {current_user['sub']}, title={title}")
    content = await file.read()
    print(f"DEBUG: Read {len(content)} bytes from file")
    
    # Process document for ingestion
    extracted_text = await DocumentProcessor.process_document(content, file.filename, file.content_type)
    
    if not extracted_text:
        raise HTTPException(status_code=400, detail="Unable to extract content. Please upload a clearer document or image.")

    upload_result = await upload_file(content, f"{current_user['sub']}_{int(time.time())}")
    
    if not upload_result:
        print("DEBUG: Cloudinary upload returned None")
        raise HTTPException(status_code=500, detail="Failed to upload to Cloudinary")
    
    url = upload_result.get("secure_url")
    public_id = upload_result.get("public_id")
    
    report_data = {
        "user_id": current_user["sub"],
        "title": title or file.filename,
        "report_type": report_type,
        "cloudinary_url": url,
        "public_id": public_id,
        "extracted_text": extracted_text[:5000] if extracted_text else "",
        "upload_date": time.time()
    }
    
    result = await reports_collection.insert_one(report_data)
    print(f"DEBUG: Report {result.inserted_id} saved to DB")
    return {"id": str(result.inserted_id), "url": url, "public_id": public_id}

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
