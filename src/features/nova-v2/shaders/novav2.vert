// ── NOVA V2 Vertex Shader — Living Matter Consciousness Core ─────────────────
// Surface advection via tangent-space curl noise.
// Palette: white / silver / soft blue / gold accents.

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

// ── Simplex 3D Noise ─────────────────────────────────────────────────────────
vec3 mod289v3(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289v4(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289v4(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159-0.85373472095314*r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - vec3(0.5);
  i = mod289v3(i);
  vec4 p  = permute(permute(permute(
    i.z + vec4(0.0,i1.z,i2.z,1.0))
    + i.y + vec4(0.0,i1.y,i2.y,1.0))
    + i.x + vec4(0.0,i1.x,i2.x,1.0));
  float n_ = 0.142857142857;
  vec3 ns  = n_ * vec4(0.0,0.5,1.0,2.0).wyz - vec4(0.0,0.5,1.0,2.0).xzx;
  vec4 j   = p - 49.0*floor(p*ns.z*ns.z);
  vec4 x_  = floor(j*ns.z);
  vec4 y_  = floor(j - 7.0*x_);
  vec4 xs  = x_*ns.x + ns.yyyy;
  vec4 ys  = y_*ns.x + ns.yyyy;
  vec4 h   = 1.0 - abs(xs) - abs(ys);
  vec4 b0  = vec4(xs.xy, ys.xy);
  vec4 b1  = vec4(xs.zw, ys.zw);
  vec4 s0  = floor(b0)*2.0+1.0;
  vec4 s1  = floor(b1)*2.0+1.0;
  vec4 sh  = -step(h, vec4(0.0));
  vec4 a0  = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1  = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0  = vec3(a0.xy, h.x);
  vec3 p1  = vec3(a0.zw, h.y);
  vec3 p2  = vec3(a1.xy, h.z);
  vec3 p3  = vec3(a1.zw, h.w);
  vec4 nrm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=nrm.x; p1*=nrm.y; p2*=nrm.z; p3*=nrm.w;
  vec4 m   = max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m = m*m;
  return 42.0*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

// ── Tangent-space surface advection ─────────────────────────────────────────
vec3 surfaceAdvect(vec3 normal, float t, float rnd) {
  vec3 seed = normal * 1.4 + rnd * 3.7;

  float n1 = snoise(seed + vec3(t * 0.18, 0.0, 0.0));
  float n2 = snoise(seed + vec3(0.0, t * 0.18, 0.9));

  // Build orthonormal tangent frame on sphere
  vec3 up      = abs(normal.y) < 0.97 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(up, normal));
  vec3 bitan   = cross(normal, tangent);

  return tangent * n1 + bitan * n2;
}

void main() {
  vec3 normal = normalize(aSpherePos);
  float t     = uTime;

  // ── Surface advection flow (living fluid motion) ─────────────────────────
  float flowStr = aLayer < 0.5 ? 0.09 + aRandom * 0.05 : 0.04;
  
  // Speed scales up when actively thinking or processing
  float speedMod = 1.0 + smoothstep(1.0, 2.0, uStateIntensity) * 1.5;
  vec3 flow      = surfaceAdvect(normal, t * speedMod, aRandom);
  vec3 surfNorm  = normalize(normal + flow * flowStr);

  // ── State-based radius ───────────────────────────────────────────────────
  float radius = aLayer < 0.5 ? 1.0 : 1.05 + aRandom * 0.12;

  // 1. IDLE: Slow breathing motion + subtle organic awareness pulse
  float idleBreath = sin(t * 0.95 + aRandom * 3.14) * 0.015;
  radius *= 1.0 + idleBreath;

  // Initialize scale and base colors
  float size = uPointSize;
  
  vec3 colFront = vec3(0.93, 0.95, 0.98);  // near-white
  vec3 colMid   = vec3(0.70, 0.75, 0.84);  // silver
  vec3 colBack  = vec3(0.42, 0.54, 0.74);  // soft blue
  
  vec3 viewNorm = normalize(mat3(modelViewMatrix) * normal);
  float facing  = clamp(viewNorm.z * 0.5 + 0.5, 0.0, 1.0);
  vec3 baseColor = mix(colBack, mix(colMid, colFront, facing), facing);

  // 2. LISTENING (State Intensity ~ 1.0)
  // Incoming ripple waves, radar sweeps, and particle attraction based on uVoiceAmplitude
  float listenF = smoothstep(0.3, 1.0, uStateIntensity) * smoothstep(1.7, 1.0, uStateIntensity);
  if (listenF > 0.0) {
    // Inward ripple waves
    float inwardRipple = sin(dot(normal, vec3(1.0)) * 14.0 + t * 9.0) * 0.038 * listenF;
    radius += inwardRipple;

    // Radar sweeps scanning the sphere
    float angle = atan(normal.y, normal.x);
    float sweep = smoothstep(0.85, 1.0, cos(angle - t * 4.2));
    
    // Attract particles dynamically toward center when loud (gaining core density)
    float attraction = uVoiceAmplitude * 0.15 * (1.0 + sweep * 0.4) * listenF;
    radius -= attraction;

    // Radar sweeps color particles teal
    baseColor = mix(baseColor, vec3(0.18, 0.83, 0.75), sweep * listenF * 0.45);
  }

  // 3. THINKING (State Intensity ~ 2.0)
  // Forms local intelligence reasoning clusters and twinkle synaptic connections
  float thinkF = smoothstep(1.0, 2.0, uStateIntensity) * smoothstep(2.7, 2.0, uStateIntensity);
  if (thinkF > 0.0) {
    // Generate cluster masks using noise
    float clusterNoise = snoise(normal * 3.2 + vec3(t * 0.35));
    
    if (clusterNoise > 0.38) {
      // Pull particles toward discrete grid locations representing cluster cores
      vec3 clusterCore = normalize(floor(normal * 2.2 + vec3(0.5)));
      surfNorm = mix(surfNorm, clusterCore, 0.22 * thinkF * (clusterNoise - 0.38));
      
      // Fast synaptic twinkles (sparking clusters)
      float twinkle = sin(t * 26.0 + aRandom * 120.0) * 0.45 + 0.55;
      size *= (1.2 + twinkle * 1.0) * thinkF;
      
      // Color clusters with a gorgeous violet/blue neural glow
      baseColor = mix(baseColor, vec3(0.60, 0.52, 0.98), thinkF * 0.65);
    }
  }

  // 4. SPEAKING (State Intensity ~ 3.0)
  // Speech pulses, energy waves, and syllable-driven brightness/size modulation
  float respF = smoothstep(2.0, 3.0, uStateIntensity);
  if (respF > 0.0) {
    // Outward energy waves
    float energyWave = sin(dot(normal, vec3(1.0)) * 6.5 - t * 15.0) * 0.055 * respF;
    radius += energyWave;

    // Direct speech pulse expansion
    radius += uVoiceAmplitude * 0.16 * respF;

    // Syllable size modulation
    float syllableMod = 1.0 + uVoiceAmplitude * 1.6;
    size *= syllableMod;

    // Dynamic color shift towards warm gold/amber highlights on speech spikes
    vec3 colSpeechGlow = mix(baseColor, vec3(1.0, 0.88, 0.72), uVoiceAmplitude * 0.65);
    baseColor = mix(baseColor, colSpeechGlow, respF);
  }

  vec3 pos = surfNorm * radius;

  // ── Project position ─────────────────────────────────────────────────────
  vec4 mvPos   = modelViewMatrix * vec4(pos, 1.0);
  gl_Position  = projectionMatrix * mvPos;

  // ── Aura fade & variables mapping ────────────────────────────────────────
  vFacing = facing;

  // Aura: dimmer silver-blue
  if (aLayer > 0.5) baseColor *= 0.55;

  vColor = baseColor;

  // Alpha (dim background layers slightly)
  float surfAlpha = 0.78 + facing * 0.22;
  float auraAlpha = 0.28 + facing * 0.15;
  vAlpha = aLayer < 0.5 ? surfAlpha : auraAlpha;

  // ── Point size calculations ──────────────────────────────────────────────
  float depth = max(-mvPos.z, 0.5);
  float sizeFinal = size * (0.45 + facing * 0.7) * (3.2 / depth);
  if (aLayer > 0.5) sizeFinal *= 0.52;
  gl_PointSize = clamp(sizeFinal, 1.0, 7.0);
}
