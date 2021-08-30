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

new Vue通常有两种场景：

1. 开发者主动调用new Vue(options)来实例化一个Vue对象；

2. 组件内部通过new Vue(options)来实例化子组件。









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
  // ⚠️如果没有定义render方法，则会把el和template转换成render方法
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

简而言之render方法主要做的事情就是将实例渲染成了一个VNode，创建VNode实际上调用的是createElement方法。而createElement方法也只是对真正创建VNode的_createElement函数的封装，允许传入的参数更灵活。



##### children的规范化

``` javascript
// 代码来源：src/core/vdom/create-element.js
// normalizationType表示子节点规范的类型，类型不同规范的方法也不同
// 主要的参考是render函数是编译生成的还是开发者手写的
if (normalizationType === ALWAYS_NORMALIZE) {
    /**
     * 调用场景有两个：
     * 1.render函数是用户手写的，当children只有一个节点的时候，
     * Vue.js从接⼝层⾯允许⽤户把children写成基础类型⽤来创建单个简单的⽂本节点；
     * 2.编译slot、v-for的时候会产生嵌套数组的情况，会调⽤normalizeArrayChildren⽅法。
     */
    children = normalizeChildren(children)
} else if (normalizationType === SIMPLE_NORMALIZE) {
    /**
     * 调用场景是render函数是由编译生成的 。理论上编译生成的children都已经是VNode类型的，
     * 有一个例外，函数式组件返回的是一个深度只有一层的数组而不是一个根结点，
     * 所以会通过Array.prototype.concat⽅法将数组打平。
     */
    children = simpleNormalizeChildren(children)
}
```

由于Virtual DOM实际上是一个树状结构，每一个VNode可能会有若干个子节点，这些子节点应该也是VNode类型。但是_createElement接收的第四个参数children是任意类型的，因此要将这个children规范成VNode类型的Array。



##### VNode的创建

``` javascript
// 代码来源：src/core/vdom/create-element.js
// 判断tag是否是String类型
if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
        // 判断如果是内置的⼀些节点，则直接创建⼀个普通VNode
        // platform built-in elements
        if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
            warn(`The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
            context)
        }
        vnode = new VNode(
            config.parsePlatformTagName(tag), data, children,
            undefined, undefined, context
            )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // 如果是一个已注册的组件名，则通过createComponent创建⼀个组件类型的VNode，本质上还是返回一个Vnode
        vnode = createComponent(Ctor, data, context, children, tag)
    } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        // 创建一个未知的标签的VNode
        vnode = new VNode(
            tag, data, children,
            undefined, undefined, context
        )
    }
} else {
    // 如果tag是Component类型，则直接调⽤createComponent创建⼀个组件类型的VNode节点
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
}
```

无论是new VNode还是createComponent，最后返回的都是VNode类型的数据。每个VNode有children，children的每个元素又是VNode，这样就形成了一个VNode Tree，也就是传说中的Virtual DOM，用来映射构建DOM Tree。







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







#### VDOM是怎么渲染成DOM的？

``` javascript
// 代码来源：src/core/instance/lifecycle.js
if (!prevVnode) {
    // initial render
    // 首次渲染
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
} else {
    // updates
    // 数据更新
    vm.$el = vm.__patch__(prevVnode, vnode)
}
```

patch方法被调用的时机有两个：首次渲染和数据更新。

``` javascript
// 代码来源：src/platforms/web/runtime/index.js
Vue.prototype.__patch__ = inBrowser ? patch : noop
```

在源码中是使用vm._update完成的，而 _update的核心是vm.__patch__方法。patch放在在不同的平台上的定义是不一样的，在Web和Weex环境，它们把VDOM映射到平台DOM的方法是不同的，包括对属性模块的创建和更新都会有所不同。整个渲染过程，实际上就是调用原生的DOM的API来进行DOM操作。

需要关注的两个函数：

1. createElm的作⽤是通过虚拟节点创建真实的 DOM 并插⼊到它的⽗节点中；
2. createChildren遍历子虚拟节点，以深度优先的算法递归调用createElm，最后再调用insert方法把dom插入到父节点中。子元素会优先调用insert方法，所以整个VNode树的插入顺序是先子后父。

> tips：首次渲染的整个过程实际上就是递归创建了一个完整的DOM树并插入到Body上。







#### 初始化Vue到最终渲染的过程是怎么样的？

new Vue 之后执行一系列的初始化操作，如合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化inject、props、method、data、computed、watch、privide等等。初始化完成之后，对Vue实例进行挂载。挂载时会判断是否有render函数，如果是el和template转换成render方法，执行render方法会生成VNode tree，也就是VDOM。最后再调用patch方法，将VNode渲染成DOM并完成挂载，实际上整个渲染过程调用的就是原生的DOM API。







#### Vue是怎么渲染子组件的？

通过createComponent返回的是组件的VNode，也通过patch方法实现渲染。

createComponent返回的是组件的VNode，主要有三个步骤：

1. 构造⼦类构造函数：使用原型继承的方式把一个纯对象转换成一个继承于Vue的构造器Sub并返回，然后对Sub本身扩展了一些属性，如options、添加全局API，并对配置中的props和computed做了初始化⼯作，最后将这个 Sub构造函数做了缓存，避免多次执⾏ Vue.extend 的时候对同⼀个⼦组件重复构造。
2. 安装组件钩⼦函数：componentVNodeHooks的钩⼦函数合并到data.hook中，在VNode执⾏patch的过程中执⾏相关的钩⼦函数；
3. 实例化VNode： new VNode实例化⼀个vnode并返回。





#### 组件的mounted时机在哪儿？

``` javascript
// 代码来源：src/core/vdom/patch.js
function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue
    } else {
        for (let i = 0; i < queue.length; ++i) {
            queue[i].data.hook.insert(queue[i])
        }
    }
}

// 代码来源：src/core/vdom/create-component.js
insert (vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
        componentInstance._isMounted = true
        callHook(componentInstance, 'mounted')
    }
    ...
  }
```

组件的 VNode patch 到 DOM 后，会执⾏ invokeInsertHook 函数，把 insertedVnodeQueue ⾥保存的钩⼦函数依次执⾏⼀遍。该函数会执⾏ insert 这个钩⼦函数，每个⼦组件都是在这个钩⼦函数中执⾏ mouted 钩⼦函数。 insertedVnodeQueue 的添加顺序是先⼦后⽗，所以对于同步渲染的⼦组件⽽⾔， mounted 钩⼦函数的执⾏顺序也是先⼦后⽗。 







#### $destroy做了哪些事情？

``` javascript
Vue.prototype.$destroy = function () {
    const vm: Component = this
    if (vm._isBeingDestroyed) {
        return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm)
    }
    // teardown watchers
    if (vm._watcher) {
        vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
        vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    // 触发它⼦组件的销毁钩⼦函数，递归调⽤，执⾏顺序是先⼦后⽗，和 mounted过程⼀样。
    vm.__patch__(vm._vnode, null)
    // fire destroyed hook
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
        vm.$el.__vue__ = null
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
        vm.$vnode.parent = null
    }
}
```

先执行了beforeDestroy 钩⼦函数，接着执⾏了⼀系列的销毁动作，包括从 parent 的 $children 中删掉⾃⾝，删除 watcher ，当前渲染的 VNode 执⾏销毁钩⼦函数等，执⾏完毕后再调⽤ destroy 钩⼦函数。