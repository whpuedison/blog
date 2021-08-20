const globby = require('globby')
const path = require('path')


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
            compilation.hooks.additionalAssets.tapAsync('CopyWebpackPlugin', async cb => {
                debugger
                console.log(compiler)
                console.log(compilation)

                const { from, to = '', ignore } = this.options || {}

                // 1.筛选需要拷贝的所有文件的绝对路径
                const absoluteFromPath = path.resolve(compiler.options.context, from)
                const paths = await globby([absoluteFromPath, ignore])
                debugger
                console.log(absoluteFromPath)

                // 2.将文件转成webpack能识别的格式

                // 3.写入到打包文件中
                cb()
            })
        })
    }
}

module.exports = CopyWebpackPlugin