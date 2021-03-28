#version 300 es

precision highp float;
layout(location = 0) in vec2 aPos;

out vec2 uv;

uniform mat4 u_MVP;

void main() {
  gl_Position = vec4(aPos, .0f, 1.0f);
  vec4 uv_out =  gl_Position * inverse(u_MVP);
  uv = uv_out.xy;
}