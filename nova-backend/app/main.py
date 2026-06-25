from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, query, session
from app.config import DEBUG, ALLOWED_ORIGINS

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Bootstrap Context Engine (loading entities and relationship graph)
    from app.services.context.context_engine import initialize_context_engine
    initialize_context_engine()
    
    # Register Mock Provider
    from app.services.orchestrator.provider_registry import get_registry
    from app.services.providers.mock_provider import MockProvider
    registry = get_registry()
    registry.register(MockProvider())
    
    # Register OpenAI Provider if API key is present
    import os
    if os.getenv("OPENAI_API_KEY"):
        try:
            from app.services.providers.openai_provider import OpenAIProvider
            openai_provider = OpenAIProvider()
            registry.register(openai_provider)
            registry.set_default("openai")
        except Exception as e:
            import logging
            logging.getLogger("main").warning(f"Failed to initialize OpenAIProvider: {e}")
            
    yield

# Initialize app
app = FastAPI(
    title="NOVA Core AI Backend",
    description="Python FastAPI engine for portfolio logic, intents, and voice proxies.",
    version="1.0.0",
    debug=DEBUG,
    lifespan=lifespan
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
api_router.include_router(session.router)

app.include_router(api_router)

