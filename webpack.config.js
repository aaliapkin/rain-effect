'use strict';
var path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

var rules = [
  require('./webpack/loaders/glsl'),
  require('./webpack/loaders/html'),
];

module.exports = {
  mode: 'development',
  entry: './src/js/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js',
  },
  module: {
    rules
  },
  resolve: {
    modules: [
      'node_modules',
      'src',
    ],
    alias: {
      shaders: path.resolve(__dirname, 'src/shaders'),
    },
  },
  devServer: {},
  plugins: [new HtmlWebpackPlugin()],
};