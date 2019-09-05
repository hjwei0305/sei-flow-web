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
    return (
      <React.Fragment>
        <div id="content"></div>
        <div id="moreinfo"></div>
      </React.Fragment>
    );
  }
}
