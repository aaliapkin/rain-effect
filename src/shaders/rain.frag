#version 300 es

precision highp float;

#define MAX_ITERATIONS 255.0
#define S(a, b, t) smoothstep(a, b, t)
#define _2PI 6.28318530718

out vec4 FragColor;
in vec2 uv;
in vec2 mouse;

uniform vec4 u_bounds;
uniform float u_time;
uniform float u_Size;
uniform sampler2D u_Sampler;
uniform float u_MouseInt;
uniform float u_asp;

$N21
$blendScreen

void main()
{
  float Pi = _2PI;
  vec2 asp = vec2(u_asp, 1.0);
  float t = mod(u_time, 72000.0);

  float imgasp = u_asp / 1.4; // image aspect ratio
  vec2 sampleuv;
  if (imgasp > 1.0) { 
    sampleuv = (uv - vec2(0.5)) * vec2(1.0, 1.0 / imgasp) + vec2(0.5);
  } else {
    sampleuv = (uv - vec2(0.5)) * vec2(imgasp, 1.0) + vec2(0.5);
  }

  float divide = 30.0f;
  vec2 uv1 = uv * divide;
  vec2 id = floor(uv1);

  float n = N21(id);
  float n1 = N21(id + vec2(7.0, 23.0));

  t = t * n * .2 + n * .3;
  // (abs(sin(7*t + sin(2.1*t - sin(7.17*t))))-.75)*4
  float y = clamp((-(abs(sin(7.0 * t + sin(2.1 * n - sin(7.17 * t))))) + 0.1) * 10.0, 0.0, 1.0);
  n *= sin(y) * sin(y + 13.0);
  //n1 *= sin(y + 13.0);
  
  float mouseCircle = S(divide/2.0f, divide/5.0f, length((mouse * divide - id) * asp)) ;

  // n = n * mouseCircle;
  n1 = n1 * mouseCircle;
  
  vec2 offs = vec2(1.0 / divide) * clamp(floor(10.0 * n), -1.0, 1.0);
  vec4 Color = texture(u_Sampler, sampleuv + offs);

  
  float Directions = 8.0;
  float Quality = 4.0; 
  float Size = 2.0;
  vec2 Radius = vec2(.02);


  vec4 BlurColor = texture(u_Sampler, sampleuv, 4.0);

  for(float d = 0.0; d < Pi; d += Pi/Directions) {
    for(float i = 1.0 / Quality; i <= 1.0; i += 1.0 / Quality) {
      BlurColor += texture(u_Sampler, sampleuv + vec2(cos(d), sin(d)) * Radius * i, 4.0);		
    }
  }
  BlurColor /= Quality * Directions;

  // try screen
  // FragColor = vec4(blendScreen(BlurColor.xyz, Color.xyz, n), 1.0);

  // FragColor = mix(BlurColor, Color, 1.0 - n1);
  // FragColor = vec4(blendScreen(FragColor.xyz, vec3(n * .3)), 1.0);

  FragColor = Color;

  // debug n
  // FragColor = vec4(1.0) * n;
}