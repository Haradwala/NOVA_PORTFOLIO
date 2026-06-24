from typing import List, Dict, Any
from app.models.schemas import VisitorMemory
from app.core.constants import IMPORTANCE_PERMANENT, IMPORTANCE_MEDIUM, IMPORTANCE_LOW

class ImportanceConfig:
    WEIGHT_PERMANENT = IMPORTANCE_PERMANENT
    WEIGHT_MEDIUM = IMPORTANCE_MEDIUM
    WEIGHT_LOW = IMPORTANCE_LOW

def rank_memory(memory: VisitorMemory) -> List[Dict[str, Any]]:
    ranked = []
    cfg = ImportanceConfig()
    
    # 1. Permanent items
    if memory.lastName:
        ranked.append({
            "key": "lastName",
            "value": memory.lastName,
            "category": "Permanent",
            "score": cfg.WEIGHT_PERMANENT,
            "description": "Visitor's lastName"
        })
        
    if memory.knowledgeGraph:
        for proj in memory.knowledgeGraph.get("projects", []):
            ranked.append({
                "key": f"interested_project_{proj}",
                "value": proj,
                "category": "Permanent",
                "score": cfg.WEIGHT_PERMANENT * 0.9,
                "description": f"User is interested in project: {proj}"
            })
        for skill in memory.knowledgeGraph.get("skills", []):
            ranked.append({
                "key": f"interested_skill_{skill}",
                "value": skill,
                "category": "Permanent",
                "score": cfg.WEIGHT_PERMANENT * 0.9,
                "description": f"User is interested in skill: {skill}"
            })

    # 2. Medium items
    if memory.topics:
        for topic in memory.topics:
            ranked.append({
                "key": f"topic_{topic}",
                "value": topic,
                "category": "Medium",
                "score": cfg.WEIGHT_MEDIUM,
                "description": f"Recent conversation topic: {topic}"
            })

    # 3. Low items
    if memory.questions:
        for i, q in enumerate(memory.questions):
            # Dynamic incremental weight to prefer newer queries slightly, capped
            adjusted_score = cfg.WEIGHT_LOW + (i * 0.01)
            ranked.append({
                "key": f"query_{i}",
                "value": q,
                "category": "Low",
                "score": min(adjusted_score, cfg.WEIGHT_MEDIUM - 0.1),
                "description": f"Recent query: {q}"
            })

    # Sort descending by importance score
    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked
