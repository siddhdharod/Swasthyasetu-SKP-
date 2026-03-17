from fastapi import APIRouter, Depends, HTTPException, Body
from database import db, profile_collection, datasets_collection
from utils.jwt_handler import get_current_user
from services.ai_service import AIService
from bson import ObjectId
import time

router = APIRouter()

async def get_user_name(user: dict):
    profile = await profile_collection.find_one({"email": user.get("sub")})
    return profile.get("name") if profile else user.get("sub").split("@")[0]

# Problems
@router.post("")
async def submit_problem(payload: dict = Body(...), user: dict = Depends(get_current_user)):
    user_name = await get_user_name(user)
    problem = {
        "title": payload.get("title"),
        "description": payload.get("description"),
        "createdBy": user_name,
        "email": user.get("sub"),
        "createdAt": int(time.time()),
        "messageCount": 0
    }
    res = await db.problems.insert_one(problem)
    return {"id": str(res.inserted_id), **problem}

@router.get("")
async def list_problems():
    problems = await db.problems.find().sort("createdAt", -1).to_list(100)
    for p in problems:
        p["id"] = str(p["_id"])
        del p["_id"]
    return problems

@router.get("/{id}")
async def get_problem(id: str):
    p = await db.problems.find_one({"_id": ObjectId(id)})
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    p["id"] = str(p["_id"])
    del p["_id"]
    return p

# Ideas
@router.post("/{id}/ideas")
async def add_idea(id: str, payload: dict = Body(...), user: dict = Depends(get_current_user)):
    user_name = await get_user_name(user)
    type = payload.get("type", "user") # "user" or "ai"
    
    if type == "ai":
        problem_text = payload.get("problem_text")
        ideas = await AIService.generate_ideas(problem_text)
        for i in ideas:
            i["problem_id"] = id
            i["type"] = "ai"
            i["createdBy"] = "AI Synthesis"
            i["createdAt"] = int(time.time())
            await db.ideas.insert_one(i)
        return ideas
    else:
        idea = {
            "title": payload.get("title"),
            "description": payload.get("description"),
            "problem_id": id,
            "type": "user",
            "createdBy": user_name,
            "createdAt": int(time.time()),
            "feasibility": 0 # User ideas start at 0 or can be rated later
        }
        await db.ideas.insert_one(idea)
        return idea

@router.get("/{id}/ideas")
async def get_ideas(id: str):
    ideas = await db.ideas.find({"problem_id": id}).sort("createdAt", -1).to_list(100)
    for i in ideas:
        i["id"] = str(i["_id"])
        del i["_id"]
    return ideas

# Messages
@router.post("/{id}/messages")
async def post_message(id: str, payload: dict = Body(...), user: dict = Depends(get_current_user)):
    user_name = await get_user_name(user)
    msg = {
        "problem_id": id,
        "content": payload.get("content"),
        "author": user_name,
        "email": user.get("sub"),
        "timestamp": int(time.time())
    }
    await db.messages.insert_one(msg)
    # Increment message count on problem
    await db.problems.update_one({"_id": ObjectId(id)}, {"$inc": {"messageCount": 1}})
    return {"status": "success"}

@router.get("/{id}/messages")
async def get_messages(id: str):
    msgs = await db.messages.find({"problem_id": id}).sort("timestamp", 1).to_list(100)
    for m in msgs:
        m["id"] = str(m["_id"])
        del m["_id"]
    return msgs

@router.get("/{id}/summary")
async def get_summary(id: str):
    msgs = await db.messages.find({"problem_id": id}).to_list(50)
    summary = await AIService.chatbot_response(f"Summarize this discussion: {msgs}") # Reusing chatbot for summary
    return {"summary": summary}

# Datasets
@router.post("/datasets")
async def add_dataset(payload: dict = Body(...), user: dict = Depends(get_current_user)):
    user_name = await get_user_name(user)
    dataset = {
        "title": payload.get("title"),
        "description": payload.get("description"),
        "url": payload.get("link"),
        "category": payload.get("category", "Community"),
        "source": user_name,
        "email": user.get("sub"),
        "createdAt": int(time.time()),
        "color": payload.get("color", "blue")
    }
    res = await datasets_collection.insert_one(dataset)
    dataset["id"] = str(res.inserted_id)
    return dataset

@router.get("/datasets/list")
async def list_datasets():
    datasets = await datasets_collection.find().sort("createdAt", -1).to_list(100)
    for ds in datasets:
        ds["id"] = str(ds["_id"])
        del ds["_id"]
    return datasets
