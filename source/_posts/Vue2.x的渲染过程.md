---
title: Vue2.x的渲染过程

tags: [渲染]

categories: vue
---
new Vue 之后执行一系列的初始化操作，如合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化inject、props、method、data、computed、watch、privide等等。

初始化完成之后，对Vue实例进行挂载。挂载时会判断是否有render函数，如果是el和template转换成render方法，执行render方法会生成VNode tree，也就是VDOM。

最后再调用patch方法，将VNode渲染成DOM并完成挂载，实际上整个渲染过程调用的就是原生的DOM API。