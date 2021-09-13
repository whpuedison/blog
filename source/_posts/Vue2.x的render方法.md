---
title: Vue2.x的render方法

tags: [render]

categories: vue
---

#### 基本介绍

render方法将Vue实例渲染成一个虚拟Node，在生成VNode的时候完成了渲染watcher的依赖的收集。

patch方法将VNode转换为真正的DOM节点。



#### 前情提要

在Vue实例挂载的时候，执行render方法来生成VNode。而在开发的时候，开发者大多数情况并不是自己手写的render函数，而是写的template模版或者el。在mounted的方法中，会将template模版编译成render方法，如果是el会多一个步骤，得先从el中提取出template模版。



#### 本集看点

##### render渲染VNode主要步骤

1. 将children参数规范化：由于生成VNode的参数中children必须是VNode类型的，而下面几种情况下children不符合条件，所以在根据参数实例化VNode之前需要将children规范化成一个类型为VNode的Array。

   * render函数是编译生成的，理论上编译生成的children已经是VNode类型的，但是当组件是函数式组件时，返回的是一个数组而不是一个根结点，所以需要用Array.prototype.concat方法将整个children数组打平，让深度只有一层。

     ⚠️只有这一种情况，调用simpleNormalizeChildren方法来实现children规范化。

   * 1. render函数是用户手写的，当children只有一个基础类型节点的时候，会调用createTextVNode方法创建一个文本节点的VNode；
     2. render函数是手写的，当编译slot或者v-for的时候。

     ⚠️只有这两种情况，调用normalizeChildren方法来实现children规范化。

     

2. 创建VNode实例

   为每一个html标签创建一个VNode，顺序是先子后父，从上到下。可以理解成按照标签闭合的顺序，依次创建VNode，一个template模版中的根标签生成的就是当前组件的VNode树，也称为VDOM。

   对tag进行判断，创建不同类型的VNode：

   * 如果是字符串类型且是内置的节点，直接创建普通VNode;
   * 如果是字符串类型且是已注册的组件名，则通过createComponent方法创建一个组件类型的VNode;
   * 如果是字符串类型，又不是上面两种情况，创建一个未知标签的VNode;
   * 如果是组件类型，则通过createComponent方法创建一个组件类型的VNode。





##### 创建组件类型VNode主要步骤

render渲染VNode可能会生成3种类型的VNode：

1. 普通类型VNode;
2. 未知标签VNode;
3. 组件类型VNode。



因为前面两种都比较简单，这里着重分析组件类型VNode。通过createComponent方法将组件渲染成VNode主要做了3个事情：

1. 构造子类构造函数：开发者在写组件的时候，通常都是创建一个普通的对象，Vue内部使用Vue.extend将这个普通对象做了扩展，使这个对象可以像Vue实例一样可以完成初始化、挂载、渲染等一系列功能。

   Vue.extend的作用是构造一个Vue的子类，使用一种非常经典的原型继承的方式把一个纯对象转换成了一个继承于Vue的构造器Sub并返回，然后对Sub对象本身扩展一些属性，如扩展options、添加全局API，并且对配置做一些初始化工作。

   最后对这个Sub构造函数做了缓存，避免多次执行Vue.extend的时候对同一个子组件重复构造。在执行父组件patch方法解析到组件VNode的时候，会触发子组件生命周期中的init hook，在init hook中开始对子组件进行挂载，再走到子组件初始化逻辑。



2. 安装组件钩子函数：将组件特有的几个钩子和Vue实例的生命周期钩子合并。

   在实例化Vue的时候，Vue的挂载是在初始化完成的时候，这个是一个同步的事件，有一个固定的地方可以执行这块逻辑，不需要钩子函数来回调Vue的挂载操作。

   而子组件的挂载时机，是在父组件patch的过程中。子组件为了更好的管理自己的生命周期，添加了init、prepatch、insert和destroy四个生命周期钩子，分别对应初始化、更新、挂载完成、销毁。

   在父组件VNode执行执行patch的时候会执行上面的钩子函数，这就可以实现组件的渲染。这里需要注意的一点是Vue实例原有的几种生命钩子是可以正常使用的，如mounted钩子函数会在insert钩子执行的时候被调用。



3. 实例化VNode：实例化一个VNode，不过需要注意的是组件的VNode是没有children的。因为父组件render方法中，是看不到子组件内部结构的，只会为子组件生成一个组件VNode。

   父组件render方法生成VDOM之后，会执行到patch方法，在patch过程中会将子组件当作一个新的Vue实例，重新进行初始化、render生成VDOM，在这个子组件render方法生成的VDOM中，才会有children。

   也就是说render方法在解析子组件的时候，只会将子组件生成一个组件VNode，不会关心子组件是否有子组件，子组件是否有子组件，这个事情由子组件来关心。



