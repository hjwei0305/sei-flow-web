/**
 * @description
 * @autor liusonglin
 * @date 2018/8/28.
 */
import React, {Component} from 'react';
import {Route} from 'react-router-dom'
import httpUtils from "../commons/utils/FeatchUtils";
import {cache} from "../commons/utils/CommonUtils";
import {_loginUrl, basicAuthor, check_host, defaultAppCode} from "./DefaultConfig";
import queryString from "query-string";
import {Spin} from 'antd';


class PrivateRoute extends Component {
    constructor(props){
        super(props)
        this.state ={
            hasToken:true
        }
    }
    componentWillMount(){
        let urlParams = queryString.parse(this.props.location.search);
   /*     if(urlParams && urlParams._s){
            httpUtils.get(check_host+basicAuthor+"/checkToken?_s="+urlParams._s+'&AppCode='+defaultAppCode.toString()).then(res => {
                if(res.success){
                    cache.set('Authorization',res.data[0]);
                    cache.set('Right',res.data[1]);
                    cache.set('_s',urlParams._s);
                    this.setState({hasToken:res.success});
                }else {
                    cache.clear('Authorization');
                    cache.clear('Right');
                    cache.clear('_s');
                    cache.clear('authHeader');
                    if(window.top){
                window.top.location.replace(_loginUrl);
              }else{
                window.location.replace(_loginUrl);
              }
                }
            })
        }else {*/
            // if(cache.get('Authorization')){
            //     this.setState({hasToken:true});
            // }else {
            //   if(window.top){
            //     console.log(window.top);
            //     window.top.location.replace(_loginUrl);
            //   }else{
            //     window.location.replace(_loginUrl);
            //   }
            // }
        //}
    }

    render(){
        const { component: Component, ...rest } = this.props
        return (
            <Route
                {...rest}
                render={props =>
                    this.state.hasToken?
                        <Component {...props} /> :
                        <Spin tip="加载中..." wrapperClassName={"spin"}/>
                }
            />
        )

    }
}

export default PrivateRoute
