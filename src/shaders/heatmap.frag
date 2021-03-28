#version 300 es

precision highp float;

#define S(a, b, t) smoothstep(a, b, t)
#define _2PI 6.28318530718

out vec4 FragColor;
in vec2 uv;

uniform vec4 u_bounds;
uniform float u_time;
uniform float u_Size;
uniform sampler2D u_Sampler;
uniform float u_asp;
uniform float u_Mouse;

$N21
$blendScreen

void main()
{
  vec2 asp = vec2(u_asp, 1.0);
  float t = mod(u_time, 72000.0);

  float imgasp = u_asp / 1.4; // image aspect ratio
  vec2 sampleuv;
  if (imgasp > 1.0) { 
    sampleuv = (uv - vec2(0.5)) * vec2(1.0, 1.0 / imgasp) + vec2(0.5);
  } else {
    sampleuv = (uv - vec2(0.5)) * vec2(imgasp, 1.0) + vec2(0.5);
  }

  // FragColor = texture(u_Sampler, sampleuv);
  FragColor = vec4(1.0 * (sin(t) / 2.0 + 0.5), 1.0, 1.0, 1.0);
}