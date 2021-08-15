const path = require('path')
const fs = require('fs')
const Promise = require('./myPromise.js')

// 异步读取文件
function getPromiseResult (path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}

// filePromise.then(res => {
//     console.log(res)
// }).catch(err => {
//     console.err(err)
// })

// test1: 异步任务成功调用resolve方法，返回值是什么
// 读取文件的绝对路径
const absolutePath = path.resolve(__dirname, 'myPromise.js')
const promiseResult = getPromiseResult(absolutePath)
// console.log(promiseResult) // 官方： Promise { <pending> }
console.log(promiseResult) // 手写： Promise { <pending> }