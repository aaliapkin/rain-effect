#version 300 es

precision highp float;
layout(location = 0) in vec2 aPos;

out vec2 uv;
out vec2 mouse;

uniform mat4 u_MVP;
uniform vec2 u_Mouse;

void main() {
  gl_Position = vec4(aPos, .0f, 1.0f);
  vec4 uv_out =  gl_Position * inverse(u_MVP);
  uv = uv_out.xy;
  mouse = u_Mouse.xy;
}