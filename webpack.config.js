"use strict";

var path = require("path");

var plugins = require("./webpack/plugins");

var rules = [
  require("./webpack/loaders/glsl"),
  require("./webpack/loaders/html"),
  require("./webpack/loaders/babel"),
  require("./webpack/loaders/css"),
  require("./webpack/loaders/image"),
];

module.exports = {
  mode: "production",
  entry: "./src/js/main.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle.js",
  },
  module: {
    rules,
  },
  resolve: {
    modules: ["node_modules", "src"],
    alias: {
      shaders: path.resolve(__dirname, "src/shaders"),
      js: path.resolve(__dirname, "src/js"),
      css: path.resolve(__dirname, "src/css"),
    },
  },
  devServer: {
    contentBase: path.resolve(__dirname, "./dist"),
  },
  devtool: "source-map",
  plugins: plugins,
};
