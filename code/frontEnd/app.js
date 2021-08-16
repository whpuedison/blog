const express = require('express')
const path = require('path')
const proxy = require('http-proxy-middleware')

const app = express()

app.use(express.static('public'));

// 解决跨域：开发环境前端服务通过proxy做代理转发请求
app.use('*', proxy({ target: 'http://192.168.191.2:3000', changeOrigin: true })); // office-url
// app.use('*', proxy({ target: 'http://192.168.31.186:3000', changeOrigin: true })); // home-url

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
app.listen(8080)