#version 300 es

precision highp float;
layout(location = 0) in vec2 aPos;

out vec2 uv;

uniform mat4 u_MVP;

void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
  vec4 uv_out =  inverse(u_MVP) * gl_Position;
  uv = uv_out.xy;
}