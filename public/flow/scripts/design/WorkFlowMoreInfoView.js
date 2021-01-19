/**
 * 流程设计界面
 */
EUI.WorkFlowMoreInfoView = EUI.extend(EUI.CustomUI, {
  renderTo: "moreinfo",
  isCopy: false,//参考创建
  isFromVersion: false,//流程定义版本参考创建（true）
  businessModelId: null,
  businessModelCode: null,
  afterConfirm: null,
  afterCancel: null,
  startUEL: null,
  parent: null,
  width: 875,

  initComponent: function () {
    var g = this;
    this.form = EUI.FormPanel({
      width: g.width,
      renderTo: this.renderTo,
      height: "auto",
      style: {
        "border-top": "none"
      },
      itemspace: 0,
      defaultConfig: {
        xtype: "Container",
        layout: "auto",
        height: "auto",
        padding: 3
      },
      items: [{
        itemspace: 15,
        items: [{
          xtype: "NumberField",
          title: "优先级",
          labelWidth: 90,
          allowNegative: false,
          allowBlank: false,
          width: 133,
          value: 0,
          name: "priority"
        }, {
          xtype: "NumberField",
          title: "流程额定工时",
          labelWidth: 120,
          allowNegative: false,
          allowBlank: false,
          width: 151,
          value: 0,
          name: "timing",
          unit: "小时"
        }, {
          xtype: "CheckBox",
          title: "允许为子流程",
          labelWidth: 100,
          name: "subProcess",
          id: "subProcess",
          hidden: false,
          onChecked: function (value) {
            var solidCmp = EUI.getCmp("solidifyFlow");
            if (value) {
              if (solidCmp) {
                solidCmp.hide();
              }
            } else {
              solidCmp.show();
            }
          }
        }, {
          xtype: "CheckBox",
          title: "允许固化流程",
          labelWidth: 100,
          name: "solidifyFlow",
          id: "solidifyFlow",
          hidden: false,
          onChecked: function (value) {
            var subProcessCmp = EUI.getCmp("subProcess");
            if (value) {
              if (!g.checkAllowSolidFlow()) {
                this.reset();
                return false;
              }
              if (subProcessCmp) {
                subProcessCmp.hide();
              }
              g.parent.isSolidifyFlow = true;
            } else {
              subProcessCmp.show();
              g.parent.isSolidifyFlow = false;
            }
          }
        }]
      }, {
        itemspace: 12,
        items: [{
          xtype: "ComboBox",
          title: "启动前事件",
          id: "beforeStart",
          name: "beforeStartServiceName",
          field: ["beforeStartServiceId"],
          labelWidth: 90,
          width: 322,
          loadonce: false,
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
          xtype: "CheckBox",
          title: "异步调用",
          labelFirst: false,
          name: "beforeStartServiceAync"
        }]
      }, {
        items: [{
          xtype: "ComboBox",
          title: "启动后事件",
          id: "afterStart",
          loadonce: false,
          name: "afterStartServiceName",
          field: ["afterStartServiceId"],
          labelWidth: 90,
          width: 322,
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
          xtype: "CheckBox",
          title: "异步调用",
          labelFirst: false,
          name: "afterStartServiceAync"
        }]
      }, {
        items: [{
          xtype: "ComboBox",
          title: "结束前事件",
          id: "beforeEnd",
          loadonce: false,
          name: "beforeEndServiceName",
          field: ["beforeEndServiceId"],
          labelWidth: 90,
          width: 322,
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
          xtype: "CheckBox",
          title: "异步调用",
          labelFirst: false,
          name: "beforeEndServiceAync"
        }]
      }, {
        items: [{
          xtype: "ComboBox",
          title: "结束后事件",
          id: "afterEnd",
          loadonce: false,
          name: "afterEndServiceName",
          field: ["afterEndServiceId"],
          labelWidth: 90,
          width: 322,
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
          xtype: "CheckBox",
          title: "异步调用",
          labelFirst: false,
          name: "afterEndServiceAync"
        }]
      }, {
        items: [{
          xtype: "TextField",
          readonly: true,
          title: "启动条件",
          labelWidth: 90,
          width: 322,
          checkHtmlStr: false,//不验证特殊字符
          submitName: false,
          id: "startUEL",
          name: "logicUel"
        }, {
          xtype: "Label",
          content: "<span class='ecmp-eui-setting'></span>",
          style: {
            cursor: "pointer"
          },
          onClick: function () {
            new EUI.UELSettingView({
              title: "流程启动条件",
              data: g.startUEL,
              showName: false,
              businessModelId: g.businessModelId,
              businessModelCode: g.businessModelCode,
              flowTypeId: EUI.getCmp("formPanel").getFormValue().flowTypeId,
              afterConfirm: function (data) {
                EUI.getCmp("startUEL").setValue(data.logicUel);
                g.startUEL = data;
              }
            });
          }
        }]
      }, this.initTbar()]
    });
    if (this.data) {
      this.loadData(this.data);
      if (this.data.solidifyFlow) {
        EUI.getCmp("subProcess").hide();
      } else if (this.data.subProcess) {
        EUI.getCmp("solidifyFlow").show();
      }
      this.doExcludeNodes(this.data.solidifyFlow);
    }
  },
  initTbar: function () {
    var g = this;
    return {
      xtype: "ToolBar",
      items: ["->", {
        xtype: "Button",
        title: "取消",
        handler: function () {
          g.hide();
          g.afterCancel && g.afterCancel.call(g);
          g.parent.moreShow = false;
        }
      }, {
        xtype: "Button",
        title: "确定",
        selected: true,
        handler: function () {
          var data = g.getData();
          if (data) {
            g.afterConfirm && g.afterConfirm.call(g, data);
            g.doExcludeNodes(data.solidifyFlow);
          }
          g.hide();
          g.parent.moreShow = false;
        }
      }]
    };
  }
  ,
  checkAllowSolidFlow: function () {
    var nodes = $(".node-choosed");
    if (nodes && nodes.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        var item = $(nodes[i]);
        var type = item.attr("type");
        if (type === "CallActivity") {
          EUI.ProcessStatus({
            msg: "固化流程不能包含【调用子流程】，请检查！",
            success: false
          });
          return false;
        }
      }
    }
    return true;
  },
  //固化流程 不显示子流程、服务任务、工作池任务节点
  doExcludeNodes: function (solidifyFlow) {
    var nodeCallActivity = $(".flow-task-box>[nodetype='CallActivity']").parent();
    if (solidifyFlow) {
      nodeCallActivity && nodeCallActivity.hide();
    } else {
      nodeCallActivity && nodeCallActivity.show();
    }
  },
  show: function () {
    this.form.show();
  }
  ,
  hide: function () {
    this.form.hide();
  }
  ,
  reset: function () {
    this.form.reset();
  },
  checkValid: function () {
    return this.form.isValid();
  },
  getData: function () {
    if (!this.checkValid()) {
      return null;
    }
    var data = this.form.getFormValue();
    data.startUEL = this.startUEL;
    return data;
  },
  loadData: function (data) {
    this.startUEL = data.startUEL;
    if (data.startUEL) {
      data.logicUel = data.startUEL.logicUel;
    }
    this.form.loadData(data);
  },
  updateParams: function (businessModelId, businessModelCode) {
    this.businessModelId = businessModelId;
    this.businessModelCode = businessModelCode;
    EUI.getCmp("beforeStart").store.params.busModelId = businessModelId;
    EUI.getCmp("afterStart").store.params.busModelId = businessModelId;
    EUI.getCmp("beforeEnd").store.params.busModelId = businessModelId;
    EUI.getCmp("afterEnd").store.params.busModelId = businessModelId;
    this.reset();
    this.form.getCmpByName("priority").setValue(0);
    this.form.getCmpByName("timing").setValue(0);
    this.startUEL = null;
  }
})
;
