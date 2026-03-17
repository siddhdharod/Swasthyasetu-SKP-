from fastapi import APIRouter, Body
from services.ai_service import AIService
from pydantic import BaseModel

router = APIRouter()

class SuggestionRequest(BaseModel):
    text: str
    context: str

@router.post("/")
async def get_suggestions(request: SuggestionRequest):
    suggestions = await AIService.generate_suggestions(request.text, request.context)
    return {"suggestions": suggestions}
