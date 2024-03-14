/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

"use strict";

const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: [/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/, /\.svg$/],

        use: ["raw-loader"],
      },
      {
        test: [/ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/, /\.css$/],

        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "singletonStyleTag",
              attributes: {
                "data-cke": true,
              },
            },
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
            },
          },
        ],
      },
      {
        test: /\.js$/, // Применять загрузчик только к .js файлам
        exclude: /node_modules/, // Исключить папку node_modules
        use: {
          loader: 'babel-loader', // Использовать babel-loader для обработки .js файлов
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Каталог для статики
    },
    port: 8080,
    open: true, // Автоматически открывать браузер
  },

  mode: 'development',

  // Useful for debugging.
  devtool: "source-map",

  // By default webpack logs warnings if the bundle is bigger than 200kb.
  performance: { hints: false },
};
