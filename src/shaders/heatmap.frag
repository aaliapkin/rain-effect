#version 300 es

precision highp float;

#define S(a, b, t) smoothstep(a, b, t)
#define _2PI 6.28318530718

out vec4 FragColor;
in vec2 uv;

uniform float u_time;
uniform sampler2D u_Sampler;
uniform float u_asp;
uniform vec2 u_Mouse;

$N21
$sampleBlur

void main()
{
  vec2 asp = vec2(u_asp / 1.4, 1.0); // texture aspect
  float t = mod(u_time, 72000.0);
  vec2 mouse = u_Mouse;
  vec2 uv1 = uv;
  uv1.y = 1.0 - uv1.y;

  // Sampler UV Directions Quality Size Radius Mip
  vec4 BlurColor = SampleBlur(u_Sampler, uv1, 6.0, 2.0, 0.5, vec2(0.01), 2.0);

  float mouseCircle = S(0.3f, 0.0f, length((mouse - uv1) * asp )) ;

  FragColor = BlurColor + 0.03 * mouseCircle;
  FragColor *= 0.918;
  FragColor = clamp(FragColor, 0.0, 1.0);
}