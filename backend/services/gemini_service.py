import google.generativeai as genai
from config import Config
import json
import time

# Configure Gemini with API Key from Config
if Config.GOOGLE_API_KEY:
    genai.configure(api_key=Config.GOOGLE_API_KEY)
else:
    print("WARNING: GOOGLE_API_KEY not found in Config!")

class GeminiService:
    @staticmethod
    async def refine_problem(description: str):
        try:
            model = genai.GenerativeModel(Config.GEMINI_MODEL)
            prompt = f"""
            Act as a professional healthcare research consultant. 
            Refine the following healthcare problem statement into a structured research format.
            
            Original Problem: {description}
            
            Format the response in JSON with these keys:
            - context: Background information
            - population: Who is affected
            - impact: How it affects healthcare
            - research_direction: Suggested areas for study
            """
            
            response = await model.generate_content_async(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini refine_problem Error: {e}")
            return {
                "context": "Error refining problem. Please try again later.",
                "population": "Analyzing...",
                "impact": "Significant",
                "research_direction": "Requires further AI processing"
            }

    @staticmethod
    async def generate_ideas(problem_text: str):
        try:
            model = genai.GenerativeModel(Config.GEMINI_MODEL)
            prompt = f"""
            Based on this healthcare problem: "{problem_text}", 
            generate 3 intelligent, innovative solution ideas.
            
            Format each idea as a JSON object inside a list:
            - title: Name of the idea
            - description: One-sentence explanation
            - feasibility: Number from 0 to 100
            - explanation: Short technical rationale
            """
            
            response = await model.generate_content_async(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini generate_ideas Error: {e}")
            return [
                {"title": "AI Diagnostics", "description": "Automated scanning", "feasibility": 85, "explanation": "High readiness"},
                {"title": "Tele-care", "description": "Remote consultations", "feasibility": 90, "explanation": "Easily deployable"},
                {"title": "Mobile Clinic", "description": "Physical outreach", "feasibility": 70, "explanation": "Low cost options"}
            ]

    @staticmethod
    async def get_chatbot_response(message: str, history: list = []):
        try:
            model = genai.GenerativeModel(Config.GEMINI_MODEL)
            chat = model.start_chat(history=history or [])
            response = await chat.send_message_async(message)
            return response.text
        except Exception as e:
            print(f"Gemini Error (Chat): {e}")
            return "AI temporarily unavailable. Our neural link is currently undergoing maintenance. Please try again in 60 seconds."

    @staticmethod
    async def summarize_discussion(messages: list):
        if not messages:
            return "No discussion yet."
        try:
            model = genai.GenerativeModel(Config.GEMINI_MODEL)
            messages_text = "\n".join([f"{m.get('author', 'User')}: {m.get('content', '')}" for m in messages])
            prompt = f"""
            Summarize the following healthcare collaboration discussion:
            
            Discussion:
            {messages_text}
            
            Provide a concise 2-3 sentence summary highlighting key suggestions and focus areas.
            """
            
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini summarize Error: {e}")
            return "Summary unavailable at this time."

    @staticmethod
    async def get_suggestions(text: str, context: str):
        prompt = f"Provide 5 short medical search suggestions for context: {context} starting with: {text}. Return only a list of strings."
        try:
            model = genai.GenerativeModel(Config.GEMINI_MODEL)
            response = await model.generate_content_async(prompt)
            # Basic parsing of list-like response
            suggestions = [s.strip('- ').strip('12345. ') for s in response.text.split('\n') if s.strip()]
            return [s for s in suggestions if s][:5]
        except Exception as e:
            print(f"Gemini Error (Suggestions): {e}")
            return ["AI temporarily unavailable"]

    @staticmethod
    async def extract_text_from_media(content: bytes, mime_type: str):
        """
        Extracts text from images or PDFs using Gemini's multimodal capabilities.
        """
        try:
            model = genai.GenerativeModel(Config.GEMINI_MODEL)
            
            prompt = """
            You are a professional medical document digitizer. 
            Extract ALL readable text from this document as accurately as possible.
            If this is a table, preserve the row/column structure using spaces or tabs.
            Ignore visual noise, signatures (just note "[Signature]"), and stamps.
            Return ONLY the extracted text.
            """
            
            # Prepare the media part
            media_part = {
                "mime_type": mime_type,
                "data": content
            }
            
            response = await model.generate_content_async([prompt, media_part])
            return response.text.strip()
        except Exception as e:
            print(f"Gemini OCR Error: {e}")
            return ""

    @staticmethod
    async def analyze_medical_document(text: str):
        prompt = f"""
        Analyze this medical document text and provide a structured report with these exact sections:
        
        1. CLAIM SUMMARY: A concise summary of the medical claim.
        2. SCIENTIFIC VALIDITY: Assessment of whether the claim aligns with established medical science.
        3. EVIDENCE LEVEL: Classification of evidence (e.g., High, Moderate, Low, or Anecdotal).
        4. POSSIBLE RISKS: Any health risks or complications associated with the claim or condition.
        5. RECOMMENDATION: Clear, actionable medical recommendation or next steps.

        Document Text:
        {text}
        
        Format the response with the section headers in ALL CAPS followed by a colon.
        """
        try:
            model = genai.GenerativeModel(Config.GEMINI_MODEL)
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Error (Analyze): {e}")
            return "AI temporarily unavailable. Our neural link is currently undergoing maintenance. Please try again in 60 seconds."
