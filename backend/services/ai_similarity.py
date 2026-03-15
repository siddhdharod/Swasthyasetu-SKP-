from sentence_transformers import SentenceTransformer, util
import torch

model = SentenceTransformer('all-MiniLM-L6-v2')

def calculate_similarity(text1: str, text2: str):
    try:
        embeddings1 = model.encode(text1, convert_to_tensor=True)
        embeddings2 = model.encode(text2, convert_to_tensor=True)
        
        cosine_score = util.cos_sim(embeddings1, embeddings2)
        return float(cosine_score[0][0])
    except Exception as e:
        print(f"Similarity error: {e}")
        return 0.0
