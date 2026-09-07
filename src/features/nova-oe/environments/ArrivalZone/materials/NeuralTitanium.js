import * as THREE from 'three';

// 1. Structural — Primary architectural material (matte, heavy engineered alloy)
export const matTitanium = new THREE.MeshStandardMaterial({
  color: '#202636',
  metalness: 0.62,
  roughness: 0.52,
});

// 2. Recessed — Slightly darker, used only where architecture naturally falls into shadow
export const matTitaniumDark = new THREE.MeshStandardMaterial({
  color: '#151924',
  metalness: 0.58,
  roughness: 0.56,
});

// 3. Highlight — Slightly brighter with stronger edge response for focal elements
export const matTitaniumWorn = new THREE.MeshStandardMaterial({
  color: '#222838',
  metalness: 0.68,
  roughness: 0.44,
});
