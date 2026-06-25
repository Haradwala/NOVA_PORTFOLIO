import pytest
from app.services.orchestrator.provider_registry import get_registry
from app.services.providers.mock_provider import MockProvider

@pytest.fixture(autouse=True, scope="session")
def register_global_mock_provider():
    """Globally registers the MockProvider at the start of the test session for all tests."""
    reg = get_registry()
    if not reg.exists("mock"):
        reg.register(MockProvider())
