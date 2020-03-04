/*
* @Author: zp
* @Date:   2020-02-19 11:21:57
* @Last Modified by:   zp
* @Last Modified time: 2020-03-04 13:38:37
*/
import { SERVER_PATH, defaultPageSize } from './constants';
import { FetchHelper } from 'sei-utils';

const interceptors = {
    request: [[(config) => {
      console.log(config)
        if(config.url.indexOf('ByPage')!==-1) {
            if (config.params !== undefined) {
                config.params = {
                    pageInfo: config.params.pageInfo ? config.params.pageInfo : {
                        'page': 1,
                        'rows': defaultPageSize
                    }, ...config.params
                }
            } else if (config.data !== undefined) {
                config.data = {
                    pageInfo: config.data.pageInfo ? config.data.pageInfo : {
                        'page': 1,
                        'rows': defaultPageSize
                    }, ...config.data
                }
            }
        }
        // if(!isLocalhost || config.url.indexOf('http')===-1){
        //   config.url=gatewayHost+config.url
        // }
        return config;
    }, (err) => {
        return Promise.reject(err);
    }]]
};

const defaults = {
    baseURL: SERVER_PATH,
    xsrfCookieName: 'xsrf-token',
};
export default FetchHelper({
    interceptors,
    defaults,
    unAuthorerCb: () => {

    }
});
