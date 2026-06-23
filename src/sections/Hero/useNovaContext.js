import { useState, useCallback } from 'react';

export function useNovaContext() {
  const [activeSubNodes, setActiveSubNodes] = useState([]);
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [previewCard, setPreviewCard] = useState(null);
  const [navigationLock, setNavigationLock] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  // Conversation context states
  const [lastIntent, setLastIntent] = useState(null);
  const [lastEntity, setLastEntity] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  const resetContext = useCallback(() => {
    setActiveSubNodes([]);
    setHighlightedNode(null);
    setPreviewCard(null);
    setNavigationLock(false);
    setPendingRoute(null);
  }, []);

  const triggerPreview = useCallback((previewPayload) => {
    setPreviewCard(previewPayload);
    setActiveSubNodes([]); // Clear generic navigation nodes
    setNavigationLock(true); // Lock auto-navigation, waiting for user approval (e.g. "Show me more")
  }, []);

  const triggerSubNodes = useCallback((subLabels) => {
    setActiveSubNodes(subLabels);
    setPreviewCard(null); // Clear preview card
    setNavigationLock(true); // Wait for node click/voice select
  }, []);

  return {
    activeSubNodes,
    setActiveSubNodes,
    highlightedNode,
    setHighlightedNode,
    previewCard,
    setPreviewCard,
    navigationLock,
    setNavigationLock,
    pendingRoute,
    setPendingRoute,
    resetContext,
    triggerPreview,
    triggerSubNodes,
    
    // Conversation context fields
    lastIntent,
    setLastIntent,
    lastEntity,
    setLastEntity,
    lastAction,
    setLastAction
  };
}

