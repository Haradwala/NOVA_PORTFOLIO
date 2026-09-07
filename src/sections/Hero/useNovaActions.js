import { useCallback } from 'react';
import { useWarpTransition } from '../../hooks/useWarpTransition';
import { scrollToSection, highlightSection } from '../../utils/sectionRegistry';

export function useNovaActions({ setHighlightedNode } = {}) {
  const { warpTo } = useWarpTransition();

  const executeAction = useCallback((action, payload) => {
    if (!action) return;

    const triggerNodeFeedback = (label) => {
      if (!label) return;
      window.dispatchEvent(new CustomEvent('nova-nav', { detail: { label } }));
      if (setHighlightedNode) {
        setHighlightedNode(label);
        setTimeout(() => {
          setHighlightedNode((current) => (current === label ? null : current));
        }, 3000);
      }
    };

    switch (action) {
      case 'scroll_projects': {
        triggerNodeFeedback('Projects');
        const scrolled = scrollToSection('projects');
        if (!scrolled) {
          window.__pendingScroll = 'projects';
          warpTo('/work');
        }
        break;
      }
      case 'scroll_contact': {
        triggerNodeFeedback('Contact');
        const scrolled = scrollToSection('contact');
        if (!scrolled) {
          window.__pendingScroll = 'contact';
          warpTo('/contact');
        }
        break;
      }
      case 'highlight_skills': {
        triggerNodeFeedback('Skills');
        const scrolled = scrollToSection('skills');
        if (scrolled) {
          highlightSection('skills');
        } else {
          window.__pendingScroll = 'skills';
          window.__pendingHighlight = 'skills';
          warpTo('/about');
        }
        break;
      }
      case 'scroll_about': {
        triggerNodeFeedback('About');
        const scrolled = scrollToSection('about');
        if (!scrolled) {
          window.__pendingScroll = 'about';
          warpTo('/about');
        }
        break;
      }
      case 'open_project': {
        triggerNodeFeedback('Projects');
        if (!payload) return;

        // Dispatch a custom event in case the Work component is already mounted on the active route
        window.dispatchEvent(new CustomEvent('nova-open-project', { detail: { projectId: payload } }));

        if (window.location.pathname !== '/work') {
          warpTo(`/work?project=${payload}`);
        }
        break;
      }
      default:
        break;
    }
  }, [warpTo, setHighlightedNode]);

  return { executeAction };
}
