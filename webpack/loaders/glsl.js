"use strict";

var path = require("path");
const root = path.resolve(__dirname, "../../src/shaders");

module.exports = {
  test: /\.(frag|vert|glsl)$/,
  use: [
    {
      loader: "shader-loader",
      options: {
        glsl: {
          chunkPath: path.resolve(root, "chunks"),
        },
      },
    },
  ],
};
