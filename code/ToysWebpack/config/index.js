
const webpack = require('../webpack/index.js')
const env = process.env.NODE_ENV

// 懒加载当前运行环境的打包配置
const optionsMap = {
    prod: () => require('./webpack.prod.config.js'),
    test: () => require('./webpack.test.config.js')
}
const options = optionsMap[env]()

// 给webpack函数传入打包配置，返回一个Compiler实例
const compiler = webpack(options)
// 执行run方法开始编译打包
compiler.run()