from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the current directory to sys.path to ensure absolute imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes import auth, reports, claims, profile, innovation, chatbot, suggestions, diseases, dashboard

app = FastAPI(title="SwasthyaSetu AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", # Fallback for dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(claims.router, prefix="/api/claims", tags=["claims"])
app.include_router(innovation.router, prefix="/api/problems", tags=["innovation"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(suggestions.router, prefix="/api/ai-suggestions", tags=["suggestions"])
app.include_router(diseases.router, prefix="/api/diseases", tags=["diseases"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
async def root():
    return {"message": "SwasthyaSetu AI API is running"}
