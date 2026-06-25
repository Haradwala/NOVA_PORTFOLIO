import re
from typing import Dict, Any, List
from app.services.memory.memory_service import get_memory
from app.services.context.memory_ranker import rank_memory
from app.services.conversation.conversation_service import get_history
from app.services.context.context_compressor import compress_context
from app.services.context.entity_loader import get_entity_index, initialize_entities
from app.services.context.relationship_graph import get_graph

def _match_entities(query: str) -> List[Dict[str, Any]]:
    """Matches entities from the in-memory cache against the query text."""
    index = get_entity_index()
    if not index:
        initialize_entities()
        index = get_entity_index()
        
    query_lower = query.lower()
    matched = []
    for node_id, data in index.items():
        aliases = data.get("aliases", [])
        name = data.get("name", "")
        # Merge canonical name into matching set
        all_aliases = {a.lower() for a in aliases if a}
        all_aliases.add(name.lower())
        
        matched_node = False
        for alias in all_aliases:
            if not alias:
                continue
            if len(alias) <= 3:
                # Word boundary match for short keywords
                pattern = rf"\b{re.escape(alias)}\b"
                if re.search(pattern, query_lower):
                    matched_node = True
                    break
            else:
                if alias in query_lower:
                    matched_node = True
                    break
        if matched_node:
            matched.append(data)
    return matched

def build_context(session_id: str, query: str) -> Dict[str, Any]:
    """
    Builds context dict for LLM containing ranked memory, compressed conversation,
    matched knowledge nodes, matched entity name list, and visitor relationship graph.
    """
    # 1. Memory: get and rank memory
    memory = get_memory(session_id)
    ranked_memories = []
    if memory:
        ranked_memories = rank_memory(memory)
        
    # 2. Conversation: get history and compress
    history = get_history(session_id)
    compressed_history = compress_context(history)
    
    # 3. Entities & Knowledge: match using dynamic cached entity index
    matched_nodes = _match_entities(query)
    entity_names = sorted(list({node["name"] for node in matched_nodes}))
    
    # Structure knowledge to map ID, type, name, and metadata
    knowledge_list = []
    seen_ids = set()
    for node in matched_nodes:
        node_id = node["id"]
        seen_ids.add(node_id)
        knowledge_list.append({
            "id": node_id,
            "type": node["type"],
            "name": node["name"],
            "metadata": node.get("metadata", {})
        })
        
    # 3.5. RAG Hybrid Retrieval integration
    try:
        from app.services.retrieval.retrieval_engine import get_retrieval_engine
        retriever = get_retrieval_engine()
        rag_results = retriever.retrieve(query, session_id)
        for doc in rag_results:
            if doc.id not in seen_ids:
                seen_ids.add(doc.id)
                knowledge_list.append({
                    "id": doc.id,
                    "type": doc.type,
                    "name": doc.name,
                    "metadata": doc.metadata
                })
    except Exception as e:
        import logging
        logging.getLogger("context_builder").warning(f"RAG Knowledge Retrieval failed or skipped: {e}")
        
    # 4. Relationship Graph context
    g = get_graph()
    visitor_id = f"visitor:{session_id}"
    index = get_entity_index()
    
    # Retrieve all visitor relationships
    visitor_edges = g.get_relationships(source=visitor_id)
    
    # Track all involved nodes in this session's subgraph
    involved_node_ids = {visitor_id}
    for edge in visitor_edges:
        involved_node_ids.add(edge.get("target"))
        involved_node_ids.add(edge.get("source"))
        
    for node in matched_nodes:
        involved_node_ids.add(node["id"])
        
    # Retrieve relationships among involved nodes
    all_edges = g.get_relationships()
    graph_edges = []
    for edge in all_edges:
        src = edge.get("source")
        tgt = edge.get("target")
        if src in involved_node_ids and tgt in involved_node_ids:
            rel_type = edge.get("relation_type") or edge.get("relationType")
            graph_edges.append({
                "id": edge.get("id"),
                "source": src,
                "target": tgt,
                "relationType": rel_type,
                "weight": edge.get("weight", 1.0)
            })
            
    # Fetch node detail schema for all involved nodes
    graph_nodes = []
    for nid in sorted(list(involved_node_ids)):
        node_data = g.get_node(nid)
        if node_data:
            graph_nodes.append({
                "id": node_data.get("id"),
                "type": node_data.get("type"),
                "name": node_data.get("name"),
                "metadata": node_data.get("metadata", {})
            })
        elif nid in index:
            graph_nodes.append({
                "id": index[nid]["id"],
                "type": index[nid]["type"],
                "name": index[nid]["name"],
                "metadata": index[nid]["metadata"]
            })
        elif nid == visitor_id:
            # Fallback visitor node structure
            graph_nodes.append({
                "id": visitor_id,
                "type": "visitor",
                "name": f"Visitor {session_id[:8]}",
                "metadata": {}
            })
            
    return {
        "memory": ranked_memories,
        "conversation": compressed_history,
        "knowledge": knowledge_list,
        "entities": entity_names,
        "relationship_graph": {
            "nodes": graph_nodes,
            "edges": graph_edges
        }
    }
