/**
 * 实现功能：ChooseUserView 节点选人页面
 *
 * @author CHEHSHUANG
 * @version 1.0.00
 */
EUI.ChooseUserView = EUI.extend(EUI.CustomUI, {
  isAnyOneNode: false,
  nodeData: null,//当前点击的任务节点信息
  businessId: null,
  businessModelCode: null,
  initComponent: function () {
    var g = this;
    if(this.isAnyOne()){
      g.showChooseWin();
    }else{
      this.getData();
    }
  },
  showChooseWin: function(data){
    var g = this;
    this.winBox = EUI.Window({
      title: "配置执行人",
      width: 600,
      height: 450,
      padding: 0,
      showClose: false,
      afterRender: function () {
      },
      afterClose: function () {
        g.winBox.remove();
      },
      html: "<div class='flow-operate'></div>",
      buttons: [{
        title: "取消",
        handler: function () {
          g.winBox.remove();
        }
      }, {
        title: "确定",
        selected: true,
        hidden: false,
        handler: function () {
          var user = g.getSelectedUser();
          if (!user) {
            return false;
          }
          $("#"+user.actTaskDefKey).removeClass("not-choose-error");
          g.setSelectedUser(user);
          g.winBox.remove();
        }
      }]
    });
    this.showChooseUser(data);
    this.addEvents();
  },
  getData: function () {
    var g = this;
    var requestExecutorsVos=[];
    if(this.nodeData&&!Object.isEmpty(this.nodeData)){
      var nodeConfig = this.nodeData.nodeConfig;
      if (!nodeConfig|| !nodeConfig.executor || nodeConfig.executor.length===0) {
        return;
      }
      for(var i in nodeConfig.executor){
        var newObj = {},obj = nodeConfig.executor[i];
        newObj.userType = obj.userType;
        if(obj.userType==="SelfDefinition"){
          newObj.ids = obj.selfDefId || obj.selfDefOfOrgAndSelId || null;
        }else{
          newObj.ids = obj.ids || null;
        }
        requestExecutorsVos.push(newObj);
      }
    }
    var mask = EUI.LoadMask({
      msg: "正在获取数据，请稍候..."
    });
    EUI.Store({
      url:  _ctxPath + "/flowTask/getExecutorsByExecutorsVos",
      postType: 'json',
      isUrlParam: false,
      params: {
        requestExecutorsVos: JSON.stringify(requestExecutorsVos),
        businessModelCode: this.businessModelCode,
        businessId: this.businessId
      },
      success: function (status) {
        mask.remove();
        if (status.success) {
          g.showChooseWin(status.data);
        } else {
          EUI.ProcessStatus(status);
        }
      },
      failure: function (response) {
        mask.remove();
        EUI.ProcessStatus(response);
      }
    });
  },
  isAnyOne: function(){
    var executor = this.nodeData.nodeConfig.executor;
    for(var i = 0; i< executor.length;i++){
      if(executor[i].userType === "AnyOne"){
        this.isAnyOneNode = true;
        break;
      }
    }
    return this.isAnyOneNode;
  },
  showChooseUser: function (data) {
    var g = this;
    var nodeTypeStr = "",nodeType="",nodeName="";
    var taskText = this.lang.generalTaskText,iconCss = "choose-radio";
    if (this.nodeData.nodeType) {
      nodeTypeStr = this.nodeData.nodeType.toLowerCase();
      nodeType = this.nodeData.nodeType;
      nodeName = this.nodeData.name;
    }
    switch (nodeTypeStr) {
      case "singlesign":
        iconCss = "choose-checkbox";
        taskText = this.lang.singleSignTaskText;
        break;
      case "countersign":
        iconCss = "choose-checkbox";
        taskText = this.lang.counterSignTaskText;
        break;
      case "paralleltask":
        iconCss = "choose-checkbox";
        taskText = this.lang.ParallelTaskText;
        break;
      case "approve":
        taskText = this.lang.approveTaskText;
        break;
      case "serialtask":
        taskText = this.lang.SerialTaskText;
        break;
      case "servicetask":
        taskText = this.lang.serviceTaskText;
        break;
      case "receivetask":
        taskText = this.lang.receiveTaskText;
        break;
      default: break;

    }

    var itemdom = "",user = data;
    if (this.isAnyOneNode) {
      var html = g.showAnyContainer(0, taskText,nodeType,nodeName);
      $(".flow-operate").before(html);
      return;
    }
    var urgentHtml = "";
    if(this.nodeData.nodeConfig.normal.allowChooseInstancy){//是否允许加急
      var userInfo = this.parentThis.executorInfo[this.nodeData.id];
      if(userInfo&&userInfo.instancyStatus){
        urgentHtml = '<div class="urgentchoose-icon select-urgentchoose-radio" style="top: 4px;position: relative;"/>'+
          '<span class="urgentchoose-span" style="color: red">' + "紧急" + '</span>';
      }else{
        urgentHtml = '<div class="urgentchoose-icon urgentchoose-radio" style="top: 4px;position: relative;"/>'+
          '<span class="urgentchoose-span">' + "紧急" + '</span>';
      }
    }
    var nodeHtml ="";
    if(iconCss === "choose-checkbox"){
      nodeHtml = '<div class="flow-node-box" index="' + 0 + '">' +
        '<div class="flow-excutor-title"><div class="choose-icon choose-checkbox" ></div>' + nodeName + '-[' + taskText +']' +urgentHtml+
        '</div>' +
        '<div class="flow-excutor-content">';
    }else{
      nodeHtml = '<div class="flow-node-box" index="' + 0 + '">' +
        '<div class="flow-excutor-title">' + nodeName + '-[' + taskText +']' +urgentHtml+
        '</div>' +
        '<div class="flow-excutor-content">';
    }


    if (iconCss === "choose-radio") {
      itemdom = $(g.showUserItem(user, nodeHtml, iconCss, taskText,nodeType));
      $(".flow-operate").before(itemdom);
      if (!this.unNeedSelectExecutor && data && data.length === 1) {
        $(".flow-user-item:first", itemdom).addClass("select");
      }
    }else if (iconCss === "choose-checkbox") {
      itemdom = $(g.showUserItem(user, nodeHtml, iconCss, taskText,nodeType));
      $(".flow-operate").before(itemdom);

      if(user.length>0 && user.length == $(".flow-user-item.select").length){
        $(".flow-excutor-title").addClass("select");
      }else{
        $(".flow-excutor-title").removeClass("select");
      }
      //  $(".flow-user-item", itemdom).addClass("select");
    }
  },
  showAnyContainer: function (i, taskText,nodeType,nodeName) {
    this.unNeedSelectExecutor = false;
    var g = this;
    var urgentHtml = "";
    if(this.nodeData.nodeConfig.normal.allowChooseInstancy){//是否允许加急
      var userInfo = this.parentThis.executorInfo[this.nodeData.id];
      if(userInfo&&userInfo.instancyStatus){
        urgentHtml = '<div class="urgentchoose-icon select-urgentchoose-radio" style="top: 4px;position: relative;"/>'+
          '<span class="urgentchoose-span" style="color: red">' + "紧急" + '</span>';
      }else{
        urgentHtml = '<div class="urgentchoose-icon urgentchoose-radio" style="top: 4px;position: relative;"/>'+
          '<span class="urgentchoose-span">' + "紧急" + '</span>';
      }
    }
    var html = "",anyOnehtml= this.parentThis.anyOneSelectHtml[this.nodeData.id] || "";
    var nodeHtml = '<div class="flow-node-box" index="' + i + '">' +
      '<div class="flow-excutor-title" flowTaskType="' + nodeType + '">' + nodeName + '-[' + taskText + ']' +urgentHtml+
      '</div>' +
      '<div class="flow-excutor-content2-box">' +
      '<div class="flow-excutor-content2">'+anyOnehtml+'</div>' +
      '<div class="choose-btn">' +
      '<span class="btn-icon ecmp-common-add"></span>' +
      '<span class="btn-icon choose-btn-text">' + g.lang.chooseText + '</span>' +
      '</div>' +
      '</div>' +
      '</div>';
    return html += nodeHtml;
  },
  findId: function(selectedId,id){
    var flag = false;
    if(selectedId&&selectedId.length>0){
      for(var i=0;i<selectedId.length;i++){
        if(selectedId[i]===id){
          flag = true;
          break;
        }
      }
    }
    return flag;
  },
  showUserItem: function (users, nodeHtml, iconCss, taskText,nodeType) {
    var userInfo = this.parentThis.executorInfo[this.nodeData.id],selectedId = userInfo&&userInfo.executorIds;
    if(selectedId){
      selectedId = selectedId.split(",");
    }
    var html = "", classStr="flow-user-item";
    this.unNeedSelectExecutor = false;
    for (var j = 0; j < users.length; j++) {
      var user = users[j];
      // if((iconCss==="choose-checkbox"&&!selectedId) || this.findId(selectedId,user.id)){
      if(this.findId(selectedId,user.id)){
        classStr="flow-user-item select";
      }else{
        classStr="flow-user-item"
      }
      if (!user.positionId) {
        nodeHtml += '<div class="'+classStr+'" type="' + nodeType + '" id="' + user.id + '">' +
          '<div class="choose-icon ' + iconCss + '" ></div>' +
          '<div class="excutor-item-title">' +
          String.format(this.lang.showUserInfo2Text, user.name, user.organizationName, user.code) +
          '</div>' +
          '</div>';
      } else {
        nodeHtml += '<div class="'+classStr+'" type="' + nodeType + '" id="' + user.id + '">' +
          '<div class="choose-icon ' + iconCss + '"></div>' +
          '<div class="excutor-item-title">' +
          String.format(this.lang.showUserInfoText, user.name, user.positionName, user.organizationName, user.code) +
          '</div>' +
          '</div>';
      }
    }
    nodeHtml += "</div>";
    return html += nodeHtml;
  },
  //设置各个节点的执行人
  setSelectedUser: function(userInfo){
    this.parentThis.executorInfo[userInfo.actTaskDefKey]=userInfo;
  },
  getSelectedUser: function () {
    var nodeDoms = $(".flow-node-box");
    if(nodeDoms.length>0){
      var nodeDom = $(nodeDoms[0]);
      var itemDoms = $(".select", nodeDom);
      if (itemDoms.length === 0) {
        EUI.ProcessStatus({
          success: false,
          msg: String.format(this.lang.chooseExecutorMsgText, this.nodeData.name)
        });
        return false;
      }
      if(this.isAnyOneNode){
        this.parentThis.anyOneSelectHtml[this.nodeData.id] = $(".flow-excutor-content2").html();//用于编辑回显
      }
      var ids = "";
      for (var j = 0; j < itemDoms.length; j++) {
        if (j > 0) {
          ids += ",";
        }
        ids += $(itemDoms[j]).attr("id");
      }
      var user = this.parentThis.executorInfo[this.nodeData.id]||{instancyStatus: false};
      user.executorIds = ids;
      user.actTaskDefKey = this.nodeData.id;
      user.nodeType = this.nodeData.nodeType;
      return user;
    }
    return false;
  },
  showChooseExecutorWind: function (currentChooseDivIndex, currentChooseTaskType,treeData) {
    var g = this;
    var isChooseOneTitle;
    var saveBtnIsHidden;
    if (currentChooseTaskType === "Normal" || currentChooseTaskType === "Approve") {
      isChooseOneTitle = "选择任意执行人【可双击选择】";
      saveBtnIsHidden = true; //单选
    } else {
      isChooseOneTitle = "选择任意执行人";
      saveBtnIsHidden = false;
    }
    g.chooseAnyOneWind = EUI.Window({
      title: isChooseOneTitle,
      width: 720,
      layout: "border",
      height: 380,
      padding: 5,
      itemspace: 0,
      items: [this.initChooseUserWindLeft(treeData), this.InitChooseUserGrid(currentChooseDivIndex, currentChooseTaskType)],
      buttons: [{
        title: "取消",
        handler: function () {
          g.chooseAnyOneWind.remove();
        }
      },{
        title: "确定",
        selected: true,
        hidden: false,
        handler: function () {
          var selectRow = EUI.getCmp("chooseUserGridPanel").getSelectRow();
          if (!selectRow) {
            EUI.ProcessStatus({msg: "请选择执行人",success: false});
            return;
          }
          if (saveBtnIsHidden) {
            var rowData = selectRow;
            var html = '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + rowData.id + '">' +
              '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
              '<div class="excutor-item-title">姓名：' + rowData["userName"] +
              '，组织机构：' + rowData["organization.name"] + '，编号：' + rowData.code + '</div>' +
              '</div>';
            $("div[index=" + currentChooseDivIndex + "]").find(".flow-excutor-content2").html(html);
          } else {
            g.addChooseUsersInContainer(selectRow, currentChooseDivIndex, currentChooseTaskType);
          }
          g.chooseAnyOneWind.close();
        }
      }]
    });
  },
  initChooseUserWindLeft: function (treeData) {
    var g = this;
    return {
      xtype: "Container",
      region: "west",
      border: false,
      width: 250,
      itemspace: 0,
      layout: "border",
      items: [this.initChooseUserWindTopBar(), this.initChooseUserWindTree(treeData)]
    }
  },
  initChooseUserWindTopBar: function () {
    var g = this;
    return {
      xtype: "ToolBar",
      region: "north",
      height: 40,
      border: false,
      padding: 0,
      isOverFlow: false,
      items: ['->', {
        xtype: "SearchBox",
        width: 160,
        displayText: "根据名称搜索",
        onSearch: function (v) {
          EUI.getCmp("chooseAnyUserTree").search(v);
          g.selectedOrgId = null;
        },
        afterClear: function () {
          EUI.getCmp("chooseAnyUserTree").reset();
          g.selectedOrgId = null;
        }
      }]
    };
  },
  initChooseUserWindTree: function (treeData) {
    var g = this;
    // var mask = EUI.LoadMask({msg: "正在加载，请稍候"});
    return {
      xtype: "TreePanel",
      region: "center",
      id: "chooseAnyUserTree",
      // url: _ctxPath + "/flowDefination/listAllOrgs",
      data: treeData,
      border: true,
      searchField: ["name"],
      showField: "name",
      style: {
        "background": "#fff"
      },
      onSelect: function (node) {
        g.selectedOrgId = node.id;
        var chooseUserGridPanel = EUI.getCmp("chooseUserGridPanel").setGridParams({
          url: _ctxPath + "/flowDefination/listUserByOrgByWeb",
          loadonce: false,
          datatype: "json",
          postData: {
            organizationId: g.selectedOrgId,
            includeSubNode: true,
            quickSearchValue:""
          }
        }, true);
        EUI.getCmp("chooseUserGridPanel").data = null;
      },
      afterItemRender: function (nodeData) {
        if (nodeData.frozen) {
          var nodeDom = $("#" + nodeData.id);
          if (nodeDom.length===0) {
            return;
          }
          var itemCmp = $(nodeDom[0].children[0]);
          itemCmp.addClass("ux-tree-freeze");
          itemCmp.find(".ux-tree-title").text(itemCmp.find(".ux-tree-title").text() + "(已冻结)");
        }
      },
      /*afterShowTree: function () {
          this.setSelect(treeData[0].id);
          mask.hide();
      }*/
    }
  },
  InitChooseUserGrid: function (currentChooseDivIndex, currentChooseTaskType) {
    var g = this;
    var isShowMultiselect = currentChooseTaskType !== "Normal" && currentChooseTaskType !== "Approve";
    return {
      xtype: "Container",
      region: "center",
      itemspace: 0,
      layout: "border",
      border: false,
      items: [{
        xtype: "ToolBar",
        region: "north",
        isOverFlow: false,
        padding: 0,
        height: 40,
        border: false,
        items: ['->', {
          xtype: "SearchBox",
          displayText: g.searchDisplayText,
          onSearch: function (value) {
            var chooseUserGridPanel = EUI.getCmp("chooseUserGridPanel").setGridParams({
              url: _ctxPath + "/flowDefination/listUserByOrgByWeb",
              loadonce: false,
              datatype: "json",
              postData: {
                organizationId: g.selectedOrgId,
                includeSubNode: true,
                quickSearchValue:value
              }
            }, true);
            EUI.getCmp("chooseUserGridPanel").data = null;
          },
          afterClear: function () {
            EUI.getCmp("chooseUserGridPanel").restore();
          }
        }]
      }, {
        xtype: "GridPanel",
        region: "center",
        id: "chooseUserGridPanel",
        searchConfig: {
          searchCols: ["userName", "code"]
        },
        style: {"border-radius": "3px"},
        gridCfg: {
          datatype: "local",
          loadonce: true,
          multiselect: isShowMultiselect,
          colModel: [{
            label: "用户ID",
            name: "id",
            index: "id",
            hidden: true
          }, {
            label: "用户名称",
            name: "userName",
            index: "userName",
            width: 150,
            align: "center"
          }, {
            label: "员工编号",
            name: "code",
            index: "code",
            width: 200
          }, {
            label: "组织机构",
            name: "organizationName",
            index: "organizationName",
            width: 150,
            align: "center"
            // , hidden: true
          }],
          //单选 双击选中
          ondblClickRow: function (rowid) {
            var html = "";
            var rowData = EUI.getCmp("chooseUserGridPanel").grid.jqGrid('getRowData', rowid);
            html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + rowData.id + '">' +
              '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
              '<div class="excutor-item-title">姓名：' + rowData["userName"] +
              '，组织机构：' + rowData["organizationName"] + '，编号：' + rowData.code + '</div>' +
              '</div>';
            $("div[index=" + currentChooseDivIndex + "]").find(".flow-excutor-content2").html(html);
            g.chooseAnyOneWind.close();
          }
        }
      }]
    }
  },
  //多选
  addChooseUsersInContainer: function (selectRow, currentChooseDivIndex, currentChooseTaskType) {
    var g = this;
    var html = "";
    var selectedUser = [],$content = $("div[index=" + currentChooseDivIndex + "]").find(".flow-excutor-content2");
    $content.children().each(function (index, domEle) {
      selectedUser.push(domEle.id)
    });
    for (var j = 0; j < selectRow.length; j++) {
      var item = selectRow[j];
      //排除已选的数据
      if (!g.itemIdIsInArray(item.id, selectedUser)) {
        html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + item.id + '">' +
          '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
          '<div class="excutor-item-title">姓名：' + item["userName"] +
          '，组织机构：' + item["organizationName"] + '，编号：' + item.code + '</div>' +
          '</div>';
      }
    }
    $content.append(html);
  },
  itemIdIsInArray: function (id, array) {
    for (var i = 0; i < array.length; i++) {
      if (id === array[i]) {
        return true;
      }
    }
    return false;
  },
  addEvents: function () {
    var g = this;

    $(".flow-excutor-title>.choose-checkbox").die().live("click", function () {
      var $this = $(this);
      var $parent = $this.parent(".flow-excutor-title");
      if ($parent.hasClass("select")) {
        $parent.removeClass("select");
        var $userItems = $parent.siblings().children();
        for (var i = 0; i < $userItems.length; i++) {
          var $item = $($userItems[i]);
          if ($item.hasClass("select")) {
            $item.removeClass("select");
          }
        }
      } else {
        $parent.addClass("select");
        var $userItems = $parent.siblings().children();
        for (var i = 0; i < $userItems.length; i++) {
          var $item = $($userItems[i]);
          if (!$item.hasClass("select")) {
            $item.addClass("select");
          }
        }
      }
    });



    //设置紧急按钮
    $(".urgentchoose-icon").die().live("click", function () {
      var user = g.parentThis.executorInfo[g.nodeData.id]||{};
      if(user.instancyStatus){
        $(this).removeClass("select-urgentchoose-radio").addClass("urgentchoose-radio");
        $(".urgentchoose-span").css("color", "black");
        user.instancyStatus=false;
      } else {
        $(this).removeClass("urgentchoose-radio").addClass("select-urgentchoose-radio");
        $(".urgentchoose-span").css("color", "red");
        user.instancyStatus=true;
      }
      g.parentThis.executorInfo[g.nodeData.id] = user
    });
    //执行人选择
    $(".flow-user-item").die().live("click", function () {
      var $this = $(this);
      var type = $this.attr("type").toLowerCase();
      if (type === "normal" || type === "approve" || type === "servicetask" || type === "receivetask") {
        if ($this.parent().children("div").length === 1) {
          if ($this.hasClass("select")) {
            $this.removeClass("select");
          } else {
            $this.addClass("select");
          }
        } else {
          $this.addClass("select").siblings().removeClass("select");
        }
      }
      if (type === "singlesign" || type === "countersign" || type === "paralleltask" || type === "serialtask") {
        if ($this.hasClass("select")) {
          $this.removeClass("select");
          $(".flow-excutor-title").removeClass("select");
        } else {
          $this.addClass("select");
        }
      }
    });
    //选择任意执行人
    $(".choose-btn").die().live("click", function () {
      var $this = $(this),$parent = $this.parents(".flow-node-box");
      var mask = EUI.LoadMask({msg: "正在加载，请稍候"});
      EUI.Store({
        url: _ctxPath + "/flowDefination/listAllOrgs",
        success: function (status) {
          mask.hide();
          var currentChooseDivIndex = $parent.attr("index");
          var currentChooseTaskType = $parent.children().eq(0).attr("flowtasktype");
          g.showChooseExecutorWind(currentChooseDivIndex, currentChooseTaskType,status.data);
          EUI.getCmp("chooseAnyUserTree").setSelect(status.data[0].id);
        },
        failure: function (response) {
          mask.hide();
          EUI.ProcessStatus(response);
        }
      });
      return false;
    });
    //删除选择的执行人
    $(".ecmp-flow-delete").die().live("click", function () {
      $(this).parent().remove();
    });
  }
});
