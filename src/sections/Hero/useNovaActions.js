import { useCallback } from 'react';
import { useWarpTransition } from '../../hooks/useWarpTransition';
import { scrollToSection, highlightSection } from '../../utils/sectionRegistry';

export function useNovaActions() {
  const { warpTo } = useWarpTransition();

  const executeAction = useCallback((action, payload) => {
    if (!action) return;

    switch (action) {
      case 'scroll_projects': {
        const scrolled = scrollToSection('projects');
        if (!scrolled) {
          window.__pendingScroll = 'projects';
          warpTo('/work');
        }
        break;
      }
      case 'scroll_contact': {
        const scrolled = scrollToSection('contact');
        if (!scrolled) {
          window.__pendingScroll = 'contact';
          warpTo('/contact');
        }
        break;
      }
      case 'highlight_skills': {
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
      case 'open_project': {
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
  }, [warpTo]);

  return { executeAction };
}
