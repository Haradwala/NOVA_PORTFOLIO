export const CORE_NODES = [
  { label: 'Projects',   route: '/work',    description: 'Interactive project portfolio' },
  { label: 'Skills',     route: '/about',   description: 'Core technical capabilities' },
  { label: 'Experience', route: '/about',   description: 'Professional history' },
  { label: 'Contact',    route: '/contact', description: 'Get in touch' },
  { label: 'AI Systems', route: '/chat',    description: 'Integrated assistant capabilities' },
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
