/**
 * 流程设计界面
 */
EUI.ConfigWorkFlowView = EUI.extend(EUI.CustomUI, {
  renderTo: null,
  count: 0,
  id: null,
  versionCode: null,
  instance: null,
  connectInfo: {},
  uelInfo: {},
  businessModelId: null,//业务实体ID
  businessModelCode: null,
  businessId: null,
  executorInfo: {},
  anyOneSelectHtml: {},//用于编辑回显
  defData: null,
  remark: null,//附加说明
  initComponent: function () {
    var g = this;
    EUI.Container({
      renderTo: this.renderTo,
      layout: "border",
      defaultConfig: {
        border: true,
        borderCss: "flow-border"
      },
      items: [{
        xtype: "ToolBar",
        region: "north",
        border: false,
        isOverFlow: false,
        height: 40,
        padding: 3,
        items: this.getTopItems()
      }, {
        region: "center",
        id: "center",
        html: this.getCenterHtml()
      }]
    });
    //设置面板背景表格
    EUI.getCmp("center").dom.addClass("flow-grid");
    this.addEvents();
    this.initJSPlumb();
    if (this.id) {
      this.loadData();
    }
  },
  getTopItems: function () {
    var g = this;
    return [{
      xtype: "FormPanel",
      width: 781,
      isOverFlow: false,
      height: 40,
      padding: 0,
      layout: "auto",
      id: "formPanel",
      border: false,
      itemspace: 5,
      defaultConfig: {
        labelWidth: 80,
        readonly: true,
        xtype: "TextField"
      },
      items: [{
        name: "flowTypeName",
        title: "流程类型",
        width: 200,
        labelWidth: 90
      }, {
        name: "id",
        width: 110,
        labelWidth: 85,
        title: "流程代码"
      }, {
        xtype: "TextField",
        title: "流程名称",
        labelWidth: 85,
        width: 190,
        name: "name"
      }]
    }, {
      xtype: "Button",
      title: "提交",
      selected: true,
      handler: function () {
        g.submit();
      }
    }, {
      xtype: "Button",
      title: "返回",
      selected: false,
      handler: function () {
        g.returnPage();
      }
    }];
  },

  getCenterHtml: function () {
    return "<div class='flow-content'></div>";
  },
  initJSPlumb: function () {
    var g = this;
    this.instance = jsPlumb.getInstance({
      Endpoint: "Blank",
      ConnectionOverlays: [["Arrow", {
        location: 1,
        visible: true,
        length: 14,
        id: "ARROW"
      }], ["Label", {
        location: 0.2,
        id: "label",
        visible: false,
        label: null,
        cssClass: "flow-line-note node-title"
      }]],
      Container: "body"
    });

    this.instance.registerConnectionType("basic", {
      anchor: "Continuous",
      connector: ["Flowchart", {
        stub: [5, 5],
        cornerRadius: 5
      }]
    });
    // 连接事件
    this.instance.bind("connection", function (connection, originalEvent) {
      g.connectInfo[connection.sourceId + "," + connection.targetId] = true;
      var uel = g.uelInfo[connection.sourceId + "," + connection.targetId];
      if (uel) {
        var overlay = connection.connection.getOverlay("label");
        overlay.setLabel(uel.name);
        $(overlay.canvas).attr("title", uel.name);
        overlay.show();
      }
    });
  }
  ,
  initNode: function (el) {
    this.instance.makeSource(el, {
      filter: ".node-dot",
      anchor: "Continuous",
      connector: ["Flowchart", {
        stub: [5, 5],
        cornerRadius: 5,
      }],
      connectorStyle: {
        stroke: "#c7c7c7",
        strokeWidth: 2,
        joinstyle: "round",
        outlineStroke: "white",
        outlineWidth: 2
      },
      connectorHoverStyle: {
        strokeWidth: 3,
        stroke: "#216477",
        outlineWidth: 2,
        outlineStroke: "white"
      },
      connectionType: "basic"
    });
  }
  ,
  doConect: function (sourceId, targetId) {
    this.instance.connect({
      source: sourceId,
      target: targetId,
      type: "basic"
    });
  }
  ,
  loadData: function () {
    var g = this;
    var url = _ctxPath + "/design/getEntity";
    var postData = {
      id: this.id, //流程定义id
      versionCode: -1,
      businessId: this.businessId,
      businessModelCode: this.businessModelCode
    };
    var mask = EUI.LoadMask({
      msg: "正在获取数据，请稍候..."
    });
    EUI.Store({
      url: url,
      params: postData,
      success: function (status) {
        mask.remove();
        g.showDesign(status.data);
      },
      failure: function (status) {
        mask.remove();
        EUI.ProcessStatus(status);
      }
    });
  },
  initExecutorInfo: function (node) {
    var nodeTypeStr = node.nodeType && node.nodeType.toLowerCase();
    switch (nodeTypeStr) {
      case "singlesign":
      case "countersign":
      case "paralleltask":
      case "approve":
      case "serialtask":
      case "normal":
        this.executorInfo[node.id] = null;
        this.anyOneSelectHtml[node.id] = "";
        break;
      default:
        break;
    }
  },
  showDesign: function (defData) {
    var data = JSON.parse(defData.defJson);
    this.defData = data;
    this.businessModelId = data.businessModelId;
    data.flowTypeName = defData.flowDefination.flowType.name;
    this.loadHead(data);
    var html = "";
    for (var id in data.process.nodes) {
      var node = data.process.nodes[id];
      var type = node.type;
      if (type === "StartEvent") {
        html += this.showStartNode(id, node);
      } else if (type.indexOf("EndEvent") !== -1) {
        html += this.showEndNode(id, node);
      } else if (type.indexOf("Task") !== -1 || type === "CallActivity") {
        this.initExecutorInfo(node);
        html += this.showTaskNode(id, node);
      } else if (type.indexOf("Gateway") !== -1) {
        html += this.showGatewayNode(id, node);
      }
      var tmps = id.split("_");
      var count = parseInt(tmps[1]);
      this.count = this.count > count ? this.count : count;
    }
    $(".flow-content").append(html);
    var doms = $(".node-choosed");
    for (var i = 0; i < doms.length; i++) {
      this.initNode(doms[i]);
      var item = $(doms[i]);
      var id = item.attr("id");
      item.data(data.process.nodes[id]);
    }
    for (var id in data.process.nodes) {
      var node = data.process.nodes[id];
      for (var index in node.target) {
        var target = node.target[index];
        if (target.uel) {
          this.uelInfo[id + "," + target.targetId] = target.uel;
        }
        this.doConect(id, target.targetId);
      }
    }

    //默认设置只有一个执行人情况（添加：单签任务默认全部选择）
    if (defData.solidifyExecutorOfOnly) {
      for (var actTaskDefKey in defData.solidifyExecutorOfOnly) {
        this.executorInfo[actTaskDefKey] = defData.solidifyExecutorOfOnly[actTaskDefKey];
      }
    }
    //默认设置一个执行人，其他标红（添加：单签任务默认全部选择）
    this.checkStartUserValid();
  },

  loadHead: function (data) {
    var headData = {
      name: data.process.name,
      id: data.process.id,
      flowTypeId: data.flowTypeId,
      flowTypeName: data.flowTypeName
    };
    EUI.getCmp("formPanel").loadData(headData);
  },

  showStartNode: function (id, node) {
    return "<div tabindex=0 type='StartEvent' id='"
      + id
      + "' class='flow-event-box flow-node node-choosed'  style='cursor: auto;left: "
      + node.x
      + "px; top: "
      + node.y
      + "px; opacity: 1;'>"
      + "<div class='flow-event-iconbox'><div class='flow-event-start'></div></div>"
      + "<div class='node-title' title='" + node.name + "'>" + node.name + "</div>"
      + "</div>";
  }
  ,
  showEndNode: function (id, node) {
    var css = "flow-event-end";
    if (node.type === "TerminateEndEvent") {
      css = "flow-event-terminateend";
    }
    return "<div tabindex=0 type='" + node.type + "' id='"
      + id
      + "' class='flow-event-box flow-node node-choosed' style='cursor: auto; left: "
      + node.x
      + "px; top: "
      + node.y
      + "px; opacity: 1;'>"
      + "<div class='flow-event-iconbox'><div class='" + css + "'></div></div>"
      + "<div class='node-title' title='" + node.name + "'>" + node.name + "</div>	</div>";
  }
  ,
  showTaskNode: function (id, node) {
    var nodeCss = "flow-task flow-node node-choosed";
    var css = node.css;
    var visibleCss = " visibleCss", disabledCss = " disabledCss";
    if (!css) {
      switch (node.nodeType) {
        case "Normal":
          css = "usertask";
          nodeCss = nodeCss + visibleCss;
          break;
        case "SingleSign":
          css = "singletask";
          nodeCss = nodeCss + visibleCss;
          break;
        case "CounterSign":
          css = "countertask";
          nodeCss = nodeCss + visibleCss;
          node.nodeConfig.normal.isSequential = node.nodeConfig.normal.isSequential.toString();
          if (node.nodeConfig.normal.isSequential === "true") {
            css = "countertask serial-countertask";
          } else {
            css = "countertask parallel-countertask";
          }
          break;
        case "Approve":
          css = "approvetask";
          nodeCss = nodeCss + visibleCss;
          break;
        case "ParallelTask":
          css = "paralleltask";
          nodeCss = nodeCss + visibleCss;
          break;
        case "SerialTask":
          css = "serialtask";
          nodeCss = nodeCss + visibleCss;
          break;
        case "ServiceTask":
          css = "servicetask";
          nodeCss = nodeCss + disabledCss;
          break;
        case "ManualTask":
          css = "manualtask";
          nodeCss = nodeCss + disabledCss;
          break;
        case "ReceiveTask":
          css = "receiveTask";
          nodeCss = nodeCss + disabledCss;
          break;
        case "PoolTask":
          css = "poolTask";
          nodeCss = nodeCss + disabledCss;
          break;
        case "CallActivity":
          css = "callActivity";
          nodeCss = nodeCss + disabledCss;
          break;
      }
    }
    return "<div tabindex=0 id='" + id
      + "' class='" + nodeCss + "' type='"
      + node.type + "' nodeType='" + node.nodeType + "' style='cursor: pointer; left: "
      + node.x + "px; top: " + node.y + "px; opacity: 1;'>"
      + "<div class='" + css + "'></div>"
      + "<div class='node-title' title='" + node.name + "'>" + node.name + "</div>"
      + "</div>";
  }
  ,
  showGatewayNode: function (id, node) {
    var nodeCss = "flow-event-box flow-node node-choosed";
    var css = node.type.toLowerCase();
    if (node.busType === "ManualExclusiveGateway") {
      css = "manualExclusivegateway";
    }
    return "<div tabindex=0 id='" + id
      + "' class='" + nodeCss + "' bustype='" + node.busType + "' type='"
      + node.type + "' style='cursor: auto; left: "
      + node.x + "px; top: " + node.y + "px; opacity: 1;'>"
      + "<div class='flow-gateway-iconbox'>"
      + "<div class='" + css + "'></div></div>"
      + "<div class='node-title' title='" + node.name + "'>" + node.name + "</div>"
      + "</div>";
  },
  checkStartUserValid: function () {
    var userIsNull = false;
    for (var key in this.executorInfo) {
      var user = this.executorInfo[key];
      if (!user || !user.executorIds) {
        userIsNull = true;
        $("#" + key).addClass("not-choose-error");//标红色
      }
    }
  },

  checkUserValid: function () {
    var userIsNull = false;
    for (var key in this.executorInfo) {
      var user = this.executorInfo[key];
      if (!user || !user.executorIds) {
        userIsNull = true;
        $("#" + key).addClass("not-choose-error");//标红色
      }
    }
    if (userIsNull) {
      EUI.ProcessStatus({
        success: false,
        //msg: String.format("请选择[{0}]的执行人", this.defData.process.nodes[key].name)
        msg: "执行人未选择，请双击任务节点选择"
      });
      return false;
    }
    return true;
  },
  //返回单据启动页面
  returnPage: function (){
    var g = this;
    g.refreshPage();
  },
  //提交流程-先保存执行人、再调用流程启动方法
  submit: function () {
    var g = this;
    if (!this.checkUserValid()) {
      return false;
    }
    var executorsVos = [];
    for (var key in this.executorInfo) {
      executorsVos.push(this.executorInfo[key]);
    }
    var mask = EUI.LoadMask({
      msg: "正在处理中,请稍候..."
    });
    EUI.Store({
      url: _ctxPath +  "/flowSolidifyExecutor/saveSolidifyInfoByExecutorVos",
      postType: 'json',
      isUrlParam: false,
      params: {
        businessModelCode: g.businessModelCode,
        businessId: g.businessId,
        executorsVos: JSON.stringify(executorsVos)
      },
      success: function (status) {
        mask.hide();
        g.startFlow();
      },
      failure: function (response) {
        mask.hide();
        EUI.ProcessStatus(response);
      }
    });
  },
  startFlow: function () {
    var g = this;
    var mask = EUI.LoadMask({
      msg: "正在启动，请稍候..."
    });
    EUI.Store({
      url: _ctxPath +  "/defaultFlowBase/startFlowNew",
      postType: 'json',
      isUrlParam: false,
      params: {
        businessKey: this.businessId,
        businessModelCode: this.businessModelCode,
        typeId: this.typeId,
      },
      success: function (res1) {
        var taskList = "", task = [];
        var data = res1.data.nodeInfoList;
        var flowDefKey = res1.data.flowTypeList[0].flowDefKey;
        for (var i = 0; i < data.length; i++) {
          var item = data[i];
          task.push({
            nodeId: item.id,
            userVarName: item.userVarName,
            flowTaskType: item.flowTaskType,
            callActivityPath: item.callActivityPath,
            solidifyFlow: true
          });
        }
        taskList = JSON.stringify(task);
        EUI.Store({
          url: _ctxPath +  "/defaultFlowBase/startFlowNew",
          postType: 'json',
          isUrlParam: false,
          params: {
            businessKey: g.businessId,
            businessModelCode: g.businessModelCode,
            typeId: g.typeId,
            flowDefKey: flowDefKey,
            opinion: g.remark,//附加说明
            taskList: g.ifPoolTask === "true" ? "anonymous" : taskList,
            anonymousNodeId: g.ifPoolTask === "true" ? data[0].id : ""
          },
          success: function (res2) {
            mask.hide();
            var status = {
              msg: "启动成功",
              success: true
            };
            EUI.ProcessStatus(status);
          },
          failure: function (response) {
            mask.hide();
            EUI.ProcessStatus(response);
          }
        })

        // parentThis.afterSubmit && parentThis.afterSubmit(res);
        // g.refreshPage();
      },
      failure: function (response) {
        mask.hide();
        EUI.ProcessStatus(response);
      }
    });
  },
  refreshPage: function () {
    if (this.originStartTab) {
      var id = this.parentThis.data.flowDefinationId + "_configUser";

      if (window.top.homeView && (typeof window.top.homeView.addTab) === 'function') {
        window.top.homeView.addTab(this.originStartTab);
        window.top.homeView.getTabPanel().close(id);
      } else {
        var item = {id: id};
        var closeData = {tabAction: 'close', item: item};
        window.parent.postMessage(closeData, '*');
        var openItem = {
          id: this.originStartTab.id,
          name: this.originStartTab.title,
          featureUrl: this.originStartTab.url
        }
        var openData = {tabAction: 'open', item: openItem};
        window.parent.postMessage(openData, '*');
      }
    }
  },
  addEvents: function () {
    var g = this;
    $(".node-choosed.visibleCss").live({
      "dblclick": function () {
        var dom = $(this);
        new EUI.ChooseUserView({
          businessModelCode: g.businessModelCode,
          businessId: g.businessId,
          nodeData: dom.data(),
          parentThis: g
        });
      }
    });
  }
})
;
