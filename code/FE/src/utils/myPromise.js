import { reject, resolve } from "../../text2"

class Promise {
    constructor (execute) {
        /**
         *  Promise实例状态值（3种）: 1.pending; 2.fulfilled; 3.rejected。
         *  状态改变方式（2种）：1.pending -> fulfilled; 2.pending -> fulfilled。
         *  注意：一旦状态改变，不可逆。
         */
        this.PromiseState = 'pending'
        // Promise实例结果: 存储成功时返回的终值（eventual value）和失败时返回的拒因（reason）。
        this.PromiseResult = null
        /**
         * 应用场景：当Promise执行函数为异步时，存储then方法的回调函数，等异步执行完后，根据状态在resolve或reject函数中在去执行。
         * 因为每一个Promise实例可以有多个then方法，所以存储回调的对象属性值是一个数组。
         * 因为异步执行的结果未知，所以成功回调和失败回调都要存储起来，
         * 数组的每一项都是一个对象：{ onResolve: 成功回调, onReject: 失败回调 }。
         */
        this.callBacks = []

        /**
         * 使用方式：在Promise执行函数中，将成功的值作为参数调用resolve函数
         * 执行函数里的内置方法，主要作用有三个：
         * 1.改变Promise实例状态： pending -> fulfilled；
         * 2.改变Promise实例结果： this.PromiseState = data；
         * 3.实现Promise的状态不可逆，具体做法是只当状态为pending时才改变状态和结果。
         */
        const resolve = (data) => {
            if (this.PromiseState !== 'pending') return
            this.PromiseState = 'fulfilled'
            this.PromiseResult = data
            // Promise的then方法是异步执行的，回调函数执行放在定时器里面来实现。
            setTimeout(() => { this.callBacks.forEach(item => item.onResolve())}, 0)
        }

        /**
         * 使用方式：在Promise执行函数中，将失败的原因作为参数调用reject函数
         * 执行函数里的内置方法，主要作用有三个：
         * 1.改变Promise实例状态： pending -> rejected；
         * 2.改变Promise实例结果： this.PromiseState = data；
         * 3.实现Promise的状态不可逆，具体做法是只当状态为pending时才改变状态和结果。
         */
        const reject = (data) => {
            if (this.PromiseState !== 'pending') return
            this.PromiseState = 'rejected'
            this.PromiseResult = data
            // Promise的then方法是异步执行的，回调函数执行放在定时器里面来实现。
            setTimeout(() => { this.callBacks.forEach(item => item.onReject())}, 0)
        }

        // 用try...catch...来处理执行函数运行抛出错误
        try {
            execute(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

    then (onResolve, onReject) {
        /**
         * then方法主要做的事情有四个：
         * 1.接收两个函数作为参数，分别是成功回调和失败回调；
         * 2.返回一个新的Promise实例，可以链式调用；
         * 3.当前面的Promise状态改变时，then方法根据其最终状态，选择特定的回调函数执行；
         * 4.回调函数返回值不同，分三种情况：
         *   *抛出异常，状态为失败，结果为失败返回的拒因；
         *   *返回结果不是Promise实例，状态为成功，结果为成功返回的终值；
         *   *返回结果是Promise实例，返回为这个Promise的结果。
         */

        /**
         * then方法支持参数可以不传，当成功回调不传的时候，默认赋值为一个函数，
         * 这个函数做的事情就是把上一个Promise的返回结果，传递给下一个then方法。
         */
        onResolve = typeof onResolve === 'function' ? onResolve : res => res

         /**
         * then方法支持参数可以不传，当失败回调不传的时候，默认赋值为一个函数，
         * 这个函数做的事情就是抛出错误原因，实现异常穿透。
         */
        onReject = typeof onReject === 'function' ? onReject : err => { throw err } 
        
        return new Promise((resolve, reject) => {
            /**
             * 根据回调函数返回的结果，执行相应内置函数来改变then函数返回的Promise实例状态和结果值
             */
            const handle = (cbType) => {
                // 使用try...catch...来捕获成功回调函数执行中的异常
                try {
                    // 执行成功回调，获取then方法成功回调的返回结果。
                    const res = cbType(this.PromiseResult)
                    if (res instanceof Promise) {
                        res.then(resolve, reject)
                    } else {
                        resolve(res)
                    }
                } catch (e) {
                    reject(e)
                }
            }

            switch (this.PromiseState) {
                // Promise实例的执行函数是同步的，状态为fulfilled。
                case 'fulfilled':
                    // Promise的then方法是异步执行的，回调函数执行放在定时器里面来实现。
                    setTimeout(() => { handle(onResolve) })
                    break;
                // Promise实例的执行函数是同步的，状态为rejected。
                case 'rejected':
                    // Promise的then方法是异步执行的，回调函数执行放在定时器里面来实现。
                    setTimeout(() => { handle(onReject) })
                    break;
                // Promise实例的执行函数是异步的，状态为pending。
                default:
                    // 往回调里面添加成功回调和失败回调
                    this.callBacks.push({
                        /**
                         * 等上一个Promise状态改变时，来根据key执行相对应的value函数
                         */
                        onResolve: () => handle(onResolve),
                        onReject: () => handle(onReject)
                    })
            }
        })
    }

    catch (onReject) {
        // 只需要调用then方法，成功回调传空即可
        return this.then(null, onReject)
    }

    static resolve (value) {
        /**
         * 返回结果为Promise实例，有两种情况：
         * 1.参数是Promise实例，返回为这个Promise的结果；
         * 2.参数不是Promise实例，状态为成功，结果为参数。
         */
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }

    static reject (value) {
        /**
         * 返回结果为Promise实例，状态为失败，结果为参数
         */
        return new Promise((resolve, reject) => {
            reject(value)
        })
    }

    static all (promises) {
        /**
         * 接收的参数为一个由Promise实例组成的数组
         * 返回结果有两种情况：
         * 1.参数中的Promise实例结果都为成功，状态为成功，并将实例终值按原顺序拼凑成一个数组，作为all返回的Promise实例终值；
         * 2.参数中的Promise实例结果有一个失败，状态为失败，并将第一个失败的拒因，作为all返回的Promise实例据因。
         */
         return new Promise((resolve, reject) => {
            let count = 0
            const values = new Array(promises.length)
            for (let i = 0; i < promises.length; i++) {
                Promise.resolve(promises[i]).then(res => {
                    count++
                    values[i] = res
                    console.log('count', count)
                    if (count === promises.length) {
                        resolve(values)
                    }
                }, err => {
                    reject(err)
                })
            }
        }) 
    }

    static race (promises) {
        /**
         * 接收的参数为一个由Promise实例组成的数组
         * 返回一个Promise实例，结果由第一个完成的Promise实例决定
         */
         return new Promise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                Promise.resolve(promises[i]).then(res => {
                    resolve(res)
                }, err => {
                    reject(err)
                })
            }
        })
    }
}

export default Promise