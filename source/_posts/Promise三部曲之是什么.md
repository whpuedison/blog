---

title: Promise三部曲之是什么

tags: [Promise]

categories: javascript

---

### 官方定义

#### [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

**Promise** 对象用于表示一个异步操作的最终完成 (或失败)及其结果值。

一个 `Promise` 对象代表一个在这个 promise 被创建出来时不一定已知的值。它让您能够把异步操作最终的成功返回值或者失败原因和相应的处理程序关联起来。 这样使得异步方法可以像同步方法那样返回值：异步方法并不会立即返回最终的值，而是会返回一个 *promise*，以便在未来某个时候把值交给使用者。



#### 阮一峰 《[ECMAScript 6 入门](https://es6.ruanyifeng.com/)》

 所谓`Promise`，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。



### 知识储备

[Promises/A+ 规范](https://www.ituring.com.cn/article/66566)

#### 术语

- **解决（fulfill）**：指一个 promise 成功时进行的一系列操作，如状态的改变、回调的执行。虽然规范中用 `fulfill` 来表示解决，但在后世的 promise 实现多以 `resolve` 来指代之。
- **拒绝（reject）**：指一个 promise 失败时进行的一系列操作。
- **终值（eventual value）**：所谓终值，指的是 promise 被**解决**时传递给解决回调的值，由于 promise 有**一次性**的特征，因此当这个值被传递时，标志着 promise 等待态的结束，故称之终值，有时也直接简称为值（value）。
- **拒因（reason）**：也就是拒绝原因，指在 promise 被**拒绝**时传递给拒绝回调的值。



#### 状态

一个 Promise 的当前状态必须为以下三种状态中的一种：

1. **等待态（Pending）**：可以迁移至执行态或拒绝态；
2. **执行态（Fulfilled）**：必须拥有一个不可变的终值，不能迁移到别的状态；
3. **拒绝态（Rejected）**： 必须拥有一个不可变的拒因，不能迁移到别的状态。



### 举个🌰

异步读取一个文件内容

```javascript
const fs = require('fs')
const path = require('path')
const filePath = path.resolve(__dirname, 'text.js');
const p1 = new Promise((resolve, reject) => {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            reject(err)
            return
        }
        resolve(data.toString())
     })
})
p1.then(res => {
    console.log(res)
}, err => {
    console.error(err)
})
```

p1 就是一个 <code>Promise</code> 对象，表示读取文件内容这个异步操作最终完成 (或失败)及其结果值。

创建一个 <code>Promise</code> 对象的时候，传入的参数是一个函数。

这个函数可以拆成两部分来分析：

1. 参数：<code>resolve</code> 和 <code>reject</code> 其实也都是函数，这两个函数是 <code>Promise</code> 内置的两个处理异步操作结果的函数。先可以简单的把 <code>resolve</code> 当作一个成功回调， <code>reject</code> 当作一个失败回调，将异步的结果当作参数传入回调函数中。
2. 函数体：多用于执行异步操作，在异步操作的成功回调中将 **终值** 作为参数执行 <code>resolve</code> 函数，在失败回调用将**拒因**作为参数执行 <code>reject</code> 函数。

拿到  <code>Promise</code> 对象并不是最终目的，就这个例子来讲，读取文件成功时拿到文件内容或者读取失败时拿到失败原因才是目的，那么就不得不提一下<code>then</code>方法了。

在 Promises/A+ 规范中提到：一个 promise 必须提供一个 `then` 方法以访问其当前值、终值和据因。

陈列一下 <code>then</code> 方法做的事情：

1. 接收两个函数作为参数，分别是成功回调和失败回调；
2. 返回一个新的 <code>Promise</code> 实例，可以链式调用；
3. 当前面的 <code>Promise</code>  状态改变时，  <code>then</code> 方法可以根据其最终状态，选择特定的回调函数执行；
4. 回调函数返回值不同，处理方案如下：
   * 不返回值，相当于返回了一个 <code>undefined</code>；
   * 返回新的 <code>Promise</code>  ，下一级的 <code>then</code> 方法会在这个 <code>Promise</code>  状态改变后执行；
   * 返回其他值，立即执行下一级的 <code>then</code> 方法。
