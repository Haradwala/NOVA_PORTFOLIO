precision highp float;

varying float vDepth;
varying float vActivity;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float dist = length(c);
  if (dist > 0.5) discard;

  float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
  alpha *= vAlpha;

  float glow = exp(-dist * 4.0) * vActivity * 0.3;
  vec3 color = vColor + vec3(0.1, 0.15, 0.25) * glow;

  float haze = smoothstep(2.0, 0.5, vDepth);
  color = mix(color * 0.5, color, haze);

  gl_FragColor = vec4(color, alpha);
}
