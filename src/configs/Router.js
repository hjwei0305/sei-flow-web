/**
 * Created by liusonglin on 2018/7/12.
 */
import React, {Component} from 'react';
import {Switch, BrowserRouter as Router} from 'react-router-dom'
import Route from './PrivateRoute'
import Demo from "../commons/components/Demo";
import IndexView from "./IndexView";
import AppModuleTable from "../components/mainData/AppModule/AppModuleTable";
import WorkPageTable from "../components/mainData/WorkPage/WorkPageTable";
import BusinessModelTable from "../components/mainData/businessModel/BusinessModelTable";

export default class Routers extends Component {
    render() {
        return (
            <Router basename="/react-flow-web">
                <Switch>
                    <Route path='/' exact component={IndexView}/>
                    <Route path='/Demo' component={Demo}/>
                    <Route path='/AppModuleTable' component={AppModuleTable}/>
                    <Route path='/WorkPageTable' component={WorkPageTable}/>
                    <Route path='/BusinessModelTable' component={BusinessModelTable}/>
                </Switch>
            </Router>

        );
    }
}
