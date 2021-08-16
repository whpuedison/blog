

// 同步：

const { resolve } = require("../../text2")

/* test1: 测试promise内容为同步，状态为成功的Promise */
const p1 = new Promise((resolve, reject) => { resolve('sync OK') })
console.log('p1', p1)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "sync OK"
// self: 
const p1_then_res1 = p1.then(res => { console.log('p1_res1', res) })
// ES6:  p1_res1 sync OK
// self: 
const p1_then_res2 = p1.then(() => 'p1 then resolve ok')
const p1_then_res3 = p1.then(() => { throw "p1 then throw error" })
const p1_then_res4 = p1.then(() => new Promise((resolve) => resolve('p1 then promise resolve')))
const p1_then_res5 = p1.then(() => new Promise((resolve, reject) => reject('p1 then promise reject')))

console.log('p1_then_res1', p1_then_res1)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
console.log('p1_then_res2', p1_then_res2)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p1 then resolve ok"
// self: 
console.log('p1_then_res3', p1_then_res3)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p1 then throw error"
// self: 
console.log('p1_then_res4', p1_then_res4)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p1 then promise resolve"
// self: 
console.log('p1_then_res5', p1_then_res5)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p1 then promise reject"
// self: 



/* test2: 测试promise内容为同步，状态为失败的Promise */
const p2 = new Promise((resolve, reject) => { reject('sync ERROR') })
console.log('p2', p2)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "sync ERROR"
// self: 
const p2_catch_err = p2.catch(err => { console.log('p2_err', err) })
// ES6:  p2_catch_err sync ERROR
// self:
console.log('p2_catch_err', p2_catch_err)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
const p2_then_res1 = p2.catch(res => { console.log('p2_res1', res) })
// ES6:  p2_res1 sync ERROR
// self: 
const p2_then_res2 = p2.catch(() => 'p2 then resolve ok')
const p2_then_res3 = p2.catch(() => { throw "p2 then throw error" })
const p2_then_res4 = p2.catch(() => new Promise((resolve) => resolve('p2 then promise resolve')))
const p2_then_res5 = p2.catch(() => new Promise((resolve, reject) => reject('p2 then promise reject')))
console.log('p2_then_res1', p2_then_res1)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
console.log('p2_then_res2', p2_then_res2)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p2 then resolve ok"
// self:
console.log('p2_then_res3', p2_then_res3)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p2 then throw error"
// self:
console.log('p2_then_res4', p2_then_res4)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p2 then promise resolve"
// self:
console.log('p2_then_res5', p2_then_res5)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p2 then promise reject"
// self:



/* test3: 测试promise内容为同步，抛出错误 */
const p3 = new Promise(() => { throw 'sync throw error' })
console.log('p3', p3)
// ES6: [[PromiseState]]: "rejected", [[PromiseResult]]: "sync throw error"
// self: 
const p3_catch_err = p3.catch(err => { console.log('p3_err', err) })
// ES6:  p3_err sync throw error
// self: 
console.log('p3_catch_err', p3_catch_err)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
const p3_then_res1 = p3.catch(res => { console.log('p3_res1', res) })
// ES6:  p3_res1 sync ERROR
// self: 
const p3_then_res2 = p3.catch(() => 'p3 then resolve ok')
const p3_then_res3 = p3.catch(() => { throw "p3 then throw error" })
const p3_then_res4 = p3.catch(() => new Promise((resolve) => resolve('p3 then promise resolve')))
const p3_then_res5 = p3.catch(() => new Promise((resolve, reject) => reject('p3 then promise reject')))
console.log('p3_then_res1', p3_then_res1)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
console.log('p3_then_res2', p3_then_res2)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p3 then resolve ok"
// self:
console.log('p3_then_res3', p3_then_res3)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p3 then throw error"
// self:
console.log('p3_then_res4', p3_then_res4)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p3 then promise resolve"
// self:
console.log('p3_then_res5', p3_then_res5)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p3 then promise reject"
// self:



// 异步：
/* test4: 测试promise内容为异步，状态为成功的Promise */
const p4 = new Promise((resolve) => {
    setTimeout(() => { resolve('async OK') }, 500)
})
console.log('p4', p4)
// ES6: pedding -> [[PromiseState]]: "fulfilled", [[PromiseResult]]: "async OK"
// self: 
const p4_then_res = p4.then(res => { console.log('p4_res', res) })
// ES6:  p4_res async OK
// self: 
console.log('p4_then_res', p4_then_res)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
const p4_then_res1 = p4.then(res => { console.log('p4_res1', res) })
// ES6:  p4_res1 sync OK
// self: 
const p4_then_res2 = p4.then(() => 'p4 then resolve ok')
const p4_then_res3 = p4.then(() => { throw "p4 then throw error" })
const p4_then_res4 = p4.then(() => new Promise((resolve) => resolve('p4 then promise resolve')))
const p4_then_res5 = p4.then(() => new Promise((resolve, reject) => reject('p4 then promise reject')))

console.log('p4_then_res1', p4_then_res1)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
console.log('p4_then_res2', p4_then_res2)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p4 then resolve ok"
// self: 
console.log('p4_then_res3', p4_then_res3)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p4 then throw error"
// self: 
console.log('p4_then_res4', p4_then_res4)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p4 then promise resolve"
// self: 
console.log('p4_then_res5', p4_then_res5)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p4 then promise reject"
// self: 



/* test5: 测试promise内容为异步，状态为失败的Promise */
const p5 = new Promise((resolve, reject) => {
    setTimeout(() => { reject('async ERROR') }, 500)
})
console.log('p5', p5) 
// ES6: pedding -> [[PromiseState]]: "rejected", [[PromiseResult]]: "async ERROR"
// self: 
const p5_catch_err = p5.catch(err => { console.log('p5_err', err) })
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
console.log('p5_catch_err', p5_catch_err)
// ES6:  p5_catch_err async ERROR
// self: 
const p5_then_res1 = p5.catch(res => { console.log('p5_res1', res) })
// ES6:  p5_res1 sync ERROR
// self: 
const p5_then_res2 = p5.catch(() => 'p5 then resolve ok')
const p5_then_res3 = p5.catch(() => { throw "p5 then throw error" })
const p5_then_res4 = p5.catch(() => new Promise((resolve) => resolve('p5 then promise resolve')))
const p5_then_res5 = p5.catch(() => new Promise((resolve, reject) => reject('p5 then promise reject')))
console.log('p5_then_res1', p5_then_res1)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: undefined
// self: 
console.log('p5_then_res2', p5_then_res2)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p5 then resolve ok"
// self:
console.log('p5_then_res3', p5_then_res3)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p5 then throw error"
// self:
console.log('p5_then_res4', p5_then_res4)
// ES6:  [[PromiseState]]: "fulfilled", [[PromiseResult]]: "p5 then promise resolve"
// self:
console.log('p5_then_res5', p5_then_res5)
// ES6:  [[PromiseState]]: "rejected", [[PromiseResult]]: "p5 then promise reject"
// self:



/* test6: 测试promise内容为异步，抛出错误 */
// try..catch.. 虽然能捕获错误，但是不能捕获异步的异常
const p6 = new Promise(() => {
    setTimeout(() => { throw 'throw error' }, 500)
})
console.log('p6', p6)
// ES6: [[PromiseState]]: "pending", [[PromiseResult]]: undefined
// self: 
// 状态为pendding, then方法无法执行







