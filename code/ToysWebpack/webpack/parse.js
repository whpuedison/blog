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