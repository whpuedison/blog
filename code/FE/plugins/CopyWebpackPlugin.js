const globby = require('globby')
const path = require('path')
const fs = require('fs')
const util = require('util')
const webpack = require('webpack')

// 将文件资源转化成webpack compilation可以识别的格式
const { RawSource } = webpack.sources
// 将读取文件函数基于Promise再次封装
const readFilePromise = util.promisify(fs.readFile)

// 插件都是一个类
class CopyWebpackPlugin {
    constructor (options) {
        // 从构造函数参数中获取webpack.config.js中的配置
        // options: '{ from: 'public', to: '', ignore: '**/index.html' }'
        this.options = options
    }

    /**
     * apply函数中根据需求在合适的生命周期注册回调函数
     * 函数接收的参数是一个Compiler实例，Compiler扩展自Tapable。
     * 
     * Tapable实现了发布订阅模式:
     * 1.实例属性hooks是一个对象，key为事件名称， value可以指定该事件数组的执行方式（同步并行/异步并行/...）；
     * 2.使用tap/tapAsync/tapPromise往hooks里的事件注册回调；
     * 3.使用call/callAsync/promise触发hooks里的事件。
     * 
     * 在webpack中Tapable创建了各种钩子，插件将自己的方法注册到对应的钩子上，
     * 相当于往实例的hooks里的事件注册回调，交给webpcak，
     * webpack编译时，不同的生命周期触发不同的事件。
     */
    apply (compiler) {
        /**
         * thisCompilation钩子：
         * 生命周期：初始化compilation时调用，在触发compilation事件之前调用
         * 事件数组执行方式：SyncHook 串行同步，出没出错都往下执行
         * 回调参数：compilation，compilationParams
         */
        compiler.hooks.thisCompilation.tap('CopyWebpackPlugin', (compilation) => {
            /**
             * Compilation模块会被Compiler用来创建新的编译（或新的构建）
             * compilation实例的additionalAssets钩子：
             * 生命周期：可以为compilation创建额外asset
             * 事件数组执行方式：AsyncSeriesHook 串行异步
             * cb: 调用表示任务完成
             */
            compilation.hooks.additionalAssets.tapAsync('CopyWebpackPlugin', async callback => {
                const { from, to = '', ignore } = this.options || {}

                // 筛选需要拷贝的所有文件的绝对路径
                const absoluteFromPath = path.resolve(compiler.options.context, from)
                /**
                 * globby函数第一个参数是匹配的绝对路径，第二个参数是配置对象。
                 * 下面配置了ignore属性，设置可以忽略的文件
                 */
                const paths = await globby(absoluteFromPath, { ignore })
                console.log(absoluteFromPath)

                // 判断文件分类，先简单分为三类：js、css、images 
                const judgeType = (path) => {
                    let middle = ''
                    if (/\.js$/.test(path)) {
                        middle = 'js'
                    } else if (/\.css$/.test(path)) {
                        middle = 'css'
                    } else if (/\w(\.gif|\.jpeg|\.png|\.jpg|\.bmp)/i.test(path)) {
                        middle = 'image'
                    }
                    return middle
                }

                try {
                    const files = await Promise.all(
                        // 遍历文件内容
                        paths.map(async absolutePath => {
                            // 获取文件内容
                            const source = await readFilePromise(absolutePath)
                            // 文件名称：webpack.config.js中配置的to + 文件分类 + 获取path的最后一部分
                            const baseName = path.basename(absolutePath)
                            const fileName = path.join(to, judgeType(absolutePath), baseName )
                            // 将资源转成compilation可识别的格式
                            const rawSource = new RawSource(source)
                            // 输出文件
                            compilation.emitAsset(fileName, rawSource)
                        })
                    )
                    // 成功回调
                    callback()
                } catch {
                    // 抛出异常
                    callback(new Error('[CopyWebpackPlugin] loading error'))
                } 
            })
        })
    }
}

module.exports = CopyWebpackPlugin