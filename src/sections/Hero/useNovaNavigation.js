import { useCallback } from 'react';
import { useWarpTransition } from '../../hooks/useWarpTransition';
import { useNovaKnowledge } from './useNovaKnowledge';
import { useNovaActions } from './useNovaActions';
import { INTENT_KEYWORDS } from './constants';

export const SECTION_TO_ACTION = {
  contact: 'scroll_contact',
  projects: 'scroll_projects',
  skills: 'highlight_skills',
  about: 'scroll_about',
};

export function getContextualNavigationReply(section) {
  switch (section) {
    case 'contact':
      return 'Navigating to the Contact section.';
    case 'projects':
      return 'Opening the Projects section.';
    case 'skills':
      return 'Highlighting the Skills matrix.';
    case 'about':
      return 'Taking you to the About section.';
    default:
      return 'Sure, taking you there now.';
  }
}

export function detectReferencedSection(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.toLowerCase();

  // Contact keywords / email / form / touch base
  if (/\b(hello@shadab\.design|contact(\s*(form|page|section|details|info))?|reach(\s*(out|shadab))?|get\s*in\s*touch|hire(\s*(him|shadab))?|touch\s*base)\b/i.test(clean)) {
    return 'contact';
  }

  // Projects keywords / case studies / grid / work
  if (/\b(projects?(\s*(grid|section|page|list))?|case\s*stud(y|ies)|featured\s*(work|project)|portfolio(\s*(items|section|work))?|work\s*(section|page))\b/i.test(clean)) {
    return 'projects';
  }

  // Skills keywords / stack / toolkit
  if (/\b(skills?(\s*(matrix|section|set|overview))?|toolkit(\s*matrix)?|tech(nical)?\s*stack|core\s*competencies|tools\s*and\s*technologies)\b/i.test(clean)) {
    return 'skills';
  }

  // About keywords / background / bio / experience
  if (/\b(about(\s*(section|page|shadab|him))?|background|career\s*(history|journey)|work\s*experience|professional\s*(background|chronology)|biography)\b/i.test(clean)) {
    return 'about';
  }

  return null;
}

