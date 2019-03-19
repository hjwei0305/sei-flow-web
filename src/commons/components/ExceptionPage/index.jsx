import React from 'react';
import PropTypes from 'prop-types';
import { exceptionPages } from './exceptionPageType.js';
import './index.less';

/**
 * 异常页面展示组件
 */
export default class ExceptionPage extends React.Component {
  static displayName = 'ExceptionPage 异常页面';

  static propTypes = {
    /** define exception type */
    type: PropTypes.string.isRequired,
  };

  render() {
    const { type } = this.props;
    const exceptionPath = exceptionPages[type] || exceptionPages.nullpage;
    return (
      <div className="exception-container">
        <img alt="页面异常" src={exceptionPath} />
      </div>
    );
  }
}
