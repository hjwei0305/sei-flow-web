import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux'
import {MainStore} from './configs/MainStore'
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import './App.css';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
ReactDOM.render(
    <LocaleProvider locale={zhCN}>
        <Provider store={MainStore}>
            <App />
        </Provider>
    </LocaleProvider>,
    document.getElementById('root'));
registerServiceWorker();
