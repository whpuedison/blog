import { ApiRoot } from '../config/index.js'
// import Promise from './myPromise.js'

const getReq = (url) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'get',
            url: `${ApiRoot}${url}`,
            success (res) {
                resolve(res)
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