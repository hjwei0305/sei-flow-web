import React, {Component} from 'react';
import {connect} from 'react-redux'
import Router from './configs/Router'
import {Spin} from 'antd';
import {LocaleProvider} from 'seid';
import {seiLocale} from 'sei-utils';

const {seiIntl} = seiLocale;

class App extends Component {
  render() {
    const { seidLocale, loadings } = this.props;
    return (
      <LocaleProvider locale={seidLocale}>
        <Spin
          tip={seiIntl.get({key: 'flow_000000', desc: '加载中...'})}
          spinning={loadings}
          wrapperClassName={"spin"}
        >
          <Router/>
        </Spin>
      </LocaleProvider>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loadings: state.SharedReducer.loadings,
    seidLocale: state.SharedReducer.seidLocale
  }
}

export default connect(
  mapStateToProps
)(App)
