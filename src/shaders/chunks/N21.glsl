float N21(vec2 p) {
  p = fract(p * vec2(123.34f, 345.45f));      
  p += dot(p, p + 34.345f);
  return fract(p.x * p.y);      
}
