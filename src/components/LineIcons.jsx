/**
 * LineIcons.jsx — Bespoke Line-Icon SVGs
 * 
 * Replaces all native emojis across Identity, Capabilities, and Work with
 * crisp, accessible vector SVGs formatted in the site's dark/violet/teal/rose palette.
 */

import React from 'react';

// Common base wrapper
function IconBase({ size = 16, color = 'currentColor', className = '', style = {}, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      {...props}
    >
      {children}
    </svg>
  );
}

// ── Educational & Academic Icons ─────────────────────────────────────────────
export function GraduationCapIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </IconBase>
  );
}

export function TrophyIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </IconBase>
  );
}

export function ScrollIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z" />
      <path d="M8 21v-4a2 2 0 0 1 2-2h9" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </IconBase>
  );
}

// ── Technical & System Icons ─────────────────────────────────────────────────
export function LightningIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </IconBase>
  );
}

export function TerminalIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </IconBase>
  );
}

export function BrainIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
    </IconBase>
  );
}

export function GearIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconBase>
  );
}

export function SparklesIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </IconBase>
  );
}

export function OrbitIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
    </IconBase>
  );
}

export function GlobeIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconBase>
  );
}

export function Cube3dIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="m21 16-9 5-9-5V8l9-5 9 5v8z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </IconBase>
  );
}

export function BoxIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </IconBase>
  );
}

export function ShoppingBagIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </IconBase>
  );
}

// ── Work Card Icons ──────────────────────────────────────────────────────────
export function BlossomIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4a3 3 0 0 0-3 3c0 2 3 5 3 5s3-3 3-5a3 3 0 0 0-3-3z" />
      <path d="M12 20a3 3 0 0 0 3-3c0-2-3-5-3-5s-3 3-3 5a3 3 0 0 0 3 3z" />
      <path d="M4 12a3 3 0 0 0 3 3c2 0 5-3 5-3s-3-3-5-3a3 3 0 0 0-3 3z" />
      <path d="M20 12a3 3 0 0 0-3-3c-2 0-5 3-5 3s3 3 5 3a3 3 0 0 0 3-3z" />
    </IconBase>
  );
}

export function MonitorIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </IconBase>
  );
}

// ── Capabilities Technology Icons ────────────────────────────────────────────
export function BotIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <rect width="18" height="12" x="3" y="6" rx="2" />
      <path d="M12 2v4" />
      <line x1="8" y1="12" x2="8" y2="12.01" />
      <line x1="16" y1="12" x2="16" y2="12.01" />
    </IconBase>
  );
}

export function CodeBracketIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </IconBase>
  );
}

export function MessageSquareIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </IconBase>
  );
}

export function RadioTowerIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </IconBase>
  );
}

export function AtomIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <circle cx="12" cy="12" r="1.5" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(90 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(150 12 12)" />
    </IconBase>
  );
}

export function ServerIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </IconBase>
  );
}

export function RocketIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 9v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </IconBase>
  );
}

export function DatabaseIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </IconBase>
  );
}

export function LeafIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M11 20A7 7 0 0 1 4 13C4 7 11 2 20 2c0 9-5 16-9 18z" />
      <path d="M4 20c4-4 8-8 16-18" />
    </IconBase>
  );
}

export function RefreshCwIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </IconBase>
  );
}

export function PaletteIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </IconBase>
  );
}

export function RulerIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </IconBase>
  );
}

export function MusicIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </IconBase>
  );
}

export function VideoCameraIcon({ size = 16, color = 'currentColor', ...props }) {
  return (
    <IconBase size={size} color={color} {...props}>
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </IconBase>
  );
}
