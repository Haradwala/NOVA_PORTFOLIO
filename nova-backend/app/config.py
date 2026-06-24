import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory setup
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment file
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

# App Config variables
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")
DEBUG = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")

# CORS origins loading and parsing
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in allowed_origins_raw.split(",")
    if origin.strip()
]
if not ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]

# API Keys & LLM Config (future-ready)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_STT_MODEL = os.getenv("OPENAI_STT_MODEL", "gpt-4o-mini-transcribe")
OPENAI_TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
OPENAI_TTS_VOICE = os.getenv("OPENAI_TTS_VOICE", "nova")
