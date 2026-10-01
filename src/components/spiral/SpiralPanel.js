/**
 * SpiralPanel.js
 *
 * Physical 3D curved project panel representation:
 *   - Curved physical canvas (subtle cylindrical curvature R = 2.2)
 *   - Dimensions: panelWidth ≈ 1.55, panelHeight = 1.2, thickness = 0.025
 *   - Frosted acrylic physical substrate with dual-layer depth
 *   - Authentic project thumbnail + minimal typography for each portfolio project
 *   - Texture caching across the 8 repeated project instances
 */

import * as THREE from 'three';
import { SPIRAL_CONFIG } from './spiralConfig';

/**
 * Creates curved rectangular plane geometry that bends around cylinder radius R
 */
export function createCurvedPanelGeometry(width, height, radius, segmentsX = 24, segmentsY = 4) {
  const geo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i);
    const angle = u / radius;
    pos.setX(i, radius * Math.sin(angle));
    pos.setZ(i, -radius * (1 - Math.cos(angle)));
  }

  geo.computeVertexNormals();
  return geo;
}

// Global texture cache for the 8 authentic projects
const textureCache = new Map();

/**
 * Generates an authentic, crisp canvas thumbnail texture for a project.
 * Adheres strictly to Sections 7 & 8:
 *   - [ PROJECT IMAGE / THUMBNAIL ]
 *   - PROJECT NAME
 *   - Minimal typography, no fake telemetry, no status badges, no fake statistics.
 */
export function getProjectTexture(project) {
  if (textureCache.has(project.id)) {
    return textureCache.get(project.id);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  const { title, category, year, color = '#8B5CF6', accentColor = '#A78BFA' } = project;

  // Background substrate: Frosted deep dark slate
  ctx.fillStyle = '#0c0e14';
  ctx.fillRect(0, 0, 768, 600);

  // Subtle interior gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 768, 600);
  bgGrad.addColorStop(0, 'rgba(25, 28, 40, 0.95)');
  bgGrad.addColorStop(1, 'rgba(10, 11, 18, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(12, 12, 744, 576);

  // Soft ambient radial glow using the project's authentic color accent
  const glow = ctx.createRadialGradient(384, 200, 20, 384, 200, 280);
  glow.addColorStop(0, `${color}28`);
  glow.addColorStop(0.6, `${color}08`);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 768, 420);

  // Subtle frosted perimeter frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 736, 568);

  // ── 1. PROJECT VISUAL THUMBNAIL AREA (Top 65%) ──
  ctx.save();
  ctx.beginPath();
  ctx.rect(36, 36, 696, 350);
  ctx.clip();

  // Abstract visual treatment derived strictly from project brand identity
  ctx.fillStyle = 'rgba(15, 17, 26, 0.85)';
  ctx.fillRect(36, 36, 696, 350);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 696, 350);

  // Project identity visual emblem
  const cx = 384;
  const cy = 210;

  if (project.id === 'nova' || project.id === 'nova-desktop') {
    // Living neural core rings
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 64, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 84, 40, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (project.id === 'finance-manager') {
    // Balanced accounting ledger isometric geometry
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    // Central isometric cube
    const s = 48;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + s * 0.866, cy - s * 0.5);
    ctx.lineTo(cx + s * 0.866, cy + s * 0.5);
    ctx.lineTo(cx, cy + s);
    ctx.lineTo(cx - s * 0.866, cy + s * 0.5);
    ctx.lineTo(cx - s * 0.866, cy - s * 0.5);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + s);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + s * 0.866, cy - s * 0.5);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - s * 0.866, cy - s * 0.5);
    ctx.stroke();
  } else if (project.id === 'trading-intelligence') {
    // Quantitative market series curve
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 100, cy + 40);
    ctx.lineTo(cx - 50, cy + 20);
    ctx.lineTo(cx - 10, cy - 35);
    ctx.lineTo(cx + 30, cy + 5);
    ctx.lineTo(cx + 70, cy - 45);
    ctx.lineTo(cx + 105, cy - 60);
    ctx.stroke();

    // Baseline axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 110, cy + 50);
    ctx.lineTo(cx + 115, cy + 50);
    ctx.stroke();
  } else if (project.id === 'forge') {
    // IDE Bracket symbols { }
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.font = '700 72px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('{  }', cx, cy);
    ctx.fillStyle = accentColor;
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText('OS', cx, cy);
  } else if (project.id === 'petal-npins') {
    // Blossom geometric petals
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * 32, cy + Math.sin(a) * 32, 28, 14, a, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (project.id === 'mr-agro') {
    // Agritech leaf canopy geometry
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 55);
    ctx.quadraticCurveTo(cx - 55, cy, cx, cy - 55);
    ctx.quadraticCurveTo(cx + 55, cy, cx, cy + 55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 55);
    ctx.lineTo(cx, cy - 45);
    ctx.stroke();
  } else {
    // Dealership Platform / Automotive geometry
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 55, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
    ctx.strokeStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 36, cy - 26);
    ctx.stroke();
  }

  ctx.restore();

  // ── 2. MINIMAL PROJECT INFORMATION AREA (Bottom 35%) ──
  // Hairline dividing line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, 420);
  ctx.lineTo(732, 420);
  ctx.stroke();

  // Project Title (Bold, crisp, clean)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 36px "Instrument Sans", "Syne", -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(title.toUpperCase(), 44, 475);

  // Subtitle / Category + Year (Subtle, elegant)
  ctx.fillStyle = 'rgba(220, 225, 240, 0.65)';
  ctx.font = '500 20px "JetBrains Mono", "IBM Plex Mono", monospace';
  ctx.fillText(`${category} · ${year}`, 44, 520);

  // Right-aligned discreet selection indicator
  ctx.fillStyle = accentColor;
  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('EXPLORE →', 720, 485);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.minFilter = THREE.LinearFilter;
  textureCache.set(project.id, texture);
  return texture;
}

/**
 * Creates an individual spiral panel mesh assembly
 */
export function createSpiralPanelMesh(index, totalPanels, geometryConfig, project) {
  const { panelWidth, panelHeight, radius, panelThickness } = geometryConfig;

  // Root assembly group for this panel
  const group = new THREE.Group();
  group.name = `spiral-panel-${index}`;

  const frontGeometry = createCurvedPanelGeometry(panelWidth, panelHeight, radius);

  // Project texture canvas
  const projectTexture = getProjectTexture(project);

  // Physical frosted acrylic material with project texture decal mapped
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: projectTexture,
    roughness: 0.28,
    metalness: 0.05,
    transmission: 0.65,
    thickness: 0.25,
    ior: 1.35,
    clearcoat: 0.35,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.95,
  });

  const frontMesh = new THREE.Mesh(frontGeometry, material);
  frontMesh.castShadow = true;
  frontMesh.receiveShadow = true;
  group.add(frontMesh);

  // Physical back plate for depth / acrylic thickness
  const backGeo = createCurvedPanelGeometry(panelWidth * 0.99, panelHeight * 0.99, radius, 16, 2);
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x12141c,
    roughness: 0.8,
    metalness: 0.05,
    transparent: true,
    opacity: 0.3,
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.z = -panelThickness;
  group.add(backMesh);

  // Pitch tilt slope angle along the helix rise
  const pitchSlopeAngle = Math.atan2(geometryConfig.pitch, 2 * Math.PI * radius);
  frontMesh.rotation.z = pitchSlopeAngle;
  backMesh.rotation.z = pitchSlopeAngle;

  return {
    mesh: group,
    frontMesh,
    backMesh,
    material,
    index,
    projectIndex: index % 8,
    project,
    pitchSlopeAngle,
  };
}
