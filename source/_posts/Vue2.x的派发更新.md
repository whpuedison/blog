---
title: Vue2.x的派发更新

tags: [派发更新]

categories: vue
---

#### 基本概念

响应式数据改变之后，执行对数据有依赖的watcher，这个过程称为派发更新。



#### 更新过程

响应式数据改变的时候，会执行数据的set方法。在set方法里面主要做了3件事：

1. 更新数据的值；
2. 调用observe方法处理新值，如果是对象或者VNode类型，则进行数据劫持；
3. 调用dep.notify方法，开始派发更新。



dep.notify方法中将数据依赖的watcher按创建顺序排序，遍历执行watcher实例的update方法。这里有3种情况（注意是if - else if - else）：

1. computed watcher，只需要把watcher实例的dirty属性值设置为true。

2. 同步的watcher，就直接执行watcher实例的run方法；

3. 执行queueWatcher方法。



第一种情况computed watcher在派发更新里做的事情比较简单，因为只是一个取值操作，并没有复杂回调。

第二种情况也比较简单，后面会具体聊到run方法。

这里重点了解一下第三种情况，因为一般数据更新都是这个情况。在queueWatcher方法中，主要做的事情有两个：

1. 根据watcher实例的id从小到大顺序，往待执行的watcher队列里插入当前watcher，使用has对象保证同一个watcher只添加一次；
2. 使用nextTick异步执行flushSchedulerQueue方法，通过waiting保证在一次派发更新过程中对nextTick方法只执行一次。



flushSchedulerQueue主要做的3个事情：

1. 对队列做了从⼩到⼤的排序，确保组件的更新由父到子，user watcher要优先于render watcher，computed watcher不会到这个队列来。

2. 遍历队列依次执行watcher的run方法；

3. 执行resetSchedulerState方法，将控制流程状态的变量恢复到初始状态，清空队列，这就完成了一次派发更新。

   

run方法里先执行了watcher实例的get方法，得到当前的值，并重新进行依赖收集。如果满足新值和旧值不等、新值是对象类型、deep模式任何一个条件，执行watcher的回调。



这里需要注意的是，render watcher 和 computed watcher都执行不到这个回调。render watcher 执行完get方法，重新收集依赖并更新视图之后，因为没有返回值满足不了判断条件，所以就结束了。computed watcher只是在需要获取计算属性的时候会执行一下getter方法，获取到最新值并收集依赖就结束了，都不会执行到判断条件这里来。



#### 总结

响应式数据变化的时候，并不会马上就去执行对数据有依赖的watcher，而是会将user watcher和render watcher放入到一个watcher队列里面，computed watcher会在程序需要读取计算属性的时候执行。当同步任务执行完，按照浏览器的事件循环机制，执行到这个nextTick里的回调函数的时候，就开始执行watcher队列。

