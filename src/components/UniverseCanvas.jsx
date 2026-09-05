/**
 * UniverseCanvas.jsx
 *
 * Previously re-exported NovaBackground (2D canvas grid-tunnel).
 * Now delegates to CinematicUniverseCanvas (shared R3F environment background).
 *
 * This file is kept as a thin re-export for backward compatibility with
 * any external import that still references UniverseCanvas directly.
 */
export { default } from '../features/scene-engine/CinematicUniverseCanvas';
