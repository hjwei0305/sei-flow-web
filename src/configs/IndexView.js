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
                        <h4>后台配置：</h4>
                        <li><Link to='/AppModuleTable'>应用模块配置</Link></li>
                        <li><Link to='/WorkPageTable'>工作界面配置</Link></li>
                    </ul>
                </nav>
            </header>

        );
    }
}
