// ── NOVA V3 Vertex Shader — Living Matter Consciousness Core ─────────────────
uniform float uTime;
uniform float uStateIntensity;
uniform float uVoiceAmplitude;
uniform float uPointSize;

attribute float aRandom;
attribute vec3  aSpherePos;   // unit-sphere normal
attribute float aLayer;       // 0=surface, 1=aura

varying vec3  vColor;
varying float vAlpha;
varying float vFacing;

// Noise include
#include <noise>

// Attention include
#include <attention>

// Listening include
#include <listening>

// Thinking include
#include <thinking>

// Speaking include
#include <speaking>

void main() {
  vec3 normal = normalize(aSpherePos);
  float t     = uTime;

  // 1. Surface advection flow (living fluid motion)
  float flowStr = aLayer < 0.5 ? 0.09 + aRandom * 0.05 : 0.04;
  float speedMod = 1.0 + smoothstep(1.0, 2.0, uStateIntensity) * 1.5;
  vec3 flow      = surfaceAdvect(normal, t * speedMod, aRandom);
  vec3 surfNorm  = normalize(normal + flow * flowStr);

  // 2. Base state radius
  float radius = aLayer < 0.5 ? 1.0 : 1.05 + aRandom * 0.12;

  // 3. Idle sleeping consciousness breathing
  float idleBreath = sin(t * 0.95 + aRandom * 3.14) * 0.015;
  radius *= 1.0 + idleBreath;

  float size = uPointSize;
  
  // Base colors
  vec3 colFront = vec3(0.93, 0.95, 0.98);  // near-white
  vec3 colMid   = vec3(0.70, 0.75, 0.84);  // silver
  vec3 colBack  = vec3(0.42, 0.54, 0.74);  // soft blue
  
  vec3 viewNorm = normalize(mat3(modelViewMatrix) * normal);
  float facing  = clamp(viewNorm.z * 0.5 + 0.5, 0.0, 1.0);
  vec3 baseColor = mix(colBack, mix(colMid, colFront, facing), facing);

  // Calculate dynamic animations and displacements
  float listenF = smoothstep(0.3, 1.0, uStateIntensity) * smoothstep(1.7, 1.0, uStateIntensity);
  float thinkF  = smoothstep(1.0, 2.0, uStateIntensity) * smoothstep(2.7, 2.0, uStateIntensity);
  float respF   = smoothstep(2.0, 3.0, uStateIntensity);

  // Apply state behaviors
  vec3 displaceListen   = applyListening(surfNorm * radius, normal, listenF, t, baseColor, size);
  vec3 displaceThink    = applyThinking(surfNorm * radius, normal, thinkF, t, aRandom, baseColor, size);
  vec3 displaceSpeak    = applySpeaking(surfNorm * radius, normal, respF, t, baseColor, size);
  
  vec3 pos = surfNorm * radius + displaceListen + displaceThink + displaceSpeak;

  // Apply attention focus bending
  pos = applyAttention(pos, normal, uAttentionStrength, thinkF);

  // Project position to clip space
  vec4 mvPos   = modelViewMatrix * vec4(pos, 1.0);
  gl_Position  = projectionMatrix * mvPos;

  // Set varyings
  vFacing = facing;
  if (aLayer > 0.5) baseColor *= 0.55;
  vColor = baseColor;

  float surfAlpha = 0.78 + facing * 0.22;
  float auraAlpha = 0.28 + facing * 0.15;
  vAlpha = aLayer < 0.5 ? surfAlpha : auraAlpha;

  // Point size mapping
  float depth = max(-mvPos.z, 0.5);
  float sizeFinal = size * (0.45 + facing * 0.7) * (3.2 / depth);
  if (aLayer > 0.5) sizeFinal *= 0.52;
  gl_PointSize = clamp(sizeFinal, 1.0, 7.0);
}
