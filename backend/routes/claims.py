from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from database import claims_collection
from utils.jwt_handler import get_current_user
from utils.pdf_extractor import extract_text_from_pdf
from services.ai_similarity import calculate_similarity
from services.gemini_service import GeminiService
import time
from bson import ObjectId

router = APIRouter()

@router.post("/analyze")
async def analyze_claim(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content = await file.read()
    text = extract_text_from_pdf(content)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from claim PDF")
    
    # NLP and Similarity Analysis using Gemini
    gemini_analysis = await GeminiService.analyze_medical_document(text)
    
    # Internal duplicate detection
    cursor = claims_collection.find()
    max_internal_similarity = 0.0
    async for existing_claim in cursor:
        sim = calculate_similarity(text, existing_claim["text"])
        if sim > max_internal_similarity:
            max_internal_similarity = sim
            
    claim_record = {
        "user_id": current_user["sub"],
        "filename": file.filename,
        "text": text[:1000],
        "internal_similarity": max_internal_similarity,
        "medical_similarity": gemini_analysis.get("medical_similarity", 0),
        "ai_writing_score": gemini_analysis.get("ai_writing_score", 0),
        "nlp_report": gemini_analysis.get("nlp_report", {}),
        "timestamp": time.time()
    }
    
    await claims_collection.insert_one(claim_record)
    
    return {
        "internal_similarity_percentage": round(max_internal_similarity * 100, 2),
        "medical_similarity_percentage": gemini_analysis.get("medical_similarity", 0),
        "ai_writing_percentage": gemini_analysis.get("ai_writing_score", 0),
        "nlp_report": gemini_analysis.get("nlp_report", {})
    }

@router.get("/history")
async def get_claims_history(current_user: dict = Depends(get_current_user)):
    cursor = claims_collection.find({"user_id": current_user["sub"]}).sort("timestamp", -1)
    history = []
    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)
    return history
