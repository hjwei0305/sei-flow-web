import React from 'react';
import {gatewayHost} from "../../../configs/DefaultConfig";

export default class index extends React.Component {

  constructor(props) {
    super(props);
    window._ctxPath = gatewayHost + "/flow-service";
  }

  componentDidMount() {
    const EUI = window.EUI;
    var flowView, orgName;
    var id = EUI.util.getUrlParam("id");
    var orgId = EUI.util.getUrlParam("orgId");
    var orgCode = EUI.util.getUrlParam("orgCode");
    var versionCode = EUI.util.getUrlParam("versionCode");
    var businessModelId = EUI.util.getUrlParam("businessModelId");
    var businessModelCode = EUI.util.getUrlParam("businessModelCode");
    var isCopy = EUI.util.getUrlParam("isCopy") == "true";
    var isFromVersion = EUI.util.getUrlParam("isFromVersion") == "true";
    if (isCopy && !isFromVersion) {
        orgName = decodeURIComponent(EUI.util.getUrlParam("orgName"));
    }
    EUI.onReady(function () {
        flowView = new EUI.WorkFlowView({
            id: id,
            orgId: orgId,
            orgCode: orgCode,
            orgName: orgName,
            businessModelId: businessModelId,
            businessModelCode: businessModelCode,
            versionCode: versionCode || -1,
            isCopy: isCopy,
            isFromVersion: isFromVersion,
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
