import React from 'react';
import { AuthUrl } from 'suid';

export default class index extends React.Component {


  // componentDidMount() {
  //   var flowView;
  //   const EUI = window.EUI;
  //   var id = EUI.util.getUrlParam("id");
  //   var instanceId = EUI.util.getUrlParam("instanceId");
  //   EUI.onReady(function () {
  //     flowView = new EUI.LookWorkFlowView({
  //       id: id,
  //       instanceId: instanceId,
  //       renderTo: "content"
  //     });
  //   });
  // }

  lookEui = () => {
    if (window.EUI) {
      const id = EUI.util.getUrlParam("id");
      const instanceId = EUI.util.getUrlParam("instanceId");
      const flowView = new EUI.LookWorkFlowView({
        id: id,
        instanceId: instanceId,
        renderTo: "content"
      });
    }
  };

  render() {
    const style = {
      fontSize: '14px',
    }
    return (
      <AuthUrl loaded={this.lookEui}>
        <React.Fragment>
          <div id="content" style={style}></div>
          <div id="moreinfo" style={style}></div>
        </React.Fragment>
      </AuthUrl>
    );
  }
}
