const Compiler = require('./Compiler.js')

/**
 * ToysWebpack只做一件事：将入口文件及其依赖打包到出口文件
 */
const webpack = (options) => {
    return new Compiler(options)
}

module.exports = webpack