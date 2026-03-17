from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from database import claims_collection
from utils.jwt_handler import get_current_user
from utils.document_processor import DocumentProcessor
from services.ai_similarity import calculate_similarity
from services.ai_service import AIService
import time
from bson import ObjectId

router = APIRouter()

@router.post("/analyze")
async def analyze_claim(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content = await file.read()
    text = await DocumentProcessor.process_document(content, file.filename, file.content_type)
    
    if not text:
        raise HTTPException(status_code=400, detail="Unable to extract content. Please upload a clearer document or image.")
    
    # NLP and Similarity Analysis using AI Service
    ai_analysis = await AIService.analyze_claim(text)
    
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
            
    # The AI service now returns a structured JSON for analyze_claim

    claim_record = {
        "user_id": current_user["sub"],
        "filename": file.filename,
        "text": text[:2000],
        "internal_similarity": max_internal_similarity,
        "ai_analysis": ai_analysis,
        "timestamp": time.time()
    }
    
    await claims_collection.insert_one(claim_record)
    
    return {
        "internal_similarity_percentage": round(max_internal_similarity * 100, 2),
        "ai_analysis": ai_analysis
    }

@router.get("/history")
async def get_claims_history(current_user: dict = Depends(get_current_user)):
    cursor = claims_collection.find({"user_id": current_user["sub"]}).sort("timestamp", -1)
    history = []
    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)
    return history
