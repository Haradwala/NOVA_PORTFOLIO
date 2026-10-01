/**
 * SpiralPanel.js
 *
 * Curved frosted acrylic panels with:
 *   - Mathematical cylindrical curvature around radius R
 *   - Radial pitch tilt so width axis rises in the +θ direction
 *   - Individual index tint variation (±4% lightness) for distinct visual identification
 *   - Clean, minimal typography for destination panels
 */

import * as THREE from 'three';
import { SPIRAL_CONFIG } from './spiralConfig';

/**
 * Creates curved rectangular plane geometry that subtly bends around the helix cylinder
 */
function createCurvedPanelGeometry(width, height, radius, segmentsX = 24, segmentsY = 4) {
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

/**
 * Creates minimal text label texture for destination panels
 */
function createLabelTexture(label) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 720);

  // Subtle top hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 60);
  ctx.lineTo(452, 60);
  ctx.stroke();

  // Clean small typography
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '600 28px "Instrument Sans", sans-serif';
  ctx.letterSpacing = '0.18em';
  ctx.textAlign = 'center';
  ctx.fillText(label, 256, 380);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export function createSpiralPanelMesh(index, totalPanels) {
  const panelWidth = SPIRAL_CONFIG.panelWidth;
  const panelHeight = SPIRAL_CONFIG.panelHeight;
  const panelRadius = SPIRAL_CONFIG.radius;
  const thickness = SPIRAL_CONFIG.panelThickness;

  const destination = SPIRAL_CONFIG.destinations.find((d) => d.panelIndex === index);

  // Assembly group
  const group = new THREE.Group();
  group.name = `panel-${index}`;

  const frontGeometry = createCurvedPanelGeometry(panelWidth, panelHeight, panelRadius);

  // Calculate subtle lightness tint variation (±4% across index range)
  // Ensures every panel is identifiable in A/B captures while maintaining uniform frosted look
  const tintFactor = totalPanels > 1 ? index / (totalPanels - 1) : 0.5;
  const lightness = 0.96 + 0.08 * tintFactor; // 0.96 to 1.04

  // Frosted acrylic physical material
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(lightness, lightness, lightness),
    roughness: SPIRAL_CONFIG.material.roughness,
    metalness: SPIRAL_CONFIG.material.metalness,
    transmission: SPIRAL_CONFIG.material.transmission,
    thickness: SPIRAL_CONFIG.material.thickness,
    ior: SPIRAL_CONFIG.material.ior,
    clearcoat: SPIRAL_CONFIG.material.clearcoat,
    clearcoatRoughness: SPIRAL_CONFIG.material.clearcoatRoughness,
    transparent: true,
    opacity: 0.95,
  });

  const frontMesh = new THREE.Mesh(frontGeometry, material);
  frontMesh.castShadow = true;
  frontMesh.receiveShadow = true;
  group.add(frontMesh);

  // Back plate for physical depth
  const backGeo = createCurvedPanelGeometry(panelWidth * 0.99, panelHeight * 0.99, panelRadius, 16, 2);
  const backMat = new THREE.MeshStandardMaterial({
    color: 0xdde2ee,
    roughness: 0.75,
    metalness: 0.0,
    transparent: true,
    opacity: 0.25,
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.z = -thickness;
  group.add(backMesh);

  // Minimal label decal (only on destination panels)
  let decalMesh = null;
  let decalMat = null;
  if (destination) {
    const labelTexture = createLabelTexture(destination.label);
    decalMat = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    decalMesh = new THREE.Mesh(frontGeometry, decalMat);
    decalMesh.position.z = 0.005;
    group.add(decalMesh);
  }

  // Pitch tilt angle: width axis rises in the +θ direction along the helix slope
  // α_pitch = arctan(pitch / (2π * R))
  const pitchSlopeAngle = Math.atan2(SPIRAL_CONFIG.pitch, 2 * Math.PI * panelRadius);

  // Sub-container for pitch tilt around local radial axis
  frontMesh.rotation.z = pitchSlopeAngle;
  backMesh.rotation.z = pitchSlopeAngle;
  if (decalMesh) decalMesh.rotation.z = pitchSlopeAngle;

  // Helical positioning:
  // θ_i = (i + 0.5) * Δθ
  // Center active point near θ = 3π
  // Shift base angles by half a step (+0.5 * deltaTheta) to keep panel 0 off the boundary
  const deltaTheta = SPIRAL_CONFIG.deltaTheta;
  const baseAngle = (index + 0.5) * deltaTheta;

  const x = panelRadius * Math.cos(baseAngle);
  const z = panelRadius * Math.sin(baseAngle);
  // y = 0 at θ = 3π
  const y = (SPIRAL_CONFIG.pitch * (baseAngle - SPIRAL_CONFIG.activeTheta)) / (2 * Math.PI);

  const normal = new THREE.Vector3(Math.cos(baseAngle), 0, Math.sin(baseAngle)).normalize();

  group.position.set(x, y, z);
  // Orient panel facing outwards along cylinder tangent
  group.rotation.y = -baseAngle + Math.PI / 2;

  return {
    mesh: group,
    frontMesh,
    material,
    decalMesh,
    decalMat,
    index,
    baseAngle,
    baseLightness: lightness,
    basePos: new THREE.Vector3(x, y, z),
    normal,
    destination,
  };
}
