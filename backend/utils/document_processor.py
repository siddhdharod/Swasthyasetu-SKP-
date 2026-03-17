import io
import re
from pypdf import PdfReader
from services.gemini_service import GeminiService

class DocumentProcessor:
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Cleans and normalizes extracted text.
        """
        if not text:
            return ""
            
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove weird symbols but keep punctuation
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)
        # Normalize line breaks
        text = text.replace('\r', '\n').strip()
        
        return text

    @staticmethod
    async def process_document(content: bytes, filename: str, content_type: str) -> str:
        """
        Universal pipeline to extract text from PDFs and Images.
        """
        print(f"DEBUG: Processing document {filename} ({content_type}), size={len(content)}")
        
        extracted_text = ""
        
        # 1. Handle PDF
        if "pdf" in content_type.lower() or filename.lower().endswith(".pdf"):
            try:
                # Attempt text-based extraction first
                reader = PdfReader(io.BytesIO(content))
                text_parts = []
                # Limit to first 10 pages as per plan
                for i, page in enumerate(reader.pages[:10]):
                    text_parts.append(page.extract_text() or "")
                
                extracted_text = "\n".join(text_parts).strip()
                
                # If extraction is insufficient, fallback to Gemini OCR
                if len(extracted_text) < 50:
                    print("DEBUG: PDF text extraction insufficient (<50 chars), falling back to Gemini OCR")
                    extracted_text = await GeminiService.extract_text_from_media(content, "application/pdf")
                    
            except Exception as e:
                print(f"DEBUG: PDF processing error: {e}, attempting OCR fallback")
                extracted_text = await GeminiService.extract_text_from_media(content, "application/pdf")

        # 2. Handle Images
        elif "image" in content_type.lower() or any(filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            print("DEBUG: Processing as image via Gemini OCR")
            # For images, we always use Gemini OCR
            extracted_text = await GeminiService.extract_text_from_media(content, content_type)

        # 3. Final Cleaning
        if extracted_text:
            return DocumentProcessor.clean_text(extracted_text)
            
        return ""
