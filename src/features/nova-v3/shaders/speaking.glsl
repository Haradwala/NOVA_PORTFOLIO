// Speaking State: Speech Pulses and Outward Waves
vec3 applySpeaking(vec3 pos, vec3 normal, float respF, float t, inout vec3 baseColor, inout float size) {
  if (respF > 0.0) {
    float energyWave = sin(dot(normal, vec3(1.0)) * 6.5 - t * 15.0) * 0.055 * respF;
    float ampPulse = uVoiceAmplitude * 0.16 * respF;
    
    float syllableMod = 1.0 + uVoiceAmplitude * 1.6;
    size *= syllableMod;

    vec3 colSpeechGlow = mix(baseColor, vec3(1.0, 0.88, 0.72), uVoiceAmplitude * 0.65);
    baseColor = mix(baseColor, colSpeechGlow, respF);

    return normal * (energyWave + ampPulse);
  }
  return vec3(0.0);
}
