/**
 * Created by fly on 2017/4/18.
 */
EUI.LookFlowNodeSettingView = EUI.extend(EUI.CustomUI, {
  title: null,
  data: null,
  nodeType: null,
  afterConfirm: null,
  businessModelId: null,
  instanceId: null,
  flowTypeId: null,
  id: null,
  notifyBeforePositionData: null,
  notifyAfterPositionData: null,
  isSolidifyFlow: null,
  initComponent: function () {
    var g = this;
    if (g.nodeType == "CallActivity") {
      this.window = EUI.Window({
        title: "节点配置",
        width: 580,
        height: 435,
        padding: 15,
        afterRender: function () {
          // this.dom.find(".ux-window-content").css("border-radius", "6px");
        },
        afterClose: function () {
          g.remove();
        },
        items: [{
          xtype: "TabPanel",
          isOverFlow: false,
          showTabMenu: false,
          defaultConfig: {
            iframe: false,
            closable: false
          },
          items: [this.getNormalTab()]
        }]
      });
    } else if (g.nodeType == "ServiceTask" || g.nodeType == "ReceiveTask" || this.nodeType == "PoolTask") {
      this.window = EUI.Window({
        title: "节点配置",
        width: 580,
        height: 435,
        padding: 15,
        afterRender: function () {
          // this.dom.find(".ux-window-content").css("border-radius", "6px");
        },
        afterClose: function () {
          g.remove();
        },
        items: [{
          xtype: "TabPanel",
          isOverFlow: false,
          showTabMenu: false,
          defaultConfig: {
            iframe: false,
            closable: false
          },
          items: [this.getServiceTaskNormalTab(this.nodeType), this.getEventTab(),
            this.getNotifyTab(true)]
        }]
      });
      this.initNotify(true);
    } else {
      this.window = EUI.Window({
        title: "节点配置",
        width: 580,
        height: 435,
        padding: 15,
        afterRender: function () {
          // this.dom.find(".ux-window-content").css("border-radius", "6px");
        },
        afterClose: function () {
          g.remove();
        },
        items: [{
          xtype: "TabPanel",
          isOverFlow: false,
          showTabMenu: false,
          defaultConfig: {
            iframe: false,
            closable: false
          },
          items: [this.getNormalTab(), this.getExcutorTab(), this.getEventTab(),
            this.getNotifyTab()]
        }]
      });
      this.initNotify();
    }

    if (this.data && !Object.isEmpty(this.data)) {
      this.loadData();
    }
    this.addEvent();
  },
  addEvent: function () {
    var g = this;
    $(".west-navbar").live("click", function () {
      if ($(this).hasClass("select-navbar")) {
        return;
      }
      $(this).addClass("select-navbar").siblings().removeClass("select-navbar");
      var index = $(this).index();
      $(".notify-center").hide();
      var selecter = ".notify-center:eq(" + index + ")";
      $(selecter).show();
      if (index == 0) {
        g.nowNotifyTab = EUI.getCmp("notify-before");
      } else {
        g.nowNotifyTab = EUI.getCmp("notify-after");
      }
    });

    $(".notify-user-item").live("click", function () {
      if ($(this).hasClass("select")) {
        return;
      }
      $(this).addClass("select").siblings().removeClass("select");
      EUI.getCmp(g.nowNotifyTab.items[0]).hide();
      EUI.getCmp(g.nowNotifyTab.items[1]).hide();
      if (g.nowNotifyTab.items[2]) {
        EUI.getCmp(g.nowNotifyTab.items[2]).hide();
      }
      if (g.nowNotifyTab.items[3]) {
        EUI.getCmp(g.nowNotifyTab.items[3]).hide();
      }
      var index = $(this).index();
      switch (index) {
        case 0:
          EUI.getCmp(g.nowNotifyTab.items[0]).show();
          break;
        case 1:
          EUI.getCmp(g.nowNotifyTab.items[1]).show();
          break;
        case 2:
          if (g.nowNotifyTab.items[2]) {
            EUI.getCmp(g.nowNotifyTab.items[2]).show();
          }
          break;
        case 3:
          if (g.nowNotifyTab.items[3]) {
            EUI.getCmp(g.nowNotifyTab.items[3]).show();
          }
          break;
        default:
          break;
      }
    });
  },
  getNormalTab: function () {
    var g = this;
    var items = [{
      title: "节点名称",
      labelWidth: 100,
      name: "name",
      value: this.title
    }, {
      title: "节点代码",
      labelWidth: 100,
      name: "nodeCode"
    },
      //     {
      //     xtype: "NumberField",
      //     title: "额定工时",
      //     allowNegative: false,
      //     name: "executeTime",
      //     labelWidth: 100,
      //     unit: "分钟"
      // },
      {
        xtype: "FieldGroup",
        labelWidth: 100,
        title: "额定工时",
        layout: "column",
        width: 400,
        defaultConfig: {
          padding: 0,
          labelWidth: 0,
          width: 88
        },
        items: [{
          xtype: "NumberField",
          name: "executeDay",
          value: 0,
          unit: "天",
          readonly: true
        }, {
          xtype: "NumberField",
          name: "executeHour",
          value: 0,
          unit: "时",
          readonly: true
        }, {
          xtype: "NumberField",
          name: "executeMinute",
          value: 0,
          unit: "分",
          readonly: true
        }]
      },
      {
        title: "工作界面",
        labelWidth: 100,
        name: "workPageName"
      }];
    items.concat([{
      xtype: "NumberField",
      title: "会签决策",
      labelWidth: 100,
      unit: "%",
      hidden: this.nodeType == "CounterSign" ? false : true,
      name: "counterDecision"
    }, {
      xtype: "RadioBoxGroup",
      name: "isSequential",
      title: "执行策略",
      labelWidth: 100,
      hidden: this.nodeType == "CounterSign" ? false : true,
      items: [{
        title: "并行",
        name: "false",
        checked: true
      }, {
        title: "串行",
        name: "true"
      }]
    }]);
    if (this.nodeType == "CallActivity") {
      items = [{
        title: "节点名称",
        labelWidth: 100,
        name: "name",
        value: this.title
      }, {
        title: "子流程",
        labelWidth: 100,
        name: "callActivityDefName",
        field: ["callActivityDefKey", "currentVersionId"],
        listWidth: 400
      }, {
        xtype: "Button",
        width: 85,
        height: 25,
        title: "查看子流程",
        style: {
          "margin-left": "291px",
          "position": "absolute",
          "top": "120px"
        },
        selected: true,
        handler: function () {
          var instanceId = g.data.subProcessInstanceId ? g.data.subProcessInstanceId : "";
          var id = EUI.getCmp("normal").getCmpByName("callActivityDefName").getSubmitValue().currentVersionId;
          var url = _ctxPath + "/design/showLook?id=" + id + "&instanceId=" + instanceId;
          var tab = {
            title: g.lang.flowDiagramText,
            url: url,
            id: instanceId
          };
          window.open(tab.url);
        }
      }];
    }
    if (this.nodeType != 'CallActivity') {
      items = items.concat([{
        title: "默认意见",
        labelWidth: 100,
        name: "defaultOpinion",
        maxlength: 80
      }]);
    }
    if (this.nodeType == "CounterSign") {
      items = items.concat([{
        xtype: "NumberField",
        title: "会签决策",
        labelWidth: 100,
        unit: "%",
        minValue: 1,
        maxValue: 100.1,
        minValueText: "最低通过比例为1%",
        maxValueText: "最高通过比例为100%",
        displayText: "请输入会签通过的百分比1%—100%",
        allowNegative: false,
        allowBlank: false,
        name: "counterDecision"
      }, {
        xtype: "RadioBoxGroup",
        name: "isSequential",
        title: "执行策略",
        labelWidth: 100,
        items: [{
          title: "并行",
          name: "false",
          checked: true
        }, {
          title: "串行",
          name: "true"
        }]
      }, {
        xtype: "CheckBox",
        title: "允许即时生效",
        name: "immediatelyEnd"
      }, {
        xtype: "CheckBox",
        title: "折叠弃权日志",
        name: "foldingLog",
      }, {
        xtype: "CheckBox",
        title: "允许流程发起人终止",
        name: "allowTerminate"
      }, {
        xtype: "CheckBox",
        title: "允许加签",
        name: "allowAddSign"
      }, {
        xtype: "CheckBox",
        title: "允许减签",
        name: "allowSubtractSign"
      }]);
    } else if (this.nodeType != "CounterSign" && this.nodeType != "ParallelTask" && this.nodeType != "SerialTask" && this.type != "ServiceTask" && this.type != "ReceiveTask" && this.nodeType != "CallActivity") {
      items = items.concat([{
        xtype: "CheckBox",
        title: "允许流程发起人终止",
        name: "allowTerminate"
      }, {
        xtype: "CheckBox",
        title: "允许撤回",
        name: "allowPreUndo"
      }, {
        xtype: "CheckBox",
        title: "允许驳回",
        name: "allowReject"
      }]);
    }
    if (this.nodeType == "Normal" || this.nodeType == "Approve" || this.nodeType == "CounterSign") {
      items = items.concat([{
        xtype: "CheckBox",
        title: "允许任意退回",
        name: "allowReturn"
      },{
        xtype: "CheckBox",
        title: "允许转办",
        name: "allowTransfer"
      }]);
      if (this.nodeType == "Approve" || this.nodeType == "CounterSign") {
        items = items.concat([{
          xtype: "CheckBox",
          title: "允许委托",
          name: "allowEntrust"
        }]);
      }
      if (this.nodeType == "Approve") {
        items = items.concat([{
          xtype: "CheckBox",
          title: "需要选择不同意原因",
          name: "chooseDisagreeReason"
        }]);
      }
    }

    if (this.nodeType == "ParallelTask") {
      items = items.concat([{
        xtype: "CheckBox",
        title: "抄送（呈报）",
        name: "carbonCopyOrReport",
        readonly: true
      }]);
    }

    if (this.nodeType == "Normal" || this.nodeType == "SingleSign" || this.nodeType == "CounterSign" || this.nodeType == "Approve"
      || this.nodeType == "ParallelTask" || this.nodeType == "SerialTask") {
      items = items.concat([{
        xtype: "CheckBox",
        title: "允许选择紧急状态",
        name: "allowChooseInstancy"
      }]);
    }
    if (this.type != 'CallActivity' && g.isSolidifyFlow == false) {
      items = items.concat([{
        xtype: "CheckBox",
        title: "单任务不选择执行人",
        name: "singleTaskNoChoose"
      }]);
    }

    //审批节点添加[处理后返回我审批],会签只有当决策是100%并且立即生效的时候才显示[处理后返回我审批]
    //如果勾选，在选择不同意的时候，可以选择不同意后的节点执行是按流程图路线走还是直接回到当前节点
    if (this.nodeType == 'Approve' || this.nodeType == 'CounterSign') {
      items = items.concat([{
        xtype: "CheckBox",
        title: "处理后返回我审批",
        name: "allowJumpBack",
        readonly: true
      }]);
    }


    return {
      title: "常规",
      xtype: "FormPanel",
      id: "normal",
      padding: 10,
      defaultConfig: {
        width: 300,
        xtype: "TextField",
        labelWidth: 150,
        colon: false,
        readonly: true
      },
      style: {
        padding: "10px 30px"
      },
      items: items
    };
  },
  getServiceTaskNormalTab: function (nodeType) {
    var items = [{
      title: "节点名称",
      labelWidth: 100,
      allowBlank: false,
      name: "name",
      maxlength: 80,
      value: this.title,
      readonly: true
    }, {
      title: "节点代码",
      labelWidth: 100,
      name: "nodeCode",
      readonly: true
    }, {
      xtype: "ComboBox",
      title: "服务名称",
      labelWidth: 100,
      allowBlank: false,
      name: "serviceTask",
      field: ["serviceTaskId"],
      canClear: true,
      readonly: true,
      store: {
        url: _ctxPath + "/design/listAllServiceUrl",
        params: {
          "busModelId": this.businessModelId
        }
      },
      reader: {
        name: "name",
        field: ["id"]
      }
    }];

    if (nodeType == "ReceiveTask") {
      items.push({
        xtype: "CheckBox",
        title: "允许流程发起人终止",
        name: "allowTerminate",
        readonly: true
      });
    }

    if (nodeType == "PoolTask") {
      items.push({
        title: "池代码",
        labelWidth: 100,
        allowBlank: false,
        name: "poolTaskCode",
        maxlength: 80,
        readonly: true
      }, {
        xtype: "ComboBox",
        title: "工作界面",
        labelWidth: 100,
        allowBlank: false,
        readonly: true,
        name: "workPageName",
        field: ["id", "mustCommit"],
        async: false,
        store: {
          url: _ctxPath + "/design/listAllWorkPage",
          params: {
            businessModelId: this.businessModelId
          }
        },

        reader: {
          name: "name",
          field: ["id", "mustCommit"]
        }
      }, {
        title: "默认意见",
        labelWidth: 100,
        name: "defaultOpinion",
        maxlength: 80
      }, {
        xtype: "CheckBox",
        title: "允许流程发起人终止",
        name: "allowTerminate",
        readonly: true
      }, {
        xtype: "CheckBox",
        title: "允许撤回",
        name: "allowPreUndo",
        readonly: true
      }, {
        xtype: "CheckBox",
        title: "允许选择紧急状态",
        name: "allowChooseInstancy"
      });
    }
    return {
      title: "常规",
      xtype: "FormPanel",
      id: "normal",
      padding: 10,
      defaultConfig: {
        width: 300,
        xtype: "TextField",
        readonly: true,
        labelWidth: 150,
        colon: false
      },
      style: {
        padding: "10px 30px"
      },
      items: items
    };
  },
  getExcutorTab: function () {
    var g = this;
    return {
      xtype: "FormPanel",
      title: "执行人",
      height: 400,
      width: 565,
      id: "excutor",
      itemspace: 0,
      items: [{
        xtype: "Container",
        height: 90,
        width: 555,
        padding: 0,
        border: false,
        items: [this.initUserTypeGroup()]
      }, {
        xtype: "Container",
        width: 555,
        height: 290,
        padding: 0,
        id: "gridBox",
        hidden: true,
        defaultConfig: {
          border: true,
          height: 300,
          width: 520
        },
        items: [this.getSelfDef(),
          this.getSelfDefOfOrgAndSel(),
          {
            xtype: "ToolBar",
            region: "north",
            height: 40,
            padding: 0,
            border: false,
            hidden: g.instanceId == null ? true : false,
            items: [{
              xtype: "Button",
              title: "查看候选人",
              iconCss: "ecmp-common-choose",
              id: "lookCandidateBtn",
              handler: function () {
                g.getCandidateInfo(g.data);
              }
            }]
          },
          this.getPositionGrid(),
          this.getPositionOfOrgGrid(),
          this.getPositionOfOrgAndSelGrid(),
          this.getPositionTypeGrid(),
          this.getPositionTypeAndOrgGrid(),
          this.getPositionTypeOfSelGrid(),
          this.getOrgGrid(),
          this.getOrgOfSelGrid(),
          this.getOrganizationGrid(),
          this.getOrganizationOfSelGrid()]
      }]
    };
  },
  getCandidateInfo: function (nodeData) {
    var g = this;
    var requestExecutorsVos = [];
    if (nodeData && !Object.isEmpty(nodeData)) {
      var nodeConfig = nodeData.nodeConfig;
      if (!nodeConfig || !nodeConfig.executor || nodeConfig.executor.length === 0) {
        return;
      }
      for (var i in nodeConfig.executor) {
        var newObj = {}, obj = nodeConfig.executor[i];
        newObj.userType = obj.userType;
        if (obj.userType === "SelfDefinition") {
          newObj.ids = obj.selfDefId || obj.selfDefOfOrgAndSelId || null;
        } else {
          newObj.ids = obj.ids || null;
        }
        requestExecutorsVos.push(newObj);
      }
    }
    var mask = EUI.LoadMask({
      msg: "正在获取数据，请稍候..."
    });
    EUI.Store({
      url: _ctxPath + "/flowTask/getExecutorsByVoAndInstanceIdVo",
      postType: 'json',
      isUrlParam: false,
      params: {
        requestExecutorsVos: JSON.stringify(requestExecutorsVos),
        instanceId: g.instanceId
      },
      success: function (result) {
        mask.remove();
        if (result.success) {
          g.showCandidateWin(result.data);
        } else {
          EUI.ProcessStatus(result);
        }
      },
      failure: function (response) {
        mask.remove();
        EUI.ProcessStatus(response);
      }
    });
  },
  showCandidateWin: function (executorList) {
    var g = this;
    g.win = EUI.Window({
      title: "候选人名单",
      padding: 15,
      width: 580,
      height: 400,
      buttons: [{
        title: "关闭",
        selected: true,
        handler: function () {
          g.win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "center",
        border: false,
        padding: 0,
        itemspace: 0,
        items: [this.initCandidateWind(executorList)]
      }]
    });
  },
  initCandidateWind: function (executorList) {
    return {
      xtype: "GridPanel",
      border: true,
      width: 560,
      id: "selUserGridGrid",
      region: "east",
      gridCfg: {
        datatype: "local",
        hasPager: false,
        rowNum: 150,
        loadonce: true,
        multiselect: false,
        sortname: 'code',
        colModel: this.executorGridColModel(),
        data: executorList
      }
    }
  },
  executorGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: "姓名",
      name: "name",
      index: "name",
      width: 150
    }, {
      label: "账号",
      name: "code",
      index: "code",
      width: 150
    }, {
      label: "组织机构",
      name: "organizationName",
      index: "organizationName",
      width: 250
    }];
  },
  initUserTypeGroup: function () {
    var g = this;
    return {
      xtype: "RadioBoxGroup",
      title: "执行人类型",
      labelWidth: 100,
      name: "userType",
      id: "userType",
      readonly: true,
      defaultConfig: {
        labelWidth: 100
      },
      items: [{
        title: "流程发起人",
        name: "StartUser",
        checked: true
      }, {
        title: "指定岗位",
        name: "Position"
      }, {
        title: "指定岗位类别",
        name: "PositionType"
      }, {
        title: "自定义执行人",
        name: "SelfDefinition"
      }, {
        title: "任意执行人",
        name: "AnyOne"
      }, {
        title: "岗位+组织维度",
        name: "PositionAndOrg"
      }, {
        title: "自定义执行人（参数自选）",
        name: "PositionAndOrgAndSelfDefinition",
        labelWidth: 210
      }, {
        title: "岗位类别+跨组织机构",
        name: "PositionTypeAndOrg",
        labelWidth: 140
      }]
    };
  },
  showChooseUserGrid: function (userType, data) {
    if (userType == "StartUser") {
      var grid = EUI.getCmp("gridBox");
      grid && grid.hide();
    } else if (userType == "Position") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("positionGrid").show();
      EUI.getCmp("lookCandidateBtn").show();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("orgGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      if (data && data.rowdata) {
        EUI.getCmp("positionGrid").setDataInGrid(data.rowdata);
      }
    } else if (userType == "PositionType") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("positionTypeGrid").show();
      EUI.getCmp("lookCandidateBtn").show();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      EUI.getCmp("orgGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      if (data && data.rowdata) {
        EUI.getCmp("positionTypeGrid").setDataInGrid(data.rowdata);
      }
    } else if (userType == "SelfDefinition") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("selfDef").show();
      EUI.getCmp("lookCandidateBtn").show();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      EUI.getCmp("orgGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      EUI.getCmp("selfDef").loadData(data);
    } else if (userType == "AnyOne") {
      EUI.getCmp("gridBox").hide();
    } else if (userType == "PositionAndOrg") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("positionOfOrgGrid").show();
      EUI.getCmp("organizationGrid").show();
      EUI.getCmp("lookCandidateBtn").show();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("orgGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      if (data && data.length == 2) {
        EUI.getCmp("positionOfOrgGrid").setDataInGrid(data[0].rowdata);
        EUI.getCmp("organizationGrid").setDataInGrid(data[1].rowdata);
      }
    } else if (userType == "PositionAndOrgAndSelfDefinition") {
      EUI.getCmp("selfDefOfOrgAndSel").show();
      EUI.getCmp("gridBox").show();
      EUI.getCmp("lookCandidateBtn").show();
      EUI.getCmp("positionOfOrgAndSelGrid").show();
      EUI.getCmp("organizationOfSelGrid").show();
      EUI.getCmp("orgOfSelGrid").show();
      EUI.getCmp("positionTypeOfSelGrid").show();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("orgGrid").hide();
      if (data && data.length > 1) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].userType == "SelfDefinition") {
            EUI.getCmp("selfDefOfOrgAndSel").loadData(data[i]);
          } else if (data[i].userType == "Position") {
            EUI.getCmp("positionOfOrgAndSelGrid").setDataInGrid(data[i].rowdata);
          } else if (data[i].userType == "PositionType") {
            EUI.getCmp("positionTypeOfSelGrid").setDataInGrid(data[i].rowdata);
          } else if (data[i].userType == "Org") {
            EUI.getCmp("orgOfSelGrid").setDataInGrid(data[i].rowdata);
          } else if (data[i].userType == "OrganizationDimension") {
            EUI.getCmp("organizationOfSelGrid").setDataInGrid(data[i].rowdata);
          }
        }
      }
    } else if (userType == "PositionTypeAndOrg") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("positionTypeAndOrgGrid").show();
      EUI.getCmp("orgGrid").show();
      EUI.getCmp("lookCandidateBtn").show();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      if (data && data.length == 2) {
        EUI.getCmp("positionTypeAndOrgGrid").setDataInGrid(data[0].rowdata);
        EUI.getCmp("orgGrid").setDataInGrid(data[1].rowdata);
      }
    }
  },
  getEventTab: function () {
    return {
      xtype: "FormPanel",
      title: "事件",
      id: "event",
      padding: 20,
      items: [{
        xtype: "FieldGroup",
        width: 530,
        defaultConfig: {
          readonly: true,
          xtype: "TextField"
        },
        items: [{
          name: "beforeExcuteService",
          title: "任务到达时",
          colon: false,
          labelWidth: 100,
          width: 220
        }, {
          xtype: "RadioBoxGroup",
          name: "beforeAsync",
          // title: "执行策略",
          labelWidth: 100,
          items: [{
            title: "同步",
            labelWidth: 30,
            name: false
          }, {
            title: "异步",
            name: true,
            labelWidth: 30,
          }]
        }]
      }, {
        xtype: "FieldGroup",
        width: 530,
        defaultConfig: {
          readonly: true,
          xtype: "TextField"
        },
        items: [{
          name: "afterExcuteService",
          field: ["afterExcuteServiceId"],
          title: "任务执行后",
          colon: false,
          labelWidth: 100,
          width: 220
        }, {
          xtype: "RadioBoxGroup",
          name: "afterAsync",
          // title: "执行策略",
          labelWidth: 100,
          items: [{
            title: "同步",
            name: false,
            labelWidth: 30
          }, {
            title: "异步",
            labelWidth: 30,
            name: true
          }]
        }]
      }]
    };
  },
  getNotifyTab: function (noExcutor) {
    var html = '<div class="notify-west">' +
      '<div class="west-navbar select-navbar">任务到达时</div>' +
      '<div class="west-navbar">任务执行后</div>' +
      '</div>' +
      '<div class="notify-center">' +
      '<div class="notify-user">';
    if (!noExcutor) {
      html += '<div class="notify-user-item select">通知执行人</div>';
      html += '<div class="notify-user-item">通知发起人</div>';
    } else {
      html += '<div class="notify-user-item select">通知发起人</div>';
    }
    html += '<div class="notify-user-item">通知岗位</div>' +
      '<div class="notify-user-item">通知人自定义</div>' +
      '</div>' +
      '<div id="notify-before"></div>' +
      '</div>' +
      '<div class="notify-center" style="display: none;">' +
      '<div class="notify-user">' +

      '<div class="notify-user-item select">通知发起人</div>' +
      '<div class="notify-user-item">通知岗位</div>' +
      '<div class="notify-user-item">通知人自定义</div>' +
      '</div>' +
      '<div id="notify-after"></div>' +
      '</div>';
    return {
      title: "通知",
      padding: 10,
      style: {
        "position": "relative"
      },
      defaultConfig: {
        width: 300,
        xtype: "TextField",
        colon: false
      },
      html: html
    };
  },
  initNotify: function (noExcutor) {
    var items = null;
    if (noExcutor) {
      items = [{
        items: this.getNotifyItem("notifyBefore")
      }, {
        hidden: true,
        items: this.getNotifyChoosePositionItem("notifyBefore")
      }, {
        hidden: true,
        items: this.getNotifyChooseSelfDefinitionItem("notifyBefore")
      }];
    } else {
      items = [{
        items: this.getNotifyItem("notifyBefore")
      }, {
        hidden: true,
        items: this.getNotifyItem("notifyBefore")
      }, {
        hidden: true,
        items: this.getNotifyChoosePositionItem("notifyBefore")
      }, {
        hidden: true,
        items: this.getNotifyChooseSelfDefinitionItem("notifyBefore")
      }];
    }
    this.nowNotifyTab = EUI.Container({
      width: 445,
      height: 340,
      padding: 12,
      renderTo: "notify-before",
      itemspace: 0,
      defaultConfig: {
        iframe: false,
        xtype: "FormPanel",
        width: 425,
        height: 305,
        padding: 0,
        itemspace: 10
      },
      items: items
    });
    var nextTab = EUI.Container({
      width: 445,
      height: 340,
      padding: 12,
      itemspace: 0,
      renderTo: "notify-after",
      defaultConfig: {
        iframe: false,
        xtype: "FormPanel",
        width: 425,
        height: 310,
        padding: 0,
        itemspace: 10
      },
      items: [{
        items: this.getNotifyItem("notifyAfter")
      }, {
        hidden: true,
        items: this.getNotifyChoosePositionItem("notifyAfter")
      }, {
        hidden: true,
        items: this.getNotifyChooseSelfDefinitionItem("notifyAfter")
      }]
    });
  },
  getNotifyChooseSelfDefinitionItem: function (notifyType) {
    var g = this;
    if (notifyType == "notifyBefore") {
      return [{
        xtype: "ComboBox",
        id: "notifyBeforeSelfDef",
        name: "name",
        title: "通知人员",
        readonly: true,
        labelWidth: 80,
        height: 18,
        width: 280,
        field: ["notifySelfDefId"],
        reader: {
          field: ["id"]
        },
        store: {
          url: _ctxPath + "/flowExecutorConfig/listCombo",
          params: {
            "businessModelId": this.businessModelId
          }
        }
      }, {
        xtype: "CheckBoxGroup",
        title: "通知方式",
        labelWidth: 80,
        itemspace: 5,
        name: "type",
        readonly: true,
        defaultConfig: {
          labelWidth: 28
        },
        items: [{
          title: "邮件",
          name: "EMAIL"
        }, {
          title: "钉钉",
          name: "DINGDING"
        }, {
          title: "站内信",
          name: "MESSAGE",
          labelWidth: 42
        }, {
          title: "虚拟待办",
          name: "VIRTUALTODO",
          labelWidth: 56
        }]
      }, {
        xtype: "TextArea",
        width: 320,
        height: 180,
        readonly: true,
        labelWidth: 80,
        title: "通知备注",
        name: "content"
      }];
    }
    if (notifyType == "notifyAfter") {
      if ((this.nodeType == "Approve" || this.nodeType == "CounterSign")) {
        return [{
          xtype: "ComboBox",
          id: "notifyAfterSelfDef",
          name: "name",
          title: "通知人员",
          readonly: true,
          labelWidth: 80,
          height: 18,
          width: 280,
          field: ["notifySelfDefId"],
          reader: {
            field: ["id"]
          },
          store: {
            url: _ctxPath + "/flowExecutorConfig/listCombo",
            params: {
              "businessModelId": this.businessModelId
            }
          }
        }, {
          xtype: "CheckBoxGroup",
          title: "通知方式",
          labelWidth: 80,
          itemspace: 5,
          readonly: true,
          name: "type",
          defaultConfig: {
            labelWidth: 28
          },
          items: [{
            title: "邮件",
            name: "EMAIL"
          }, {
            title: "钉钉",
            name: "DINGDING"
          }, {
            title: "站内信",
            name: "MESSAGE",
            labelWidth: 42
          }, {
            title: "虚拟待办",
            name: "VIRTUALTODO",
            labelWidth: 56
          }]
        }, {
          xtype: "RadioBoxGroup",
          title: "通知条件",
          labelWidth: 80,
          itemspace: 5,
          readonly: true,
          name: "condition",
          defaultConfig: {
            labelWidth: 45
          },
          items: [{
            title: "全部",
            name: "ALL"
          }, {
            title: "同意",
            name: "AGREE"
          }, {
            title: "不同意",
            name: "DISAGREE"
          }]
        }, {
          xtype: "TextArea",
          width: 320,
          height: 150,
          labelWidth: 80,
          readonly: true,
          title: "通知备注",
          name: "content"
        }];
      } else {
        return [{
          xtype: "ComboBox",
          id: "notifyAfterSelfDef",
          name: "name",
          title: "通知人员",
          readonly: true,
          labelWidth: 80,
          height: 18,
          width: 280,
          field: ["notifySelfDefId"],
          reader: {
            field: ["id"]
          },
          store: {
            url: _ctxPath + "/flowExecutorConfig/listCombo",
            params: {
              "businessModelId": this.businessModelId
            }
          }
        }, {
          xtype: "CheckBoxGroup",
          title: "通知方式",
          readonly: true,
          labelWidth: 80,
          itemspace: 5,
          name: "type",
          defaultConfig: {
            labelWidth: 28
          },
          items: [{
            title: "邮件",
            name: "EMAIL"
          }, {
            title: "钉钉",
            name: "DINGDING"
          }, {
            title: "站内信",
            name: "MESSAGE",
            labelWidth: 42
          }, {
            title: "虚拟待办",
            name: "VIRTUALTODO",
            labelWidth: 56
          }]
        }, {
          xtype: "TextArea",
          width: 320,
          height: 180,
          labelWidth: 80,
          readonly: true,
          title: "通知备注",
          name: "content"
        }];
      }
    }
  },
  getNotifyChoosePositionItem: function (notifyType) {
    var g = this;
    if (notifyType == "notifyBefore") {
      if (!this.notifyBeforePositionData) {
        var choosePositionNum = 0
      } else {
        var choosePositionNum = this.notifyBeforePositionData.length
      }
    }
    if (notifyType == "notifyAfter") {
      if (!this.notifyAfterPositionData) {
        var choosePositionNum = 0
      } else {
        var choosePositionNum = this.notifyAfterPositionData.length
      }
    }

    if ((this.nodeType == "Approve" || this.nodeType == "CounterSign") && notifyType == "notifyAfter") {
      return [{
        xtype: "CheckBoxGroup",
        title: "通知方式",
        labelWidth: 80,
        itemspace: 5,
        name: "type",
        readonly: true,
        defaultConfig: {
          labelWidth: 28
        },
        items: [{
          title: "邮件",
          name: "EMAIL"
        }, {
          title: "钉钉",
          name: "DINGDING"
        }, {
          title: "站内信",
          name: "MESSAGE",
          labelWidth: 42
        }, {
          title: "虚拟待办",
          name: "VIRTUALTODO",
          labelWidth: 56
        }]
      }, {
        xtype: "RadioBoxGroup",
        title: "通知条件",
        labelWidth: 80,
        itemspace: 5,
        readonly: true,
        name: "condition",
        defaultConfig: {
          labelWidth: 45
        },
        items: [{
          title: "全部",
          name: "ALL"
        }, {
          title: "同意",
          name: "AGREE"
        }, {
          title: "不同意",
          name: "DISAGREE"
        }]
      }, {
        xtype: "Button",
        id: notifyType + "ChoosePositionBtn",
        width: 85,
        height: 25,
        title: "已选岗位(" + '<a class=' + notifyType + 'notifyChoosePositionNum>' + choosePositionNum + '</a>)',
        style: {
          "margin-left": "350px",
          "position": "absolute",
          "top": "65px"
        },
        handler: function () {
          var nowChooseBtnId = $(this).attr("id");
          var notifyChoosePositionGridData = null;
          if (nowChooseBtnId.indexOf("notifyBefore") == 0) {
            notifyChoosePositionGridData = g.notifyBeforePositionData
          }
          if (nowChooseBtnId.indexOf("notifyAfter") == 0) {
            notifyChoosePositionGridData = g.notifyAfterPositionData
          }
          g.showNotifySelectPositionWindow(function (data) {
            if (nowChooseBtnId.indexOf("notifyBefore") == 0) {
              g.notifyBeforePositionData = data;
              $(".notifyBeforenotifyChoosePositionNum").html(data.length);
            }
            if (nowChooseBtnId.indexOf("notifyAfter") == 0) {
              g.notifyAfterPositionData = data;
              $(".notifyAfternotifyChoosePositionNum").html(data.length);
            }
            g.notifySelectPositionWin.close()
          }, notifyChoosePositionGridData);
        }
      }, {
        xtype: "TextArea",
        width: 320,
        height: 190,
        labelWidth: 80,
        readonly: true,
        title: "通知备注",
        name: "content"
      }];
    } else {
      return [{
        xtype: "CheckBoxGroup",
        title: "通知方式",
        labelWidth: 80,
        itemspace: 5,
        name: "type",
        readonly: true,
        defaultConfig: {
          labelWidth: 28
        },
        items: [{
          title: "邮件",
          name: "EMAIL"
        }, {
          title: "钉钉",
          name: "DINGDING"
        }, {
          title: "站内信",
          name: "MESSAGE",
          labelWidth: 42
        }, {
          title: "虚拟待办",
          name: "VIRTUALTODO",
          labelWidth: 56
        }]
      }, {
        xtype: "Button",
        id: notifyType + "ChoosePositionBtn",
        width: 85,
        height: 25,
        title: "已选岗位(" + '<a class=' + notifyType + 'notifyChoosePositionNum>' + choosePositionNum + '</a>)',
        style: {
          "margin-left": "350px",
          "position": "absolute",
          "top": "65px"
        },
        handler: function () {
          var nowChooseBtnId = $(this).attr("id");
          var notifyChoosePositionGridData = null;
          if (nowChooseBtnId.indexOf("notifyBefore") == 0) {
            notifyChoosePositionGridData = g.notifyBeforePositionData
          }
          if (nowChooseBtnId.indexOf("notifyAfter") == 0) {
            notifyChoosePositionGridData = g.notifyAfterPositionData
          }
          g.showNotifySelectPositionWindow(function (data) {
            if (nowChooseBtnId.indexOf("notifyBefore") == 0) {
              g.notifyBeforePositionData = data;
              $(".notifyBeforenotifyChoosePositionNum").html(data.length);
            }
            if (nowChooseBtnId.indexOf("notifyAfter") == 0) {
              g.notifyAfterPositionData = data;
              $(".notifyAfternotifyChoosePositionNum").html(data.length);
            }
            g.notifySelectPositionWin.close()
          }, notifyChoosePositionGridData);
        }
      }, {
        xtype: "TextArea",
        width: 320,
        height: 210,
        labelWidth: 80,
        readonly: true,
        title: "通知备注",
        name: "content"
      }];
    }
  },
  getNotifyItem: function (notifyType) {
    if ((this.nodeType == "Approve" || this.nodeType == "CounterSign") && notifyType == "notifyAfter") {
      return [{
        xtype: "CheckBoxGroup",
        title: "通知方式",
        labelWidth: 80,
        itemspace: 5,
        name: "type",
        readonly: true,
        defaultConfig: {
          labelWidth: 28
        },
        items: [{
          title: "邮件",
          name: "EMAIL"
        }, {
          title: "钉钉",
          name: "DINGDING"
        }, {
          title: "站内信",
          name: "MESSAGE",
          labelWidth: 42
        }, {
          title: "虚拟待办",
          name: "VIRTUALTODO",
          labelWidth: 56
        }]
      }, {
        xtype: "RadioBoxGroup",
        title: "通知条件",
        labelWidth: 80,
        itemspace: 5,
        name: "condition",
        readonly: true,
        defaultConfig: {
          labelWidth: 45
        },
        items: [{
          title: "全部",
          name: "ALL"
        }, {
          title: "同意",
          name: "AGREE"
        }, {
          title: "不同意",
          name: "DISAGREE"
        }]
      }, {
        xtype: "TextArea",
        width: 320,
        height: 200,
        readonly: true,
        labelWidth: 80,
        title: "通知备注",
        name: "content"
      }];
    } else {
      return [{
        xtype: "CheckBoxGroup",
        title: "通知方式",
        labelWidth: 80,
        itemspace: 5,
        name: "type",
        readonly: true,
        defaultConfig: {
          labelWidth: 28
        },
        items: [{
          title: "邮件",
          name: "EMAIL"
        }, {
          title: "钉钉",
          name: "DINGDING"
        }, {
          title: "站内信",
          name: "MESSAGE",
          labelWidth: 42
        }, {
          title: "虚拟待办",
          name: "VIRTUALTODO",
          labelWidth: 56
        }]
      }, {
        xtype: "TextArea",
        width: 320,
        height: 220,
        readonly: true,
        labelWidth: 80,
        title: "通知备注",
        name: "content"
      }];
    }
  },
  getOrganizationOfSelGrid: function () {
    return {
      xtype: "GridPanel",
      id: "organizationOfSelGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: this.organizationOfSelGridColModel()
      }
    };
  },
  getOrgOfSelGrid: function () {
    return {
      xtype: "GridPanel",
      id: "orgOfSelGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: this.orgOfSelGridColModel()
      }
    };
  },
  getOrgGrid: function () {
    return {
      xtype: "GridPanel",
      id: "orgGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: this.orgGridColModel()
      }
    };
  },
  orgOfSelGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: "组织机构代码",
      name: "code",
      index: "code",
      width: 100
    }, {
      label: "组织机构名称",
      name: "name",
      index: "name",
      width: 150

    }];
  },
  orgGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: this.lang.codeText,
      name: "code",
      index: "code",
      width: 100
    }, {
      label: this.lang.nameText,
      name: "name",
      index: "name",
      width: 150

    }];
  },
  getOrganizationGrid: function () {
    return {
      xtype: "GridPanel",
      id: "organizationGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: this.organizationGridColModel()
      }
    };
  },
  getPositionGrid: function () {
    return {
      xtype: "GridPanel",
      id: "positionGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        // url: _ctxPath + "",
        colModel: this.positionGridColModel()
      }
    };
  },
  getPositionOfOrgAndSelGrid: function () {
    return {
      xtype: "GridPanel",
      id: "positionOfOrgAndSelGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: this.positionOfOrgAndSelGridColModel()
      }
    };
  },
  getPositionOfOrgGrid: function () {
    return {
      xtype: "GridPanel",
      id: "positionOfOrgGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: this.positionOfOrgGridColModel()
      }
    };
  },
  organizationOfSelGridColModel: function () {
    return [{
      label: "组织维度代码",
      name: "id",
      index: "id",
      width: 100
    }, {
      label: "组织维度名称",
      name: "name",
      index: "name",
      width: 150

    }];
  },
  organizationGridColModel: function () {
    return [{
      label: this.lang.codeText,
      name: "id",
      index: "id",
      width: 100
    }, {
      label: this.lang.nameText,
      name: "name",
      index: "name",
      width: 150

    }];
  },
  positionOfOrgAndSelGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: "岗位代码",
      name: "code",
      index: "code",
      width: 100
    }, {
      label: "岗位名称",
      name: "name",
      index: "name",
      width: 150

    }, {
      label: "岗位组织机构",
      name: "organization.name",
      index: "organization.name",
      width: 150

    }];
  },
  positionOfOrgGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: this.lang.codeText,
      name: "code",
      index: "code",
      width: 100
    }, {
      label: this.lang.nameText,
      name: "name",
      index: "name",
      width: 150

    }, {
      label: this.lang.organizationText,
      name: "organization.name",
      index: "organization.name",
      width: 150

    }];
  },
  positionGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: this.lang.codeText,
      name: "code",
      index: "code",
      width: 100
    }, {
      label: this.lang.nameText,
      name: "name",
      index: "name",
      width: 200
    }];
  },
  positionTypeGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: this.lang.codeText,
      name: "code",
      index: "code",
      width: 100
    }, {
      label: this.lang.nameText,
      name: "name",
      index: "name",
      width: 200
    }];
  },
  getPositionTypeOfSelGrid: function () {
    return {
      xtype: "GridPanel",
      hidden: true,
      id: "positionTypeOfSelGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: this.positionTypeOfSelGridColModel()
      }
    };
  },
  getPositionTypeAndOrgGrid: function () {
    return {
      xtype: "GridPanel",
      hidden: true,
      id: "positionTypeAndOrgGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: this.positionTypeAndOrgGridColModel()
      }
    };
  },
  positionTypeOfSelGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: "岗位类别代码",
      name: "code",
      index: "code",
      width: 100
    }, {
      label: "岗位类别名称",
      name: "name",
      index: "name",
      width: 150
    }];
  },
  positionTypeAndOrgGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: this.lang.codeText,
      name: "code",
      index: "code",
      width: 100
    }, {
      label: this.lang.nameText,
      name: "name",
      index: "name",
      width: 150
    }];
  },
  getPositionTypeGrid: function () {
    return {
      xtype: "GridPanel",
      hidden: true,
      id: "positionTypeGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        // url: _ctxPath + "",
        colModel: this.positionTypeGridColModel()
      }
    };
  },
  getSelfDefGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: this.lang.codeText,
      name: "code",
      index: "code",
      width: 100
    }, {
      label: this.lang.nameText,
      name: "name",
      index: "name",
      width: 200
    }];
  },
  getSelfDef: function () {
    return {
      xtype: "TextField",
      id: "selfDef",
      name: "name",
      title: "自定义执行人类型",
      labelWidth: 140,
      height: 18,
      width: 340,
      hidden: true,
      readonly: true
    };
  },
  getSelfDefOfOrgAndSel: function () {
    return {
      xtype: "ComboBox",
      id: "selfDefOfOrgAndSel",
      name: "name",
      title: "自定义执行人类型",
      labelWidth: 140,
      height: 18,
      width: 340,
      hidden: true,
      readonly: true
    };
  },
  loadData: function () {
    var g = this;
    var normalForm = EUI.getCmp("normal");
    var executorForm = EUI.getCmp("excutor");
    var eventForm = EUI.getCmp("event");
    var notifyForm = EUI.getCmp("notify");
    var nodeConfig = this.data.nodeConfig;
    if (!nodeConfig) {
      return;
    }
    //加载常规配置
    normalForm.loadData(nodeConfig.normal);
    if (this.nodeType == 'CallActivity') {
      return;
    }
    //加载执行人配置
    if (nodeConfig.executor) {
      var executorLength = nodeConfig.executor.length;
      if (executorLength == 1) {
        var userType = nodeConfig.executor[0].userType;
        var userTypeCmp = EUI.getCmp("userType");
        userTypeCmp.setValue(userType);
        this.showChooseUserGrid(userType, nodeConfig.executor[0]);
      } else if (executorLength > 1) {
        var userTypeCmp = EUI.getCmp("userType");
        var userType = "";
        if (nodeConfig.executor[0].userType == "SelfDefinition") {
          userType = "PositionAndOrgAndSelfDefinition";
        } else if (nodeConfig.executor[0].userType == "PositionType") {
          userType = "PositionTypeAndOrg";
        } else {
          userType = "PositionAndOrg";
        }
        userTypeCmp.setValue(userType);
        this.showChooseUserGrid(userType, nodeConfig.executor);
      }
    }
    //加载事件配置
    eventForm.loadData(nodeConfig.event);

    //加载通知配置
    if (!this.data.nodeConfig.notify) {
      return;
    }
    var notifyBefore = EUI.getCmp("notify-before");
    var notifyAfter = EUI.getCmp("notify-after");
    this.loadNotifyData(notifyBefore, this.data.nodeConfig.notify.before);
    this.loadNotifyDataAfter(notifyAfter, this.data.nodeConfig.notify.after);

    this.loadNotifyChoosePositonData(this.data.nodeConfig);
    this.notifyBeforePositionData = this.data.nodeConfig.notify.before.notifyPosition.positionData;
    this.notifyAfterPositionData = this.data.nodeConfig.notify.after.notifyPosition.positionData;
  },
  loadNotifyData: function (tab, data) {
    var g = this;
    if (g.type == "ServiceTask" || g.type == "ReceiveTask" || g.type == "PoolTask") {
      EUI.getCmp(tab.items[0]).loadData(data.notifyStarter);
      EUI.getCmp(tab.items[1]).loadData(data.notifyPosition);
      if (data.notifySelfDefinition) {
        EUI.getCmp(tab.items[2]).loadData(data.notifySelfDefinition);
      }
    } else {
      EUI.getCmp(tab.items[0]).loadData(data.notifyExecutor);
      EUI.getCmp(tab.items[1]).loadData(data.notifyStarter);
      EUI.getCmp(tab.items[2]).loadData(data.notifyPosition);
      if (data.notifySelfDefinition) {
        EUI.getCmp(tab.items[3]).loadData(data.notifySelfDefinition);
      }
    }
  },
  loadNotifyDataAfter: function (tab, data) {
    if (!data.notifyStarter.condition) {
      data.notifyStarter.condition = "ALL";
    }
    if (!data.notifyPosition.condition) {
      data.notifyPosition.condition = "ALL";
    }
    if (data.notifySelfDefinition && !data.notifySelfDefinition.condition) {
      data.notifySelfDefinition.condition = "ALL";
    }
    EUI.getCmp(tab.items[0]).loadData(data.notifyStarter);
    EUI.getCmp(tab.items[1]).loadData(data.notifyPosition);
    if (data.notifySelfDefinition) {
      EUI.getCmp(tab.items[2]).loadData(data.notifySelfDefinition);
    }

  },
  loadNotifyChoosePositonData: function (data) {
    if (!data.notify.before.notifyPosition.positionData) {
      $(".notifyBeforenotifyChoosePositionNum").html(0);
      EUI.getCmp("notifyBeforeChoosePositionBtn").hide();
    } else {
      $(".notifyBeforenotifyChoosePositionNum").html(data.notify.before.notifyPosition.positionData.length);
    }
    if (!data.notify.after.notifyPosition.positionData) {
      $(".notifyAfternotifyChoosePositionNum").html(0);
      EUI.getCmp("notifyAfterChoosePositionBtn").hide();
    } else {
      $(".notifyAfternotifyChoosePositionNum").html(data.notify.after.notifyPosition.positionData.length);
    }
  },
  remove: function () {
    EUI.getCmp("notify-before") && EUI.getCmp("notify-before").remove();
    EUI.getCmp("notify-after") && EUI.getCmp("notify-after").remove();
    $(".west-navbar").die();
    $(".notify-user-item").die();
  },
  showNotifySelectPositionWindow: function (callback, notifyChoosePositionGridData) {
    var g = this;
    g.notifySelectPositionWin = EUI.Window({
      title: "已选岗位",
      padding: 0,
      width: 470,
      height: 500,
      items: [{
        xtype: "Container",
        layout: "auto",
        border: false,
        padding: 0,
        itemspace: 1,
        items: [{
          xtype: "Container",
          region: "west",
          layout: "border",
          border: false,
          padding: 0,
          width: 470,
          itemspace: 0,
          isOverFlow: false,
          items: [{
            xtype: "GridPanel",
            id: "notifyChoosePositionGrid",
            region: "center",
            gridCfg: {
              datatype: "local",
              loadonce: true,
              sortname: 'code',
              colModel: this.positionGridColModel(),
              ondblClickRow: function (rowid) {
                var cmp = EUI.getCmp("notifyChoosePositionGrid");
                var row = cmp.grid.jqGrid('getRowData', rowid);
                if (!row) {
                  g.message("请选择一条要操作的行项目!");
                  return false;
                }
                g.deleteRowData([row], cmp);
              }
            }
          }]
        }]
      }]
    });
    EUI.getCmp("notifyChoosePositionGrid").reset();
    if (!notifyChoosePositionGridData) {
      EUI.getCmp("notifyChoosePositionGrid").setDataInGrid([], false);
    } else {
      EUI.getCmp("notifyChoosePositionGrid").setDataInGrid(notifyChoosePositionGridData, false);
    }
    this.notifyAddPositionEvent();
  },
  notifyAddPositionEvent: function (notifyType) {
    var g = this;
    $("#notifyPosition-left").bind("click", function (e) {
      var cmp = EUI.getCmp("notifyChoosePositionGrid");
      var selectRow = EUI.getCmp("notifyAllPositionGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });
    $("#notifyPosition-right").bind("click", function (e) {
      var cmp = EUI.getCmp("notifyChoosePositionGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  }
})
;
