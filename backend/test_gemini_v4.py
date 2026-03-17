import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

with open('gemini_diagnostics.txt', 'w') as f:
    f.write("Attempting to list all models...\n")
    try:
        models = genai.list_models()
        model_list = [m.name for m in models]
        f.write(f"AVAILABLE_MODELS: {model_list}\n")
    except Exception as e:
        f.write(f"LIST_MODELS_FAILED: {e}\n")

    f.write("\nTesting gemini-1.5-flash specifically...\n")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("ping")
        f.write(f"FLASH_PONG: {response.text}\n")
    except Exception as e:
        f.write(f"FLASH_FAILED: {e}\n")

    f.write("\nTesting gemini-pro specifically...\n")
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("ping")
        f.write(f"PRO_PONG: {response.text}\n")
    except Exception as e:
        f.write(f"PRO_FAILED: {e}\n")
