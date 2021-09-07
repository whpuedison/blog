---
title: Vue2.x的Virtual DOM

tags: [Virtual DOM]

categories: vue
---
浏览器中的DOM的设计是非常复杂的，当我们频繁的去做DOM更新的时候，会产生一定的性能问题。

而Virtual DOM就是一个用js对象去描述一个DOM节点，对Virtual DOM的操作代价会少很多。

这个设计在react中也有用到，在Vue中Virtual DOM是用VNode这么一个Class去描述的，借鉴了⼀个开源库 snabbdom 的实现，然后加⼊了⼀些 Vue.js 特⾊的东⻄。
