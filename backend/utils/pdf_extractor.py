import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_content):
    try:
        reader = PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""
