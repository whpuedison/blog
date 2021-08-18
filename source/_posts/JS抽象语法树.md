---
title: JS抽象语法树

tags: [AST]

categories: javascript
---

### 前言

babel是现在几乎每个项目中必备的一个东西，但是其工作原理避不开对js的解析在生成的过程，babel有引擎babylon，早期fork了项目acron，了解这个之前我们先来看看这种引擎解析出来是什么东西。不光是babel还有webpack等都是通过javascript parser将代码转化成抽象语法树，这棵树定义了代码本身，通过操作这颗树，可以精准的定位到赋值语句、声明语句和运算语句。



### 什么是抽象语法树

我们可以来看一个简单的例子：

```
var a = 1;
var b = a + 1;
```

我们通过这个网站，他是一个esprima引擎的网站，十分好用.画成流程图如下：

![img](https://raw.githubusercontent.com/whpuEdison/blog/master/static/images/ast.png)

而他的json对象格式是这样的：

```
{
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "a"
                    },
                    "init": {
                        "type": "Literal",
                        "value": 1,
                        "raw": "1"
                    }
                }
            ],
            "kind": "var"
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "b"
                    },
                    "init": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "Identifier",
                            "name": "a"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 1,
                            "raw": "1"
                        }
                    }
                }
            ],
            "kind": "var"
        }
    ],
    "sourceType": "script"
}
```

### AST的三板斧

- 通过esprima生成AST
- 通过estraverse遍历和更新AST

- 通过escodegen将AST重新生成源码



### 作用

抽象语法树的作用非常的多，比如编译器、IDE、压缩优化代码等。在JavaScript中，虽然我们并不会常常与AST直接打交道，但却也会经常的涉及到它。例如使用UglifyJS来压缩代码，实际这背后就是在对JavaScript的抽象语法树进行操作。
