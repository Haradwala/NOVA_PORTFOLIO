// Thinking State: Reasoning Clusters and Synaptic Firing
vec3 applyThinking(vec3 pos, vec3 normal, float thinkF, float t, float rnd, inout vec3 baseColor, inout float size) {
  if (thinkF > 0.0) {
    float clusterNoise = snoise(normal * 3.2 + vec3(t * 0.35));
    if (clusterNoise > 0.38) {
      vec3 clusterCore = normalize(floor(normal * 2.2 + vec3(0.5)));
      
      float twinkle = sin(t * 26.0 + rnd * 120.0) * 0.45 + 0.55;
      size *= (1.2 + twinkle * 1.0) * thinkF;

      baseColor = mix(baseColor, vec3(0.60, 0.52, 0.98), thinkF * 0.65);
      
      return (clusterCore - normal) * 0.22 * thinkF * (clusterNoise - 0.38);
    }
  }
  return vec3(0.0);
}
