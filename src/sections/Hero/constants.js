export const CORE_NODES = [
  { label: 'About',    route: '/', description: 'Learn about Shadab' },
  { label: 'Skills',   route: '/', description: 'Technical toolkit' },
  { label: 'Projects', route: '/', description: 'Featured case studies' },
  { label: 'Contact',  route: '/', description: 'Get in touch' },
];

export const INTENT_KEYWORDS = {
  PROJECTS:    ['project', 'work', 'petal', 'pins', 'portfolio', 'e-commerce', 'design'],
  SKILLS:      ['skill', 'toolkit', 'stack', 'three.js', 'react', 'supabase'],
  EXPERIENCE:  ['experience', 'career', 'job', 'timeline', 'history', 'chronology'],
  CONTACT:     ['contact', 'email', 'message', 'touch', 'reach out', 'hire'],
  AI_SYSTEMS:  ['ai system', 'assistant', 'chat', 'nova', 'speech', 'engine'],
};

// ── Neural Singularity Particle Configuration ──────────────────────────────
// Three-layer density: Consciousness Core / Cognitive Field / Drift Horizon
export const PARTICLE_CONFIG = {
  mobile: {
    count:          900,
    maxConnections: 140,
    maxDist:        0.38,
  },
  desktop: {
    count:          2600,
    maxConnections: 420,
    maxDist:        0.30,
  },
};

export const HUD_LEFT_ITEMS = [
  'AI Cognitive Systems',
  '3D Experiences',
  'LLM Agents',
  'Three.js • React • Node • Supabase',
];

export const HUD_RIGHT_ITEMS = [
  'NOVA Engine v2.0',
  'Neural Operating Virtual Architecture',
  'Voice-Powered AI Assistant',
  'Interactive Portfolio Experience',
];
