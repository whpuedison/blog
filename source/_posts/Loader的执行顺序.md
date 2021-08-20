---
title: Loader的执行顺序

date: 2021-08-19

tags: [loader]

categories: webpack
---



### 配置 webpack.config.js

```javascript
 module: {
    rules: [ 
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
```



### 编写 loader 文件

#### loader1.js

```javascript
/**
 * 执行顺序：webpack当前loader链中的pitch方法同步代码执行完成之后，
 * 再从右往左（从下往上）执行loader函数。
 * 注意：异步回调使用this.async，异步回调执行完之后才会下一个loader.
 */
module.exports = function (content) {
    console.log('1')
    return content
}

/**
 * pitch方法不是必须的。
 * 执行顺序: webpack会从左往右（从上往下）执行loader链中的每一个pitch方法。
 * 注意：如果picth方法中有异步代码，webpack执行的时候不会等待，
 * 会将loader链中的pitch方法中同步代码执行完再来执行异步代码。
 */
module.exports.pitch = () => {
    console.log('pitch1')
}
```



#### loader2.js

``` javascript
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
```



#### loader3.js

``` javascript
module.exports = function (content, map, meta) {
    console.log('3')
    // 给loader2传递meta数据
    this.callback(null, content, map, { preLoader: 'loader3' })
}

module.exports.pitch = () => {
    console.log('pitch3')
}
```



### 打包执行结果

``` she
pitch1
pitch2
pitch3
3
async pitch2
2
1
```

