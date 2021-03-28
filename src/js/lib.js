"use strict";

export function mapclamp(x, in_start, in_end, out_start, out_end) {
  x = x === undefined ? in_end : x;
  x = x > in_end ? in_end : x;
  x = x < in_start ? in_start : x;
  let out =
    out_start + ((out_end - out_start) / (in_end - in_start)) * (x - in_start);
  return out;
}

export function hexToRgb(hex) {
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return r + "," + g + "," + b;
}
