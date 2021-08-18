---
title: typeof和instanceof区别

tags: [typeof,instanceof]

categories: javascript
---

typeof和instanceof都是用来判断变量类型的，两者的区别在于：

- typeof判断所有变量的类型，返回值有number，boolean，string，function，object，undefined。（这里需要注意一下，js中基本数据类型常用的有六种，其中简单一点的有五个：String、Number、Boolean、Undefined、Null，一个复杂的数据类型：Object。ES6中新增了一个Symbol用于生成唯一标识符，ES10中新增了BigInt可以表示任意大的整数）。
- typeof对于丰富的对象实例，只能返回"object"字符串。

- instanceof用来判断对象，代码形式为obj1 instanceof obj2（obj1是否是obj2的实例），obj2必须为对象，否则会报错！其返回值为布尔值。



语法： object instanceof constructor

object（要检测的对象），constructor（某个构造函数），instanceof 运算符用来检测 constructor.prototype 是否存在于参数 object 的原型链上。



简而言之，A instanceof B ， 是判断对象实例A是否是构造函数B的实例。更准确一点的说法是，构造函数B的原型，是否存在与对象实例A的原型链上。

