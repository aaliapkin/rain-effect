#version 300 es

precision highp float;
#define MAX_ITERATIONS 255.0
#define S(a, b, t) smoothstep(a, b, t)

out vec4 FragColor;
in vec2 uv;

uniform vec4 u_bounds;
uniform float u_time;
uniform float u_Size;
uniform sampler2D u_Sampler;

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float N21(vec2 p) {
  p = fract(p * vec2(123.34f, 345.45f));      
  p += dot(p, p + 34.345f);
  return fract(p.x * p.y);      
}

vec3 Layer(vec2 UV, float t) {
  
  vec2 asp = vec2(2.0f, 1.0f); // y: 2, x: 1
  vec2 uv1 = UV * u_Size * asp;
  uv1.y = -uv1.y;
  uv1.y += t * .25f;
  vec2 gv = fract(uv1) - .5f;
  vec2 id = floor(uv1);

  float n = N21(id);
  t += n * 6.2831;
  
  float w = UV.y * 10.0f;
  float x = (n - 0.5f) * .8f;
  x += (.4f - abs(x)) * sin(3.0f * w) * pow(sin(w), 6.0f) * .45f;

  float y = -sin(t + sin(t + sin(t) * .5f)) * .45f;
  y -= (gv.x - x) * (gv.x - x);

  vec2 dropPos = (gv - vec2(x, y)) / asp;
  float drop = S(.035f, .025f, length(dropPos));

  vec2 trailPos = (gv - vec2(x, t * .25f)) / asp;
  trailPos.y = (fract(trailPos.y * 16.0f) - 0.5f) / 16.0f;
  float trail = S(.03f, .001f, length(trailPos)) * .4f;
  float fogTrail = S(-.1f, .1f, dropPos.y);
  fogTrail *= S(.5f, y, gv.y);
  trail *= fogTrail;
  fogTrail *= S(0.03f, 0.02f, abs(dropPos.x));

  vec2 offs = drop * dropPos * .6 + trail * trailPos * .4;

  return vec3(offs, fogTrail);

  // return vec3(trail, offs.y, fogTrail);
}

void main()
{
  float Pi = 6.28318530718;

  FragColor = vec4(0.0f);
  float t = mod(u_time, 72000.0f);
  vec2 uv1 = uv + vec2(0.5f, 0.5f);

  vec3 drops = Layer(uv, t);
  drops += Layer(uv * 1.73f + 1.75f, t + 1.87);
  drops += Layer(uv * 1.13f + 7.03f, t + 3.31);

  float blur = (1.0f - drops.z);
  
  float Directions = 8.0;
  float Quality = 4.0; 
  float Size = 2.0;
  vec2 Radius = vec2(.02f);

  vec2 uvoff = uv1 + drops.xy;
  vec4 Color = texture(u_Sampler, uv1, 4.0f);

  for(float d = 0.0; d < Pi; d += Pi/Directions) {
    for(float i = 1.0 / Quality; i <= 1.0; i += 1.0 / Quality) {
      Color += texture(u_Sampler, uv1 + vec2(cos(d), sin(d)) * Radius * i, 4.0f);		
    }
  }

  Color /= Quality * Directions;
  vec4 BaseColor = texture(u_Sampler, uvoff);
  FragColor = mix(BaseColor, Color * .5f, blur);

  // FragColor = BaseColor;
  // FragColor = vec4(1.0f) * drops.x;
}