from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, query
from app.config import DEBUG, ALLOWED_ORIGINS

# Initialize app
app = FastAPI(
    title="NOVA Core AI Backend",
    description="Python FastAPI engine for portfolio logic, intents, and voice proxies.",
    version="1.0.0",
    debug=DEBUG
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers (versioned v1 namespace)
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(query.router)

app.include_router(api_router)
