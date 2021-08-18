/**
 * 防抖函数
 * 返回值也是一个函数，函数内部的变量就是局部变量，可以避免造成全局污染
 * 只要触发就关闭当前定时器，重新开始计时
 */ 
 const debounce = (fn, delay) => {
    let timer = null
    return function () {
        // 存储参数
        let args = arguments
        // 定时器存在就清除定时器
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

/**
 * 节流函数
 * 返回值也是一个函数，函数内部的变量就是局部变量，可以避免造成全局污染
 * 只有等当前定时器时间到了，才能重新触发
 */ 
const throttle = (fn, delay) => {
    let timer = null
    return function () {
        // 存储参数
        let args = arguments
        // 定时器存在就等待
        if (!timer) {
            timer = setTimeout(() => {
                timer = null
                fn.apply(this, args)
            }, delay)
        }
    }
}

function throttle_2(fn, delay) {
    let previous = 0;
    return function () {
        // 存储参数
        let args = arguments
        const nowTime = Date.now()
        if (nowTime - previous > delay) {
            fn.apply(this, args)
            previous = nowTime
        }
    }
}

export { debounce, throttle, throttle_2 }