const { getOptions } = require('loader-utils')
const { validate } = require('schema-utils')
const { transform} = require('@babel/core')
const { promisify } = require('util')

// 将回调函数转换为基于promise的函数
const transformAsync = promisify(transform)
// 校验配置
const babelSchema = require('./schemas/babelSchema.js')

// loader本质上是一个函数
module.exports = function (source) {
    // 获取loader的配置
    const options = getOptions(this)
    // 校验配置：成功时往下运行，失败时停止运行报出错误
    validate(babelSchema, options, {
        name: 'babelLoader'
    })
    // 异步返回结果
    const callBack = this.async()
    // 调用transform方法进行转码并返回
    transformAsync(source, options)
        .then(({ code }) => callBack(null, code))
        .catch(err => {callBack(err)})

}