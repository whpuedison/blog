// async function a1 () {
//     console.log('a1 start')
//     await a2()
//     console.log('a1 end')
// }
// async function a2 () {
//     console.log('a2')
// }

// console.log('script start')

// setTimeout(() => {
//     console.log('setTimeout')
// }, 0)

// Promise.resolve().then(() => {
//     console.log('promise1')
// })

// a1() 

// let promise2 = new Promise((resolve) => {
//     resolve('promise2.then')
//     console.log('promise2')
// })

// promise2.then((res) => {
//     console.log(res)
//     Promise.resolve().then(() => {
//         console.log('promise3')
//     })
// })
// console.log('script end')




// Promise.resolve().then(()=>{
//     console.log('Promise1')
//     setTimeout(()=>{
//       console.log('setTimeout2')
//     },0)
//   })
//   setTimeout(()=>{
//     console.log('setTimeout1')
//     Promise.resolve().then(()=>{
//       console.log('Promise2')
//     })
//   },0)




console.log('script start')

async function async1() {
    await async2()
    console.log('async1 end')
}
async function async2() {
    console.log('async2 end')
    return Promise.resolve().then(()=>{
        console.log('async2 end1')
    })
}
async1()

setTimeout(function() {
    console.log('setTimeout')
}, 0)

new Promise(resolve => {
    console.log('Promise')
    resolve()
})
.then(function() {
    console.log('promise1')
})
.then(function() {
    console.log('promise2')
})

console.log('script end')





// console.log('script start')

// async function async1() {
//     await async2()
//     console.log('async1 end')
// }
// async function async2() {
//     console.log('async2 end')
// }
// async1()

// setTimeout(function() {
//     console.log('setTimeout')
// }, 0)

// new Promise(resolve => {
//     console.log('Promise')
//     resolve()
// })
// .then(function() {
//     console.log('promise1')
// })
// .then(function() {
//     console.log('promise2')
// })

// console.log('script end')
 // 旧版输出如下，但是请继续看完本文下面的注意那里，新版有改动
// script start => async2 end => Promise => script end => promise1 => promise2 => async1 end => setTimeout





// console.log('start')
// // 宏任务
// setTimeout(() => {
//   console.log('timer1')
//   // 微任务
//   Promise.resolve().then(function() {
//     console.log('promise1')
//   })
// }, 0)
// // 宏任务
// setTimeout(() => {
//   console.log('timer2')
//   // 微任务
//   Promise.resolve().then(function() {
//     console.log('promise2')
//   })
// }, 0)
// // 微任务
// Promise.resolve().then(function() {
//   console.log('promise3')
// })
// console.log('end')