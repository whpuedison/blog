---
title: Node的事件循环机制

tags: [事件循环]

categories: Node
---

#### 简介

Node中的Event Loop和浏览器中的是完全不相同的东西。Node采用V8作为js的解析引擎，而I/O处理方面使用了自己设计的libuv。libuv是一个事件驱动的跨平台抽象层，封装了不同操作系统的一些底层特性，对外提供统一的API，事件循环机制也是它里面的实现。



#### 运行机制

V8引擎解析js脚本，解析后的代码调用Node API。libuv库负责Node API的执行，将不同的任务分配给不同的线程，形成一个事件循环，以异步的方式将任务的返回结果返回给V8引擎，再由V8引擎将结果返回给用户。



#### 事件循环的阶段顺序

输入数据阶段 incoming data -> 轮询阶段 poll ->  检查阶段 check -> 关闭事件回调阶段 close callback -> 定时器检测阶段 timer ->  I/O事件回调阶段 I/O callbacks -> 闲置阶段 idle,prepare -> 轮询阶段 poll ...



#### 六大阶段概述

* 定时器检测阶段 timer：执行timer的回调，即setTimeout、setInterval里面的回调函数；
* I/O事件回调阶段 I/O callbacks：执行上一轮循环中未被执行的一些I/O回调；
* 闲置阶段 idle, prepare：仅系统内部使用；
* 轮询阶段 poll：检索新的I/O事件，执行与I/O相关的回调；
* 检查阶段 check：setImmediate()回调函数在这里执行；
* 关闭事件回调阶段 close callback：一些关闭的回调函数，如socket.on('close', ...)。



⚠️每个阶段都有一个先进先出队列来执行回调。通常情况下，当事件循环进入给定的阶段后，将执行该阶段的任何操作，然后执行该阶段队列中的回调。当该队列执行完毕或达到最大回调限制时，事件循环将移动到下一阶段。



#### 三大阶段详述

日常开发中绝大部分的异步任务都是在poll、check、timer这三个阶段，重点分析一下。

##### timer

timer阶段会执行setTimeout、setInterval里面的回调函数，并且是由poll阶段控制的。在Node中定时器指定的时间也不是准确时间，只能是尽快执行。



##### check

setImmediate()回调函数在这里执行。



##### poll

poll阶段是一个至关重要的阶段，执行逻辑相对复杂，具体流程如下。

在这一阶段中，系统会做两件事情：

1. 回到timer阶段执行回调：设定了timer且poll队列为空，如果有timer超时，则会回到timer阶段；
2. 执行I/O回调（没满足上面的条件就会走下面流程）：
   * 如果poll队列不为空，会遍历回调队列并同步执行，直到队列为空或者达到系统限制；
   * 如果poll队列为空时，也有两种情况：
     * 如果有setImmediate回调需要执行，poll阶段会停止并且进入到check阶段执行回调；
     * 如果没有setImmediate回调需要执行，会等待回调被加入队列中并立即执行回调。这里有个超时时间设置，防止一直等待下去。





#### 分析差别

Node中的事件循环和浏览器的事件循环，差别就在于浏览器中事件循环中异步任务只分为了宏任务和微任务，他们执行的是同属于一个阶段的，简单理解为渲染之前的阶段。而Node中的不同的宏任务会有不同的执行阶段，且微任务的执行时机跟Node的版本还有关系。



##### Node中宏任务和微任务

###### 宏任务 macro-task

* setTimeout：timers阶段执行；
* setInterval：timers阶段执行；
* setImmediate：check阶段执行；
* script 整体代码：执行同步代码，将不同类型的异步任务添加到任务队列；
* I/O 操作：poll阶段执行。
* ...

###### 微任务 micro-task

* process.nextTick：与普通的微任务有区别，在微任务队列执行之前执行；
* Promise.then;
* ...



##### 版本差异总结

node11之前，每一个event loop阶段完成后都会先清空nextTick队列，再清空微任务队列。

node11之后，process.nextTick是微任务的一种，但还是执行顺序优先于Promise.then。在异步任务的执行方面，已经在向浏览器看齐，最大的改变是微任务的执行时机发生变化了。当执行完一个宏任务时，生成的微任务会在这个宏任务出队列的时候立即执行，而不是等到一个event loop阶段再去执行。

⚠️虽然node11之后，异步方法的执行方面已经在向浏览器看齐了，但是不同的宏任务还是位于不同的阶段去执行，这个跟浏览器还是很大差别的。



###### 举几个🌰

1. 微任务执行时机

``` javascript
setImmediate(() => {
    console.log('timeout1')
    Promise.resolve().then(() => console.log('promise resolve'))
    process.nextTick(() => console.log('next tick1'))
});
setImmediate(() => {
    console.log('timeout2')
    process.nextTick(() => console.log('next tick2'))
});
setImmediate(() => console.log('timeout3'));
setImmediate(() => console.log('timeout4'));

// 执行结果：
// node11之前：timeout1 -> timeout2 -> timeout3 -> timeout4 -> next tick1 -> next tick2 -> promise resolve

// node11之后：timeout1 -> next tick1 -> promise resolve -> timeout2 -> next tick2 -> timeout3 -> timeout4
```

过程分析：

node11之前，在check阶段执行setImmediate的时候遇到的微任务都会先放入微任务队列，等check阶段所有的setImmediate执行完成之后，在进入关闭事件回调阶段 close callback之前，会讲所有的微任务清空。

node11之后，在check阶段执行setImmediate的时候遇到的微任务都在当前的宏任务执行完成之后，马上清空该宏任务生成的微任务。等微任务清空后，再去执行下一个宏任务。



2. setTimeout 和 setImmediate

``` javascript
setTimeout(function timeout () {
    console.log('timeout');
},0);
setImmediate(function immediate () {
    console.log('immediate');
});
// 执行结果：结果不固定
```

对于以上代码来说，setTimeout可能执行在前，也可能执行在后。首先科普一下，setTimeout(fn, 0) === setTimeout(fn, 1)，这个是源码决定的。

因为进入事件循环也是需要时间的，如果在进入时间循环的准备阶段花费了大于1ms的时间，那么此时就成了一个timer超时且poll队列为空的状态，会回到timer阶段执行setTimeout回调。

如果进入时间循环的准备阶段花费了小于1ms的时间，不满足timer超时且poll队列为空的状态，就会还是处于poll阶段执行I/O回调。由于poll队列为空，且有setImmediate回调，就直接跳转到check阶段执行immediate回调函数。



3. 异步I/O回调中的setTimeout 和 setImmediate

``` javascript
const fs =require('fs')
fs.readFile('./reptileServer.js', 'utf-8', (err, res) => {
    if (err) throw err
    setTimeout(function timeout () {
        console.log('timeout');
    },0);
    setImmediate(function immediate () {
        console.log('immediate');
    });
})
// 执行结果：immediate -> timeout
```

这个🌰跟上面看似只有细微差别，实际上会有完全不同的执行结果，会稳定先执行setImmediate回调。因为在I/O回调生成setTimeout和setImmediate宏任务时，poll队列不为空，所以不管timer是否超时都不会进入到timers阶段。等队列为空时，会直接到check阶段执行setImmediate回调。