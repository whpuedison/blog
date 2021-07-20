const { resolve } = require("./promise");
const Promise = require("./promise");
const fs = require('fs')
const path = require('path')
const filePath = path.resolve(__dirname, 'text1.js');
const p1 = new Promise((resolve, reject) => {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            reject('errMsg')
            return
        }
        resolve(data.toString())
     })
})
// p1.then().then(res=> {
//     console.log('res', res)
//     return res
// })
p1.then(res => {
    console.log(res)
}, err => {
    console.error(err)
})
// console.log(p2)
