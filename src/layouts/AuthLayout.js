import React, { Fragment, PureComponent, } from 'react';
import { LocaleProvider } from 'seid';
import { Spin, } from 'antd';
import { seiLocale } from 'sei-utils';
import withRouter from "umi/withRouter";
import { connect, } from 'dva';
import enUS from '@/locales/en-US.js';
import zhCN from '@/locales/zh-CN.js';
import { userUtils, } from '@/utils';

const { getCurrentLocale, } = userUtils;

const localeCode = getCurrentLocale() || 'zh-CN';

const languages = {
  'en-US': enUS,
  'zh-CN': zhCN,
};

const {
  seiIntl,
} = seiLocale;

function initLocalLocals() {
  seiIntl.init({
    currentLocale: localeCode,
    locales: {
      [localeCode]: languages[localeCode]
    }
  });
}

initLocalLocals();

@withRouter
@connect(({ global, }) => ({ global, }))
class Layout extends PureComponent {
  render() {
    const { children, global } = this.props;
    const { globalLoading, } = global;

    return (
      <Fragment>
        <LocaleProvider locale={localeCode}>
          <Spin
            tip={seiIntl.get({key: 'app.loading', desc: '加载中...'})}
            spinning={globalLoading}
            wrapperClassName={"spin"}
          >
            {children}
          </Spin>
        </LocaleProvider>
      </Fragment>
    );
  }
}

export default Layout;

