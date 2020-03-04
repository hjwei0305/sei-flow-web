import React from 'react';

export default class index extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var flowView;
    const EUI = window.EUI;
    var id = EUI.util.getUrlParam("id");
    var instanceId = EUI.util.getUrlParam("instanceId");
    EUI.onReady(function () {
        flowView = new EUI.LookWorkFlowView({
            id: id,
            instanceId: instanceId,
            renderTo: "content"
        });
    });
  }

  render() {
    const style = {
        fontSize: '14px',
    }
    return (
      <React.Fragment>
        <div id="content" style={style}></div>
        <div id="moreinfo" style={style}></div>
      </React.Fragment>
    );
  }
}
