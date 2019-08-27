import React, {Component} from 'react';
import {connect} from 'react-redux'
import Router from './configs/Router'
import {Spin, LocaleProvider} from 'antd';
import {seiLocale} from 'sei-utils';

const {seiIntl} = seiLocale;

class App extends Component {
  render() {
    const { antdLocale, loadings } = this.props;
    return (
      <LocaleProvider locale={antdLocale}>
        <Spin
          tip={seiIntl.get({key: 'loading', desc: '加载中...'})}
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
    antdLocale: state.SharedReducer.antdLocale
  }
}

export default connect(
  mapStateToProps
)(App)
