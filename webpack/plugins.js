"use strict";

var path = require("path");
const root = path.resolve(__dirname, "..");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");

module.exports = [
  new HtmlWebpackPlugin({
    template: path.resolve(root, "src/index.html"),
  }),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(root, "src/img"),
        to: path.resolve(root, "dist/img"),
      },
    ],
  }),
  new MiniCssExtractPlugin(),
  new CleanWebpackPlugin(),
  // new ErrorOverlayPlugin(),
  new ImageMinimizerPlugin({
    minimizerOptions: {
      plugins: [
        ["gifsicle", { interlaced: true }],
        ["mozjpeg", { quality: 80 }],
        [
          "pngquant",
          {
            quality: [0.6, 0.8],
          },
        ],
        [
          "svgo",
          {
            plugins: [
              {
                removeViewBox: false,
              },
            ],
          },
        ],
      ],
    },
  }),
];
