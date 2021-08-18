---
title: JS中的原型和原型链

tags: [原型,原型链]

categories: javascript
---
### 原型

每一个javascript对象（null除外）在创建的时候，都会与另外一个对象所关联。而这个与创建对象所关联的对象，就是所创建对象的原型，每一个对象都会从原型中继承属性。



#### 构造函数、原型、实例的关系图

![](原型图.png) 

#### 为什么原型没有属性指向实例？

因为一个构造函数可以创建多个实例对象，原型与实例对象是一对多的关系，所以就没法用一个属性指向实例。



### 原型链

当读取实例的属性时，如果找不到就会去查找与对象关联的原型中的属性，如果还找不到，就去找原型的原型，一直找到最顶层为止，这样由原型组成的链状结构就是原型链。



#### 原型链的尽头

```
console.log(Object.prototype.__proto__ === null) // true
```

 Object.prototype.__proto__ 的值为 null 跟 Object.prototype 没有原型，其实表达了一个意思，所以查找属性到了 Object.prototype就可以停止查找了。



#### 原型链关系图

![](JS中的原型和原型链/原型链.png)

图中由相互关联的原型组成的链状结构就是原型链，也就是蓝色的这条线。



### 几个常见小问题

#### 实例的constructor属性指向构造函数吗？

```
function Person() {}
var person = new Person();
console.log(person.constructor === Person); // true
```

当获取person的constructor属性时，其实 person 中并没有 constructor 属性，当不能读取到constructor 属性时，会从 person 的原型也就是 Person.prototype 中读取，正好原型中有该属性。

```
person.constructor === Person.prototype.constructor
```



#### 怎么理解__proto__属性？

绝大多数浏览器都支持这个非标准的方法访问原型，然而它并不存在于Person.prototype中，实际上它是来自于 Object.prototype。与其说是一个属性，不如说是一个getter/setter，当使用 obj.__proto__ 时，可以理解成返回了 Object.getPrototypeOf(obj)。



#### 真的是从原型上“继承”属性吗？

继承意味着复制操作，然而 JavaScript 默认并不会复制对象的属性。相反，JavaScript 只是在两个对象之间创建一个关联，这样，一个对象就可以通过委托访问另一个对象的属性和函数，所以与其叫继承，委托的说法反而更准确些。

