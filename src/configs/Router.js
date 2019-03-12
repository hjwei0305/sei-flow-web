/**
 * Created by liusonglin on 2018/7/12.
 */
import React, {Component, Suspense, lazy} from 'react';
import {BrowserRouter as Router, Route as NoAuthRoute, Switch, Redirect} from 'react-router-dom'
import Route from './PrivateRoute'
import {Spin} from "antd";

const Demo = lazy(() => import('../commons/components/Demo'));
const IndexView = lazy(() => import('./IndexView'));
const AppModuleTable = lazy(() => import('../components/mainData/AppModule/AppModuleTable'));
const WorkPageTable = lazy(() => import('../components/mainData/WorkPage/WorkPageTable'));
const BusinessModelTable = lazy(() => import('../components/mainData/businessModel/BusinessModelTable'));
const FlowTypeTable = lazy(() => import('../components/mainData/FlowType/FlowTypeTable'));
const FlowDefinationView = lazy(() => import('../components/mainData/FlowDefination/FlowDefinationView'));

export default class Routers extends Component {
    render() {
        return (
            <Router basename="/react-flow-web">
                <Suspense
                    fallback={<Spin/>}
                >
                    <Switch>
                        <Route path='/' exact component={IndexView}/>
                        <Route path='/Demo' component={Demo}/>
                        {/*后台配置*/}
                        <Route path='/AppModuleTable' component={AppModuleTable}/>
                        <Route path='/WorkPageTable' component={WorkPageTable}/>
                        <Route path='/BusinessModelTable' component={BusinessModelTable}/>
                        {/*流程配置*/}
                        <Route path='/FlowTypeTable' component={FlowTypeTable}/>
                        <Route path='/FlowDefinationView' component={FlowDefinationView}/>
                    </Switch>
                </Suspense>

            </Router>

        );
    }
}
