---
title: Vue2.x的依赖收集

tags: [依赖收集]

categories: vue
---

#### 基本概念

Vue是一个实现了数据驱动的框架， 当数据改变的时候，需要通知到依赖这个数据的订阅者watcher。将数据和依赖数据的订阅者watcher联系起来的过程，称为依赖收集。



#### 收集过程

一般来讲，数据的订阅者watcher常见的类型有如下3种：

1. computed watcher
2. user watcher
3. render watcher

不同类型的watcher完成依赖收集是有顺序的，比如上面提到的3种类型watcher执行顺序就是：computed watcher -> user watcher -> render watcher。

下面按顺序来分析3种watcher完成依赖收集的过程：

##### computed watcher

在初始化数据的时候，如果组件中有使用computed计算属性，会执行initComputed方法，一个computed属性对应生成一个computed watcher。computed watcher是惰性的，不会马上执行watcher实例的get方法，watcher实例的get方法是依赖收集的一个关键方法，也就是说初始化computed的时候是没有做依赖收集的。

当后面使用到computed属性时，如template模版中第一次使用到计算属性，会执行computed对应watcher的get方法。

在这里插入对依赖管理器的介绍，帮助理解后续的过程。对于每一个被用到的响应式数据，都需要有一个dep实例来管理依赖这个数据的watcher。构造函数Dep有一个静态属性target，可以理解成一个全局变量，开始当前watcher的依赖收集的时候，就将当前依赖收集的watcher赋值给target。结束当前watcher的依赖收集的时候，将target赋值为watcher栈里的最上层的一个watcher。从上面的描述中可以看出，在做依赖收集的时候，是按watcher顺序执行来完成依赖收集的。

在get方法中会将当前的watcher压入watcher栈中，并将依赖管理器Dep的静态属性target赋值为当前watcher。然后执行当前watcher实例的getter方法，也就是computed属性对应的计算方法，里面涉及到对响应式数据的取值操作，就会执行数据的getter方法（为了跟前面的get方法区别开，使用getter）。

这里注意一下响应式数据，在执行initComputed之前，数据都是已经被数据劫持过的，使用的是Object.defineProperty方法。所以在对响应式数据取值的时候，才会执行数据的getter方法。

在getter方法中，除了取值还做了依赖收集的工作。判断Dep.target是否存在，如果存在就执行dep实例的depend方法，而dep.depend方法中调用的是当前watcher的addDep方法。

因为在前面的get方法中完成了computed watcher的压栈，所以这个时候的Dep.target是存在的，且值为computed watcher，会顺利执行到当前watcher的addDep方法。

在watcher.addDep方法中做了两件事，通过id来避免了重复收集：

1. 判断当前的watcher是否有收集关于当前dep实例的信息，如果没有则收集到自己的属性中；
2. 判断当前的dep实例是否有收集当前watcher的信息，如果没有则收集到自己的属性中。

watcher.addDep执行完成后，接着执行computed属性对应的计算方法，对使用到的响应式数据都完成依赖收集。完成依赖收集之后，将当前的watcher出栈。最后完成一个细节，遍历deps属性移除旧的订阅，更新为新的订阅。一些列操作完成之后，开始下一个watcher的依赖收集。



##### user watcher

在初始化数据的时候， 如果组件中有使用watch监听属性，会执行initWatch方法，一个watch属性对应生成一个user watcher。创建user watcher实例之后，会马上执行实例的get方法。

在get方法中也会将当前的watcher压入watcher栈中，并将依赖管理器Dep的静态属性target赋值为当前watcher。

执行当前watcher实例的getter方法，这个getter方法是在创建实例的时候执行parsePath方法返回的一个方法，会从Vue实例中获取到当前watch属性的值。因为watch的属性都是响应式数据，所以取值的时候会执行数据的getter方法。

在getter方法中，除了取值还做了依赖收集的工作。判断Dep.target是否存在，如果存在就执行dep实例的depend方法，而dep.depend方法中调用的是当前watcher的addDep方法。

因为在前面的get方法中完成了user watcher的压栈，所以这个时候的Dep.target是存在的，且值为user watcher，会顺利执行到当前watcher的addDep方法。

在watcher.addDep方法中做了两件事，通过id来避免了重复收集：

1. 判断当前的watcher是否有收集关于当前dep实例的信息，如果没有则收集到自己的属性中；
2. 判断当前的dep实例是否有收集当前watcher的信息，如果没有则收集到自己的属性中。

watcher.addDep执行完成后，将当前的watcher出栈。最后也是完成一个细节，遍历deps属性移除旧的订阅，更新为新的订阅。一些列操作完成之后，开始下一个watcher的依赖收集。



##### render watcher

初始化数据完成之后，对Vue实例进行挂载。将VNode渲染成DOM的方法作为创建watcher的第二个参数，创建了一个render watcher，一个组件实例对应一个render watcher。创建render watcher实例之后，会马上执行实例的get方法。

在get方法中也会将当前的watcher压入watcher栈中，并将依赖管理器Dep的静态属性target赋值为当前watcher。

执行当前watcher实例的getter方法，也就是将VNode渲染成DOM的方法（创建watcher实例时传入的第二个参数），在创建DOM的时候，需要对响应式数据进行取值，这就会执行数据的getter方法。

在getter方法中，除了取值还做了依赖收集的工作。判断Dep.target是否存在，如果存在就执行dep实例的depend方法，而dep.depend方法中调用的是当前watcher的addDep方法。

因为在前面的get方法中完成了render watcher的压栈，所以这个时候的Dep.target是存在的，且值为user watcher，会顺利执行到当前watcher的addDep方法。

在watcher.addDep方法中做了两件事，通过id来避免了重复收集：

1. 判断当前的watcher是否有收集关于当前dep实例的信息，如果没有则收集到自己的属性中；
2. 判断当前的dep实例是否有收集当前watcher的信息，如果没有则收集到自己的属性中。

watcher.addDep执行完成后，将当前的watcher出栈。最后也是完成一个细节，遍历deps属性移除旧的订阅，更新为新的订阅。一些列操作完成之后，开始下一个watcher的依赖收集。



#### 差异

这三种watcher的其实大同小异，主要差别在于两点：

1. 实例的get方法执行时机不一样；
2. 实例的getter方法不一样，可以根据需求自定义。

