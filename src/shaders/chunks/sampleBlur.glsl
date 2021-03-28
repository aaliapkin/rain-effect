vec4 SampleBlur(sampler2D u_Sampler, vec2 sampleuv, float Directions, float Quality, float Size, vec2 Radius, float mip) {
  vec4 Color = texture(u_Sampler, sampleuv, mip);
  for(float d = 0.0; d < _2PI; d += _2PI/Directions) {
    for(float i = 1.0 / Quality; i <= 1.0; i += 1.0 / Quality) {
      Color += texture(u_Sampler, sampleuv + vec2(cos(d), sin(d)) * Radius * i, mip);		
    }
  }
  Color /= Quality * Directions;
  return Color;
}