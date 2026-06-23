// Attention Bending logic
uniform vec3 uAttentionRegion;
uniform float uAttentionStrength;

vec3 applyAttention(vec3 pos, vec3 normal, float strength, float thinkF) {
  if (uAttentionStrength > 0.01 && thinkF < 0.01) {
    float dist = distance(normal, normalize(uAttentionRegion));
    float pull = smoothstep(1.5, 0.0, dist) * uAttentionStrength * 0.18;
    return pos + normalize(uAttentionRegion) * pull;
  }
  return pos;
}
