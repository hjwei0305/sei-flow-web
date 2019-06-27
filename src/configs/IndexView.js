/**
 * Created by liusonglin on 2018/7/13.
 */
import React, {Component} from 'react';
import {Link} from 'react-router-dom'

export default class IndexView extends Component {
  render() {
    return (
      <header>
        <nav>
          <ul>
            <li><Link to='/Demo'>组件测试Demo</Link></li>
            <li><Link to='/login'>登陆</Link></li>
            <h4>后台配置：</h4>
            <li><Link to='/AppModuleTable'>应用模块配置</Link></li>
            <li><Link to='/WorkPageTable'>工作界面配置</Link></li>
            <li><Link to='/BusinessModelTable'>业务实体管理</Link></li>
            <h4>流程配置：</h4>
            <li><Link to='/FlowTypeTable'>流程类型管理</Link></li>
            <li><Link to='/FlowDefinationView'>流程定义管理</Link></li>
            <li><Link to='/DefinaionPage'>流程定义</Link></li>
            <h4>流程监管：</h4>
            <li><Link to='/FlowInstanceTable'>流程实例管理</Link></li>
            <li><Link to='/TurnToDoTable'>任意转办</Link></li>
            <li><Link to='/AddSignTable'>加签管理</Link></li>
          </ul>
        </nav>
      </header>

    );
  }
}
