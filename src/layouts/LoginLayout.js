import React, { PureComponent, Fragment } from "react";
import withRouter from "umi/withRouter";

@withRouter
class LoginLayout extends PureComponent {

  render() {
    const { children } = this.props;
    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }
}

export default LoginLayout;
