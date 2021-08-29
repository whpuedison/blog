---
title: Vue2.x源码学习

tags: [vue,源码]

categories: vue

---

> tips：这篇文章会从源码的角度来分析一些常见的问题。



#### 为什么创建Vue实例的时候需要使用new？

```javascript
// 代码来源：src/core/instance/index.js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // _init函数，是在initMixin(Vue)中扩展到Vue原型上的
  this._init(options)
}
```

Vue实际上是一个用Function实现的类，只能使用new去实例化。





#### 为什么Vue要用Function去实现，而不用ES6的Class？

``` javascript
// 代码来源：src/core/instance/index.js
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```

这些Mixin方法，都会给Vue的prototype上扩展一些方法，Vue按照功能把这些扩展放在了不同的模块。实现方式是在创建Vue实例的时候，调用这些Mixin方法，并将Vue作为参数传入。这种将原型方法放在不同的模块去扩展，用Class是难以实现的。





#### new Vue发生了什么？

``` javascript
// 代码来源：src/core/instance/init.js
// 合并配置
if (options && options._isComponent) {
     initInternalComponent(vm, options)
} else {
     vm.$options = mergeOptions(
     resolveConstructorOptions(vm.constructor),
     options || {},
     vm)
}
...
initLifecycle(vm) // 初始化生命周期
initEvents(vm) // 初始化事件中心
initRender(vm) // 初始化渲染
callHook(vm, 'beforeCreate') // 执行生命周期beforeCreate的回调函数
initInjections(vm) // 初始化inject
initState(vm) // 依次初始化props、method、data、computed、watch
initProvide(vm) // 初始化privide
callHook(vm, 'created') // 执行生命周期created的回调函数
```

Vue初始化主要干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化inject、props、method、data、computed、watch、privide等等。





#### 生命周期对应的回调函数是怎么执行的？

``` javascript
// 代码来源：src/core/instance/lifecycle.js
export function callHook (vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  // 找到该生命周期对应的回调函数
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      // 执行回调
      invokeWithErrorHandling(handlers[i], vm, null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    // ⚠️生命周期回调函数执行的时候会向父元素冒泡一个事件
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
```





#### Vue实例的挂载是怎么实现的？

``` javascript
// 代码来源：src/platform/web/entry-runtime-with-compiler.js
// 代码比较多，可以先只关注⚠️相关模块，了解主要流程
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  // ⚠️ Vue不能挂在在body、html这样的根结点上
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // ⚠️如果没有定义render方法，则会吧el和template转换成render方法
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // ⚠️调用compileToFunctions在线编译template为render方法
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // ⚠️调用原先原型上的$mount方法挂载
  return mount.call(this, el, hydrating)
}
```

1. 首先对el做了限制，Vue不能挂在在body、html这样的根结点上；

2. 然后判断是否有定义render方法，如果没有定义render方法，则会吧el和template转换成render方法；

3. 最后调用原先原型上的$mount方法挂载。

   

原先原型上$mount方法挂载的主要流程：

1. 原先原型上的$mount方法是在 src/platform/web/runtime/index.js定义的；

2. 这个mount方法真正去实现挂载调用的是src/core/instance/lifecycle.js 中的mountComponent方法；

3. mountComponent方法主要做的事情有3个：

   * 调用vm._render方法生成VNode;
   * 实例化一个渲染Watcher，会在回调函数中调用updateComponent；
   * 调用vm._update更新dom。

   

> tips: 这里可以停顿下来思考一个细节，将原先原型上的$mount方法放在 src/platform/web/runtime/index.js定义，其实就是将挂载功能独立了出去，使Runtime-Only和Runtime+Compiler都可以复用。





#### 为什么Vue2.x组件模板只能有一个根元素？

``` javascript
// 代码来源：src/core/instance/render.js
// if the returned array contains only a single node, allow it
if (Array.isArray(vnode) && vnode.length === 1) {
    vnode = vnode[0]
}
// return empty vnode in case the render function errored out
if (!(vnode instanceof VNode)) {
  if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
      warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
      vm)
  }
  vnode = createEmptyVNode()
}
```

这里只从Vue2.x的源码角度，来解释为什么Vue2.x组件模板只能有一个根元素。至于为什么这么设计就不去多分析了，因为Vue3是允许一个组件是有多个根元素的。对于开发者来讲，允许多个根元素是更友好的。





#### render方法做了什么事情？

``` javascript
// 代码来源：src/core/instance/render.js
// 内部调用了createElement方法
vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
...
// render函数的第一个参数是vm.$createElement
vnode = render.call(vm._renderProxy, vm.$createElement)
```

简而言之render方法主要做的事情就是将实例渲染成了一个VNode，创建VNode实际上调用的是createElement方法。







#### Vue2.x为什么要用Virtual DOM?

``` javascript
// 代码来源：src/core/vdom/vnode.js
// VNode只是用来映射到真实DOM的渲染，不需要包含操作DOM的方法
// 虽然看起来还是很复杂，但是跟浏览器的DOM比起来还是非常轻量的
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  devtoolsMeta: ?Object; // used to store functional render context for devtools
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}
```

浏览器中的DOM的设计是非常复杂的，当我们频繁的去做DOM更新的时候，会产生一定的性能问题。而Virtual DOM就是一个用js对象去描述一个DOM节点，对Virtual DOM的操作代价会少很多，这草设计在react中也有用到。在Vue中，Virtual DOM是用VNode这么一个Class去描述的，借鉴了⼀个开源库 snabbdom 的实现，然后加⼊了⼀些 Vue.js 特⾊的东⻄。









