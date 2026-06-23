const registry = {};

export function registerSection(id, ref) {
  registry[id] = ref;

  // Process any pending scroll actions for this section
  if (window.__pendingScroll === id) {
    window.__pendingScroll = null;
    const isHighlight = window.__pendingHighlight === id;
    if (isHighlight) {
      window.__pendingHighlight = null;
    }

    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (isHighlight) {
          highlightSection(id);
        }
      }
    }, 450); // Small buffer to ensure mounting layout settles
  }

  return () => {
    delete registry[id];
  };
}

export function scrollToSection(id) {
  const ref = registry[id];
  if (ref && ref.current) {
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  return false;
}

export function highlightSection(id) {
  const ref = registry[id];
  if (ref && ref.current) {
    ref.current.classList.add('pulse-highlight');
    setTimeout(() => {
      ref.current.classList.remove('pulse-highlight');
    }, 2000);
    return true;
  }
  return false;
}
