/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/7
 */
import React, {Component} from "react"
import {Button, Checkbox, Form, Icon, Input, message, Spin} from 'antd'
import './index.css'
import {login} from "./service";
import md5 from "md5"

const {Item} = Form;

class LoginForm extends Component {
  state = {
    isLoading: false,
    showTenant: false
  };
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, user) => {
      if (!err) {
        user.password = md5(user.password);
        this.doLogin(user);
      }
    })
  };
  doLogin = (params) => {
    this.setState({isLoading: true});
    login(params).then(res => {
      if(res.success&&res.data){
        if (res.data.loginStatus === "success") {
          message.success("登录成功");
            sessionStorage.setItem('Authorization', JSON.stringify(res.data));
            sessionStorage.setItem('_s', res.data.sessionId);
          setTimeout(() => {
            this.props.history.push({pathname: '/index', state: params})
          }, 200)//延迟进入
        } else if (res.data.loginStatus === "multiTenant") {
          message.error("登录时需要传入租户代码");
          this.setState({showTenant: true})
        } else if (res.data.loginStatus === "captchaError") {
          message.error("验证码错误");
        } else if (res.data.loginStatus === "frozen") {
          message.error("账号被冻结");
        } else if (res.data.loginStatus === "locked") {
          message.error("账号被锁定");
        } else if (res.data.loginStatus === "failure") {
          message.error("账号密码错误或账号不存在");
        } else {
          message.error("登录失败");
        }
      }else {
        message.error("登录失败");
      }
    })
      .finally(() => {
        this.setState({isLoading: false});
      })
  }

  componentDidMount() {
    this.userInput.focus();
  }

  render() {
    const {showTenant} = this.state;
    const {getFieldDecorator} = this.props.form;
    return (
      <Spin size="large" className="loading" spinning={this.state.isLoading} tip={'加载中'}>
        <div className={'login'}>
          <div className={'login-form'}>
            <div className="login-logo">
              <div className="login-name">sei平台</div>
            </div>
            <Form onSubmit={this.handleSubmit} style={{maxWidth: '300px'}}>
              {
                showTenant && <Item>
                  {
                    getFieldDecorator('tenantCode', {
                      rules: [{required: false, message: '请输入租户账号!',whitespace:true}]
                    })(
                      <Input autofocus="autofocus" prefix={<Icon type="user" style={{fontSize: 13}}/>} placeholder="租户账号"/>
                    )
                  }
                </Item>
              }

              <Item>
                {
                  getFieldDecorator('account', {
                    rules: [{required: true, message: '请输入用户名!',whitespace:true}]
                  })(
                    <Input ref={(inst) => {
                      this.userInput = inst;
                    }} prefix={<Icon type="user" style={{fontSize: 13}}/>} placeholder="用户名"/>
                  )
                }
              </Item>
              <Item>
                {
                  getFieldDecorator('password', {
                    rules: [{required: true, message: '请输入密码!',whitespace:true}]
                  })(
                    <Input prefix={<Icon type="lock" style={{fontSize: 13}}/>} type="password"
                           placeholder="密码"/>
                  )
                }
              </Item>
              <Item>
                {
                  getFieldDecorator('rememberMe', {
                    valuePropName: 'checked',
                    initialValue: true,
                  })(
                    <Checkbox>记住我</Checkbox>
                  )}
                <a className="login-form-forgot" style={{float: 'right'}}>忘记密码?</a>
                <Button type="primary" htmlType="submit" className="login-form-button" style={{width: '100%'}}>
                  登录
                </Button>
              </Item>
            </Form>
          </div>
        </div>
      </Spin>

    )
  }
}

export default Form.create()(LoginForm);
