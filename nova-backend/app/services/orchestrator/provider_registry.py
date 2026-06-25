from typing import Dict, List, Optional
from app.services.providers.provider import BaseAIProvider

class ProviderRegistry:
    def __init__(self):
        self._providers: Dict[str, BaseAIProvider] = {}
        self._default_name: Optional[str] = None

    def register(self, provider: BaseAIProvider):
        """Registers a provider. If no default is set, sets this as default."""
        name = provider.name()
        self._providers[name] = provider
        if not self._default_name:
            self._default_name = name

    def unregister(self, name: str):
        """Unregisters a provider."""
        if name in self._providers:
            del self._providers[name]
        if self._default_name == name:
            self._default_name = list(self._providers.keys())[0] if self._providers else None

    def get(self, name: str) -> BaseAIProvider:
        """Retrieves a provider by name."""
        if name not in self._providers:
            raise ValueError(f"Provider '{name}' is not registered.")
        return self._providers[name]

    def exists(self, name: str) -> bool:
        """Checks if a provider exists."""
        return name in self._providers

    def list(self) -> List[str]:
        """Lists registered provider names."""
        return list(self._providers.keys())

    def default(self) -> BaseAIProvider:
        """Retrieves the default provider."""
        if not self._default_name or self._default_name not in self._providers:
            raise ValueError("No default provider registered.")
        return self._providers[self._default_name]

    def set_default(self, name: str):
        """Sets the default provider."""
        if name not in self._providers:
            raise ValueError(f"Cannot set default. Provider '{name}' is not registered.")
        self._default_name = name

    def health(self) -> Dict[str, bool]:
        """Runs health checks on all registered providers."""
        return {name: prov.health() for name, prov in self._providers.items()}

# Global registry instance
_registry = ProviderRegistry()

def get_registry() -> ProviderRegistry:
    return _registry
