/**
 * content: 对于第一个执行的loader为资源的内容，非第一个执行的loader为上一个loader的执行结果。
 * map: 可选参数，sourceMap
 * mate: 可选参数，传递给下一个loader数据（在这个例子中下一个loader是loader1） 
 */
module.exports = function (content, map, meta) {
    // 接收pitch传递过来data
    // console.log(this.data.customStr) // 传递给loader函数的字符串

    // 接收loader3传递过来的meta数据
    // console.log(meta) // { preLoader: 'loader3' }

    const callback = this.async()
    setTimeout(() => {
        console.log('2')
        callback(null, content, map)
    }, 1000)
}

/**
 * remainingRequest：当前loader之后的资源请求字符串；
 * previousRequest：当前loader之前经历的loader列表以'!'连接的字符串；
 * data: 用于与当前loader函数传递数据
 */
module.exports.pitch = (remainingRequest, precedingRequest, data) => {
    /**
     * precedingRequest: /Users/xxx/loaders/loader3.js!/Users/xxx/testLoader.json
     * precedingRequest /Users/xxx/loaders/loader1.js
     */

    // 传递给loader函数data数据
    // data.customStr = "传递给loader函数的字符串" 
    
    console.log('pitch2')
    setTimeout(() => {
        console.log('async pitch2')
    }, 1000)
}