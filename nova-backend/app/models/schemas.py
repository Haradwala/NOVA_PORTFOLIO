from pydantic import BaseModel, Field, AliasChoices
from typing import List, Dict, Any, Optional

class Message(BaseModel):
    role: str = Field(..., description="Role of the message author: 'user' or 'nova'")
    content: str = Field(..., description="Text content of the message")

class VisitorMemory(BaseModel):
    visitCount: int = Field(
        default=1,
        serialization_alias="visitCount",
        validation_alias=AliasChoices("visitCount", "visit_count"),
        description="Number of times the client visited the page"
    )
    topics: List[str] = Field(
        default_factory=list,
        description="Categorized topics client showed interest in"
    )
    lastName: Optional[str] = Field(
        None,
        serialization_alias="lastName",
        validation_alias=AliasChoices("lastName", "last_name"),
        description="Extracted client name if resolved"
    )
    questions: List[str] = Field(
        default_factory=list,
        description="Most recent unique queries"
    )
    sessionId: Optional[str] = Field(
        None,
        serialization_alias="sessionId",
        validation_alias=AliasChoices("sessionId", "session_id"),
        description="Unique session identifier"
    )
    firstVisit: Optional[str] = Field(
        None,
        serialization_alias="firstVisit",
        validation_alias=AliasChoices("firstVisit", "first_visit"),
        description="ISO timestamp of first visit"
    )
    lastVisit: Optional[str] = Field(
        None,
        serialization_alias="lastVisit",
        validation_alias=AliasChoices("lastVisit", "last_visit"),
        description="ISO timestamp of last visit"
    )
    knowledgeGraph: Dict[str, List[str]] = Field(
        default_factory=dict,
        serialization_alias="knowledgeGraph",
        validation_alias=AliasChoices("knowledgeGraph", "knowledge_graph"),
        description="Knowledge graph relationships"
    )

class ConversationRecord(BaseModel):
    id: Optional[str] = Field(None, description="UUID of the record")
    sessionId: str = Field(
        ...,
        serialization_alias="sessionId",
        validation_alias=AliasChoices("sessionId", "session_id"),
        description="Session identifier"
    )
    timestamp: str = Field(..., description="ISO timestamp")
    userMessage: str = Field(
        ...,
        serialization_alias="userMessage",
        validation_alias=AliasChoices("userMessage", "user_message"),
        description="User's query text"
    )
    assistantReply: str = Field(
        ...,
        serialization_alias="assistantReply",
        validation_alias=AliasChoices("assistantReply", "assistant_reply"),
        description="NOVA reply text"
    )
    intent: str = Field(..., description="Matched intent name")
    entities: List[str] = Field(default_factory=list, description="Extracted entities")
    topics: List[str] = Field(default_factory=list, description="Topic classifications")
    summary: str = Field(..., description="Incremental Turn Summarization")
    payload: Optional[str] = Field(None, description="Intent payload (e.g. project ID)")





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


class ProjectNodeMetadata(BaseModel):
    technologies: List[str]
    category: str
    github: Optional[str] = None
    demo: Optional[str] = None
    aliases: List[str] = []

class SkillNodeMetadata(BaseModel):
    category: str
    level: str
    years: str

class VisitorNodeMetadata(BaseModel):
    sessionId: str = Field(..., serialization_alias="sessionId", validation_alias=AliasChoices("sessionId", "session_id"))
    firstSeen: str = Field(..., serialization_alias="firstSeen", validation_alias=AliasChoices("firstSeen", "first_seen"))
    lastSeen: str = Field(..., serialization_alias="lastSeen", validation_alias=AliasChoices("lastSeen", "last_seen"))

class RelationshipNode(BaseModel):
    id: str
    type: str
    name: str
    metadata: Dict[str, Any]

class RelationshipEdge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    relationType: str = Field(..., serialization_alias="relationType", validation_alias=AliasChoices("relationType", "relation_type"))
    weight: float = 1.0

