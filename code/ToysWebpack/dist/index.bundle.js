
              (function(depsGraph){
                // require目的：加载入口文件
                function require(module){
                    // 函数内部的require其实执行的是localRequire
                    function localRequire(relativePath){
                        // 找到要引入模块的绝对路径，通过require加载
                        return require(depsGraph[module].deps[relativePath])
                    }
                    // 定义暴露的对象，将来模块要暴露的内容都放在这里
                    let exports = {};
                    (function(require, exports, code){
                        eval(code)
                    })(localRequire, exports, depsGraph[module].code);
                    // 作为require的返回值返回出去
                    return exports
                }
                require('/Users/mashengguang/whpuedison/plan/blog/code/ToysWebpack/src/index.js')
              })({"/Users/mashengguang/whpuedison/plan/blog/code/ToysWebpack/src/index.js":{"deps":{"./add.js":"/Users/mashengguang/whpuedison/plan/blog/code/ToysWebpack/src/add.js","./log.js":"/Users/mashengguang/whpuedison/plan/blog/code/ToysWebpack/src/log.js"},"code":"\"use strict\";\n\nvar _add = require(\"./add.js\");\n\nvar _log = require(\"./log.js\");\n\n(0, _log.log)((0, _add.add)(1, 2));"},"/Users/mashengguang/whpuedison/plan/blog/code/ToysWebpack/src/add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.add = void 0;\n\nvar add = function add(a, b) {\n  return a + b;\n};\n\nexports.add = add;"},"/Users/mashengguang/whpuedison/plan/blog/code/ToysWebpack/src/log.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.log = void 0;\nvar log = console.log;\nexports.log = log;"}})
            