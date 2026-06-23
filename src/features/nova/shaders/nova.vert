uniform float uTime;
uniform float uStateIntensity;
uniform float uVoiceAmplitude;
uniform float uPointSize;
uniform vec3 uAttentionRegion;
uniform float uAttentionStrength;

attribute float aRandom;
attribute vec3 aSpherePos;
attribute float aLayer;

varying float vDepth;
varying float vActivity;
varying vec3 vColor;
varying float vAlpha;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p, float t) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0);
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p + t * 0.15);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 pos = aSpherePos;
  float t = uTime;

  float breathe = 1.0 + sin(t * 0.8 + aRandom * 6.28) * 0.03;

  float noiseFreq = 1.5 + uStateIntensity * 0.5;
  float displacement = fbm(pos * noiseFreq, t * 0.3) * 0.12;
  displacement += fbm(pos * 3.0 + vec3(t * 0.1), t * 0.2) * 0.04;

  float stateDeform = 0.0;
  if (uStateIntensity > 0.5) {
    float tension = smoothstep(0.5, 1.5, uStateIntensity);
    stateDeform -= tension * 0.08;
    displacement += fbm(pos * 4.0, t * 0.8) * 0.06 * tension;
  }
  if (uStateIntensity > 1.5) {
    float think = smoothstep(1.5, 2.5, uStateIntensity);
    float wave = sin(pos.x * 8.0 + t * 3.0) * cos(pos.y * 6.0 + t * 2.5);
    stateDeform += wave * 0.04 * think;
    displacement += fbm(pos * 5.0, t * 1.2) * 0.05 * think;
  }
  if (uStateIntensity > 2.5) {
    float respond = smoothstep(2.5, 3.0, uStateIntensity);
    stateDeform += respond * 0.1;
    float ripple = sin(length(pos.xy) * 12.0 - t * 5.0) * 0.05;
    displacement += ripple * respond;
  }

  float voiceReact = uVoiceAmplitude * 0.15;
  displacement += sin(t * 10.0 + aRandom * 20.0) * voiceReact;

  float attDist = distance(pos, uAttentionRegion);
  float attInfluence = smoothstep(0.8, 0.0, attDist) * uAttentionStrength;
  vec3 attDir = normalize(uAttentionRegion - pos);
  pos += attDir * attInfluence * 0.15;

  pos = pos * (breathe + displacement + stateDeform);

  float layerOffset = (aLayer - 0.5) * 0.08;
  pos += normalize(aSpherePos) * layerOffset;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depth = -mvPosition.z;
  vDepth = depth;

  vActivity = displacement * 5.0 + attInfluence * 3.0;

  float brightness = 0.7 + aLayer * 0.3 + displacement * 2.0;
  brightness += attInfluence * 0.4;
  vColor = vec3(0.85, 0.88, 0.95) * brightness;

  float edgeFade = smoothstep(1.3, 0.7, depth);
  vAlpha = edgeFade * (0.6 + aLayer * 0.4);

  float size = uPointSize * (1.0 + displacement * 3.0);
  size *= (300.0 / depth);
  size += attInfluence * 2.0;
  gl_PointSize = clamp(size, 1.0, 6.0);
}
