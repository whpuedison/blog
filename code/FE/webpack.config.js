const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('./plugins/CopyWebpackPlugin.js')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.bundle.js',
  },

  module: {
    rules: [ 
      { 
        test: /\.js$/, 
        use: { 
          // loader: 'babelParse.js', 
          // options: {
          //   presets: ['@babel/preset-env']
          // }
          loader: 'babel-loader', 
          options: { 
            "presets": [
              ["@babel/preset-env", {
              "useBuiltIns": "usage",
              "corejs": {
                "version": 3
              },
              "targets": {
                "chrome": "60"
              },
              "modules": "commonjs"
            }]
            ] 
          } 
        },
        include: path.resolve(__dirname, 'src')
      },
      { 
        test: /\.json$/, 
        use: ['loader1.js', 'loader2.js','loader3.js']
      }
    ]
  },
  resolveLoader: {
    // 寻找loader所在位置
    modules: ['node_modules', path.resolve(__dirname, 'loaders/')]
  },

  plugins: [
      new CopyWebpackPlugin({
        from: 'public',
        to: '',
        /**
         * '**'可以匹配任意数量的字符，包括/
         * 因为ignore是作为参数传给globby，所以规则在globby中定义
         */ 
        ignore: '**/index.html'
      }),
      // new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body'
      }),
  ],

  devtool: 'inline-source-map',
  devServer: {
    host: '192.168.31.186', // home-host
    // host: '192.168.191.3', // office-host
    port: '8080',
    proxy: {
        '*': {
            target: 'http://192.168.31.186:3000', // home-url
            // target: 'http://192.168.191.3:3000', // office-url
            changeOrigin: true
        }
    },
    open: true,
    hot: true,
    inline: true
  },

  devtool: "source-map"
};