import uuid
from fastapi import APIRouter
from app.services.memory.memory_service import create_memory

router = APIRouter(prefix="/session", tags=["Session"])

@router.post("")
async def create_session():
    session_id = str(uuid.uuid4())
    create_memory(session_id)
    return {"sessionId": session_id}
