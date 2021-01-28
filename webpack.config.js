const path = require('path');
const JscramblerWebpack = require('jscrambler-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  entry: {
    app: "./src/client/index.tsx",
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, './'), // where dev server will look for static files, not compiled
    publicPath: '/', // relative path to output path where  devserver will look for compiled files
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'dist/client'), // base path where to send compiled assets
    publicPath: '/' // base path where referenced files will be look for
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    // alias: {
    //   '@': path.resolve(__dirname, 'src') // shortcut to reference src folder from anywhere
    // }
  },
  module: {
    rules: [
      {
        test: /\.(csv|tsv)$/,
        use: ["csv-loader"],
      },
      { // config for es6 jsx
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.client.json',
            },
          },
        ],
      },
      { // config for sass compilation
        test: /\.(css|scss)$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader',
          { loader: "sass-loader" }
        ]
      },
      { // config for images
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
            }
          }
        ],
      },
      { // config for fonts
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
            }
          }
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ // plugin for inserting scripts into html
      // cleanOnceBeforeBuildPatterns: ["css/*.*", "js/*.*", "fonts/*.*", "images/*.*"]
      template: "./src/client/index.html",
      filename: "index.html",
      title: "Learning Webpack",
      cache: false,
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["css/*.*", "js/*.*", "fonts/*.*", "images/*.*"]
    }),
    new MiniCssExtractPlugin({ // plugin for controlling how compiled css will be outputted and named
      filename: "css/[name].css",
      chunkFilename: "css/[id].css"
    }),
    // new JscramblerWebpack({
    //   enable: true, // optional, defaults to true
    //   chunks: ['app'], // optional, defaults to all chunks
    //   params: [], 
    //   applicationTypes: {}
    //   // and other jscrambler configurations
    // }),
  ],
};
