/**
 * Created by liusonglin on 2018/7/12.
 */
import React, {Component, Suspense, lazy} from 'react';
import {BrowserRouter as Router, Route as NoAuthRoute, Switch, Redirect} from 'react-router-dom'
import Route from './PrivateRoute'
import {Spin} from "antd";
import Login from "../components/login";
import { seiLocale } from 'sei-utils';

const { seiIntl } = seiLocale;
const Demo = lazy(() => import('../commons/components/Demo'));
const IndexView = lazy(() => import('./IndexView'));
const AppModuleTable = lazy(() => import('../components/mainData/AppModule/AppModuleTable'));
const WorkPageTable = lazy(() => import('../components/mainData/WorkPage/WorkPageTable'));
const BusinessModelTable = lazy(() => import('../components/mainData/businessModel/BusinessModelTable'));
const FlowTypeTable = lazy(() => import('../components/mainData/FlowType/FlowTypeTable'));
const FlowDefinationView = lazy(() => import('../components/mainData/FlowDefination/FlowDefinationView'));
const FlowDefinationViewNew = lazy(() => import('../components/mainData/FlowDefinationNew/FlowDefinationView'));
const DefinaionPage = lazy(() => import('../components/mainData/FlowDefination/DefinaionPage'));
const FlowDesign = lazy(() => import('../components/mainData/FlowDesign'));
const FlowLook = lazy(() => import('../components/mainData/FlowLook'));
const ConfigUser = lazy(() => import('../components/mainData/ConfigUser'));
const FlowInstanceTable = lazy(() => import('../components/mainData/FlowInstance/FlowInstanceTable'));
const TurnToDoTable = lazy(() => import('../components/mainData/TurnToDo/TurnToDoTable'));
const AddSignTable = lazy(() => import('../components/mainData/AddSign/AddSignTable'));
const SubtractTable = lazy(() => import('../components/mainData/SubtractSign/SubtractSignTable'));
const PushFlowTaskTable = lazy(() => import('../components/mainData/PushFlowTask/PushFlowTaskTable'));
const BusinessModel2View = lazy(() => import('../components/mainData/DefaultBusinessModel2/BusinessModel2View'));
const ApproveBusinessModel2 = lazy(() => import('../components/mainData/Approve/DetailBusinessModel2'));
const TaskMakeOverPowerTable = lazy(() => import('../components/mainData/TaskMakeOverPower/TaskMakeOverPowerTable'));

export default class Routers extends Component {
  render() {
    return (
      <Router basename="/react-flow-web">
        <Suspense
          fallback={<Spin/>}
        >
          <Switch>
            <Route path='/' exact component={IndexView}/>
            <NoAuthRoute path="/login" component={Login}/>
            <Route path='/index' component={IndexView}/>
            <Route path='/Demo' component={Demo}/>
            {/*后台配置*/}
            <Route path='/AppModuleTable' component={AppModuleTable}/>
            <Route path='/WorkPageTable' component={WorkPageTable}/>
            <Route path='/BusinessModelTable' component={BusinessModelTable}/>
            {/*流程配置*/}
            <Route path='/FlowTypeTable' component={FlowTypeTable}/>
            <Route path='/FlowDefinationView' component={FlowDefinationView}/>
            <Route path='/FlowDefinationViewNew' component={FlowDefinationViewNew}/>
            <Route path='/DefinaionPage' component={DefinaionPage}/>
            <Route path='/show' component={FlowDesign}/>
            <Route path='/showLook' component={FlowLook}/>
            <Route path='/configUser' component={ConfigUser}/>
            <Route path='/taskMakeOverPower' component={TaskMakeOverPowerTable}/>
            {/*流程监管*/}
            <Route path='/FlowInstanceTable' component={FlowInstanceTable}/>
            <Route path='/PushFlowTaskTable' component={PushFlowTaskTable}/>
            <Route path='/TurnToDoTable' component={TurnToDoTable}/>
            <Route path='/AddSignTable' component={AddSignTable}/>
            <Route path='/SubtractTable' component={SubtractTable}/>
            {/*通用单据（自测使用）*/}
            <Route path='/BusinessModel2View' component={BusinessModel2View}/>
            {/*审批页面（自测使用）*/}
            <Route path='/builtInApprove/look' component={ApproveBusinessModel2}/>
          </Switch>
        </Suspense>

      </Router>

    );
  }
}
