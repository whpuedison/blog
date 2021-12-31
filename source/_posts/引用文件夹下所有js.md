---
title: 引用文件夹下所有js

date: 2021-12-31

tags: [import]

categories: javascript
---

在index.js中export同级js文件中暴露的数据:

```javascript
// index.js 
const hooks = {}
const context = require.context('./', false, /\.js$/)
const keys = context.keys().filter(item => item !== './index.js')
keys.forEach(filePath => {
    const file = context(filePath).default
    Object.assign(hooks, { [file.name]: file })
})
export default hooks
```



使用方式:

``` javascript
import hooks from 'xxx/xxx/index.js' 
const { xxx, xxx, xxx } = hooks
```

