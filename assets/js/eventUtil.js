const interval = 400
// 防抖 指定延时后执行 多次调用会延后执行
function debounce(func, wait = interval) {
  let timeout = null
  return function (...args) {
    const context = this
    if (timeout !== null) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

// 节流 立即执行 多次调用间间隔
function throttl(func, delay = interval) {
  let prev = Date.now()
  return function (...args) {
    const context = this
    const now = Date.now()
    if (now - prev >= delay) {
      func.apply(context, args)
      prev = Date.now()
    }
  }
}

module.exports = {
  debounce,
  throttl
}
