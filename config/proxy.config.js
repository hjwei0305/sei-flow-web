const { LOCAL_SERVER, } = process.env;
const proxy = {
  '/mocker.api': {
    target: 'http://rddgit.changhong.com:7300/mock/5dd5efbdc239b926aeb04627/seid.api',
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/mocker.api': '' },
  },
  '/service.api': {
    target: 'http://10.4.208.86:8100/api-gateway',
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/service.api': '' },
  },
};
/** 代理到本地服务 */
if (LOCAL_SERVER === 'true') {
  const localUrl = '/flow-service';
  const targetUrl = 'http://localhost:3000';
  proxy[`/service.api${localUrl}`] = {
    target: targetUrl,
    changeOrigin: true,
    secure: false,
    pathRewrite: { [`^/service.api${localUrl}`]: localUrl },
  };
}

export default proxy;