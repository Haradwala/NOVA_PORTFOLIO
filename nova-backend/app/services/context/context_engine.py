from app.services.context.entity_loader import initialize_entities
from app.services.context.relationship_graph import load_graph_from_knowledge

def initialize_context_engine():
    """
    Bootstraps the Context Intelligence Engine by initializing the
    dynamic entity cache and pre-populating relationship graph nodes/edges.
    """
    # 1. Load entities from knowledge database JSONs into the cache
    initialize_entities()
    
    # 2. Populate static relationships in the relationship graph
    load_graph_from_knowledge()
