import React from 'react';

export default class index extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {

    // var __SessionUser = {"accessToken":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NTQzMjEiLCJpcCI6IlVua25vd24iLCJ1c2VyTmFtZSI6Iuezu-e7n-euoeeQhuWRmCIsInVzZXJJZCI6IjE1OTJEMDEyLUEzMzAtMTFFNy1BOTY3LTAyNDIwQjk5MTc5RSIsInJhbmRvbUtleSI6IkEzMDM3OEYzLUQwNTItMTFFOS1BRDcxLTAyNDJDMEE4NDQwNiIsImF1dGhvcml0eVBvbGljeSI6IlRlbmFudEFkbWluIiwibG9naW5UaW1lIjoxNTY3NzM4ODk1MjMyLCJsb2dvdXRVcmwiOm51bGwsImFwcElkIjoiQjgwMzMwQjQtM0EwQy02QjNBLTU0NzctNzNBMDY3RUE5M0NDIiwidXNlclR5cGUiOiJFbXBsb3llZSIsImV4cCI6MTU2Nzc2Nzk5NSwiaWF0IjoxNTY3NzM4ODk1LCJ0ZW5hbnQiOiIxMDA0NCIsImFjY291bnQiOiI2NTQzMjEiLCJlbWFpbCI6bnVsbH0.Oy2y4eI4pyvTa-VU0EOBIGaoGjiZ-0v8Z5zcHE2sYZuB6bKScaO_gi28Dvdng4gnaTJeN0Fo6v_0Cckq7ZReJA","sessionId":"A30378F3-D052-11E9-AD71-0242C0A84406","userId":"1592D012-A330-11E7-A967-02420B99179E","account":"654321","userName":"\u7CFB\u7EDF\u7BA1\u7406\u5458","tenantCode":"10044","email":null,"userType":"Employee","authorityPolicy":"TenantAdmin","ip":"Unknown","appId":"B80330B4-3A0C-6B3A-5477-73A067EA93CC","loginTime":"2019-09-06T11:01:35.232+08:00","loginStatus":null,"logoutUrl":null} || {};
    // var _FeatureMaps = null || {};
    // EUI.checkAuth = function (code) {
    //     if ('GlobalAdmin' === __SessionUser['authorityPolicy']) {
    //         return true;
    //     } else if ('TenantAdmin' === __SessionUser['authorityPolicy']) {
    //         return true;
    //     }
    //     return !!_FeatureMaps[code];
    // };
    // EUI.onReady(function () {
    //     $(document).bind("keypress", function (event) {
    //         if (8 === event.keyCode) {
    //             if ("body" === event.target.tagName.toLowerCase()) {
    //                 return false;
    //             }
    //         }
    //     });
    // });

    const EUI = window.EUI;
    var flowView;
    var parentThis = JSON.parse(localStorage.getItem("flowStart")) || window.top.flowStart  || window.flowStart;
    var businessId = EUI.util.getUrlParam("businessId");
    var businessModelCode = EUI.util.getUrlParam("businessModelCode");
    var typeId = EUI.util.getUrlParam("typeId");
    if(!businessId) {
        businessId = parentThis.businessId;
    }
    if(!businessModelCode){
        businessModelCode = parentThis.businessModelCode;
    }
    var flowDefinationId = EUI.util.getUrlParam("id");
    var ifPoolTask = EUI.util.getUrlParam("ifPoolTask");
    var originStartTab = localStorage.getItem("originStartTab");
    var remark = localStorage.getItem("remark");
    EUI.onReady(function () {
        flowView = new EUI.ConfigWorkFlowView({
            id: flowDefinationId,
            businessId: businessId,
            businessModelCode: businessModelCode,
            ifPoolTask: ifPoolTask,
            originStartTab: JSON.parse(originStartTab),
            parentThis:parentThis,
            remark: remark,
            typeId: typeId,
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
