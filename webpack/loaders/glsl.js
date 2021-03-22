'use strict';

module.exports = {
  test: /\.(frag|vert|glsl)$/,
  use: [
    { 
      loader: 'glsl-shader-loader',
      options: {
        root: '/src/shaders' 
      } 
    }
  ]
};