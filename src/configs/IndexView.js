/**
 * Created by liusonglin on 2018/7/13.
 */
import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
export default class IndexView extends Component {
  render() {
    return (
      <header>
        <nav>
          <ul>
            <li><Link to='/Demo'>{seiIntl.get({key: 'flow_000001', desc: '组件测试Demo'})}</Link></li>
            <li><Link to='/login'>{seiIntl.get({key: 'flow_000002', desc: '登陆'})}</Link></li>
            <h4>{seiIntl.get({key: 'flow_000003', desc: '后台配置：'})}</h4>
            <li><Link to='/AppModuleTable'>{seiIntl.get({key: 'flow_000004', desc: '应用模块配置'})}</Link></li>
            <li><Link to='/WorkPageTable'>{seiIntl.get({key: 'flow_000005', desc: '工作界面配置'})}</Link></li>
            <li><Link to='/BusinessModelTable'>{seiIntl.get({key: 'flow_000006', desc: '业务实体管理'})}</Link></li>
            <h4>{seiIntl.get({key: 'flow_000007', desc: '流程配置：'})}</h4>
            <li><Link to='/FlowTypeTable'>{seiIntl.get({key: 'flow_000008', desc: '流程类型管理'})}</Link></li>
            <li><Link to='/FlowDefinationView'>{seiIntl.get({key: 'flow_000009', desc: '流程定义管理'})}</Link></li>
            <li><Link to='/DefinaionPage'>{seiIntl.get({key: 'flow_000010', desc: '流程定义'})}</Link></li>
            <h4>{seiIntl.get({key: 'flow_000011', desc: '流程监管：'})}</h4>
            <li><Link to='/FlowInstanceTable'>{seiIntl.get({key: 'flow_000012', desc: '流程实例管理'})}</Link></li>
            <li><Link to='/PushFlowTaskTable'>{seiIntl.get({key: 'flow_000013', desc: '推送任务管理'})}</Link></li>
            <li><Link to='/TurnToDoTable'>{seiIntl.get({key: 'flow_000014', desc: '任意转办'})}</Link></li>
            <li><Link to='/AddSignTable'>{seiIntl.get({key: 'flow_000015', desc: '加签管理'})}</Link></li>
            <li><Link to='/SubtractTable'>{seiIntl.get({key: 'flow_000016', desc: '减签管理'})}</Link></li>
            <h4>{seiIntl.get({key: 'flow_000017', desc: '通用单据（自测）：'})}</h4>
            <li><Link to='/BusinessModel2View'>{seiIntl.get({key: 'flow_000018', desc: '业务单据'})}</Link></li>
            <h4>{seiIntl.get({key: 'flow_000019', desc: '审批页面（自测）：'})}</h4>
            <li><Link to='/defaultBusinessModel2/look'>{seiIntl.get({key: 'flow_000020', desc: '业务单据审批'})}</Link></li>
          </ul>
        </nav>
      </header>

    );
  }
}
