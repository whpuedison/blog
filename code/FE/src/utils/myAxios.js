require('./jquery.min.js')

import { ApiRoot } from '../config/index.js'
// import Promise from './myPromise.js'

const getReq = (url) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'get',
            url: `${ApiRoot}${url}`,
            success (res) {
                const { code, data, msg } = res || {}
                if (code) {
                    resolve(data)
                } else {
                    reject(msg)
                }
            },
            error (e) {
                reject(e)
            }
        })  
    })
}

export {
    getReq
}