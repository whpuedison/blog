---
title: 手写一个Proxy代理

tags: [Proxy, 跨域]

categories: express
---

```javascript
const express = require('express')
const path = require('path')
const proxy = require('http-proxy-middleware')

const app = express()

// 解决跨域：开发环境前端服务通过proxy代理转发请求。
// 跨域问题是由于浏览器的同源策略，在node环境没有跨域问题。
app.use('*', proxy({ target: 'http://xx.xx.xx.xx:xxxx', changeOrigin: true }));

function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
}

function onListening() {
    var addr = app.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

app.on('error', onError);
app.on('listening', onListening);
// 开发环境前端请求自己启动的服务端口，在本地express服务中做代理转发
app.listen(8080)
```