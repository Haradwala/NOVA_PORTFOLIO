// Listening State: Radar Scanning and Inward Ripples
vec3 applyListening(vec3 pos, vec3 normal, float listenF, float t, inout vec3 baseColor, inout float size) {
  if (listenF > 0.0) {
    float inwardRipple = sin(dot(normal, vec3(1.0)) * 14.0 + t * 9.0) * 0.038 * listenF;
    
    float angle = atan(normal.y, normal.x);
    float sweep = smoothstep(0.85, 1.0, cos(angle - t * 4.2));

    float attraction = uVoiceAmplitude * 0.15 * (1.0 + sweep * 0.4) * listenF;
    float finalRadiusShift = inwardRipple - attraction;
    
    baseColor = mix(baseColor, vec3(0.18, 0.83, 0.75), sweep * listenF * 0.45);
    
    return normal * finalRadiusShift;
  }
  return vec3(0.0);
}
