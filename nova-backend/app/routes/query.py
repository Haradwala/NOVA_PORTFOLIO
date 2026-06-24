from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, QueryResponse, VisitorMemory
from app.services.intent.matcher import match_intent
from app.services.response_builder import build_response

router = APIRouter(prefix="/query", tags=["Query"])

@router.post("", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    
    # 1. Match intent using rule-based calculations
    intent_data = match_intent(text)
    
    # 2. Build QueryResponse payload using data provider layers
    current_mem = request.memory or VisitorMemory()
    response_payload = build_response(intent_data, text, current_mem)
    
    return response_payload
