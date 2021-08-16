const path = require('path')
const fs = require('fs')

// 异步读取文件
function getMusicList (relativePath) {
    const absolutePath = path.resolve(__dirname, '../public/js/music.json')
    return new Promise((resolve, reject) => {
        fs.readFile(absolutePath, 'utf-8', (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}

function getNotExistFile (relativePath) {
    const absolutePath = path.resolve(__dirname, '../public/js/null.json')
    return new Promise((resolve, reject) => {
        fs.readFile(absolutePath, 'utf-8', (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}

module.exports = {
    getMusicList,
    getNotExistFile
}