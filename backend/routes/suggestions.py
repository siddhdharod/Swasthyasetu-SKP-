from fastapi import APIRouter, Body
from services.gemini_service import GeminiService
from pydantic import BaseModel

router = APIRouter()

class SuggestionRequest(BaseModel):
    text: str
    context: str

@router.post("/")
async def get_suggestions(request: SuggestionRequest):
    suggestions = await GeminiService.get_suggestions(request.text, request.context)
    return {"suggestions": suggestions}
