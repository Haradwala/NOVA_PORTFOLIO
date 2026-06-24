import json
from pathlib import Path
from typing import Dict, Any, List, Optional

# Base directory for data
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge"

# In-memory cache variables
_about: Dict[str, Any] = {}
_contact: Dict[str, Any] = {}
_experience: List[Dict[str, Any]] = []
_portfolio: Dict[str, Any] = {}
_projects: List[Dict[str, Any]] = []
_skills: Dict[str, Any] = {}

def load_knowledge_data():
    global _about, _contact, _experience, _portfolio, _projects, _skills
    
    with open(DATA_DIR / "about.json", "r", encoding="utf-8") as f:
        _about = json.load(f)
        
    with open(DATA_DIR / "contact.json", "r", encoding="utf-8") as f:
        _contact = json.load(f)
        
    with open(DATA_DIR / "experience.json", "r", encoding="utf-8") as f:
        _experience = json.load(f)
        
    with open(DATA_DIR / "portfolio.json", "r", encoding="utf-8") as f:
        _portfolio = json.load(f)
        
    with open(DATA_DIR / "projects.json", "r", encoding="utf-8") as f:
        _projects = json.load(f)
        
    with open(DATA_DIR / "skills.json", "r", encoding="utf-8") as f:
        _skills = json.load(f)

# Load data on import
load_knowledge_data()

def get_about() -> Dict[str, Any]:
    return _about

def get_contact() -> Dict[str, Any]:
    return _contact

def get_experience() -> List[Dict[str, Any]]:
    return _experience

def get_projects() -> List[Dict[str, Any]]:
    return _projects

def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    for p in _projects:
        if p.get("id") == project_id:
            return p
    return None

def get_skills() -> Dict[str, Any]:
    return _skills

def get_portfolio() -> Dict[str, Any]:
    return _portfolio
