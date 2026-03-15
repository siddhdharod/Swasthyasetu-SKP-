import google.generativeai as genai
from config import Config
import json

# Configure Gemini with API Key from Config
if Config.GOOGLE_API_KEY:
    genai.configure(api_key=Config.GOOGLE_API_KEY)
else:
    print("WARNING: GOOGLE_API_KEY not found in Config!")

class GeminiService:
    @staticmethod
    async def refine_problem(description: str):
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
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
            model = genai.GenerativeModel('gemini-flash-latest')
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
    async def get_chatbot_response(user_query: str):
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            prompt = f"""
            Act as a professional "AI Health Assistant" for the SwasthyaSetu platform.
            Your goal is to provide helpful, concise, and scientifically accurate healthcare information.
            
            Guidelines:
            - Be empathetic and professional.
            - If the user asks for a diagnosis, remind them to consult a real physician.
            - Keep responses concise (under 4-5 sentences).
            
            User Query: {user_query}
            """
            
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Chatbot Error: {e}")
            return "I'm currently having trouble connecting to my neural network. Please try again in a moment."

    @staticmethod
    async def summarize_discussion(messages: list):
        if not messages:
            return "No discussion yet."
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            messages_text = "\n".join([f"{m['author']}: {m['content']}" for m in messages])
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
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            
            context_description = "healthcare innovation problem title"
            if context == "dataset_search":
                context_description = "medical dataset search query"
            elif context == "idea_generator":
                context_description = "healthcare startup idea title"
            
            prompt = f"""
            User is typing a {context_description}.
            Typed text: "{text}"
            
            Generate 5 short suggestions related to this context.
            Rules:
            • suggestions must be concise
            • each suggestion must be one line
            • maximum 10 words
            • return only suggestions
            • do not include numbers or explanations
            """
            
            response = await model.generate_content_async(prompt)
            if not response.text:
                print("Gemini returned empty response for suggestions.")
                return []
                
            suggestions = [line.strip().replace('• ', '').replace('- ', '') for line in response.text.split('\n') if line.strip()]
            return suggestions[:5]
        except Exception as e:
            print(f"Gemini Suggestions Error: {e}")
            return []

    @staticmethod
    async def analyze_medical_document(text: str):
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            prompt = f"""
            Act as a medical document analyst. Analyze the following medical report text and provide:
            1. A structured NLP report (summary, key findings, and recommendations).
            2. A medical similarity score (0-100) compared to millions of standard medical records and research papers (simulated).
            3. An AI writing probability (0-100) indicating the likelihood that this text was generated by an AI.

            Text: {text[:5000]}

            Format the response in JSON with these keys:
            - nlp_report: {{ "summary": string, "findings": [string], "recommendations": [string] }}
            - medical_similarity: number
            - ai_writing_score: number
            """
            
            response = await model.generate_content_async(prompt)
            result_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(result_text)
        except Exception as e:
            print(f"Gemini analyze_medical_document Error: {e}")
            return {
                "nlp_report": {
                    "summary": "Error analyzing document.",
                    "findings": [],
                    "recommendations": []
                },
                "medical_similarity": 0,
                "ai_writing_score": 0
            }

    @staticmethod
    async def detect_outbreaks(reports: list):
        if not reports:
            return None
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            reports_text = "\n".join([f"- Disease: {r['disease_name']}, Lat: {r['latitude']}, Lng: {r['longitude']}, Time: {r.get('timestamp')}" for r in reports])
            prompt = f"""
            Act as an Epidemiologist and Public Health Analyst. 
            Analyze the following recent disease reports and detect potential outbreaks or clusters.
            
            Reports:
            {reports_text}
            
            Rules:
            - An outbreak is suspected if there's a localized cluster of similar reports (e.g., 5+ reports in a small area).
            - Identify the disease name, approximate location (description), and report count.
            - Provide a short, urgent alert message if an outbreak is likely.
            
            Format response in JSON:
            {{
                "outbreak_detected": boolean,
                "disease": string or null,
                "location": string or null,
                "report_count": number or null,
                "alert_message": string or null
            }}
            """
            
            response = await model.generate_content_async(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini detect_outbreaks Error: {e}")
            return None

    @staticmethod
    async def suggest_diseases(partial_name: str):
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            prompt = f"""
            User is reporting a disease and typed: "{partial_name}".
            Suggest 5 common medical disease names that start with or are relevant to this text.
            Return ONLY a comma-separated list of names. No numbers, no extra text.
            """
            
            response = await model.generate_content_async(prompt)
            suggestions = [s.strip() for s in response.text.split(',') if s.strip()]
            return suggestions[:5]
        except Exception as e:
            print(f"Gemini suggest_diseases Error: {e}")
            return []
