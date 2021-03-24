'use strict';

module.exports = {
  test: /\.(frag|vert|glsl)$/,
  use: [
    { 
      loader: 'shader-loader'
    }
  ]
};