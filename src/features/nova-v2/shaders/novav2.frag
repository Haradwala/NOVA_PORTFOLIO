precision highp float;

varying vec3  vColor;
varying float vAlpha;
varying float vFacing;

void main() {
  vec2  c    = gl_PointCoord - 0.5;
  float dist = length(c);
  if (dist > 0.5) discard;

  // Soft Gaussian falloff — clean circle, no square artefacts
  float alpha = exp(-dist * dist * 10.0) * vAlpha;

  // Subtle rim brightening on front-facing particles
  float rim   = smoothstep(0.35, 0.0, dist) * vFacing * 0.18;
  vec3  color = vColor + rim;

  gl_FragColor = vec4(color, alpha);
}
