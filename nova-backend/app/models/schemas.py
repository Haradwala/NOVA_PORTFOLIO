from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Message(BaseModel):
    role: str = Field(..., description="Role of the message author: 'user' or 'nova'")
    content: str = Field(..., description="Text content of the message")

class VisitorMemory(BaseModel):
    visitCount: int = Field(default=1, description="Number of times the client visited the page")
    topics: List[str] = Field(default_factory=list, description="Categorized topics client showed interest in")
    lastName: Optional[str] = Field(None, description="Extracted client name if resolved")
    lastQuestion: Optional[str] = Field(None, description="Last recorded question transcript")

class PreviewData(BaseModel):
    type: str = Field(..., description="Category identifier, e.g. 'project', 'skills', 'contact'")
    data: Dict[str, Any] = Field(..., description="Dynamic payload associated with the preview type")

class QueryRequest(BaseModel):
    text: str = Field(..., description="The query string / speech transcript text")
    memory: Optional[VisitorMemory] = Field(default_factory=VisitorMemory, description="Client session memory state")
    history: List[Message] = Field(default_factory=list, description="Conversational history for prompt injection")

class DebugMetadata(BaseModel):
    matched_keywords: List[str]
    matched_intent: str
    confidence: float

class QueryResponse(BaseModel):
    reply: str = Field(..., description="Text reply composed by the AI assistant")
    intent: str = Field(..., description="Classified intent label, e.g. 'about', 'skills', 'fallback'")
    confidence: float = Field(..., description="Intent matching confidence rating")
    action: Optional[str] = Field(None, description="Visual interaction or navigation callback action")
    preview: Optional[PreviewData] = Field(None, description="Contextual dynamic view payload")
    updated_memory: VisitorMemory = Field(..., description="Mutated client memory object")
    debug: Optional[DebugMetadata] = Field(None, description="Debug details for development environment")
