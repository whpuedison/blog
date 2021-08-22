const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const { getAst, getDeps, getCode } = require('./parse.js')
const { entry } = require('../config/webpack.prod.config.js')

class Compiler {
    constructor (options) {
        // 配置信息
        this.options = options
        // 所有依赖的容器
        this.modules = []
        // 入口文件绝对路径
        this.entryFilePath = path.resolve('config', options.entry)
    }

    // 编译打包
    run () {
        // 开始第一次构建，得到入口文件的信息
        const fileInfo = this.build(this.entryFilePath)
        // 将入口文件的信息添加到容器
        this.modules.push(fileInfo)
        // 遍历fileInfo的deps, 递归得到依赖文件的信息
        this.modules.forEach(item => {
            // 取出当前文件的所有依赖
            const deps = item.deps
            for (const dep in deps) {
                /**
                 * dep: 依赖相对路径
                 * deps[dep]: 依赖绝对路径
                 * 得到依赖文件的信息
                 */
                const depFileInfo = this.build(deps[dep])
                // 将处理过后的依赖信息添加到容器中，后面会遍历到完成下一层的递归
                this.modules.push(depFileInfo)
            }
        })
        // 整理依赖关系图
        const depsGraph =  this.modules.reduce((graph, module) => {
            return {
                ...graph,
                [module.filePath]: {
                    deps: module.deps,
                    code: module.code
                }
            }
        }, {})
        // 生成输出文件
        const generate = (depsGraph) => {
            /**
             * 定义一个匿名立即执行函数，确保里面的代码只能自己操作
             */
            const bundle = `
              (function(depsGraph){
                // require目的：加载入口文件
                function require(module){
                    // 函数内部的require其实执行的是localRequire
                    function localRequire(relativePath){
                        // 找到要引入模块的绝对路径，通过require加载
                        return require(depsGraph[module].deps[relativePath])
                    }
                    // 定义暴露的对象，将来模块要暴露的内容都放在这里
                    let exports = {};
                    (function(require, exports, code){
                        eval(code)
                    })(localRequire, exports, depsGraph[module].code);
                    // 作为require的返回值返回出去
                    return exports
                }
                require('${this.entryFilePath}')
              })(${JSON.stringify(depsGraph)})
            `
            // 生成输出文件的绝对路径
            const { path: outputPath, filename } = this.options.output
            const filePath = path.resolve(outputPath, filename)
            // 写入文件
            const made = mkdirp.sync(path.dirname(filePath))
            fs.writeFileSync(filePath, bundle)
        }
        generate(depsGraph)
    }

    // 开始构建
    build (filePath) {
        // 将入口文件解析ast
        const ast = getAst(filePath)
        // 获取ast中所有的依赖
        const deps = getDeps(filePath, ast)
        // 将ast解析成code
        const code = getCode(ast)
        return { 
            // 文件路径
            filePath,
            // 当前文件的所有依赖
            deps,
            // 当前文件解析后的代码
            code
        }
    }
}

module.exports = Compiler