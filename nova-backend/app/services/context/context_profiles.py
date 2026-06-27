from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class ContextSourceConfig(BaseModel):
    enabled: bool = True
    max_records: Optional[int] = None
    max_items: Optional[int] = None

class ContextProfile(BaseModel):
    name: str = Field(..., description="Name of the context profile")
    description: str = Field(..., description="Description of the profile use-case")
    memory: ContextSourceConfig = Field(default_factory=ContextSourceConfig)
    conversation: ContextSourceConfig = Field(default_factory=ContextSourceConfig)
    knowledge: ContextSourceConfig = Field(default_factory=ContextSourceConfig)
    entities: ContextSourceConfig = Field(default_factory=ContextSourceConfig)
    relationship_graph: ContextSourceConfig = Field(default_factory=ContextSourceConfig)
    retrieval: ContextSourceConfig = Field(default_factory=ContextSourceConfig)

# Portfolio Profile: Use: Knowledge, Retrieval, Entities. Minimal: Visitor Memory, Conversation. Enabled: Graph.
PORTFOLIO_PROFILE = ContextProfile(
    name="portfolio",
    description="Focuses on portfolio knowledge, projects, skills and retrieval. Minimal memory and conversation history.",
    memory=ContextSourceConfig(enabled=True, max_items=2),
    conversation=ContextSourceConfig(enabled=True, max_records=1),
    knowledge=ContextSourceConfig(enabled=True),
    entities=ContextSourceConfig(enabled=True),
    relationship_graph=ContextSourceConfig(enabled=True),
    retrieval=ContextSourceConfig(enabled=True)
)

# Memory Profile: Use: Visitor Memory, Conversation History, Conversation Summary. Skip: Retrieval, Knowledge, Entities, Graph.
MEMORY_PROFILE = ContextProfile(
    name="memory",
    description="Focuses purely on visitor memory and conversation context. Skips retrieval and portfolio knowledge.",
    memory=ContextSourceConfig(enabled=True),
    conversation=ContextSourceConfig(enabled=True, max_records=5),
    knowledge=ContextSourceConfig(enabled=False),
    entities=ContextSourceConfig(enabled=False),
    relationship_graph=ContextSourceConfig(enabled=False),
    retrieval=ContextSourceConfig(enabled=False)
)

# Hybrid Profile: Use: Visitor Memory, Conversation, Retrieval, Knowledge, Entities, Relationship Graph.
HYBRID_PROFILE = ContextProfile(
    name="hybrid",
    description="Combines visitor memory, conversation context, hybrid retrieval, and relationship graph.",
    memory=ContextSourceConfig(enabled=True),
    conversation=ContextSourceConfig(enabled=True, max_records=3),
    knowledge=ContextSourceConfig(enabled=True),
    entities=ContextSourceConfig(enabled=True),
    relationship_graph=ContextSourceConfig(enabled=True),
    retrieval=ContextSourceConfig(enabled=True)
)

# General Profile: Balanced mix of all available context with size limits.
GENERAL_PROFILE = ContextProfile(
    name="general",
    description="Balanced fallback profile including all available context sources with size limits.",
    memory=ContextSourceConfig(enabled=True),
    conversation=ContextSourceConfig(enabled=True, max_records=3),
    knowledge=ContextSourceConfig(enabled=True),
    entities=ContextSourceConfig(enabled=True),
    relationship_graph=ContextSourceConfig(enabled=True),
    retrieval=ContextSourceConfig(enabled=True)
)

PROFILES: Dict[str, ContextProfile] = {
    "portfolio": PORTFOLIO_PROFILE,
    "memory": MEMORY_PROFILE,
    "hybrid": HYBRID_PROFILE,
    "general": GENERAL_PROFILE
}

def get_profile(name: str) -> ContextProfile:
    """Retrieves a ContextProfile by name, defaulting to general."""
    return PROFILES.get(name.lower(), GENERAL_PROFILE)
