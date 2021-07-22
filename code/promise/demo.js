// const Promise = require("./promise");
const fs = require('fs')
const path = require('path');
const filePath = path.resolve(__dirname, 'text1.js');
const Promise = require('./text')

const p1 = new Promise((resolve, reject) => {
    // fs.readFile(filePath, function (err, data) {
    //     if (err) {
    //         reject('errMsg')
    //         return
    //     }
    //     resolve(data.toString())
    //  })
    // 改变状态的三种方式：
    // 1.执行成功回调
    resolve('OK')
    // 2.执行失败回调
    // reject('error')
    // 3.抛出异常
    // throw 'Error'
})
// const p2 = p1.then(res=> {
//     // throw 'EEE'
//     return 1
//     // return new Promise((resolve, reject) => { reject('NO') })
// }, err => {
//     return 'ERROR ERROR'
//     // return new Promise((resolve, reject) => { throw 'EEE' })
// })
// const p2 = p1.catch(err => {
//     console.log(err)
// })
// setTimeout(() => {
//     console.log(p2)
// }, 1000)
// const p2 = p1.then(res => {
//     console.log(res)
// }, err => {
//     console.log(err)
// })
// setTimeout(() => {
//     console.log(p1)
// }, 1000)
// const p2 = Promise.resolve(1)
// const p3 = Promise.resolve(new Promise((resolve, reject) => { resolve('Yes') }))
// const p4 = Promise.resolve(new Promise((resolve, reject) => { reject('No') }))
// const p5 = Promise.resolve(new Promise((resolve, reject) => { throw 'what up' }))
// const p6 = Promise.reject('1')
// const p7 = Promise.reject(new Promise((resolve, reject) => { resolve('Yes')}))
// setTimeout(() => {
    // console.log(p2)
    // console.log(p3)
    // console.log(p4)
    // console.log(p5)
    // console.log(p6)
    // console.log(p7)
// }, 1000)