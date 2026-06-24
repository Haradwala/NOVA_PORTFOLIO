from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx
import logging
from datetime import datetime
from app.models.schemas import VisitorNodeMetadata
from app.config import SUPABASE_URL, SUPABASE_KEY
from app.core.constants import (
    NODE_TYPE_VISITOR, NODE_TYPE_PROJECT, NODE_TYPE_SKILL, NODE_TYPE_TECHNOLOGY, NODE_TYPE_EXPERIENCE,
    REL_USES, REL_INTERESTED_IN, REL_RELATED_TO, REL_HAS_SKILL, REL_WORKED_ON, REL_DISCUSSED, REL_VIEWED
)

logger = logging.getLogger(__name__)

class BaseRelationshipGraph(ABC):
    @abstractmethod
    def add_node(self, node_id: str, type: str, name: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def add_relationship(self, source: str, target: str, relation_type: str, weight: float = 1.0) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_relationships(self, source: Optional[str] = None, target: Optional[str] = None, relation_type: Optional[str] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        pass

class InMemoryRelationshipGraph(BaseRelationshipGraph):
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []

    def add_node(self, node_id: str, type: str, name: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        self.nodes[node_id] = {
            "id": node_id,
            "type": type,
            "name": name,
            "metadata": metadata
        }
        return self.nodes[node_id]

    def add_relationship(self, source: str, target: str, relation_type: str, weight: float = 1.0) -> Dict[str, Any]:
        for edge in self.edges:
            if edge["source"] == source and edge["target"] == target and edge["relation_type"] == relation_type:
                edge["weight"] += weight
                return edge
        new_edge = {
            "source": source,
            "target": target,
            "relation_type": relation_type,
            "weight": weight
        }
        self.edges.append(new_edge)
        return new_edge

    def get_relationships(self, source: Optional[str] = None, target: Optional[str] = None, relation_type: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        for edge in self.edges:
            if source and edge["source"] != source:
                continue
            if target and edge["target"] != target:
                continue
            if relation_type and edge["relation_type"] != relation_type:
                continue
            results.append(edge)
        return results

    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        return self.nodes.get(node_id)

class SupabaseRelationshipGraph(BaseRelationshipGraph):
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        try:
            with httpx.Client() as client:
                res = client.get(
                    f"{self.url}/rest/v1/relationship_nodes?id=eq.{node_id}",
                    headers=self.headers,
                    timeout=5.0
                )
                if res.status_code == 200:
                    data = res.json()
                    if data:
                        return data[0]
        except Exception as e:
            logger.error(f"Supabase GET node error: {e}")
        return None

    def add_node(self, node_id: str, type: str, name: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        payload = {
            "id": node_id,
            "type": type,
            "name": name,
            "metadata": metadata
        }
        try:
            headers = self.headers.copy()
            headers["Prefer"] = "resolution=merge-duplicates,return=representation"
            with httpx.Client() as client:
                res = client.post(
                    f"{self.url}/rest/v1/relationship_nodes?on_conflict=id",
                    json=payload,
                    headers=headers,
                    timeout=5.0
                )
                if res.status_code in (200, 201):
                    data = res.json()
                    if data:
                        return data[0]
        except Exception as e:
            logger.error(f"Supabase POST node error: {e}")
        return payload

    def add_relationship(self, source: str, target: str, relation_type: str, weight: float = 1.0) -> Dict[str, Any]:
        try:
            # Check if edge already exists
            with httpx.Client() as client:
                res = client.get(
                    f"{self.url}/rest/v1/relationship_edges?source=eq.{source}&target=eq.{target}&relation_type=eq.{relation_type}",
                    headers=self.headers,
                    timeout=5.0
                )
                existing = None
                if res.status_code == 200:
                    data = res.json()
                    if data:
                        existing = data[0]
                
                if existing:
                    new_weight = existing.get("weight", 0.0) + weight
                    patch_res = client.patch(
                        f"{self.url}/rest/v1/relationship_edges?id=eq.{existing['id']}",
                        json={"weight": new_weight},
                        headers=self.headers,
                        timeout=5.0
                    )
                    if patch_res.status_code in (200, 204):
                        existing["weight"] = new_weight
                        return existing
                else:
                    headers = self.headers.copy()
                    headers["Prefer"] = "resolution=merge-duplicates,return=representation"
                    post_payload = {
                        "source": source,
                        "target": target,
                        "relation_type": relation_type,
                        "weight": weight
                    }
                    post_res = client.post(
                        f"{self.url}/rest/v1/relationship_edges?on_conflict=source,target,relation_type",
                        json=post_payload,
                        headers=headers,
                        timeout=5.0
                    )
                    if post_res.status_code in (200, 201):
                        data = post_res.json()
                        if data:
                            return data[0]
        except Exception as e:
            logger.error(f"Supabase add_relationship error: {e}")
        return {"source": source, "target": target, "relation_type": relation_type, "weight": weight}

    def get_relationships(self, source: Optional[str] = None, target: Optional[str] = None, relation_type: Optional[str] = None) -> List[Dict[str, Any]]:
        query_params = []
        if source:
            query_params.append(f"source=eq.{source}")
        if target:
            query_params.append(f"target=eq.{target}")
        if relation_type:
            query_params.append(f"relation_type=eq.{relation_type}")
        
        query_str = "&".join(query_params)
        url = f"{self.url}/rest/v1/relationship_edges"
        if query_str:
            url = f"{url}?{query_str}"
        try:
            with httpx.Client() as client:
                res = client.get(url, headers=self.headers, timeout=5.0)
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            logger.error(f"Supabase get_relationships error: {e}")
        return []

_global_graph: Optional[BaseRelationshipGraph] = None

def get_graph() -> BaseRelationshipGraph:
    global _global_graph
    if _global_graph is None:
        if SUPABASE_URL and SUPABASE_KEY:
            _global_graph = SupabaseRelationshipGraph(SUPABASE_URL, SUPABASE_KEY)
        else:
            _global_graph = InMemoryRelationshipGraph()
    return _global_graph

def load_graph_from_knowledge():
    """Pre-populates static nodes and edges from JSON knowledge files."""
    from app.services.context.entity_loader import get_entity_index
    g = get_graph()
    index = get_entity_index()
    
    # Add nodes to graph
    for node_id, data in index.items():
        g.add_node(node_id, data["type"], data["name"], data["metadata"])
        
    # Build Project ↔ Technologies (USES) and Project ↔ Skills (RELATED_TO) relationships
    for node_id, data in index.items():
        if data["type"] == NODE_TYPE_PROJECT:
            metadata = data["metadata"]
            for tech in metadata.get("technologies", []):
                tech_id = f"{NODE_TYPE_TECHNOLOGY}:{tech.lower().replace(' ', '-')}"
                if tech_id in index:
                    g.add_relationship(node_id, tech_id, REL_USES)

def update_graph_for_query(session_id: str, query: str, intent_data: Dict[str, Any], entities: List[str]):
    """Dynamically registers visitor Node and Edges based on user query."""
    g = get_graph()
    
    # 1. Ensure Visitor node exists
    visitor_id = f"{NODE_TYPE_VISITOR}:{session_id}"
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    visitor_node = g.get_node(visitor_id)
    if visitor_node:
        meta = visitor_node.get("metadata", {})
        meta["last_seen"] = now_iso
        g.add_node(visitor_id, NODE_TYPE_VISITOR, f"Visitor {session_id[:8]}", meta)
    else:
        meta = VisitorNodeMetadata(
            session_id=session_id,
            first_seen=now_iso,
            last_seen=now_iso
        ).model_dump()
        g.add_node(visitor_id, NODE_TYPE_VISITOR, f"Visitor {session_id[:8]}", meta)

    # 2. Add edges from visitor to extracted entities (INTERESTED_IN)
    from app.services.context.entity_loader import get_entity_index
    index = get_entity_index()
    
    # Map entities to their canonical node IDs
    for ent in entities:
        # Find node matching ent name
        target_id = None
        for node_id, node_data in index.items():
            if node_data["name"] == ent:
                target_id = node_id
                break
        
        if target_id:
            # Add relationship Visitor → Interested In → Entity
            g.add_relationship(visitor_id, target_id, REL_INTERESTED_IN, 1.0)
            
    # If project intent payload maps to a project
    if intent_data.get("intent") == "projects" and intent_data.get("payload"):
        proj_id = intent_data["payload"]
        proj_node_id = f"{NODE_TYPE_PROJECT}:{proj_id}"
        if proj_node_id in index:
            g.add_relationship(visitor_id, proj_node_id, REL_INTERESTED_IN, 1.0)
