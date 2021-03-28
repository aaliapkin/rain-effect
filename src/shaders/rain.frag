#version 300 es

precision highp float;

#define S(a, b, t) smoothstep(a, b, t)
#define _2PI 6.28318530718

out vec4 FragColor;
in vec2 uv;

uniform float u_time;
uniform float u_Size;
uniform sampler2D u_Sampler;
uniform sampler2D u_SamplerH;
uniform float u_MouseInt;
uniform float u_asp;
uniform vec2 u_Mouse;

$N21
$blendScreen
$sampleBlur

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
}

void main()
{
  vec2 asp = vec2(u_asp, 1.0);
  // cycle time to avoid precision drop
  float t = mod(u_time, 72000.0);

  float imgasp = u_asp / 1.4; // image aspect ratio
  vec2 sampleuv;
  if (imgasp > 1.0) { 
    sampleuv = (uv - vec2(0.5)) * vec2(1.0, 1.0 / imgasp) + vec2(0.5);
  } else {
    sampleuv = (uv - vec2(0.5)) * vec2(imgasp, 1.0) + vec2(0.5);
  }

  vec2 uv1 = uv * asp;

  FragColor = vec4(0.0f);

  vec3 drops = Layer(uv1, t);
  drops += Layer(uv1 * 1.73f + 1.75f, t + 1.87);
  drops += Layer(uv1 * 1.13f + 7.03f, t + 3.31);

  float blur = (1.0f - drops.z);
  vec2 uvoff = sampleuv + drops.xy;
  
  // Sampler UV Directions Quality Size Radius Mip
  vec4 Color = SampleBlur(u_Sampler, sampleuv, 12.0, 6.0, 2.0, vec2(0.05), 2.0);
  Color = blendScreen(Color, vec4(1.0), 0.05);

  float mouseHeat = texture(u_SamplerH, sampleuv).x;
  blur *= (1.0f - mouseHeat);

  vec4 BaseColor = texture(u_Sampler, uvoff) * 0.9;
  FragColor = mix(BaseColor, Color, blur);
  // FragColor = vec4(mouseHeat);
}