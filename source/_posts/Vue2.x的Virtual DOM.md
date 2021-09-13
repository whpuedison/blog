---
title: Vue2.x的Virtual DOM

tags: [Virtual DOM]

categories: vue
---
浏览器中的DOM的设计是非常复杂的，当我们频繁的去做DOM更新的时候，会产生一定的性能问题。

而Virtual DOM就是一个用js对象去描述一个DOM节点，对Virtual DOM的操作代价会少很多。

这个设计在react中也有用到，在Vue中Virtual DOM是用VNode这么一个Class去描述的，借鉴了⼀个开源库 snabbdom 的实现，然后加⼊了⼀些 Vue.js 特⾊的东⻄。



⚠️ 使用了虚拟DOM不一定会比直接渲染真实DOM快。举个🌰：一些很明显直接替换DOM的情况下，用虚拟DOM+diff算法，明显是会更慢的。所以严谨的说法是，在复杂视图情况下，使用虚拟DOM+diff算法可以找到DOM树变更的地方，复用之前的DOM，是可以减少DOM的操作使渲染速度更快的。
