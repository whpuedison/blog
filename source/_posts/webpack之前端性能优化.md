---
title: webpack之前端性能优化

tags: [webpack,性能优化]

categories: webpack
---

### 开发环境优化

#### 优化打包速度

##### HMR 

模块热替换，一个模块发生变化，只会重新打包这一个文件，而不是打包所有文件，提升构建速度。

1. HTML文件：默认不能使用HMR功能，开启HMR功能之后会导致HTML文件不能热更新了。解决方法是修改entry入口，将HTML文件引入。

2. CSS文件：可以使用HMR功能，因为style-loader内部实现了。

3. JS文件：默认不能使用，得手动处理热替换。

   ```javascript
   if (module.hot) {
       // 一旦module.hot为true，说明开启了HMR功能
       module.hot.accept('./XXX.js', () => {
         // 监听XXX.js文件的变化，执行下面逻辑代码
         ...
       })
   }
   ```





#### 优化代码调试

##### source-map

一种提供构建后代码到源代码映射的技术，如果构建后代码出错了，通过映射可以追踪源代码错误。

``` javascript
组合方式：[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
```

开发环境推荐使用：eval-source-map / eval-cheap-module-source-map







### 生产环境优化

#### 优化打包速度

##### oneof

找到了匹配的loader之后，后面的loader就不去匹配了，一个文件在oneOf里只会匹配一个loader。



##### babel缓存

开启缓存后，babel运行的结果会保存起来。如果js文件没有变化，就可以直接使用babel的缓存，不需要重新去编译。



##### 多进程打包

可以使用thread-loader对后面的loader开启多进程打包。

需要注意的是进程的启动大概600ms，通信也需要时间，只有消耗时间长的工作使用多进程打包才有优化效果，如babel-loader。



##### externals

配置忽略打包的库，在入口文件中以CDN的方式引入，来优化打包速度。



##### dll

将一些不常更新的第三方库单独打包，在构建的时候将第三方库打包后的文件引入，每次打包只打包项目自身的代码。





#### 优化代码调试

##### source-map

生产环境隐藏源代码推荐使用：

1. nosources-source-map 全部隐藏
2. hidden-source-map 只隐藏源代码，会提示构建后代码错误信息

生产环境不隐藏源代码推荐使用：source-map / cheap-module-source-map



##### 缓存

在服务端将静态资源设置缓存时间，当用户在缓存时间内请求相同的静态文件的时候，会直接从cookie里去获取。这里的缓存方案，处理场景是在缓存时间内对静态资源有改动，使用户只从服务器获取改动的静态文件，没改动的文件还是从cookie里获取。

打包文件名添加使用hash值，类似于打包文件版本号。文件hash值一旦改变，说明改文件有变动。

1. hash：每次打包都会生成一个唯一hash值；
2. chunkhash：打包来自于同一个入口，属于同一个chunk，就公用一个hash值；
3. contenthash：根据文件内容生成hash值；



##### tree shaking

去除应用程序中没有用到的代码和库，让打包后的代码体积更小，从而提升程序执行速度。

SideEffect: 让 webpack 去除 tree shaking 带来副作用的代码。

使用方式：

1. 使用ES6 module（webpack4.X需要使用ES6 module，webpack5也支持CommonJS）
2. 开启生产模式



##### code split

###### optimization

1. 可以将node-modules中代码单独打包成一个chunk最终输出；
2. 自动分析多入口chunk中，有没有公共文件，如果有会打包成单独的一个chunk。

###### import

import动态导入语法，能将某个文件单独打包成一个chunk。

``` javascript
// 给打包文件重命名
import(/* webpackChunkName: 'XXX' */'./XXX.js')
  .then(() => {
  	...
	}).catch(() => {
    ... 
  })
```



##### 懒加载/预加载

懒加载：使用的时候才去加载，优点是不白加载，缺点是如果加载文件体积过大会卡顿；

预加载：当其他资源加载完了再去加载，优点是使用时流畅，缺点是兼容性不好。



##### PWA

一种理念，使用多种技术来增强webapp的功能，是网站的体验变得更好。能够模拟一些原生功能，如离线也可以访问。











