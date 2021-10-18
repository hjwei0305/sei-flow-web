/**
 * Created by fly on 2017/4/18.
 */
EUI.FlowNodeSettingView = EUI.extend(EUI.CustomUI, {
  title: null,
  data: null,
  flowDefinitionId: null,
  nowNotifyTab: null,
  nodeType: null,
  afterConfirm: null,
  businessModelId: null,
  flowTypeId: null,
  notifyBeforePositionData: null,
  notifyAfterPositionData: null,
  type: null,
  isSolidifyFlow: null,
  initComponent: function () {
    if (this.type == "CallActivity") {
      this.window = EUI.Window({
        width: 580,
        height: 435,
        padding: 15,
        buttons: this.getButtons(),
        afterRender: function () {
          this.dom.find(".ux-window-content").css("border-radius", "6px");
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
    } else if (this.type == "ServiceTask" || this.type == "ReceiveTask" || this.type == "PoolTask") {
      this.window = EUI.Window({
        width: 580,
        height: 435,
        padding: 15,
        buttons: this.getButtons(),
        afterRender: function () {
          this.dom.find(".ux-window-content").css("border-radius", "6px");
        },
        items: [{
          xtype: "TabPanel",
          isOverFlow: false,
          showTabMenu: false,
          defaultConfig: {
            iframe: false,
            closable: false
          },
          items: [this.getServiceTaskNormalTab(this.type), this.getEventTab(),
            this.getNotifyTab(true)]
        }]
      });
      this.initNotify(true);
    } else {
      this.window = EUI.Window({
        width: 580,
        height: 435,
        padding: 15,
        buttons: this.getButtons(),
        afterRender: function () {
          this.dom.find(".ux-window-content").css("border-radius", "6px");
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
      this.showAllowJumpBack();
    } else {
      if (this.type != "CallActivity" && this.type != "ServiceTask" &&
        this.type != "ReceiveTask" && this.type != "PoolTask") {
        this.showChooseUserGrid('Position');//岗位默认选中
      }
    }
    this.addEvent();
  },
  addEvent: function () {
    var g = this;
    $(".condetail-delete").live("click", function () {
      var data = EUI.getCmp("userType").getValue();
      var userType = data.userType;
      var id = $(this).attr("id");
      var grid;
      if (userType == "Position") {
        grid = EUI.getCmp("positionGrid");
        grid.deleteRow(id);
      } else if (userType == "PositionType") {
        grid = EUI.getCmp("positionTypeGrid");
        grid.deleteRow(id);
      } else if (userType == "SelfDefinition") {
        // grid = EUI.getCmp("selfDefGrid");
        // grid.deleteRow(id);
      } else if (userType == "PositionAndOrg") {
        var positionOfOrgGrid = EUI.getCmp("positionOfOrgGrid");
        positionOfOrgGrid.deleteRow(id);
        var organizationGrid = EUI.getCmp("organizationGrid");
        organizationGrid.deleteRow(id);
      } else if (userType == "PositionAndOrgAndSelfDefinition") {  //自定义执行人（参数自选）
        // var selfDefOfOrgAndSel = EUI.getCmp("selfDefOfOrgAndSel");
        // selfDefOfOrgAndSel.deleteRow(id);
        var positionOfOrgAndSelGrid = EUI.getCmp("positionOfOrgAndSelGrid");
        positionOfOrgAndSelGrid.deleteRow(id);
        var positionTypeGrid = EUI.getCmp("positionTypeOfSelGrid");
        positionTypeGrid.deleteRow(id);
        var organizationOfSelGrid = EUI.getCmp("organizationOfSelGrid");
        organizationOfSelGrid.deleteRow(id);
        var orgOfSelGrid = EUI.getCmp("orgOfSelGrid");
        orgOfSelGrid.deleteRow(id);
      } else if (userType == "PositionTypeAndOrg") {
        var positionTypeGrid = EUI.getCmp("positionTypeAndOrgGrid");
        positionTypeGrid.deleteRow(id);
        var orgGrid = EUI.getCmp("orgGrid");
        orgGrid.deleteRow(id);
      }
    });

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
  getButtons: function () {
    var g = this;
    return [{
      title: "取消",
      handler: function () {
        g.remove();
        g.window.close();
      }
    }, {
      title: "保存",
      selected: true,
      handler: function () {
        var normalForm = EUI.getCmp("normal");
        if (!normalForm.isValid()) {
          EUI.ProcessStatus({
            success: false,
            msg: "请将常规项配置完整"
          });
          return;
        }
        if ((g.type != 'ServiceTask' && g.type != 'ReceiveTask' && g.type != 'PoolTask' && g.type != 'CallActivity') && !g.checkExcutor()) {
          EUI.ProcessStatus({
            success: false,
            msg: "请将执行人项配置完整"
          });
          return;
        }
        var executorForm = EUI.getCmp("excutor");
        var eventForm = EUI.getCmp("event");
        var normalData = normalForm.getFormValue();
        var eventData = eventForm ? eventForm.getFormValue() : '';
        var executor = '';
        if (g.type != 'ServiceTask' && g.type != 'ReceiveTask' && g.type != 'PoolTask' && g.type != 'CallActivity') {
          executor = g.getExcutorData();
        }
        //如果是会签，考虑会签决策和立即执行的值，判断返回我审批的值是否生效
        if (g.nodeType == 'CounterSign') {
          if (normalData.counterDecision != 100 || normalData.immediatelyEnd != true) {
            normalData.allowJumpBack = false;
          }
        }
        g.afterConfirm && g.afterConfirm.call(this, {
          normal: normalData,
          executor: executor,
          event: eventData,
          notify: g.type == "CallActivity" ? '' : g.getNotifyData()
        });
        g.remove();
        g.window.close();
      }
    }];
  },
  getNormalTab: function () {
    var g = this;
    var items = [{
      title: "节点名称",
      labelWidth: 100,
      allowBlank: false,
      name: "name",
      maxlength: 80,
      value: this.title
    }, {
      title: "节点代码",//自定义节点代码
      labelWidth: 100,
      allowBlank: true,
      name: "nodeCode",
      maxlength: 80,
      value: ''
    },
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
          allowNegative: false,
          allowBlank: false,
          name: "executeDay",
          value: 0,
          hidden: false,
          unit: "天"
        }, {
          xtype: "NumberField",
          allowNegative: false,
          allowBlank: false,
          name: "executeHour",
          value: 0,
          hidden: false,
          unit: "时"
        }, {
          xtype: "NumberField",
          allowNegative: false,
          allowBlank: false,
          name: "executeMinute",
          value: 0,
          hidden: false,
          unit: "分"
        }]
      },
      {
        xtype: "ComboBox",
        title: "工作界面",
        labelWidth: 100,
        allowBlank: false,
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
      }];
    if (this.nodeType == "CallActivity") {
      items = [{
        title: "节点名称",
        labelWidth: 100,
        allowBlank: false,
        name: "name",
        maxlength: 80,
        value: this.title
      }, {
        xtype: "ComboGrid",
        title: "子流程",
        displayText: "请选择子流程",
        name: "callActivityDefName",
        allowBlank: false,
        field: ["callActivityDefKey", "currentVersionId"],
        listWidth: 400,
        labelWidth: 100,
        showSearch: true,
        onSearch: function (data) {
          this.grid.setPostParams({
            Quick_value: data,
            Q_EQ_subProcess__Boolean: true,
            Q_EQ_flowDefinationStatus__int: 1,
            Q_NE_id__String: g.flowDefinitionId
          }, true);
        },
        gridCfg: {
          url: _ctxPath + "/flowDefination/listFlowDefination",
          postData: {
            Q_EQ_subProcess__Boolean: true,
            Q_EQ_flowDefinationStatus__int: 1,
            Q_NE_id__String: g.flowDefinitionId,
          },
          loadonce: false,
          colModel: [{
            name: "id",
            index: "id",
            hidden: true
          }, {
            name: "lastDeloyVersionId",
            hidden: true
          }, {
            label: "定义KEY",
            name: "defKey",
            index: "defKey"
          }, {
            label: this.lang.nameText,
            name: "name",
            index: "name"
          }]
        },
        reader: {
          name: "name",
          field: ["defKey", "lastDeloyVersionId"]
        }
      }];
    }
    if (this.type != 'CallActivity') {
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
        name: "counterDecision",
        id: "counterDecision",
        listener: {
          "blur": function () {
            g.showAllowJumpBack();
          }
        }
      }, {
        xtype: "RadioBoxGroup",
        name: "isSequential",
        title: "执行策略",
        labelWidth: 100,
        items: [{
          title: "并行",
          name: false,
          checked: true
        }, {
          title: "串行",
          name: true
        }]
      }, {
        xtype: "CheckBox",
        title: "允许即时生效",
        name: "immediatelyEnd",
        id: "immediatelyEnd",
        onChecked: function (value) {
          g.showAllowJumpBack();
        }
      }, {
        xtype: "CheckBox",
        title: "允许流程发起人终止",
        name: "allowTerminate",
        checked: true
      }, {
        xtype: "CheckBox",
        title: "允许加签",
        name: "allowAddSign"
      }, {
        xtype: "CheckBox",
        title: "允许减签",
        name: "allowSubtractSign"
      }]);
    } else if (this.nodeType != "ParallelTask" && this.nodeType != "SerialTask" && this.type != "ServiceTask" && this.type != "ReceiveTask" && this.type != "PoolTask" && this.type != 'CallActivity') {
      items = items.concat([{
        xtype: "CheckBox",
        title: "允许流程发起人终止",
        name: "allowTerminate",
        checked: true
      }, {
        xtype: "CheckBox",
        title: "允许撤回",
        name: "allowPreUndo",
        checked: true
      }, {
        xtype: "CheckBox",
        title: "允许驳回",
        name: "allowReject",
        checked: true
      }]);
    }
    //会签添加转办功能
    if (this.nodeType == "Normal" || this.nodeType == "Approve" || this.nodeType == "CounterSign") {
      items = items.concat([{
        xtype: "CheckBox",
        title: "允许转办",
        name: "allowTransfer",
        checked: true
      }]);
      if (this.nodeType == "Approve" || this.nodeType == "CounterSign") {
        items = items.concat([{
          xtype: "CheckBox",
          title: "允许委托",
          name: "allowEntrust",
          checked: true
        }]);
      }
      if (this.nodeType == "Approve") {
        items = items.concat([{
          xtype: "CheckBox",
          title: "需要选择不同意原因",
          name: "chooseDisagreeReason",
          checked: false
        }]);
      }
    }

    if (this.nodeType == "ParallelTask") {
      items = items.concat([{
        xtype: "CheckBox",
        title: "抄送（呈报）",
        name: "carbonCopyOrReport"
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
        id: "allowJumpBack",
        name: "allowJumpBack",
        hidden: (this.nodeType == 'CounterSign') ? true : false
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
        colon: false
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
      value: this.title
    }, {
      title: "节点代码",//自定义节点代码
      labelWidth: 100,
      allowBlank: true,
      name: "nodeCode",
      maxlength: 80,
      value: ''
    }, {
      xtype: "ComboBox",
      title: "服务名称",
      labelWidth: 100,
      allowBlank: false,
      name: "serviceTask",
      field: ["serviceTaskId"],
      canClear: true,
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
        checked: false
      });
    }

    if (nodeType == "PoolTask") {
      items.push({
          title: "池代码",
          labelWidth: 100,
          allowBlank: false,
          name: "poolTaskCode",
          maxlength: 80
        }, {
          xtype: "ComboBox",
          title: "工作界面",
          labelWidth: 100,
          allowBlank: false,
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
          name: "allowTerminate"
        }, {
          xtype: "CheckBox",
          title: "允许撤回",
          name: "allowPreUndo"
        }
        // , {
        //     xtype: "CheckBox",
        //     title: "允许选择紧急状态",
        //     name: "allowChooseInstancy"
        // }
      );
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
          height: 200,
          width: 530
        },
        items: [
          this.getSelfDef(),  //自定义执行人
          this.getSelfDefOfOrgAndSel(),  //自定义执行人（参数自选）--执行人
          {
            xtype: "ToolBar",
            region: "north",
            height: 40,
            padding: 0,
            border: false,
            items: [{
              xtype: "Button",
              title: "选择岗位",
              iconCss: "ecmp-common-choose",
              id: "chooseBtn",
              handler: function () {
                var userType = EUI.getCmp("userType").getValue().userType;
                if (userType == "Position") {
                  g.showSelectPositionWindow();  //指定岗位
                } else if (userType == "PositionAndOrg") {
                  g.showSelectPositionOfOrgWindow();  //岗位+组织维度-----岗位
                } else if (userType == "PositionAndOrgAndSelfDefinition") {
                  g.showSelectPositionOfOrgAndSelWindow();  //自定义执行人（参数自选）--岗位
                }
              }
            }]
          },
          this.getPositionGrid(),  //岗位
          this.getPositionOfOrgGrid(), //岗位+组织维度
          this.getPositionOfOrgAndSelGrid(), //自定义执行人（参数自选）--岗位
          {
            xtype: "ToolBar",
            region: "north",
            height: 40,
            padding: 0,
            border: false,
            items: [{
              xtype: "Button",
              title: "选择岗位类别",
              iconCss: "ecmp-common-choose",
              id: "choosetTypeBtn",
              handler: function () {
                var userType = EUI.getCmp("userType").getValue().userType;
                if (userType == "PositionType") {
                  g.showSelectPositionTypeWindow();  //指定岗位类别
                } else if (userType == "PositionTypeAndOrg") {
                  g.showSelectPositionTypeAndOrgWindow(); //岗位类别+组织机构----岗位类别
                } else if (userType == "PositionAndOrgAndSelfDefinition") {
                  g.showPositionTypeOfSelWindow();    //自定义执行人（参数自选）--岗位类别
                }
              }
            }]
          },
          this.getPositionTypeGrid(),  //岗位类别
          this.getPositionTypeAndOrgGrid(),  //岗位类别+组织机构
          this.getPositionTypeOfSelGrid(),  //自定义执行人（参数自选）--岗位类别
          {
            xtype: "ToolBar",
            region: "north",
            height: 40,
            padding: 0,
            border: false,
            items: [{
              xtype: "Button",
              title: "选择组织机构",
              iconCss: "ecmp-common-choose",
              id: "chooseOrgBtn",
              handler: function () {
                var userType = EUI.getCmp("userType").getValue().userType;
                if (userType == "PositionTypeAndOrg") {
                  g.showSelectOrgWindow();  //岗位类别+组织机构（组织机构）
                } else if (userType == "PositionAndOrgAndSelfDefinition") {
                  g.showSelectOrgOfSelWindow();  //自定义执行人（参数自选）（组织机构）
                }
              }
            }]
          },
          this.getOrgGrid(),//岗位类别（组织机构）
          this.getOrgOfSelGrid(),//自定义执行人（参数自选）（组织机构）
          {
            xtype: "ToolBar",
            region: "north",
            height: 40,
            padding: 0,
            border: false,
            items: [{
              xtype: "Button",
              title: "选择组织维度",
              iconCss: "ecmp-common-choose",
              id: "chooseOrgWDBtn",
              handler: function () {
                var userType = EUI.getCmp("userType").getValue().userType;
                if (userType == "PositionAndOrg") {
                  g.showSelectOrganizationWindow();  //岗位+组织维度（组织维度）
                } else if (userType == "PositionAndOrgAndSelfDefinition") {
                  g.showSelectOrganizationOfSelWindow();  //自定义执行人（参数自选）（组织维度）
                }
              }
            }]
          },
          this.getOrganizationGrid(),  //岗位+组织维度
          this.getOrganizationOfSelGrid()//自定义执行人（参数自选）（组织维度）
        ]
      }]
    };
  },
  initUserTypeGroup: function () {
    var g = this;
    return {
      xtype: "RadioBoxGroup",
      title: "执行人类型",
      labelWidth: 100,
      name: "userType",
      id: "userType",
      defaultConfig: {
        labelWidth: 100
      },
      items: [{
        title: "流程发起人",
        name: "StartUser",
        onChecked: function (value) {
          g.showChooseUserGrid(this.name);
        }
      }, {
        title: "指定岗位",
        name: "Position",
        checked: true,
        onChecked: function (value) {
          g.showChooseUserGrid(this.name);
        }
      }, {
        title: "指定岗位类别",
        name: "PositionType",
        onChecked: function (value) {
          g.showChooseUserGrid(this.name);
        }
      }, {
        title: "自定义执行人",
        name: "SelfDefinition",
        onChecked: function (value) {
          g.showChooseUserGrid(this.name);
        }
      }, {
        title: "任意执行人",
        name: "AnyOne",
        onChecked: function (value) {
          g.showChooseUserGrid(this.name);
        }
      }, {
        title: "岗位+组织维度",
        name: "PositionAndOrg",
        onChecked: function (value) {
          g.showChooseUserGrid(this.name);
        }
      }, {
        title: "自定义执行人（参数自选）",
        name: "PositionAndOrgAndSelfDefinition",
        labelWidth: 210,
        onChecked: function (value) {
          g.showChooseUserGrid(this.name);
        }
      }, {
        title: "岗位类别+组织机构",
        name: "PositionTypeAndOrg",
        labelWidth: 140,
        onChecked: function (value) {
          g.showChooseUserGrid(this.name);
        }
      }]
    };
  },
  showChooseUserGrid: function (userType, data) {
    if (userType == "StartUser") {
      var grid = EUI.getCmp("gridBox");
      grid && grid.hide();
    } else if (userType == "Position") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("chooseBtn").show();
      EUI.getCmp("positionGrid").show();
      EUI.getCmp("choosetTypeBtn").hide();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("chooseOrgBtn").hide();
      EUI.getCmp("chooseOrgWDBtn").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      EUI.getCmp("orgGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      // EUI.getCmp("chooseBtn").setTitle("选择岗位");
      if (data && data.rowdata) {
        EUI.getCmp("positionGrid").setDataInGrid(data.rowdata);
      }
    } else if (userType == "PositionType") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("choosetTypeBtn").show();
      EUI.getCmp("positionTypeGrid").show();
      EUI.getCmp("chooseBtn").hide();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("chooseOrgBtn").hide();
      EUI.getCmp("chooseOrgWDBtn").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      EUI.getCmp("orgGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      // EUI.getCmp("chooseBtn").setTitle("选择岗位类别");
      if (data && data.rowdata) {
        EUI.getCmp("positionTypeGrid").setDataInGrid(data.rowdata);
      }
    } else if (userType == "SelfDefinition") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("selfDef").show();
      EUI.getCmp("chooseBtn").hide();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("choosetTypeBtn").hide();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("chooseOrgBtn").hide();
      EUI.getCmp("chooseOrgWDBtn").hide();
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
      EUI.getCmp("chooseBtn").show();
      EUI.getCmp("positionOfOrgGrid").show();
      EUI.getCmp("chooseOrgWDBtn").show();
      EUI.getCmp("organizationGrid").show();

      EUI.getCmp("chooseOrgBtn").hide();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("choosetTypeBtn").hide();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      EUI.getCmp("orgGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      // EUI.getCmp("chooseBtn").setTitle("选择岗位");
      // EUI.getCmp("chooseOrgBtn").setTitle("选择组织维度");
      if (data && data.length == 2) {
        EUI.getCmp("positionOfOrgGrid").setDataInGrid(data[0].rowdata);
        EUI.getCmp("organizationGrid").setDataInGrid(data[1].rowdata);
      }
    } else if (userType == "PositionAndOrgAndSelfDefinition") {
      EUI.getCmp("gridBox").show();
      EUI.getCmp("selfDefOfOrgAndSel").show();
      EUI.getCmp("chooseBtn").show();
      EUI.getCmp("positionOfOrgAndSelGrid").show();
      EUI.getCmp("choosetTypeBtn").show();
      EUI.getCmp("positionTypeOfSelGrid").show();
      EUI.getCmp("chooseOrgWDBtn").show();
      EUI.getCmp("organizationOfSelGrid").show();
      EUI.getCmp("chooseOrgBtn").show();
      EUI.getCmp("orgOfSelGrid").show();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("positionTypeAndOrgGrid").hide();
      EUI.getCmp("orgGrid").hide();
      // EUI.getCmp("chooseBtn").setTitle("选择岗位");
      // EUI.getCmp("chooseOrgBtn").setTitle("选择组织维度");
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
      EUI.getCmp("choosetTypeBtn").show();
      EUI.getCmp("positionTypeAndOrgGrid").show();
      EUI.getCmp("chooseOrgBtn").show();
      EUI.getCmp("orgGrid").show();
      EUI.getCmp("chooseOrgWDBtn").hide();
      EUI.getCmp("chooseBtn").hide();
      EUI.getCmp("positionTypeGrid").hide();
      EUI.getCmp("positionTypeOfSelGrid").hide();
      EUI.getCmp("positionGrid").hide();
      EUI.getCmp("positionOfOrgGrid").hide();
      EUI.getCmp("positionOfOrgAndSelGrid").hide();
      EUI.getCmp("selfDef").hide();
      EUI.getCmp("selfDefOfOrgAndSel").hide();
      EUI.getCmp("organizationGrid").hide();
      EUI.getCmp("organizationOfSelGrid").hide();
      EUI.getCmp("orgOfSelGrid").hide();
      // EUI.getCmp("chooseBtn").setTitle("选择岗位类别");
      // EUI.getCmp("chooseOrgBtn").setTitle("选择组织机构");
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
        // itemspace: 10,
        width: 530,
        items: [{
          xtype: "ComboBox",
          name: "beforeExcuteService",
          field: ["beforeExcuteServiceId"],
          title: "任务到达时",
          colon: false,
          labelWidth: 100,
          canClear: true,
          width: 220,
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
            checked: true
          }]
        }]
      }, {
        xtype: "FieldGroup",
        width: 530,
        items: [{
          xtype: "ComboBox",
          name: "afterExcuteService",
          field: ["afterExcuteServiceId"],
          title: "任务执行后",
          canClear: true,
          colon: false,
          labelWidth: 100,
          width: 220,
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
        }, {
          xtype: "RadioBoxGroup",
          name: "afterAsync",
          // title: "执行策略",
          labelWidth: 100,
          items: [{
            title: "同步",
            name: false,
            labelWidth: 30,
            checked: true
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
      height: 330,
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
      height: 330,
      padding: 12,
      itemspace: 0,
      renderTo: "notify-after",
      defaultConfig: {
        iframe: false,
        xtype: "FormPanel",
        width: 425,
        height: 305,
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
          title: "通知备注",
          name: "content"
        }];
      } else {
        return [{
          xtype: "ComboBox",
          id: "notifyAfterSelfDef",
          name: "name",
          title: "通知人员",
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
        title: "选择岗位(" + '<a class=' + notifyType + 'notifyChoosePositionNum>' + choosePositionNum + '</a>)',
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
        title: "选择岗位(" + '<a class=' + notifyType + 'notifyChoosePositionNum>' + choosePositionNum + '</a>)',
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
        labelWidth: 80,
        title: "通知备注",
        name: "content"
      }];
    }
  },
  getNotifyData: function () {
    var data = {};
    var notifyTab1 = EUI.getCmp("notify-before");
    var notifyTab2 = EUI.getCmp("notify-after");
    var beforePosition = EUI.getCmp(notifyTab1.items[notifyTab1.items.length - 2]).getFormValue();
    var afterPosition = EUI.getCmp(notifyTab2.items[notifyTab2.items.length - 2]).getFormValue();
    beforePosition.positionData = this.notifyBeforePositionData || [];
    beforePosition.positionIds = this.getNotifyChoosePositionIds(this.notifyBeforePositionData);
    afterPosition.positionData = this.notifyAfterPositionData || [];
    afterPosition.positionIds = this.getNotifyChoosePositionIds(this.notifyAfterPositionData);
    var beforeSelfDefinition = EUI.getCmp(notifyTab1.items[notifyTab1.items.length - 1]).getFormValue();
    var afterSelfDefinition = EUI.getCmp(notifyTab2.items[notifyTab2.items.length - 1]).getFormValue();
    var g = this;
    if (g.type == "ServiceTask" || g.type == "ReceiveTask" || g.type == "PoolTask") {
      data.before = {
        notifyStarter: EUI.getCmp(notifyTab1.items[0]).getFormValue(),
        notifyPosition: beforePosition,
        notifySelfDefinition: beforeSelfDefinition
      };
    } else {
      data.before = {
        notifyExecutor: EUI.getCmp(notifyTab1.items[0]).getFormValue(),
        notifyStarter: EUI.getCmp(notifyTab1.items[1]).getFormValue(),
        notifyPosition: beforePosition,
        notifySelfDefinition: beforeSelfDefinition
      };
    }

    data.after = {
      notifyExecutor: "",
      notifyStarter: EUI.getCmp(notifyTab2.items[0]).getFormValue(),
      notifyPosition: afterPosition,
      notifySelfDefinition: afterSelfDefinition
    };
    return data;
  },
  getNotifyChoosePositionIds: function (data) {
    var notifyChoosePositionIds = [];
    if (data) {
      for (var i = 0; i < data.length; i++) {
        notifyChoosePositionIds.push(data[i].id)
      }
    }
    return notifyChoosePositionIds;
  },
  getOrganizationOfSelGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.organizationOfSelGridColModel());
    return {
      xtype: "GridPanel",
      id: "organizationOfSelGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  getOrgOfSelGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.orgOfSelGridColModel());
    return {
      xtype: "GridPanel",
      id: "orgOfSelGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  getOrgGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.orgGridColModel());
    return {
      xtype: "GridPanel",
      id: "orgGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  getOrganizationGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.organizationGridColModel());
    return {
      xtype: "GridPanel",
      id: "organizationGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  organizationOfSelGridColModel: function () {
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
  orgOfSelGridColModel: function () {
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
  getPositionOfOrgAndSelGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.positionOfOrgAndSelGridColModel());
    return {
      xtype: "GridPanel",
      id: "positionOfOrgAndSelGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  getPositionOfOrgGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.positionOfOrgGridColModel());
    return {
      xtype: "GridPanel",
      id: "positionOfOrgGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  getPositionGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        // return "<div class='condetail-operate'>" +
        //     "<div class='condetail-delete' title='删除' id='" + cellvalue + "'></div></div>";
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.positionGridColModel());
    return {
      xtype: "GridPanel",
      id: "positionGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        // url: _ctxPath + "",
        colModel: colModel
      }
    };
  },
  positionOfOrgAndSelGridColModel: function () {
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
      name: "organizationName",
      index: "organizationName",
      width: 150

    }, {
      label: this.lang.organizationAllText,
      name: "organizationNamePath",
      index: "organizationNamePath",
      width: 150,
      hidden: true
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
      name: "organizationName",
      index: "organizationName",
      width: 150

    }, {
      label: this.lang.organizationAllText,
      name: "organizationNamePath",
      index: "organizationNamePath",
      width: 150,
      hidden: true
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
      width: 150

    }, {
      label: this.lang.organizationText,
      name: "organizationName",
      index: "organizationName",
      width: 150

    }, {
      label: this.lang.organizationAllText,
      name: "organizationNamePath",
      index: "organizationNamePath",
      width: 150,
      hidden: true
    }];
  },
  positionTypeOfSelGridColModel: function () {
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
      width: 150
    }];
  },
  getPositionTypeOfSelGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.positionTypeOfSelGridColModel());
    return {
      xtype: "GridPanel",
      hidden: true,
      id: "positionTypeOfSelGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  getPositionTypeAndOrgGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.positionTypeAndOrgGridColModel());
    return {
      xtype: "GridPanel",
      hidden: true,
      id: "positionTypeAndOrgGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  getPositionTypeGrid: function () {
    var colModel = [{
      label: this.lang.operateText,
      name: "id",
      index: "id",
      width: 60,
      align: "center",
      formatter: function (cellvalue, options, rowObject) {
        return "<div class='ecmp-common-delete condetail-delete' title='删除' id='" + cellvalue + "'></div>";
      }
    }];
    colModel = colModel.concat(this.positionTypeGridColModel());
    return {
      xtype: "GridPanel",
      hidden: true,
      id: "positionTypeGrid",
      gridCfg: {
        loadonce: true,
        datatype: "local",
        hasPager: false,
        colModel: colModel
      }
    };
  },
  getSelfDefGridColModel: function () {
    return [{
      name: "id",
      index: "id",
      hidden: true
    }, {
      label: "员工编号",
      name: "code",
      index: "code",
      width: 100
    }, {
      label: this.lang.nameText,
      name: "userName",
      index: "userName",
      width: 150
    }];
  },
  getSelfDef: function () {
    return {
      xtype: "ComboBox",
      id: "selfDef",
      name: "name",
      title: "自定义执行人类型",
      labelWidth: 140,
      height: 18,
      allowBlank: false,
      width: 340,
      hidden: true,
      field: ["selfDefId"],
      reader: {
        field: ["id"]
      },
      store: {
        url: _ctxPath + "/flowExecutorConfig/listCombo",
        params: {
          "businessModelId": this.businessModelId
        }
      }
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
      allowBlank: false,
      width: 340,
      hidden: true,
      field: ["selfDefOfOrgAndSelId"],
      reader: {
        field: ["id"]
      },
      store: {
        url: _ctxPath + "/flowExecutorConfig/listCombo",
        params: {
          "businessModelId": this.businessModelId
        }
      }
    };
  },
  showSelectOrganizationOfSelWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择组织维度",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("organizationOfSelGrid");
          var selectRow = EUI.getCmp("selOrganizationOfSelGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        itemspace: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          id: "selOrganizationOfSelGrid",
          region: "west",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            multiselect: true,
            sortname: 'code',
            colModel: this.organizationOfSelGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selOrganizationOfSelGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }
        }, g.getCenterIcon("organization"), {
          xtype: "GridPanel",
          width: 470,
          id: "allOrganizationOfSelGrid",
          region: "east",
          border: true,
          title: "所有组织维度",
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_organizationOfSelGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("allOrganizationOfSelGrid").setPostParams({
                Quick_value: v
              }, true);
            },
            afterClear: function () {
              EUI.getCmp("allOrganizationOfSelGrid").setPostParams({
                Quick_value: null
              }, true);
            }
          }],
          searchConfig: {
            searchCols: ["id", "name"]
          },
          gridCfg: {
            hasPager: true,
            multiselect: true,
            loadonce: false,
            sortname: 'code',
            url: _ctxPath + "/design/listOrganizationDimension",
            colModel: this.organizationOfSelGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("allOrganizationOfSelGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("selOrganizationOfSelGrid").addRowData([selectRow], true);
            }
          }
        }]
      }]
    });
    var data = EUI.getCmp("organizationOfSelGrid").getGridData();
    EUI.getCmp("selOrganizationOfSelGrid").reset();
    EUI.getCmp("selOrganizationOfSelGrid").setDataInGrid(data, false);
    this.addOrganizationOfSelEvent();
  },
  showSelectOrgOfSelWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择组织机构",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("orgOfSelGrid");
          var selectRow = EUI.getCmp("selOrgOfSelGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        itemspace: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          id: "selOrgOfSelGrid",
          region: "west",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            multiselect: true,
            sortname: 'code',
            colModel: this.orgOfSelGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selOrgOfSelGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }
        }, g.getCenterIcon("orgOfSel"), {
          xtype: "TreePanel",
          width: 470,
          region: "east",
          // id: "allOrgGrid",
          id: "allOrgOfSelGrid",
          title: "所有组织机构",
          border: true,
          tbar: ['->', {
            xtype: "SearchBox",
            width: 220,
            displayText: g.lang.searchDisplayText,
            canClear: true,
            onSearch: function (v) {
              EUI.getCmp("allOrgOfSelGrid").search(v);
              g.selectedNodeId = null;
              g.selectedNodeOrgCode = null;
              g.selectedNodeName = null;
            },
            afterClear: function () {
              EUI.getCmp("allOrgOfSelGrid").reset();
              g.selectedNodeId = null;
              g.selectedNodeOrgCode = null;
              g.selectedNodeName = null;
            }
          }],
          url: _ctxPath + "/flowDefination/listAllOrgs",
          searchField: ["code", "name"],
          showField: "name",
          onSelect: function (node) {
            if (!node.id) {
              g.message("请选择一条要操作的行项目!");
              return false;
            }
            EUI.getCmp("selOrgOfSelGrid").addRowData([{
              "id": node.id,
              "code": node.code,
              "name": node.name
            }], true);
          },
          afterItemRender: function (nodeData) {
            if (nodeData.frozen) {
              var nodeDom = $("#" + nodeData.id);
              if (nodeDom == []) {
                return;
              }
              var itemCmp = $(nodeDom[0].children[0]);
              itemCmp.addClass("ux-tree-freeze");
              itemCmp.find(".ux-tree-title").text(itemCmp.find(".ux-tree-title").text() + g.lang.FreezeText);
            }
          }
        }
        ]
      }]
    });
    var data = EUI.getCmp("orgOfSelGrid").getGridData();
    EUI.getCmp("selOrgOfSelGrid").reset();
    EUI.getCmp("selOrgOfSelGrid").setDataInGrid(data, false);
    this.addOrgOfSelEvent();
  },
  showSelectOrgWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择组织机构",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("orgGrid");
          var selectRow = EUI.getCmp("selOrgGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        itemspace: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          id: "selOrgGrid",
          region: "west",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            multiselect: true,
            sortname: 'code',
            colModel: this.orgGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selOrgGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }
        }, g.getCenterIcon("org"), {
          xtype: "TreePanel",
          width: 470,
          region: "east",
          id: "allOrgGrid",
          title: "所有组织机构",
          border: true,
          tbar: ['->', {
            xtype: "SearchBox",
            width: 220,
            displayText: g.lang.searchDisplayText,
            canClear: true,
            onSearch: function (v) {
              EUI.getCmp("allOrgGrid").search(v);
              g.selectedNodeId = null;
              g.selectedNodeOrgCode = null;
              g.selectedNodeName = null;
            },
            afterClear: function () {
              EUI.getCmp("allOrgGrid").reset();
              g.selectedNodeId = null;
              g.selectedNodeOrgCode = null;
              g.selectedNodeName = null;
            }
          }],
          url: _ctxPath + "/flowDefination/listAllOrgs",
          searchField: ["code", "name"],
          showField: "name",
          onSelect: function (node) {
            if (!node.id) {
              g.message("请选择一条要操作的行项目!");
              return false;
            }
            EUI.getCmp("selOrgGrid").addRowData([{
              "id": node.id,
              "code": node.code,
              "name": node.name
            }], true);
          },
          afterItemRender: function (nodeData) {
            if (nodeData.frozen) {
              var nodeDom = $("#" + nodeData.id);
              if (nodeDom == []) {
                return;
              }
              var itemCmp = $(nodeDom[0].children[0]);
              itemCmp.addClass("ux-tree-freeze");
              itemCmp.find(".ux-tree-title").text(itemCmp.find(".ux-tree-title").text() + g.lang.FreezeText);
            }
          }
        }
        ]
      }]
    });
    var data = EUI.getCmp("orgGrid").getGridData();
    EUI.getCmp("selOrgGrid").reset();
    EUI.getCmp("selOrgGrid").setDataInGrid(data, false);
    this.addOrgEvent();
  },
  showSelectOrganizationWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择组织维度",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("organizationGrid");
          var selectRow = EUI.getCmp("selOrganizationGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        itemspace: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          id: "selOrganizationGrid",
          region: "west",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            multiselect: true,
            sortname: 'code',
            colModel: this.organizationGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selOrganizationGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }
        }, g.getCenterIcon("organization"), {
          xtype: "GridPanel",
          width: 470,
          id: "allOrganizationGrid",
          region: "east",
          border: true,
          title: "所有组织维度",
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_organizationGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("allOrganizationGrid").setPostParams({
                Quick_value: v
              }, true);
            },
            afterClear: function () {
              EUI.getCmp("allOrganizationGrid").setPostParams({
                Quick_value: null
              }, true);
            }
          }],
          searchConfig: {
            searchCols: ["id", "name"]
          },
          gridCfg: {
            hasPager: true,
            multiselect: true,
            loadonce: false,
            sortname: 'code',
            url: _ctxPath + "/design/listOrganizationDimension",
            colModel: this.organizationGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("allOrganizationGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("selOrganizationGrid").addRowData([selectRow], true);
            }
          }
        }]
      }]
    });
    var data = EUI.getCmp("organizationGrid").getGridData();
    EUI.getCmp("selOrganizationGrid").reset();
    EUI.getCmp("selOrganizationGrid").setDataInGrid(data, false);
    this.addOrganizationEvent();
  },
  addOrganizationOfSelEvent: function () {
    var g = this;
    $("#organization-left").bind("click", function (e) {
      var cmp = EUI.getCmp("selOrganizationOfSelGrid");
      var selectRow = EUI.getCmp("allOrganizationOfSelGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });
    $("#organization-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selOrganizationOfSelGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  addOrgOfSelEvent: function () {
    var g = this;
    $("#orgOfSel-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selOrgOfSelGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  addOrgEvent: function () {
    var g = this;
    $("#org-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selOrgGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  addOrganizationEvent: function () {
    var g = this;
    $("#organization-left").bind("click", function (e) {
      var cmp = EUI.getCmp("selOrganizationGrid");
      var selectRow = EUI.getCmp("allOrganizationGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });
    $("#organization-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selOrganizationGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  showSelectPositionOfOrgAndSelWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择岗位",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("positionOfOrgAndSelGrid");
          var selectRow = EUI.getCmp("selPositionOfOrgAndSelGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        itemspace: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          id: "selPositionOfOrgAndSelGrid",
          region: "west",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            multiselect: true,
            sortname: 'code',
            colModel: this.positionOfOrgAndSelGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selPositionOfOrgAndSelGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }
        }, g.getCenterIcon("position"), {
          xtype: "GridPanel",
          width: 470,
          id: "allPositionOfOrgAndSelGrid",
          region: "east",
          border: true,
          title: "所有岗位",
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_positionOfOrgAndSelGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("allPositionOfOrgAndSelGrid").setPostParams({
                Quick_value: v
              }, true);
            },
            afterClear: function () {
              EUI.getCmp("allPositionOfOrgAndSelGrid").setPostParams({
                Quick_value: null
              }, true);
            }
          }],
          searchConfig: {
            searchCols: ["code", "name"]
          },
          gridCfg: {
            hasPager: true,
            multiselect: true,
            loadonce: false,
            sortname: 'code',
            url: _ctxPath + "/design/listPos",
            colModel: this.positionOfOrgAndSelGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("allPositionOfOrgAndSelGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("selPositionOfOrgAndSelGrid").addRowData([selectRow], true);
            }
          }
        }]
      }]
    });
    var data = EUI.getCmp("positionOfOrgAndSelGrid").getGridData();
    EUI.getCmp("selPositionOfOrgAndSelGrid").reset();
    EUI.getCmp("selPositionOfOrgAndSelGrid").setDataInGrid(data, false);
    this.addPositionOfOrgAndSelEvent();
  },
  showSelectPositionOfOrgWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择岗位",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("positionOfOrgGrid");
          var selectRow = EUI.getCmp("selPositionOfOrgGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        itemspace: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          id: "selPositionOfOrgGrid",
          region: "west",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            multiselect: true,
            sortname: 'code',
            colModel: this.positionOfOrgGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selPositionOfOrgGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }
        }, g.getCenterIcon("position"), {
          xtype: "GridPanel",
          width: 470,
          id: "allPositionOfOrgGrid",
          region: "east",
          border: true,
          title: "所有岗位",
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_positionOfOrgGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("allPositionOfOrgGrid").setPostParams({
                Quick_value: v
              }, true);
            },
            afterClear: function () {
              EUI.getCmp("allPositionOfOrgGrid").setPostParams({
                Quick_value: null
              }, true);
            }
          }],
          searchConfig: {
            searchCols: ["code", "name"]
          },
          gridCfg: {
            hasPager: true,
            multiselect: true,
            loadonce: false,
            sortname: 'code',
            url: _ctxPath + "/design/listPos",
            colModel: this.positionOfOrgGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("allPositionOfOrgGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("selPositionOfOrgGrid").addRowData([selectRow], true);
            }
          }
        }]
      }]
    });
    var data = EUI.getCmp("positionOfOrgGrid").getGridData();
    EUI.getCmp("selPositionOfOrgGrid").reset();
    EUI.getCmp("selPositionOfOrgGrid").setDataInGrid(data, false);
    this.addPositionOfOrgEvent();
  },
  showSelectPositionWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择岗位",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("positionGrid");
          var selectRow = EUI.getCmp("selPositionGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        itemspace: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          id: "selPositionGrid",
          region: "west",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            multiselect: true,
            sortname: 'code',
            colModel: this.positionGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selPositionGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }
        }, g.getCenterIcon("position"), {
          xtype: "GridPanel",
          width: 470,
          id: "allPositionGrid",
          region: "east",
          border: true,
          title: "所有岗位",
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_positionGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("allPositionGrid").setPostParams({
                Quick_value: v
              }, true);
            },
            afterClear: function () {
              EUI.getCmp("allPositionGrid").setPostParams({
                Quick_value: null
              }, true);
            }
          }],
          searchConfig: {
            searchCols: ["code", "name"]
          },
          gridCfg: {
            hasPager: true,
            multiselect: true,
            loadonce: false,
            sortname: 'code',
            url: _ctxPath + "/design/listPos",
            colModel: this.positionGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("allPositionGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("selPositionGrid").addRowData([selectRow], true);
            }
          }
        }]
      }]
    });
    var data = EUI.getCmp("positionGrid").getGridData();
    EUI.getCmp("selPositionGrid").reset();
    EUI.getCmp("selPositionGrid").setDataInGrid(data, false);
    this.addPositionEvent();
  },
  addPositionOfOrgAndSelEvent: function () {
    var g = this;
    $("#position-left").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionOfOrgAndSelGrid");
      var selectRow = EUI.getCmp("allPositionOfOrgAndSelGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });


    $("#allPositionOfOrgAndSelGrid [role=gridcell]").live("mouseenter", function () {
      var dom = $(this);
      g.initTextBox();
      var addTop = 1;
      var text = $(this).nextAll()[$(this).nextAll().length - 1].innerHTML;
      g.showTextBox(dom, "<span>" + text + "</span>", addTop);
    }).live("mouseleave", function () {
      var $tipbox = $("div.textbox");
      $tipbox.hide();
    });


    $("#position-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionOfOrgAndSelGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  addPositionOfOrgEvent: function () {
    var g = this;
    $("#position-left").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionOfOrgGrid");
      var selectRow = EUI.getCmp("allPositionOfOrgGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });

    $("#allPositionOfOrgGrid [role=gridcell]").live("mouseenter", function () {
      var dom = $(this);
      g.initTextBox();
      var addTop = 1;
      var text = $(this).nextAll()[$(this).nextAll().length - 1].innerHTML;
      g.showTextBox(dom, "<span>" + text + "</span>", addTop);
    }).live("mouseleave", function () {
      var $tipbox = $("div.textbox");
      $tipbox.hide();
    });

    $("#position-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionOfOrgGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  addPositionEvent: function () {
    var g = this;
    $("#position-left").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionGrid");
      var selectRow = EUI.getCmp("allPositionGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });

    $("#allPositionGrid [role=gridcell]").live("mouseenter", function () {
      var dom = $(this);
      g.initTextBox();
      var addTop = 1;
      var text = $(this).nextAll()[$(this).nextAll().length - 1].innerHTML;
      g.showTextBox(dom, "<span>" + text + "</span>", addTop);
    }).live("mouseleave", function () {
      var $tipbox = $("div.textbox");
      $tipbox.hide();
    });

    $("#position-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  deleteRowData: function (data, cmp) {
    var g = this;
    for (var i = 0; i < data.length; i++) {
      cmp.deleteRow(data[i].id);
    }
    cmp.setDataInGrid([].concat(cmp.getGridData()), false);
  },
  showPositionTypeOfSelWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择岗位类别",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("positionTypeOfSelGrid");
          var selectRow = EUI.getCmp("selPositionTypeOfSelGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          region: "west",
          id: "selPositionTypeOfSelGrid",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            hasPager: false,
            multiselect: true,
            sortname: 'code',
            colModel: this.positionTypeOfSelGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selPositionTypeOfSelGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }

        }, this.getCenterIcon("positionTypeOfSel"), {
          xtype: "GridPanel",
          border: true,
          region: "east",
          width: 470,
          title: "所有岗位类别",
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_positionTypeOfSelGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("allPositionTypeOfSelGrid").localSearch(v);
            },
            afterClear: function () {
              EUI.getCmp("allPositionTypeOfSelGrid").restore();
            }
          }],
          id: "allPositionTypeOfSelGrid",
          gridCfg: {
            multiselect: true,
            hasPager: false,
            sortname: 'code',
            loadonce: true,
            url: _ctxPath + "/design/listPositonType",
            colModel: this.positionTypeOfSelGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("allPositionTypeOfSelGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("selPositionTypeOfSelGrid").addRowData([selectRow], true);
            }
          }
        }]
      }]
    });
    var data = EUI.getCmp("positionTypeOfSelGrid").getGridData();
    EUI.getCmp("selPositionTypeOfSelGrid").reset();
    EUI.getCmp("selPositionTypeOfSelGrid").setDataInGrid(data, false);
    this.addPositionTypeOfSelEvent();
  },
  showSelectPositionTypeAndOrgWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择岗位类别",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("positionTypeAndOrgGrid");
          var selectRow = EUI.getCmp("selPositionTypeAndOrgGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          region: "west",
          id: "selPositionTypeAndOrgGrid",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            hasPager: false,
            multiselect: true,
            sortname: 'code',
            colModel: this.positionTypeAndOrgGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selPositionTypeAndOrgGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }

        }, this.getCenterIcon("positionTypeAndOrg"), {
          xtype: "GridPanel",
          border: true,
          region: "east",
          width: 470,
          title: "所有岗位类别",
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_positionTypeAndOrgGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("allPositionTypeAndOrgGrid").localSearch(v);
            },
            afterClear: function () {
              EUI.getCmp("allPositionTypeAndOrgGrid").restore();
            }
          }],
          id: "allPositionTypeAndOrgGrid",
          gridCfg: {
            multiselect: true,
            hasPager: false,
            sortname: 'code',
            loadonce: true,
            url: _ctxPath + "/design/listPositonType",
            colModel: this.positionTypeAndOrgGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("allPositionTypeAndOrgGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("selPositionTypeAndOrgGrid").addRowData([selectRow], true);
            }
          }
        }]
      }]
    });
    var data = EUI.getCmp("positionTypeAndOrgGrid").getGridData();
    EUI.getCmp("selPositionTypeAndOrgGrid").reset();
    EUI.getCmp("selPositionTypeAndOrgGrid").setDataInGrid(data, false);
    this.addPositionTypeAndOrgEvent();
  },
  showSelectPositionTypeWindow: function () {
    var g = this;
    var win = EUI.Window({
      title: "选择岗位类别",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          win.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var cmp = EUI.getCmp("positionTypeGrid");
          var selectRow = EUI.getCmp("selPositionTypeGrid").getGridData();
          cmp.reset();
          cmp.setDataInGrid(selectRow, false);
          win.close();
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        items: [{
          xtype: "GridPanel",
          border: true,
          title: "已选择",
          width: 470,
          region: "west",
          id: "selPositionTypeGrid",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            hasPager: false,
            multiselect: true,
            sortname: 'code',
            colModel: this.positionTypeGridColModel(),
            ondblClickRow: function (rowid) {
              var cmp = EUI.getCmp("selPositionTypeGrid");
              var row = cmp.grid.jqGrid('getRowData', rowid);
              if (!row) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              g.deleteRowData([row], cmp);
            }
          }

        }, this.getCenterIcon("positionType"), {
          xtype: "GridPanel",
          border: true,
          region: "east",
          width: 470,
          title: "所有岗位类别",
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_positionTypeGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("allPositionTypeGrid").localSearch(v);
            },
            afterClear: function () {
              EUI.getCmp("allPositionTypeGrid").restore();
            }
          }],
          id: "allPositionTypeGrid",
          gridCfg: {
            multiselect: true,
            hasPager: false,
            sortname: 'code',
            loadonce: true,
            url: _ctxPath + "/design/listPositonType",
            colModel: this.positionTypeGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("allPositionTypeGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("selPositionTypeGrid").addRowData([selectRow], true);
            }
          }
        }]
      }]
    });
    var data = EUI.getCmp("positionTypeGrid").getGridData();
    EUI.getCmp("selPositionTypeGrid").reset();
    EUI.getCmp("selPositionTypeGrid").setDataInGrid(data, false);
    this.addPositionTypeEvent();
  },
  getCenterIcon: function (id) {
    var g = this;
    if (id == "org") {
      return {
        xtype: "Container",
        region: "center",
        width: 40,
        border: false,
        isOverFlow: false,
        html: "<div class='ecmp-common-moveright arrow-right' id=" + id + "-right></div>"
      }
    } else {
      return {
        xtype: "Container",
        region: "center",
        width: 40,
        border: false,
        isOverFlow: false,
        html: "<div class='ecmp-common-moveright arrow-right' id=" + id + "-right></div>" +
          "<div class='ecmp-common-leftmove arrow-left' id=" + id + "-left></div>"
      }
    }
  },
  addPositionTypeOfSelEvent: function () {
    var g = this;
    $("#positionTypeOfSel-left").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionTypeOfSelGrid");
      var selectRow = EUI.getCmp("allPositionTypeOfSelGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });
    $("#positionTypeOfSel-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionTypeOfSelGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  addPositionTypeAndOrgEvent: function () {
    var g = this;
    $("#positionTypeAndOrg-left").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionTypeAndOrgGrid");
      var selectRow = EUI.getCmp("allPositionTypeAndOrgGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });
    $("#positionTypeAndOrg-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionTypeAndOrgGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  addPositionTypeEvent: function () {
    var g = this;
    $("#positionType-left").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionTypeGrid");
      var selectRow = EUI.getCmp("allPositionTypeGrid").getSelectRow();
      if (selectRow.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      cmp.addRowData(selectRow, true);
    });
    $("#positionType-right").bind("click", function (e) {
      var cmp = EUI.getCmp("selPositionTypeGrid");
      var row = cmp.getSelectRow();
      if (row.length == 0) {
        g.message("请选择一条要操作的行项目!");
        return false;
      }
      g.deleteRowData(row, cmp);
    });
  },
  checkExcutor: function () {
    var userType = EUI.getCmp("userType").getValue().userType;
    var data;
    var dataOrg;
    if (userType == "Position") {
      data = EUI.getCmp("positionGrid").getGridData();
    } else if (userType == "PositionType") {
      data = EUI.getCmp("positionTypeGrid").getGridData();
    } else if (userType == "SelfDefinition") {
      return EUI.getCmp("selfDef").sysValidater();
    } else if (userType == "PositionAndOrg") {
      data = EUI.getCmp("positionOfOrgGrid").getGridData();
      dataOrg = EUI.getCmp("organizationGrid").getGridData();
      if (!dataOrg || dataOrg.length == 0) {
        return false;
      }
    } else if (userType == "PositionAndOrgAndSelfDefinition") {
      data = EUI.getCmp("positionOfOrgAndSelGrid").getGridData();
      // dataOrg = EUI.getCmp("organizationOfSelGrid").getGridData();
      // if (!dataOrg || dataOrg.length == 0 || !EUI.getCmp("selfDefOfOrgAndSel").sysValidater()) {
      //     return false;
      // }
      return EUI.getCmp("selfDefOfOrgAndSel").sysValidater();
    } else if (userType == "PositionTypeAndOrg") {
      data = EUI.getCmp("positionTypeAndOrgGrid").getGridData();
      dataOrg = EUI.getCmp("orgGrid").getGridData();
      if (!dataOrg || dataOrg.length == 0) {
        return false;
      }
    } else {
      return true;
    }
    if (!data || data.length == 0) {
      return false;
    }
    return true;
  },
  getExcutorData: function () {
    var dataArray = [];
    var data = EUI.getCmp("userType").getValue();
    var userType = data.userType;
    if (userType == "Position") {
      rowdata = EUI.getCmp("positionGrid").getGridData();
      data.ids = this.getSelectIds(rowdata);
      data.rowdata = rowdata;
      dataArray.push(data);
    } else if (userType == "PositionType") {
      rowdata = EUI.getCmp("positionTypeGrid").getGridData();
      data.ids = this.getSelectIds(rowdata);
      data.rowdata = rowdata;
      dataArray.push(data);
    } else if (userType == "SelfDefinition") {
      var selfData = EUI.getCmp("selfDef").getSubmitValue();
      EUI.apply(data, selfData);
      dataArray.push(data);
    } else if (userType == "PositionAndOrg") {
      rowdata = EUI.getCmp("positionOfOrgGrid").getGridData();
      data.userType = "Position";
      data.ids = this.getSelectIds(rowdata);
      data.rowdata = rowdata;
      dataArray.push(data);

      var dataOrg = {};
      rowdata = EUI.getCmp("organizationGrid").getGridData();
      dataOrg.userType = "OrganizationDimension";
      dataOrg.ids = this.getSelectIds(rowdata);
      dataOrg.rowdata = rowdata;
      dataArray.push(dataOrg);

    } else if (userType == "PositionAndOrgAndSelfDefinition") {

      var selfData = EUI.getCmp("selfDefOfOrgAndSel").getSubmitValue();
      var datasel = {'userType': 'SelfDefinition'};
      EUI.apply(datasel, selfData);
      dataArray.push(datasel);

      rowdata = EUI.getCmp("positionOfOrgAndSelGrid").getGridData();
      data.userType = "Position";
      data.ids = this.getSelectIds(rowdata);
      data.rowdata = rowdata;
      dataArray.push(data);

      var dataType = {};
      rowdata = EUI.getCmp("positionTypeOfSelGrid").getGridData();
      dataType.userType = "PositionType";
      dataType.ids = this.getSelectIds(rowdata);
      dataType.rowdata = rowdata;
      dataArray.push(dataType);

      var dataOrg = {};
      rowdata = EUI.getCmp("orgOfSelGrid").getGridData();
      dataOrg.userType = "Org";
      dataOrg.ids = this.getSelectIds(rowdata);
      dataOrg.rowdata = rowdata;
      dataArray.push(dataOrg);

      var dataOrgZa = {};
      rowdata = EUI.getCmp("organizationOfSelGrid").getGridData();
      dataOrgZa.userType = "OrganizationDimension";
      dataOrgZa.ids = this.getSelectIds(rowdata);
      dataOrgZa.rowdata = rowdata;
      dataArray.push(dataOrgZa);

    } else if (userType == "PositionTypeAndOrg") {

      rowdata = EUI.getCmp("positionTypeAndOrgGrid").getGridData();
      data.userType = "PositionType";
      data.ids = this.getSelectIds(rowdata);
      data.rowdata = rowdata;
      dataArray.push(data);

      var dataOrg = {};
      rowdata = EUI.getCmp("orgGrid").getGridData();
      dataOrg.userType = "Org";
      dataOrg.ids = this.getSelectIds(rowdata);
      dataOrg.rowdata = rowdata;
      dataArray.push(dataOrg);

    } else {
      dataArray.push(data);
    }
    // return data;
    return dataArray;
  },
  getSelectIds: function (data) {
    var ids = "";
    for (var i = 0; i < data.length; i++) {
      if (i > 0) {
        ids += ",";
      }
      ids += data[i].id;
    }
    return ids;
  },
  loadData: function () {
    var g = this;
    var normalForm = EUI.getCmp("normal");
    var executorForm = EUI.getCmp("excutor");
    var eventForm = EUI.getCmp("event");
    var notifyForm = EUI.getCmp("notify");
    if (!this.data) {
      return;
    }
    //加载常规配置
    normalForm.loadData(this.data.normal);

    //加载执行人配置
    if (g.type != 'ServiceTask' && g.type != 'ReceiveTask' && g.type != 'PoolTask' && g.type != 'CallActivity') {
      var executorLength = this.data.executor.length;
      if (executorLength == 1) {
        var userType = this.data.executor[0].userType;
        var userTypeCmp = EUI.getCmp("userType");
        userTypeCmp.setValue(userType);
        this.showChooseUserGrid(userType, this.data.executor[0]);
      } else if (executorLength > 1) {
        var userTypeCmp = EUI.getCmp("userType");
        var userType = "";
        if (this.data.executor[0].userType == "SelfDefinition") {
          userType = "PositionAndOrgAndSelfDefinition";
        } else if (this.data.executor[0].userType == "PositionType") {
          userType = "PositionTypeAndOrg";
        } else {
          userType = "PositionAndOrg";
        }
        userTypeCmp.setValue(userType);
        this.showChooseUserGrid(userType, this.data.executor);
      }
    }
    if (g.type == 'CallActivity') {
      return;
    }
    //加载事件配置
    eventForm.loadData(this.data.event);

    //加载通知配置
    if (!this.data.notify) {
      return;
    }
    var notifyBefore = EUI.getCmp("notify-before");
    var notifyAfter = EUI.getCmp("notify-after");
    this.loadNotifyData(notifyBefore, this.data.notify.before);
    this.loadNotifyDataAfter(notifyAfter, this.data.notify.after);

    this.loadNotifyChoosePositonData(this.data);
    this.notifyBeforePositionData = this.data.notify.before.notifyPosition.positionData;
    this.notifyAfterPositionData = this.data.notify.after.notifyPosition.positionData;
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
    } else {
      $(".notifyBeforenotifyChoosePositionNum").html(data.notify.before.notifyPosition.positionData.length);
    }
    if (!data.notify.after.notifyPosition.positionData) {
      $(".notifyAfternotifyChoosePositionNum").html(0);
    } else {
      $(".notifyAfternotifyChoosePositionNum").html(data.notify.after.notifyPosition.positionData.length);
    }
  },
  initTitle: function (title) {
    return {
      xtype: "Container",
      region: "north",
      border: false,
      height: 35,
      width: 110,
      isOverFlow: false,
      html: "<div style='font-size:15px;overflow:hidden;'>" + title + "</div>"
    }
  },
  message: function (msg) {
    EUI.ProcessStatus({msg: msg, success: false});
  },
  remove: function () {
    EUI.getCmp("notify-before") && EUI.getCmp("notify-before").remove();
    EUI.getCmp("notify-after") && EUI.getCmp("notify-after").remove();
    $(".condetail-delete").die();
    $(".west-navbar").die();
    $(".notify-user-item").die();
  },
  showNotifySelectPositionWindow: function (callback, notifyChoosePositionGridData) {
    var g = this;
    g.notifySelectPositionWin = EUI.Window({
      title: "选择岗位",
      padding: 15,
      width: 1020,
      height: 350,
      buttons: [{
        title: "取消",
        handler: function () {
          g.notifySelectPositionWin.close();
        }
      }, {
        title: "确定",
        selected: true,
        handler: function () {
          var selectRow = EUI.getCmp("notifyChoosePositionGrid").getGridData();
          callback && callback.call(this, selectRow);
        }
      }],
      items: [{
        xtype: "Container",
        layout: "border",
        border: false,
        padding: 0,
        itemspace: 1,
        items: [{
          xtype: "GridPanel",
          title: "已选择",
          border: true,
          width: 470,
          id: "notifyChoosePositionGrid",
          region: "west",
          gridCfg: {
            datatype: "local",
            loadonce: true,
            multiselect: true,
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
        }, g.getCenterIcon("notifyPosition"), {
          xtype: "GridPanel",
          border: true,
          tbar: ["->", {
            xtype: "SearchBox",
            id: "searchBox_positionGrid",
            width: 200,
            displayText: g.lang.searchDisplayText,
            onSearch: function (v) {
              EUI.getCmp("notifyAllPositionGrid").setPostParams({
                Quick_value: v
              }, true);
            },
            afterClear: function () {
              EUI.getCmp("notifyAllPositionGrid").setPostParams({
                Quick_value: null
              }, true);
            }
          }],
          id: "notifyAllPositionGrid",
          title: "所有岗位",
          width: 470,
          region: "east",
          searchConfig: {
            searchCols: ["code", "name"]
          },
          gridCfg: {
            hasPager: true,
            multiselect: true,
            loadonce: false,
            sortname: 'code',
            url: _ctxPath + "/design/listPos",
            colModel: this.positionGridColModel(),
            ondblClickRow: function (rowid) {
              var selectRow = EUI.getCmp("notifyAllPositionGrid").grid.jqGrid('getRowData', rowid);
              if (!selectRow) {
                g.message("请选择一条要操作的行项目!");
                return false;
              }
              EUI.getCmp("notifyChoosePositionGrid").addRowData([selectRow], true);
            }
          }
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
  },
  initTextBox: function () {
    if ($(".textbox").length != 0) {
      return;
    }
    var $tipbox = $("<div class='textbox' style='display:none;'></div>");
    var $c = $('<div class="text_content"></div>');
    $tipbox.append($c);
    $tipbox.appendTo('body');
  },
  showTextBox: function (thisdom, content, addTop) {
    var tboxes = $("div.textbox");
    var $tipbox;
    for (var i = 0; i < tboxes.length; i++) {
      if (tboxes[i].id === "") {
        $tipbox = $(tboxes[i]);
        break;
      }
    }
    var $c = $tipbox.find("div");
    $c.html(content);
    var pos = thisdom.offset();
    var top = thisdom.height() + addTop;
    var left = thisdom.width() / 2;
    var boxtop = pos.top + top;
    var boxleft = pos.left + left;
    if (boxtop + $tipbox.height() > $(window).height()) {
      boxtop = pos.top - $tipbox.height() - $tipbox.find("b").height();
      $tipbox.find("b").removeClass("tri_t").addClass("tri_b").css({"left": 5, "margin-top": $tipbox.height()});
    } else {
      $tipbox.find("b").removeClass("tri_b").addClass("tri_t").css({"left": 5, "margin-top": -7});
    }
    $tipbox.css({
      "top": boxtop,
      "left": boxleft,
      "position": "absolute",
      "max-width": 420,
      "max-height": 130,
      "z-index": "9999999"
    }).show();
  },
  showAllowJumpBack: function () {
    //会签的时候当决策为100%并且立即生效为true是才显示【处理后返回我审批】
    if (this.nodeType == 'CounterSign') {
      var immediatelyEnd = EUI.getCmp("immediatelyEnd").getValue();
      var counterDecision = EUI.getCmp("counterDecision").getValue();
      if (counterDecision == 100 && immediatelyEnd == true) {
        EUI.getCmp("allowJumpBack").show();
      } else {
        EUI.getCmp("allowJumpBack").hide();
      }
    }
  }
});
