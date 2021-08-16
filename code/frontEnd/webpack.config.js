const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.bundle.js',
  },
  plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body'
      }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    host: '192.168.31.186',
    port: '8080',
    proxy: {
        '*': {
            target: 'http://192.168.31.186:3000', 
            changeOrigin: true
        }
    },
    open: true,
    hot: true,
    inline: true
  }
};