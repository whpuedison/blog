/**
 * 执行顺序：webpack当前loader链中的pitch方法同步代码执行完成之后，
 * 再从右往左（从下往上）执行loader函数。
 * 注意：异步回调使用this.async，异步回调执行完之后才会下一个loader.
 */
module.exports = function (content) {
    console.log('1')
    return content
}

/**
 * pitch方法不是必须的。
 * 执行顺序: webpack会从左往右（从上往下）执行loader链中的每一个pitch方法。
 * 注意：如果picth方法中有异步代码，webpack执行的时候不会等待，
 * 会将loader链中的pitch方法中同步代码执行完再来执行异步代码。
 */
module.exports.pitch = () => {
    console.log('pitch1')
}