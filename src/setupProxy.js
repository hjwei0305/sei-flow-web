/**
 * @Description:react-scripts升级到2.0.1后的代理配置
 * @Author: CHEHSHUANG
 * @Date: 2019/2/16
 */
const proxy = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(proxy('/basic-service/', {target: 'http://decmp.changhong.com', changeOrigin: true}))
    app.use(proxy('/basic-web/', {target: 'http://decmp.changhong.com', changeOrigin: true}))
    app.use(proxy('/flow-service/', {target: 'http://decmp.changhong.com', changeOrigin: true}))
}
