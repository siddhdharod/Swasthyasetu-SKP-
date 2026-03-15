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
        raise HTTPException(status_code=400, detail="Could not extract text from claim PDF. If this is a photo/scan, please ensure it has selectable text.")
    
    # NLP and Similarity Analysis using Gemini
    gemini_analysis = await GeminiService.analyze_medical_document(text)
    
    # Internal duplicate detection - OPTIMIZED
    from services.ai_similarity import get_embedding, calculate_sim_from_embeddings
    new_embedding = get_embedding(text)
    
    cursor = claims_collection.find()
    max_internal_similarity = 0.0
    async for existing_claim in cursor:
        if "text" in existing_claim:
            # We encode existing claims on the fly for now, but 
            # we pre-calculate the NEW one once.
            existing_emb = get_embedding(existing_claim["text"])
            sim = calculate_sim_from_embeddings(new_embedding, existing_emb)
            if sim > max_internal_similarity:
                max_internal_similarity = sim
            
    # Safely extract NLP components
    nlp_default = {
        "summary": "Document analysis complete.",
        "findings": ["No structured findings extracted."],
        "recommendations": ["No specific recommendations."]
    }
    nlp_report = gemini_analysis.get("nlp_report", nlp_default)
    if not isinstance(nlp_report, dict): nlp_report = nlp_default

    claim_record = {
        "user_id": current_user["sub"],
        "filename": file.filename,
        "text": text[:2000], # Store a bit more
        "internal_similarity": max_internal_similarity,
        "medical_similarity": gemini_analysis.get("medical_similarity", 0),
        "ai_writing_score": gemini_analysis.get("ai_writing_score", 0),
        "nlp_report": nlp_report,
        "timestamp": time.time()
    }
    
    await claims_collection.insert_one(claim_record)
    
    return {
        "internal_similarity_percentage": round(max_internal_similarity * 100, 2),
        "medical_similarity_percentage": gemini_analysis.get("medical_similarity", 0),
        "ai_writing_percentage": gemini_analysis.get("ai_writing_score", 0),
        "nlp_report": nlp_report
    }

@router.get("/history")
async def get_claims_history(current_user: dict = Depends(get_current_user)):
    cursor = claims_collection.find({"user_id": current_user["sub"]}).sort("timestamp", -1)
    history = []
    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)
    return history
