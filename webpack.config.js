const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    bundle: path.resolve(__dirname, "./src/index.js")
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: '[name][contenthash].js'
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, "./dist")
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Kierki',
      filename: 'index.html',
      template: 'src/template.html'
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    })
  ]
};