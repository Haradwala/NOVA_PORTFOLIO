import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class HybridRankingConfig(BaseModel):
    w_vector: float = Field(default=0.5, description="Weight for vector search similarity (cosine similarity).")
    w_keyword: float = Field(default=0.3, description="Weight for keyword relevance score.")
    w_graph: float = Field(default=0.15, description="Weight for relationship graph connectivity.")
    w_recency: float = Field(default=0.05, description="Weight for chronological recency.")

def extract_year(year_str: Any) -> Optional[int]:
    """Helper to extract an integer year from metadata strings."""
    if not year_str:
        return None
    if isinstance(year_str, int):
        return year_str
    match = re.search(r"\b(20\d{2})\b", str(year_str))
    if match:
        return int(match.group(1))
    return None

class HybridRanker:
    def __init__(self, config: Optional[HybridRankingConfig] = None):
        self.config = config or HybridRankingConfig()

    def rank(
        self,
        vector_results: List[Dict[str, Any]],
        keyword_results: List[Dict[str, Any]],
        graph_relationships: List[Dict[str, Any]],
        visitor_id: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Applies the configurable hybrid ranking formula:
        score = (w_vector * vector_score)
              + (w_keyword * keyword_score)
              + (w_graph * graph_score)
              + (w_recency * recency_score)
        """
        merged: Dict[str, Dict[str, Any]] = {}

        # 1. Normalize Vector Search Scores
        for res in vector_results:
            doc_id = res["id"]
            merged[doc_id] = {
                "id": doc_id,
                "type": res.get("type") or res.get("metadata", {}).get("type", "unknown"),
                "name": res.get("name") or res.get("metadata", {}).get("title") or res.get("metadata", {}).get("name", ""),
                "content": res.get("content", ""),
                "vector_score": max(0.0, min(1.0, res.get("score", 0.0))),
                "keyword_score": 0.0,
                "graph_score": 0.0,
                "recency_score": 0.0,
                "metadata": res.get("metadata", {})
            }

        # 2. Normalize Keyword Search Scores
        max_kw = max([res["score"] for res in keyword_results]) if keyword_results else 1.0
        for res in keyword_results:
            doc_id = res["id"]
            normalized_kw = res["score"] / max_kw
            if doc_id in merged:
                merged[doc_id]["keyword_score"] = normalized_kw
            else:
                merged[doc_id] = {
                    "id": doc_id,
                    "type": res["type"],
                    "name": res["name"],
                    "content": res["content"],
                    "vector_score": 0.0,
                    "keyword_score": normalized_kw,
                    "graph_score": 0.0,
                    "recency_score": 0.0,
                    "metadata": res["metadata"]
                }

        # 3. Compute Graph Relevance Score
        graph_boosts: Dict[str, float] = {}
        for rel in graph_relationships:
            src = rel.get("source")
            tgt = rel.get("target")
            weight = rel.get("weight", 1.0)
            
            if src == visitor_id:
                graph_boosts[tgt] = graph_boosts.get(tgt, 0.0) + weight
            elif tgt == visitor_id:
                graph_boosts[src] = graph_boosts.get(src, 0.0) + weight

        for doc_id, doc in merged.items():
            boost = graph_boosts.get(doc_id, 0.0)
            if not boost and ":" in doc_id:
                parts = doc_id.split(":")
                boost = graph_boosts.get(parts[1], 0.0)
            doc["graph_score"] = min(1.0, boost / 5.0)

        # 4. Compute Recency Score
        for doc_id, doc in merged.items():
            metadata = doc.get("metadata", {})
            year = extract_year(metadata.get("year")) or extract_year(metadata.get("period"))
            if year:
                norm_recency = (year - 2019) / (2026 - 2019)
                doc["recency_score"] = max(0.0, min(1.0, norm_recency))

        # 5. Combine scores
        final_list = []
        c = self.config
        for doc_id, doc in merged.items():
            hybrid_score = (
                c.w_vector * doc["vector_score"] +
                c.w_keyword * doc["keyword_score"] +
                c.w_graph * doc["graph_score"] +
                c.w_recency * doc["recency_score"]
            )
            doc["score"] = hybrid_score
            final_list.append(doc)

        final_list.sort(key=lambda x: x["score"], reverse=True)
        return final_list[:limit]
