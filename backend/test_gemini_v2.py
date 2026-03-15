import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Say hello")
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {e}")
    # Try to see if there's more info in the exception
    if hasattr(e, 'details'):
        print(f"DETAILS: {e.details()}")