export function isContextualNavigationQuery(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.toLowerCase().trim().replace(/[.!?]+$/, '');

  // If user explicitly mentions a section name, it's NOT a purely contextual query
  if (/\b(contact|projects?|skills?|about)\b/i.test(clean)) return false;

  // Exact or standalone anaphoric phrases
  const anaphoricExact = /^(take me there|take me to it|take me|go there|open it|open that|show it|show me that|show me|scroll there|view it|lead the way|let's go)$/i;
  if (anaphoricExact.test(clean)) return true;

  // Phrases containing embedded "take me there", "go there", "open it" etc.
  const anaphoricEmbedded = /\b(take me there|go there|open it|open that|scroll there|view it)\b/i;
  if (anaphoricEmbedded.test(clean)) return true;

  // Affirmative responses to a suggestion/prompt
  const affirmative = /^(yes|yep|yeah|yup|sure|okay|ok|definitely|absolutely|please do|why not|let's do it)$/i;
  if (affirmative.test(clean)) return true;

  return false;
}

function isNavigationQuery(text) {
  const clean = text.toLowerCase().trim();
  const navPhrases = [
    'show me',
    'show',
    'take me',
    'open',
    'navigate',
    'go to',
    'scroll to',
    'display',
    'visualize',
    'launch',
    'jump to'
  ];
  return navPhrases.some(phrase => clean.includes(phrase));
}

function resolvePronouns(text, lastEntity) {
  if (!lastEntity) return text;
  
  const cleanText = text.toLowerCase().trim();
  const pronouns = ['it', 'this', 'that'];
  
  if (pronouns.includes(cleanText)) {
    return lastEntity;
  }
  
  let resolved = cleanText;
  pronouns.forEach(p => {
    const regex = new RegExp(`\\b${p}\\b`, 'g');
    resolved = resolved.replace(regex, lastEntity);
  });
  
  return resolved;
}

export function useNovaNavigation({ novaContext, speakReply, lastReferencedSectionRef }) {
  const { warpTo } = useWarpTransition();
  const { queryKnowledge } = useNovaKnowledge();
  const { executeAction } = useNovaActions({ setHighlightedNode: novaContext?.setHighlightedNode });

  const {
    activeSubNodes,
    triggerPreview,
    triggerSubNodes,
    pendingRoute,
    setPendingRoute,
    navigationLock,
    setNavigationLock,
    resetContext,
    setHighlightedNode,
    pendingAction,
    setPendingAction,
    pendingPayload,
    setPendingPayload
  } = novaContext;

  // Triggers core event pulse + route transition
  const executeNavigation = useCallback((routePath, label) => {
    // 1. Dispatch custom event to trigger core pulse & node glow
    window.dispatchEvent(new CustomEvent('nova-nav', { detail: { label } }));

    // 2. Clear focus states
    setHighlightedNode(label);

    // 3. Warp jump transition after node flash delay
    setTimeout(() => {
      resetContext();
      warpTo(routePath);
    }, 900);
  }, [warpTo, resetContext, setHighlightedNode]);

  // Intercepts query transcripts and directs flow
  const handleQueryIntent = useCallback(async (queryText) => {
    const text = queryText.toLowerCase().trim();
    if (!text) return null;

    // ── 0. CONTEXTUAL "THERE" RESOLUTION ("take me there", "yep", "sure", "open it") ──
    if (isContextualNavigationQuery(text)) {
      // Priority A: pendingAction if set from a previous confirmation prompt
      if (pendingAction) {
        const action = pendingAction;
        const payload = pendingPayload;
        setPendingAction(null);
        setPendingPayload(null);
        executeAction(action, payload);
        return "Sure, taking you there now.";
      }

      // Priority B: lastReferencedSectionRef (set by local knowledge engine or LLM reply)
      const targetSection = lastReferencedSectionRef?.current;
      if (targetSection) {
        const targetAction = SECTION_TO_ACTION[targetSection];
        if (targetAction) {
          executeAction(targetAction);
          return getContextualNavigationReply(targetSection);
        }
      }

      // Priority C: No context available -> return null so handleSend falls through to LLM gracefully!
      return null;
    }

    // ── PENDING ACTION PROCESSING ──
    if (pendingAction) {
      const isConfirmation = ['yes', 'sure', 'okay', 'take me there', 'show me'].some(kw => text === kw || text.includes(kw));
      const isCancellation = ['no', 'nope', 'not now', 'maybe later', 'cancel', 'never mind', 'stay here'].some(kw => text === kw || text.includes(kw));

      if (isConfirmation) {
        const action = pendingAction;
        const payload = pendingPayload;
        setPendingAction(null);
        setPendingPayload(null);
        executeAction(action, payload);
        return "Sure, taking you there now.";
      } else if (isCancellation) {
        setPendingAction(null);
        setPendingPayload(null);
        return "No problem. Let me know if you'd like to explore that section later.";
      } else {
        // Clear pending action if user says something else, then proceed to normal processing
        setPendingAction(null);
        setPendingPayload(null);
      }
    }

    // ── CASE A: Navigation Lock is Active (Waiting for confirmation) ──
    if (navigationLock) {
      if (text.includes('more') || text.includes('open') || text.includes('view') || text.includes('go') || text.includes('study')) {
        if (pendingRoute) {
          const route = pendingRoute;
          const label = pendingRoute === '/work' ? 'Projects' : pendingRoute === '/contact' ? 'Contact' : 'Skills';
          executeNavigation(route, label);
          return `Opening system portal. Transitioning...`;
        }
      }
      
      // Check if they verbally selected one of the active sub-nodes
      const matchedNode = activeSubNodes.find(node => text.includes(node.toLowerCase()));
      if (matchedNode) {
        let route = '/work';
        if (matchedNode.includes('Systems') || matchedNode.includes('Stack')) route = '/work';
        if (matchedNode.includes('Commerce')) route = '/work';
        executeNavigation(route, matchedNode);
        return `Navigating to ${matchedNode}. Loading data packages.`;
      }
    }

    // ── CASE B: Direct Knowledge Search Lookups ──
    const resolvedText = resolvePronouns(text, novaContext.lastEntity);
    const knowledgeResponse = queryKnowledge(resolvedText);
    
    if (knowledgeResponse && knowledgeResponse.intent !== 'fallback') {
      // Update conversation context
      novaContext.setLastIntent(knowledgeResponse.intent);
      novaContext.setLastAction(knowledgeResponse.action);
      
      let entity = null;
      if (knowledgeResponse.intent === 'projects' && knowledgeResponse.preview?.data?.id) {
        entity = knowledgeResponse.preview.data.id;
      } else if (knowledgeResponse.intent === 'skills') {
        entity = 'skills';
      } else if (knowledgeResponse.intent === 'contact') {
        entity = 'contact';
      } else if (knowledgeResponse.intent === 'portfolio') {
        entity = 'portfolio';
      }
      if (entity) {
        novaContext.setLastEntity(entity);
      }

      // Track last referenced section for future contextual follow-ups
      if (knowledgeResponse.intent === 'contact') {
        if (lastReferencedSectionRef) lastReferencedSectionRef.current = 'contact';
      } else if (knowledgeResponse.intent === 'projects') {
        if (lastReferencedSectionRef) lastReferencedSectionRef.current = 'projects';
      } else if (knowledgeResponse.intent === 'skills') {
        if (lastReferencedSectionRef) lastReferencedSectionRef.current = 'skills';
      } else if (knowledgeResponse.intent === 'about' || knowledgeResponse.intent === 'experience') {
        if (lastReferencedSectionRef) lastReferencedSectionRef.current = 'about';
      }

      const actionPayload = knowledgeResponse.preview?.data?.id || null;

      // Handle navigation actions with UX confirmation prompt
      if (knowledgeResponse.action) {
        if (isNavigationQuery(text)) {
          // Navigation query -> execute action immediately
          executeAction(knowledgeResponse.action, actionPayload);
          if (knowledgeResponse.preview) {
            triggerPreview(knowledgeResponse.preview);
          }
          return knowledgeResponse.text;
        } else {
          // Informational query -> store pending action & payload, prompt for navigation
          setPendingAction(knowledgeResponse.action);
          setPendingPayload(actionPayload);
          if (knowledgeResponse.preview) {
            triggerPreview(knowledgeResponse.preview);
          }
          return `${knowledgeResponse.text} Would you like me to take you there?`;
        }
      } else {
        // No action associated with this intent
        if (knowledgeResponse.preview) {
          triggerPreview(knowledgeResponse.preview);
        }
        return knowledgeResponse.text;
      }
    }

    // ── CASE C: Broad category navigation requests ──
    if (INTENT_KEYWORDS.PROJECTS.some(kw => text.includes(kw))) {
      if (lastReferencedSectionRef) lastReferencedSectionRef.current = 'projects';
      triggerSubNodes(['AI Systems', 'E-Commerce', 'Full Stack Applications']);
      setPendingRoute('/work');
      return `I found multiple work categories: AI Systems, E-Commerce, or Full Stack. Select one to proceed.`;
    }

    if (INTENT_KEYWORDS.SKILLS.some(kw => text.includes(kw))) {
      if (lastReferencedSectionRef) lastReferencedSectionRef.current = 'skills';
      triggerSubNodes(['AI Cognitive Systems', 'Three.js / WebGL', 'UI/UX Design Systems']);
      setPendingRoute('/about');
      return `I resolved technical skills categories. Select one to open the toolkit matrix.`;
    }

    if (INTENT_KEYWORDS.EXPERIENCE.some(kw => text.includes(kw))) {
      if (lastReferencedSectionRef) lastReferencedSectionRef.current = 'about';
      triggerSubNodes(['Senior Architect', 'Product Engineer', 'Visual Designer']);
      setPendingRoute('/about');
      return `Retrieved professional chronology. Choose a node to view details.`;
    }

    if (INTENT_KEYWORDS.CONTACT.some(kw => text.includes(kw))) {
      if (lastReferencedSectionRef) lastReferencedSectionRef.current = 'contact';
      setPendingRoute('/contact');
      setNavigationLock(true);
      return `I can help establish a direct link with Shadab. Speak "Open contact" to redirect.`;
    }

    if (INTENT_KEYWORDS.AI_SYSTEMS.some(kw => text.includes(kw))) {
      setPendingRoute('/chat');
      setNavigationLock(true);
      return `Opening assistant details. Speak "Open assistant" to open chat workspace.`;
    }

    return null;
  }, [navigationLock, pendingRoute, activeSubNodes, queryKnowledge, triggerPreview, triggerSubNodes, setPendingRoute, setNavigationLock, executeNavigation, executeAction, novaContext, pendingAction, pendingPayload, setPendingAction, setPendingPayload, lastReferencedSectionRef]);

  return {
    handleQueryIntent,
    executeNavigation
  };
}


