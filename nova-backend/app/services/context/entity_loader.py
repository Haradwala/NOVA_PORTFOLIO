import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.models.schemas import ProjectNodeMetadata, SkillNodeMetadata
from app.core.constants import NODE_TYPE_PROJECT, NODE_TYPE_SKILL, NODE_TYPE_TECHNOLOGY, NODE_TYPE_EXPERIENCE

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge"

# In-memory entity index cache
_cached_entities: Dict[str, Dict[str, Any]] = {}

def get_entity_index() -> Dict[str, Dict[str, Any]]:
    """Return the cached entities index."""
    return _cached_entities

def initialize_entities():
    """Initializes the entity index cache. Called on startup."""
    global _cached_entities
    _cached_entities.clear()
    
    # 1. Projects
    proj_path = DATA_DIR / "projects.json"
    if proj_path.exists():
        try:
            with open(proj_path, "r", encoding="utf-8") as f:
                projs = json.load(f)
                for p in projs:
                    p_id = p.get("id")
                    title = p.get("title")
                    if p_id and title:
                        aliases = p.get("aliases", [])
                        if not aliases:
                            aliases = [title, p_id, p_id.replace('-', ' ')]
                        aliases = list(set([a.lower() for a in aliases if a]))
                        
                        meta = ProjectNodeMetadata(
                            technologies=p.get("technologies", []),
                            category=p.get("category", "General"),
                            github=p.get("links", {}).get("github"),
                            demo=p.get("links", {}).get("demo"),
                            aliases=aliases
                        )
                        node_id = f"{NODE_TYPE_PROJECT}:{p_id}"
                        _cached_entities[node_id] = {
                            "id": node_id,
                            "type": NODE_TYPE_PROJECT,
                            "name": title,
                            "aliases": aliases,
                            "metadata": meta.model_dump()
                        }
                        
                        # Add technologies as tech entities if not present
                        for tech in p.get("technologies", []):
                            tech_id = f"{NODE_TYPE_TECHNOLOGY}:{tech.lower().replace(' ', '-')}"
                            if tech_id not in _cached_entities:
                                _cached_entities[tech_id] = {
                                    "id": tech_id,
                                    "type": NODE_TYPE_TECHNOLOGY,
                                    "name": tech,
                                    "aliases": [tech.lower()],
                                    "metadata": {}
                                }
        except Exception:
            pass

    # 2. Skills
    skills_path = DATA_DIR / "skills.json"
    if skills_path.exists():
        try:
            with open(skills_path, "r", encoding="utf-8") as f:
                sk = json.load(f)
                for cat in sk.get("categories", []):
                    cat_name = cat.get("name", "")
                    for tech in cat.get("techs", []):
                        tech_id = f"{NODE_TYPE_TECHNOLOGY}:{tech.lower().replace(' ', '-')}"
                        if tech_id in _cached_entities:
                            _cached_entities[tech_id]["type"] = NODE_TYPE_SKILL
                            _cached_entities[tech_id]["metadata"] = SkillNodeMetadata(
                                category=cat_name,
                                level="Intermediate",
                                years="2+"
                            ).model_dump()
                for item in sk.get("rawList", []):
                    name = item.get("name")
                    level = item.get("level", "Advanced")
                    if name:
                        skill_id = f"{NODE_TYPE_SKILL}:{name.lower().replace(' ', '-')}"
                        aliases = item.get("aliases", [name.lower()])
                        _cached_entities[skill_id] = {
                            "id": skill_id,
                            "type": NODE_TYPE_SKILL,
                            "name": name,
                            "aliases": list(set([a.lower() for a in aliases])),
                            "metadata": SkillNodeMetadata(
                                category="General Competency",
                                level=level,
                                years="3+"
                            ).model_dump()
                        }
        except Exception:
            pass

    # 3. Experience
    exp_path = DATA_DIR / "experience.json"
    if exp_path.exists():
        try:
            with open(exp_path, "r", encoding="utf-8") as f:
                exps = json.load(f)
                for e in exps:
                    company = e.get("company")
                    role = e.get("role")
                    if company:
                        comp_id = f"{NODE_TYPE_EXPERIENCE}:{company.lower().replace(' ', '-')}"
                        _cached_entities[comp_id] = {
                            "id": comp_id,
                            "type": NODE_TYPE_EXPERIENCE,
                            "name": company,
                            "aliases": [company.lower()],
                            "metadata": {
                                "role": role,
                                "year": e.get("year"),
                                "status": e.get("status")
                            }
                        }
        except Exception:
            pass

def reload_entities():
    """Manual reload of the entity cache (e.g. for administrative tools)."""
    initialize_entities()
