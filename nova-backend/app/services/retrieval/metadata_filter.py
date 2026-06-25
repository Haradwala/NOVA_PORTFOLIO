from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseMetadataFilter(ABC):
    @abstractmethod
    def apply(self, documents: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Filters a list of documents based on a dict of metadata filter criteria."""
        pass

class MetadataFilter(BaseMetadataFilter):
    def apply(self, documents: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Applies filters to the documents list.
        Each doc has 'type' and 'metadata' dict.
        Filters are key-value checks matching against metadata values,
        plus a special key 'type' matching the document type.
        """
        if not filters:
            return documents
            
        filtered = []
        for doc in documents:
            doc_type = doc.get("type")
            metadata = doc.get("metadata", {})
            
            match = True
            for k, v in filters.items():
                if k == "type":
                    if doc_type != v and metadata.get("type") != v:
                        match = False
                        break
                else:
                    if metadata.get(k) != v:
                        match = False
                        break
            if match:
                filtered.append(doc)
        return filtered
