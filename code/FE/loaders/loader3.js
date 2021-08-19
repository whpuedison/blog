module.exports = function (content, map, meta) {
    console.log('3')
    // 给loader2传递meta数据
    this.callback(null, content, map, { preLoader: 'loader3' })
}

module.exports.pitch = () => {
    console.log('pitch3')
}