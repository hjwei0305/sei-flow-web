/**
 * Created by liusonglin on 2018/7/12.
 */
import React, {Component, Suspense, lazy} from 'react';
import {BrowserRouter as Router, Route as NoAuthRoute, Switch, Redirect} from 'react-router-dom'
import Route from './PrivateRoute'
import {Spin} from "antd";
import Login from "../components/login";
const Demo = lazy(() => import('../commons/components/Demo'));
const IndexView = lazy(() => import('./IndexView'));
const AppModuleTable = lazy(() => import('../components/mainData/AppModule/AppModuleTable'));
const WorkPageTable = lazy(() => import('../components/mainData/WorkPage/WorkPageTable'));
const BusinessModelTable = lazy(() => import('../components/mainData/businessModel/BusinessModelTable'));
const FlowTypeTable = lazy(() => import('../components/mainData/FlowType/FlowTypeTable'));
const FlowDefinationView = lazy(() => import('../components/mainData/FlowDefination/FlowDefinationView'));
const DefinaionPage = lazy(() => import('../components/mainData/FlowDefination/DefinaionPage'));
const FlowInstanceTable = lazy(() => import('../components/mainData/FlowInstance/FlowInstanceTable'));
const TurnToDoTable = lazy(() => import('../components/mainData/TurnToDo/TurnToDoTable'));
const AddSignTable = lazy(() => import('../components/mainData/AddSign/AddSignTable'));

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
                        <Route path='/DefinaionPage' component={DefinaionPage}/>
                        {/*流程监管*/}
                        <Route path='/FlowInstanceTable' component={FlowInstanceTable}/>
                        <Route path='/TurnToDoTable' component={TurnToDoTable}/>
                        <Route path='/AddSignTable' component={AddSignTable}/>
                    </Switch>
                </Suspense>

            </Router>

        );
    }
}
