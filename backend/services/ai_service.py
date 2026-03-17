import json
import time
import asyncio
from groq import AsyncGroq
import google.generativeai as genai
from config import Config

# Initialize Clients
groq_client = AsyncGroq(api_key=Config.GROQ_API_KEY) if Config.GROQ_API_KEY else None
if Config.GOOGLE_API_KEY:
    genai.configure(api_key=Config.GOOGLE_API_KEY)

# Simple Cache for Suggestions
suggestions_cache = {}

class AIService:
    @staticmethod
    async def _call_ai(prompt: str, json_mode: bool = False, retries: int = 2):
        """Helper to call Groq with Gemini fallback and retry logic"""
        
        for attempt in range(retries + 1):
            # 1. Try Groq
            if groq_client:
                try:
                    print(f"DEBUG: Calling Groq ({Config.GROQ_MODEL}) - Attempt {attempt+1}...")
                    response_format = {"type": "json_object"} if json_mode else None
                    completion = await groq_client.chat.completions.create(
                        model=Config.GROQ_MODEL,
                        messages=[{"role": "user", "content": prompt}],
                        response_format=response_format,
                        timeout=8.0
                    )
                    return str(completion.choices[0].message.content)
                except Exception as e:
                    print(f"Groq Attempt {attempt+1} Error: {e}")
                    if attempt < retries:
                        await asyncio.sleep(1) # Small backoff
                        continue
        
        # 2. Fallback to Gemini
        print(f"DEBUG: Falling back to Gemini ({Config.GEMINI_MODEL})...")
        try:
            model = genai.GenerativeModel(Config.GEMINI_MODEL)
            gemini_prompt = prompt
            if json_mode and "json" not in prompt.lower():
                gemini_prompt += "\nReturn strictly valid JSON."
            
            response = await model.generate_content_async(gemini_prompt)
            text = str(response.text).strip()
            # Basic cleanup for Gemini's markdown response
            if json_mode:
                text = text.replace('```json', '').replace('```', '').strip()
            return text
        except Exception as e:
            print(f"Gemini Fallback Error: {e}")
            raise Exception(f"AI Service Error: {str(e)}")

    @staticmethod
    async def refine_problem(description: str):
        prompt = f"""
        Act as a professional healthcare research consultant. 
        Refine the following healthcare problem statement into a structured research format.
        
        Original Problem: {description}
        
        Format the response strictly in JSON with these keys:
        - context: Background information
        - population: Who is affected
        - impact: How it affects healthcare
        - research_direction: Suggested areas for study
        """
        response = await AIService._call_ai(prompt, json_mode=True)
        try:
            return json.loads(response)
        except:
            # Fallback structure if JSON fails
            return {
                "context": "Healthcare innovation required.",
                "population": "General patients",
                "impact": "High",
                "research_direction": "Further analysis needed"
            }

    @staticmethod
    async def generate_ideas(problem_text: str):
        prompt = f"""
        Based on this healthcare problem: "{problem_text}", 
        generate 3-5 intelligent, innovative solution ideas.
        
        Format as a JSON list of objects:
        - title: Name of the idea
        - description: One-sentence explanation
        - feasibility: Number from 0 to 100
        - explanation: Short technical rationale (Scientific basis)
        """
        response = await AIService._call_ai(prompt, json_mode=True)
        try:
            return json.loads(response)
        except:
            return [{"title": "Innovation Concept", "description": "AI-driven approach", "feasibility": 50, "explanation": "Requires validation"}]

    @staticmethod
    async def analyze_claim(text: str):
        prompt = f"""
        You are a strict JSON API that analyzes text extracted from uploaded PDF documents.
        Your job is to analyze the document and return structured JSON data that will be used directly in a frontend dashboard.

        CRITICAL RULES:
        1. You MUST return ONLY valid JSON.
        2. Do NOT include explanations outside the JSON.
        3. Do NOT include markdown formatting.
        4. Do NOT include ```json blocks.
        5. Do NOT add any text before or after the JSON.
        6. Every field must always exist in the response.

        If information is missing, return "Not found".

        ---
        TEXT TO ANALYZE:
        {text}

        ---
        ANALYSIS TASKS:
        1. Document classification (Medical Report, Insurance Claim, Prescription, Lab Report, Hospital Discharge Summary, Research Paper, Legal Document, Other).
        2. Document gist (3–5 simple sentences).
        3. Key information extraction (Patient Name, Hospital Name, Doctor Name, Diagnosis, Treatment, Prescription, Claim Amount, Dates, Medical Procedures).
        4. Key points (3–6 bullet points).
        5. AI writing detection (AI probability percentage, Human probability percentage, Short explanation).
        6. Similarity analysis (Compute overall similarity percentage and matched sections).
        7. Risk indicators (High claim amounts, Missing signatures, Missing reports, Contradictions).
        8. Final insight (Short overall assessment).

        ---
        RETURN STRICT JSON USING THIS STRUCTURE:
        {{
            "document_type": "",
            "document_gist": "",
            "key_points": [],
            "entities": {{
                "patient_name": "",
                "hospital_name": "",
                "doctor_name": "",
                "diagnosis": "",
                "treatment": "",
                "prescription": "",
                "claim_amount": "",
                "dates": "",
                "medical_procedures": ""
            }},
            "ai_writing_detection": {{
                "ai_probability": "",
                "human_probability": "",
                "reason": ""
            }},
            "similarity_analysis": {{
                "similarity_score": "",
                "matched_sections": []
            }},
            "risk_indicators": [],
            "final_insight": ""
        }}
        """
        response_text = await AIService._call_ai(prompt, json_mode=True)
        try:
            # Cleanup common AI artifacts just in case
            cleaned = str(response_text).replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"CRITICAL: Final AI Response Parsing Failed: {e}")
            return {
                "document_type": "Analysis Error",
                "document_gist": "AI response format was invalid. Please retry.",
                "final_insight": str(e)
            }

    @staticmethod
    async def chatbot_response(message: str, history: list = []):
        # Simplistic history handling for now
        context = ""
        if history:
            context = "Context history:\n" + "\n".join([f"{h.get('role')}: {h.get('parts', [''])[0]}" for h in history if 'parts' in h])
        
        prompt = f"""{context}\nUser: {message}\nYou are SwasthyaSetu AI, a professional healthcare assistant. Assist the user with healthcare questions and platform guidance. Use markdown and be concise."""
        return await AIService._call_ai(prompt, json_mode=False)

    @staticmethod
    async def generate_suggestions(text: str, context: str):
        if not text or len(text) < 3:
            return []

        cache_key = f"{text.lower()}_{context.lower()}"
        if cache_key in suggestions_cache:
            return suggestions_cache[cache_key]

        # 1. Local Fallback Generator (Guarantees immediate high-quality medical results)
        def get_local_fallbacks(query: str):
            # Clean query to avoid repetitive prefixes
            prefixes = ["ai-powered", "remote", "predictive", "hospital", "smart", "advanced", "digital"]
            clean_query = query
            low_query = query.lower()
            
            # If query already starts with one of our prefixes, don't re-prefix it in a loop
            for p in prefixes:
                if low_query.startswith(p):
                    # If it's already structured, just give variety
                    return [
                        f"{query} integration",
                        f"{query} optimization",
                        f"{query} compliance audit",
                        f"Scalable {query} architecture",
                        f"Secure {query} implementation"
                    ][:5]

            templates = [
                f"AI-powered {query} detection system",
                f"Remote {query} monitoring solution",
                f"Predictive {query} early warning model",
                f"Hospital {query} workflow automation",
                f"Smart {query} health analytics platform",
                f"Advanced {query} clinical research",
                f"Digital {query} management tool"
            ]
            return templates[:6]

        prompt = f"""
        Act as a medical search engine stabilizer. 
        Generate 5 intelligent, professional, and diverse medical search suggestions starting with or related to: "{text}".
        Context of search: {context}.
        
        RULES:
        1. Return ONLY a valid JSON list of strings.
        2. Do NOT include markdown blocks.
        3. Do NOT include explanations.
        4. Focus on professional healthcare and clinical innovation.
        """
        
        suggestions = []
        try:
            response_text = await AIService._call_ai(prompt, json_mode=True)
            # Basic cleanup for common AI response artifacts
            cleaned = str(response_text).replace("```json", "").replace("```", "").strip()
            suggestions = json.loads(cleaned)
            if not isinstance(suggestions, list):
                suggestions = []
        except Exception as e:
            print(f"DEBUG: AI Suggestion API failed: {e}")
            suggestions = []

        # 2. Merge and Filter
        # Ensure we have at least 5 suggestions by mixing AI and local fallbacks
        if len(suggestions) < 5:
            fallbacks = get_local_fallbacks(text)
            for f in fallbacks:
                if f not in suggestions:
                    suggestions.append(f)
                if len(suggestions) >= 7:
                    break

        final_suggestions = suggestions[:5]
        suggestions_cache[cache_key] = final_suggestions
        return final_suggestions
