---
title: 手写一个简版Webpack

tags: [webpack]

categories: webpack
---

### 实现目标

将一个入口文件及其依赖js打包到一个出口文件。

注意：只是简单实现webpack的部分功能，目的是帮助理解webpack的打包流程。





### webpack打包流程

1. 初始化Compiler:  new Webpack(config)得到Compiler对象；
2. 开始编译：调用Compiler对象run方法开始执行编译；
3. 确定入口：根据配置中的entry找到所有入口文件；
4. 编译模块：从入口文件出发，调用所有配置的Loader对模块进行编译，再找出该模块依赖的模块，递归直到所有的模块都被加载；
5. 完成模块编译：使用Loader编译完所有模块后，得到了每个模块被编译后的最终内容以及模块的依赖关系图；
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk，再把每个Chunk转换成单独的文件加入到输出列表，这步是可以修改输出内容的最后机会。





### 具体实现

#### 整体结构

```
|-- ToysWebpack
    |-- config
        |-- index.js 执行这个文件，开始打包
        |-- webpack.prod.config.js 生产环境webpack打包配置
        |-- webpack.test.config.js 测试环境webpack打包配置
    |-- dist
        |-- index.bundle.js 生产环境包
        |-- index.test.js 测试环境包
    |-- node_modules
    |-- src 待打包的原始文件夹，出了两个环境的打包入口文件，其他都是依赖文件
        |-- add.js 
        |-- error.js
        |-- index.js 生产环境打包的入口文件
        |-- log.js
        |-- minus.js
        |-- test.js 测试环境打包的入口文件
    |-- webpack 
        |-- Compiler.js 打包主文件
        |-- index.js webpack打包的开始执行文件
        |-- parse.js 编译工具
    |-- index.html 供打包后测试使用
    |-- package-lock.json
    |-- package.json 打包脚本写里面
```





#### package.json

debug - 调试脚本， test - 打测试环境包， prod - 打生产环境包

``` javascript
{
  "name": "toys_webpack",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "debug": "cross-env NODE_ENV=prod node --inspect-brk ./config/index.js ", 
    "test": "cross-env NODE_ENV=test node ./config/index.js ",
    "prod": "cross-env NODE_ENV=prod node ./config/index.js "
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.15.0",
    "@babel/parser": "^7.15.3",
    "@babel/preset-env": "^7.15.0",
    "@babel/traverse": "^7.15.0",
    "cross-env": "^7.0.3",
    "mkdirp": "^1.0.4"
  }
}

```





#### config文件夹

index.js：执行package.json里的脚本后会到这个文件

``` javascript
const webpack = require('../webpack/index.js')
const env = process.env.NODE_ENV

// 懒加载当前运行环境的打包配置
const optionsMap = {
    prod: () => require('./webpack.prod.config.js'),
    test: () => require('./webpack.test.config.js')
}
const options = optionsMap[env]()

// 给webpack函数传入打包配置，返回一个Compiler实例
const compiler = webpack(options)
// 执行run方法开始编译打包
compiler.run()
```



webpack.prod.config.js：生产环境打包配置

``` javascript
const path = require('path')

module.exports = {
    entry: '../src/index.js',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'index.bundle.js',
    }
}
```



webpack.test.config.js: 测试环境打包配置

```javascript
const path = require('path')

module.exports = {
    entry: '../src/test.js',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'index.test.js',
    }
}
```





#### src文件夹

##### 生产环境相关文件

index.js: 入口文件

``` javascript
import { add } from './add.js'
import { log } from './log.js'

log(add(1,2))
```



add.js

``` javascript
export const add = (a, b) => a + b
```



log.js

``` javascript
export const log =  console.log
```



##### 测试环境相关代码

test.js: 入口文件

``` javascript
import { minus } from './minus.js'
import { error } from './error.js'

error(minus(1,2))
```



minus.js

``` javascript
export const minus = (a, b) => a - b
```



error.js

``` javascript
export const error =  console.error
```





#### webpack文件夹

##### index.js

webpack打包的开始执行文件

``` javascript
const Compiler = require('./Compiler.js')

/**
 * ToysWebpack只做一件事：将入口文件及其依赖打包到出口文件
 */
const webpack = (options) => {
    return new Compiler(options)
}

module.exports = webpack
```



##### Compiler.js

打包主文件

``` javascript
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
```



##### parse.js

编译工具

``` javascript
const fs = require('fs')
const path = require('path')
const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAstSync } = require('@babel/core')

/**
 * tips:下面三步也是将ES6转化成ES5的核心步骤，
 * 当然在项目实践中不需要去这么转化，有封装得更易于使用的轮子。
 */ 

//1. @babel/parser将es6的代码解析为AST
const getAst = (filePath) => {
    // 同步读取文件
    const file = fs.readFileSync(filePath, 'utf-8')
    /**
     * 调用parse方法将文件解析成AST
     * sourceType: 解析代码的模式，为module时可以解析ES6导入或导出语句
     */
    const ast = parse(file, { sourceType: "module" })
    return ast
}

// 2.@babel/traverse遍历AST收集依赖
const getDeps = (filePath, ast) => {
    const deps = {}
    // 获取文件所在文件夹的路径
    const dirname = path.dirname(filePath)
    // 内部会遍历ast中的program.body，判断里面语句类型
    traverse(ast, {
        /**
         * 当type为ImportDeclaration时，会执行下面的回调
         * 参数NodePath里存储了当前执行的语句的详细信息
         */
        ImportDeclaration: (NodePath) => {
            // 依赖的文件的相对路径
            const relativePath = NodePath.node.source.value
            // 生成基于入口文件的绝对路径
            const absolutePath = path.resolve(dirname, relativePath)
            // 添加依赖
            deps[relativePath] = absolutePath
        }
    })
    return deps
}

// 3.@bebel/core将AST解析为对应的es5代码
const getCode = (ast) => {
    const { code } = transformFromAstSync(ast, null, {
        presets: ["@babel/preset-env"]
    })
    return code
}

module.exports = {
    getAst,
    getDeps,
    getCode
}
```





#### index.html

供打包后测试使用

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script src="./dist/index.bundle.js"></script>
    <script src="./dist/index.test.js"></script>
</body>
</html>
```

