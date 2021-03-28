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
$blendScreen

void main()
{
  vec2 asp = vec2(u_asp / 1.4, 1.0); // texture aspect
  float t = mod(u_time, 72000.0);
  vec2 mouse = u_Mouse;
  vec2 uv1 = uv;
  uv1.y = 1.0 - uv1.y;


  float Directions = 8.0;
  float Quality = 2.0; 
  float Size = 1.0;
  vec2 Radius = vec2(.01);
  float mip = 0.0;

  vec4 BlurColor = texture(u_Sampler, uv1, mip);

  for(float d = 0.0; d < _2PI; d += _2PI/Directions) {
    for(float i = 1.0 / Quality; i <= 1.0; i += 1.0 / Quality) {
      BlurColor += texture(u_Sampler, uv1 + vec2(cos(d), sin(d)) * Radius * i, mip);		
    }
  }
  BlurColor /= Quality * Directions;

  vec4 Color = texture(u_Sampler, uv1);

  float mouseCircle = S(0.3f, 0.0f, length((mouse - uv1) * asp )) ;

  FragColor = BlurColor + 0.06 * mouseCircle;
  FragColor *= 0.93;
  FragColor = clamp(FragColor, 0.0, 1.0);
}