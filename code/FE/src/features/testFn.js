import { debounce, throttle } from '../utils/utils.js'

const logPosition = (event) => {
    console.log(event)
}

// 防抖
// document.addEventListener('mousemove', debounce(logPosition, 1000))

// 节流 
document.addEventListener('mousemove', throttle(logPosition, 1000))