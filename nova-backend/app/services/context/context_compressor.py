from typing import List, Dict, Any
from app.models.schemas import ConversationRecord

def compress_context(history: List[ConversationRecord], max_records: int = 3) -> Dict[str, Any]:
    """
    Compresses conversation history into a structured context dictionary.
    Includes consolidated summary, deduplicated entities, deduplicated topics,
    calculated importance score, and the timestamp range.
    """
    if not history:
        return {
            "summary": "",
            "entities": [],
            "topics": [],
            "importanceScore": 0.0,
            "timestampRange": {
                "start": "",
                "end": ""
            }
        }
    
    # Take the latest max_records
    records_to_compress = history[-max_records:]
    
    # 1. Summary: Use the incremental summary of the last record as the base,
    # fallback to joining if not fully populated.
    summary = records_to_compress[-1].summary if records_to_compress[-1].summary else ""
    if not summary:
        summaries = [rec.summary for rec in records_to_compress if rec.summary]
        summary = " ".join(summaries)
        
    # 2. Deduplicated entities and topics
    entities_set = set()
    topics_set = set()
    for rec in records_to_compress:
        if rec.entities:
            entities_set.update(rec.entities)
        if rec.topics:
            topics_set.update(rec.topics)
            
    entities = sorted(list(entities_set))
    topics = sorted(list(topics_set))
    
    # 3. Calculate importance score based on entities/topics density and count of turns
    # Low importance is 0.2, medium is 0.6, permanent/high is 1.0. Let's scale it.
    base_score = 0.2
    factor = min(0.8, 0.1 * len(records_to_compress) + 0.05 * len(entities) + 0.05 * len(topics))
    importance_score = round(base_score + factor, 2)
    
    # 4. Timestamp range
    timestamps = [rec.timestamp for rec in records_to_compress if rec.timestamp]
    if timestamps:
        start_ts = min(timestamps)
        end_ts = max(timestamps)
    else:
        start_ts = ""
        end_ts = ""
        
    return {
        "summary": summary,
        "entities": entities,
        "topics": topics,
        "importanceScore": importance_score,
        "timestampRange": {
            "start": start_ts,
            "end": end_ts
        }
    }
