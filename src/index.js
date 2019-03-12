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

ReactDOM.render(
    <LocaleProvider locale={zhCN}>
        <Provider store={MainStore}>
            <App />
        </Provider>
    </LocaleProvider>,
    document.getElementById('root'));
registerServiceWorker();
