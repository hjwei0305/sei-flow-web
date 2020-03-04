import React, {Component, Fragment} from 'react';
import {Spin} from 'antd';
import propTypes from 'prop-types';
import { isPlainObject, } from 'lodash';
import { storage, constants, commonUtils, } from "@/utils";

const { checkOperateAuth, } = commonUtils;
const { CONST_GLOBAL, AUTH_POLICY } = constants;
const { AUTH, POLICY, } = CONST_GLOBAL;
const { ADMIN, TENANT_ADMIN, } = AUTH_POLICY;
const { sessionStorage, } = storage;

const withPageAuth = WrappedComponent => {
  return class extends Component {

    static childContextTypes = {
      operateAuthority: propTypes.any
    }

    getChildContext() {
      return {
        operateAuthority: this.operateAuthority
      };
    }

    operateAuthority = []

    state = {
      componentType: 'londing'
    }

    componentDidMount() {

      const fmsAuth = sessionStorage.get(AUTH) || [];
      if (isPlainObject(fmsAuth)) {
        const hashs = window.location.hash.split('#');
        this.operateAuthority = fmsAuth[hashs[1]] || [];
      }
      const policy = sessionStorage.get(POLICY);
      if (policy === ADMIN || policy === TENANT_ADMIN) {
        this.operateAuthority = 'admin'
      }
      this.setState({
        componentType: '200',
      });
    }

    checkOperateAuth = (operateCode) => {
      return checkOperateAuth(this.operateAuthority, operateCode);
    }

    getRenderComponent = (type) => {
      const components = {
        "loading": (<Spin spinning={true}></Spin>),
        "200": (<WrappedComponent operateAuthority={this.operateAuthority}
                                  checkOperateAuth={this.checkOperateAuth} {...this.props}></WrappedComponent>),
      };

      return components[type];
    }

    getChildren = () => {
      const {componentType} = this.state;
      return this.getRenderComponent(componentType);
    }

    render() {
      return (
        <Fragment>
          {this.getChildren()}
        </Fragment>
      );
    }
  }
}

export default withPageAuth;
