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
                        <h4>：</h4>

                    </ul>
                </nav>
            </header>

        );
    }
}
