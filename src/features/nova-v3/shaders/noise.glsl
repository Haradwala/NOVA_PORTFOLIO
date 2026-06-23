// Simplex 3D Noise & Tangent-space curl advection
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

vec3 surfaceAdvect(vec3 normal, float t, float rnd) {
  vec3 seed = normal * 1.4 + rnd * 3.7;
  float n1 = snoise(seed + vec3(t * 0.18, 0.0, 0.0));
  float n2 = snoise(seed + vec3(0.0, t * 0.18, 0.9));
  vec3 up = abs(normal.y) < 0.97 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(up, normal));
  vec3 bitan = cross(normal, tangent);
  return tangent * n1 + bitan * n2;
}
