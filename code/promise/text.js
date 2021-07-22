class Promise {
    constructor(execute) {
        this.PromiseState = 'pending'
        this.PromiseResult = null
        this.callBacks = []
        const _this = this
        // 成功回调
        function resolve(data) {
            // 状态只能改一次
            if (_this.PromiseState !== 'pending') return
            // 改为成功状态
            _this.PromiseState = 'resolved'
            // 保存成功的终值
            _this.PromiseResult = data
            // 执行then方法的所有成功回调
            _this.callBacks.forEach(item => {
                item.onResolve(data)
            })
        }

        // 失败回调
        function reject(data) {
            // 状态只能改一次
            if (_this.PromiseState !== 'pending') return
            // 改为失败状态
            _this.PromiseState = 'rejected'
            // 保存失败的原因
            _this.PromiseResult = data
            // 执行then方法的所有失败回调
            _this.callBacks.forEach(item => {
                item.onReject(data)
            })
        }        

        // 执行器函数
        try {
            execute(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }

    then (onResolve, onReject) {
        onResolve = typeof onResolve === 'function' ? onResolve : res => res
        onReject = typeof onReject === 'function' ? onReject : err => { throw err }
        const _this = this
        return new Promise((resolve, reject) => {
            // 三种情况：
            // 1.如果抛出异常，状态会变成失败，reason是error；
            // 2.返回结果不是Promise对象，则返回成功，值为返回值；
            // 3.返回结果是Promise对象，返回结果是这个Promise的结果。

            function handle (type) {
                try {
                    const result = type(_this.PromiseResult)
                    if (result instanceof Promise) {
                        result.then(resolve, reject)
                    } else {
                        resolve(result)
                    }
                } catch (err) {
                    reject(err)
                }
            }

            if (this.PromiseState === 'resolved') {
                setTimeout(() => {
                    handle(onResolve)
                }, 0)
            }
            if (this.PromiseState === 'rejected') {
                setTimeout(() => {
                    handle(onReject)
                }, 0)
            }
            if (this.PromiseState === 'pending') {
                this.callBacks.push({
                    onResolve: function() {
                        handle(onResolve)
                    },
                    onReject: function() {
                        handle(onReject)
                    }
                })
            }
        })
    }

    catch (onReject) {
        return this.then(undefined, onReject)
    }

    static resolve (value) {
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }

    static reject (value) {
        return new Promise((resolve, reject) => {
            reject(value)
        })
    }
}

module.exports = Promise