const { resolve } = require("./promise");
const Promise = require("./promise");

const p1 = new Promise((resolve, reject) => {
    const value = 1
    setTimeout(() => {
        if (value) {
            resolve(value)
        } else {
            reject(value)
        }
    }, 1000)
    // if (value) {
    //     resolve(value)
    // } else {
    //     reject(value)
    // }
})
p1.then().then(res=> {
    console.log('res1111', res)
    return res
})
// p1.then(res => {
//     return res
// })
// console.log(p2)
