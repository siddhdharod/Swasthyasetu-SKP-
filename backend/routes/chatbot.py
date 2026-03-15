from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.gemini_service import GeminiService
from utils.jwt_handler import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/ask")
async def ask_chatbot(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        response = await GeminiService.get_chatbot_response(request.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
