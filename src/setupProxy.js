/**
 * @Description:react-scripts升级到2.0.1后的代理配置
 * @Author: CHEHSHUANG
 * @Date: 2019/2/16
 */
const proxy = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(proxy('/basic-service/', {target: 'http://dsei.changhong.com/api-gateway', changeOrigin: true}));
    app.use(proxy('/flow-service/', {target: 'http://dsei.changhong.com/api-gateway', changeOrigin: true}));
    app.use(proxy('/auth-service/', {target: 'http://dsei.changhong.com', changeOrigin: true}));
    app.use(proxy('/flow-web/', {target: 'http://dsei.changhong.com', changeOrigin: true}));
}
