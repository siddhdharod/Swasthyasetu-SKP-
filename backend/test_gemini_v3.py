import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print("Attempting to list all models...")
try:
    models = genai.list_models()
    model_list = [m.name for m in models]
    print(f"AVAILABLE_MODELS: {model_list}")
except Exception as e:
    print(f"LIST_MODELS_FAILED: {e}")

print("\nTesting gemini-1.5-flash specifically...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("ping")
    print(f"FLASH_PONG: {response.text}")
except Exception as e:
    print(f"FLASH_FAILED: {e}")

print("\nTesting gemini-pro specifically...")
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("ping")
    print(f"PRO_PONG: {response.text}")
except Exception as e:
    print(f"PRO_FAILED: {e}")
