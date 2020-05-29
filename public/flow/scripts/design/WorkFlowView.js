/**
 * 流程设计界面
 */
EUI.WorkFlowView = EUI.extend(EUI.CustomUI, {
    renderTo: null,
    count: 0,
    id: null,
    versionCode: null,
    flowDefVersionId: null,
    orgId: null,
    orgCode: null,
    instance: null,
    connectInfo: {},
    uelInfo: {},
    isCopy: false,//参考创建
    isFromVersion: false,//流程定义版本参考创建（true）
    businessModelId: null,//业务实体ID
    businessModelCode: null,//业务实体Code
    gDeleteConnectionId: null,//删除节点提示的标记，预防事件重发
    moreShow: false,
    isSolidifyFlow:false,
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
                id: "workFlowFormPanelToolBar",
                border: false,
                isOverFlow: false,
                height: 40,
                padding: 3,
                items: this.getTopItems()
            }, {
                region: "west",
                width: 160,
                html: this.getLeftHtml()
            }, {
                region: "center",
                id: "center",
                padding: 0,
                html: this.getCenterHtml()
            }]
        });
        //设置面板背景表格
        EUI.getCmp("center").dom.addClass("flow-grid");
        this.addEvents();
        this.initJSPlumb();
        if (this.id) {
            this.loadData();
        } else {
            this.initMoreInfo();
        }
    },
    getTopItems: function () {
        var g = this;
        var isCopy = g.isCopy;
        var isFromVersion = g.isFromVersion;
        var item = [{
            xtype: "ComboGrid",
            title: "流程类型",
            labelWidth: 90,
            id: "flowType",
            name: "flowTypeName",
            field: ["flowTypeId"],
            listWidth: isCopy && !isFromVersion ? 368 : 400,
            showSearch: true,
            searchConfig: {searchCols: ["code", "name", "businessModel.name"]},
            gridCfg: {
                url: _ctxPath + "/flowType/listFlowType",
                colModel: [{
                    name: "id",
                    index: "id",
                    hidden: true
                }, {
                    name: "businessModel.className",
                    index: "businessModel.className",
                    hidden: true
                }, {
                    name: "businessModel.id",
                    index: "businessModel.id",
                    hidden: true
                }, {
                    //businessModelText:"模块"
                    label: this.lang.businessModelText,
                    name: "businessModel.name",
                    index: "businessModel.name",
                    sortable: true
                }, {
                    label: this.lang.codeText,
                    name: "code",
                    index: "code",
                    sortable: true
                }, {
                    label: this.lang.nameText,
                    name: "name",
                    index: "name",
                    sortable: true
                }]
            },
            canClear: false,
            width: isCopy && !isFromVersion ? 159 : 160,
            readonly: (!isCopy && this.id) || (isCopy && isFromVersion) ? true : false,
            allowBlank: false,
            beforeSelect: function (data) {
                var scope = this;
                var busModelId = data.data["businessModel.id"];
                if (g.businessModelId && g.businessModelId != busModelId) {
                    var msgBox = EUI.MessageBox({
                        title: g.lang.tiShiText,
                        msg: "切换流程类型将清空所有流程设计，请确定是否继续?",
                        buttons: [{
                            title: "取消",
                            handler: function () {
                                msgBox.remove();
                            }
                        }, {
                            title: "确定",
                            selected: true,
                            handler: function () {
                                g.businessModelId = busModelId;
                                g.businessModelCode = data.data["businessModel.className"];
                                scope.setSubmitValue({
                                    flowTypeName: data.data.name,
                                    flowTypeId: data.data.id
                                });
                                g.clear();
                                msgBox.remove();
                                g.moreInfoView.updateParams(g.businessModelId, g.businessModelCode);
                            }
                        }]
                    });
                    return false;
                }
            },
            afterSelect: function (data) {
                var busModelId = data.data["businessModel.id"];
                g.businessModelId = busModelId;
                g.businessModelCode = data.data["businessModel.className"];
                g.moreInfoView.updateParams(g.businessModelId, g.businessModelCode);
            },
            reader: {
                name: "name",
                field: ["id"]
            },
            onSearch: function (data) {
                this.grid.setPostParams({
                    Quick_value: data
                }, true);
            }
        }, {
            xtype: "TextField",
            title: "流程代码",
            name: "id",
            width: isCopy && !isFromVersion ? 110 : 110,
            readonly: (!isCopy && this.id) || (isCopy && isFromVersion) ? true : false,
            labelWidth: 85,
            allowBlank: false,
            maxlength: 80,
            minlength: 6,
            validateText: "以字母开头，包含数字或字母，且长度在6-80之间",
            validater: function (data) {
                var reg = /^[A-Za-z][0-9a-zA-Z]*$/g;
                if (!reg.test(data)) {
                    return false;
                }
                return true;
            }
        }, {
            xtype: "TextField",
            title: "流程名称",
            labelWidth: 85,
            width: isCopy && !isFromVersion ? 159 : 235,
            allowBlank: false,
            name: "name"
        }];
        if (isCopy && !isFromVersion) {//流程定义参考创建
            item = [{
                xtype: "ComboTree",
                id: "orgtree",
                field: ["orgId", "orgCode"],
                name: "orgName",
                allowBlank: false,
                data: [],
                async: false,
                canClear: false,
                width: 130,
                treeCfg: {
                    showSearch: true,
                    autoLoad: true,
                    async: false,
                    url: _ctxPath + "/flowDefination/listAllOrgs",
                    showField: "name"
                },
                reader: {
                    field: ["id", "code"],
                    name: "name"
                },
                afterSelect: function (data) {
                    g.orgId = data.data.id;
                    g.orgCode = data.data.code;
                    g.orgName = data.data.name;
                }
            }].concat(item);
        }
        return [{
            xtype: "FormPanel",
            width: isCopy && !isFromVersion ? 848 : 800,
            isOverFlow: false,
            height: 40,
            padding: 0,
            layout: "auto",
            id: "formPanel",
            border: false,
            defaultConfig: {
                labelWidth: 88,
                allowBlank: false
            },
            items: item
        }, {
            xtype: "Button",
            title: "更多配置",
            handler: function () {
                if (!g.businessModelId) {
                    EUI.ProcessStatus({
                        success: false,
                        msg: "请先选择流程类型"
                    });
                    return;
                }
                if (g.moreShow) {
                    g.moreInfoView.hide();
                    g.moreShow = false;
                } else {
                    g.moreInfoView.show();
                    g.moreShow = true;
                }
            }
        }, "->", {
            xtype: "Button",
            selected: true,
            title: this.lang.deployText,
            iconCss: "ecmp-common-upload",
            handler: function () {
                g.save(true);
            }
        }, {
            xtype: "Button",
            title: this.lang.saveText,
            iconCss: "ecmp-common-save",
            handler: function () {
                g.save(false);
            }
        }, {
            xtype: "Button",
            title: this.lang.resetText,
            iconCss: "ecmp-common-clear",
            handler: function () {
                var msgBox = EUI.MessageBox({
                    title: "温馨提示",
                    msg: "清空设计将不能恢复，确定要继续吗？",
                    buttons: [{
                        title: "取消",
                        handler: function () {
                            msgBox.remove();
                        }
                    }, {
                        title: "确定",
                        selected: true,
                        handler: function () {
                            g.clear();
                            msgBox.remove();
                        }
                    }]
                });
            }
        }];
    },
    initMoreInfo: function (data) {
        var g = this;
        var isCopy = g.isCopy;
        var isFromVersion = g.isFromVersion;
        this.moreInfoView = new EUI.WorkFlowMoreInfoView({
            businessModelId: this.businessModelId,
            businessModelCode: this.businessModelCode,
            isCopy: isCopy,//参考创建
            isFromVersion: isFromVersion,//流程定义版本参考创建（true）
            data: data,
            parent: g,
            width: isCopy && !isFromVersion ? 925 : 877
        });
    },
    getLeftHtml: function () {
        var html = "";
        // 初始化事件
        html += this.initEventNode(_flownode.event);
        // 初始化任务
        html += this.initTaskNode(_flownode.task);
        // 初始化网关
        html += this.initGatewayNode(_flownode.gateway);
        return html;
    },
    initEventNode: function (events) {
        var html = "<div class='flow-item-box'>"
            + "<div class='flow-item-title select'>" + this.lang.eventTitleText + "</div>"
            + "<div class='flow-item-space'></div>"
            + "<div class='flow-item-content'>";
        // 初始化事件
        for (var i = 0; i < events.length; i++) {
            var item = events[i];
            if (i == events.length - 1) {
                html += "<div class='flow-event-box flow-node last' type='"
                    + item.type
                    + "'><div class='flow-event-iconbox'><div class='"
                    + item.css + "'></div></div>"
                    + "<div class='node-title'>" + this.lang[item.name]
                    + "</div></div>";
            } else {
                html += "<div class='flow-event-box flow-node' type='"
                    + item.type
                    + "'><div class='flow-event-iconbox'><div class='"
                    + item.css + "'></div></div>"
                    + "<div class='node-title'>" + this.lang[item.name]
                    + "</div></div>";
            }
        }
        html += "</div><div class='flow-item-space'></div></div>";
        return html;
    },
    initTaskNode: function (tasks) {
        var html = "<div class='flow-item-box'>"
            + "<div class='flow-item-title'>" + this.lang.taskTitleText + "</div>"
            + "<div class='flow-item-space'></div>"
            + "<div class='flow-item-content' style='display:none;'>";
        // 初始化事件
        for (var i = 0; i < tasks.length; i++) {
            var item = tasks[i];
            if (i == tasks.length - 1) {
                html += "<div class='flow-task-box last'>"
                    + "<div class='flow-task flow-node' type='" + item.type
                    + "' nodeType='" + item.nodeType + "'><div class='" + item.css + "'></div>"
                    + "<div class='node-title'>" + this.lang[item.name] + "</div>"
                    + "</div></div>";
            } else {
                html += "<div class='flow-task-box'>"
                    + "<div class='flow-task flow-node' type='" + item.type
                    + "' nodeType='" + item.nodeType + "'><div class='" + item.css + "'></div>"
                    + "<div class='node-title'>" + this.lang[item.name] + "</div>"
                    + "</div></div>";
            }
        }
        html += "</div><div class='flow-item-space'></div></div>";
        return html;
    },
    initGatewayNode: function (gateways) {
        var html = "<div class='flow-item-box'>"
            + "<div class='flow-item-title'>" + this.lang.gatewayTitleText + "</div>"
            + "<div class='flow-item-space'></div>"
            + "<div class='flow-item-content' style='display:none;'>";
        // 初始化事件
        for (var i = 0; i < gateways.length; i++) {
            var item = gateways[i];
            if (item.type == "EventGateway") {
                continue;
            }
            if (i == gateways.length - 1 || (gateways[i + 1].type == "EventGateway" && i == gateways.length - 2)) {
                html += "<div class='flow-gateway-box flow-node last' bustype='" + item.busType + "' type='"
                    + item.type + "'><div class='flow-gateway-iconbox'><div class='" + item.css + "'></div></div>"
                    + "<div class='node-title'>" + this.lang[item.name]
                    + "</div></div>";
            } else {
                html += "<div class='flow-gateway-box flow-node' bustype='" + item.busType + "' type='"
                    + item.type + "'><div class='flow-gateway-iconbox'><div class='" + item.css + "'></div></div>"
                    + "<div class='node-title'>" + this.lang[item.name]
                    + "</div></div>";
            }
        }
        html += "</div><div class='flow-item-space'></div></div>";
        return html;
    },
    getCenterHtml: function () {
        return "<div class='flow-content'></div>";
    },
    addEvents: function () {
        var g = this;
        $(".flow-item-title").bind("click", function () {
            if ($(this).hasClass("select")) {
                $(this).removeClass("select");
                $(this).siblings(".flow-item-content").slideUp("normal");
            } else {
                $(this).addClass("select");
                $(this).siblings(".flow-item-content").slideDown("normal");
            }
        });
        var dragging = false;
        var dragDom, preNode;
        $(".flow-node", ".flow-item-content").bind({
            "mousedown": function (event) {
                $(this).css("cursor", "move");
                preNode = $(this);
                var type = $(this).attr("type");
                if (type == "StartEvent") {
                    var nodeLength = $(".flow-event-box.flow-node.node-choosed.jtk-draggable.jtk-droppable[type='StartEvent']").length;
                    if (nodeLength == 1) {
                        return;
                    }
                }
                dragDom = $(this).clone().appendTo($("body"));
                g.count++;
                var nodeType = $(this).attr("nodetype");
                if (type == "UserTask" && nodeType == "CounterSign") {
                    dragDom.find(".countertask").addClass("parallel-countertask").removeClass("serial-countertask");
                }
                dragDom.attr("id", type + "_" + g.count);
                var titleText = dragDom.find(".node-title").html();
                dragDom.find(".node-title").attr("title", titleText);
                dragDom.addClass("node-choosed").attr("tabindex", 0);
                dragging = true;
            },
            "mouseenter": function () {
                var dom = $(this);
                g.initTipBox();
                var text = "";
                var addTop = 5;
                var type = dom.attr("type");
                switch (type) {
                    case "StartEvent":
                        addTop = 3;
                        text = "有且仅有一个，流程启动的入口";
                        break;
                    case "EndEvent":
                        text = "允许有多个，代表流程分支的结束";
                        break;
                    case "TerminateEndEvent":
                        text = "允许有多个，一旦执行，整个流程实例即宣告全部结束";
                        break;
                    case "UserTask":
                        addTop = 10;
                        var nodeType = dom.attr("nodetype");
                        if (nodeType == "Normal") {
                            text = "只允许一个人拥有待办，只允许一个人执行";
                        }
                        else if (nodeType == "SingleSign") {
                            text = "允许多个人拥有待办，只允许一个人执行，一旦任务被其中一个候选人签收或者执行，其他人对该任务即无权执行。";
                        }
                        else if (nodeType == "CounterSign") {
                            text = "多个参与人，必须每人都完成任务，通过会签决策配置的百分比决定流程走向。";
                        }
                        else if (nodeType == "Approve") {
                            text = "流程走向必须包含“同意”、“不同意”分支，只允许一个人拥有待办，只允许一个人执行审批";
                        }
                        else if (nodeType == "ParallelTask") {
                            text = "同时生成该节点的多个子任务，分配给不同的执行人，执行顺序没有先后。";
                        }
                        else if (nodeType == "SerialTask") {
                            text = "同时生成该节点的多个子任务，分配给不同的执行人，执行顺序有先后。";
                        }
                        break;
                    case "ExclusiveGateway":
                        var busType = dom.attr("bustype");
                        if (busType == "ExclusiveGateway") {
                            text = "只允许符合条件的一条分支路径执行成功，如果分支条件都不满足，走配置的默认分支。";
                        } else if (busType == "ManualExclusiveGateway") {
                            text = "由人工选择惟一的执行路径分支。";
                        }
                        break;
                    case "ParallelGateway":
                        text = "需要成对出现，允许将流程分成多条分支，也可以把多条分支汇聚到一起，并行网关不会解析条件。 即使顺序流中定义了条件，也会被忽略。";
                        break;
                    case "InclusiveGateway":
                        text = "可以看做是排他网关和并行网关的结合体。 和排他网关一样，你可以在外出顺序流上定义条件，包含网关会解析它们。 但是主要的区别是包含网关可以选择多于一条顺序流，这和并行网关一样。"
                        break;
                    case "EventGateway":
                        break;
                    case "ServiceTask":
                        text = "系统调用配置服务接口，自动执行"
                        break;
                    case "ManualTask":
                        text = "手动任务，手动任务几乎不在程序中做什么事情---只是在流程的历史中留下一点痕迹，表明流程是走过某些节点的，用于表示线下的某个动作或者当作空任务来做其他分支的合并"
                        break;
                    case "ReceiveTask":
                        text = "接收任务，当执行到该节点后流程暂时停止运行，直到收到外部发送的信号以后，才会继续向前推进";
                        break;
                    case "PoolTask":
                        text = "工作池任务，当执行到该节点后流程暂时停止运行，直到收到外部确定人执行人，才会继续向前推进";
                        break;
                    case "CallActivity":
                        text = "调用子流程，当流程执行到该节点时，会创建一个新分支，它是到达调用节点的流程的分支。 这个分支会用来执行子流程，默认创建并行子流程，就像一个普通的流程。 上级流程会等待子流程完成，然后才会继续向下执行。";
                        break;
                }
                g.showTipBox(dom, "<span>" + text + "</span>", addTop);
            },
            "mouseleave": function () {
                var $tipbox = $("div.tipbox");
                $tipbox.hide();
            }
        });
        $(".flow-content > .flow-node>.delete-node").live("click", function (e) {
            var dom = $(this).parent(".flow-node");
            var sourceId = dom.attr("id");
            if (!sourceId) {
                dom = $(this);
            }
            var mes = EUI.MessageBox({
                title: g.lang.hintText,
                msg: "确认删除？",
                buttons: [{
                    title: g.lang.cancelText,
                    handler: function () {
                        mes.remove();
                    }
                }, {
                    title: g.lang.okText,
                    selected: true,
                    handler: function () {
                        mes.remove();
                        g.instance.detachAllConnections(dom);
                        var sourceId = dom.attr("id");
                        for (var key in g.connectInfo) {
                            if (key.indexOf(sourceId) != -1) {
                                delete g.connectInfo[key];
                            }
                        }
                        for (var key in g.uelInfo) {
                            if (key.indexOf(sourceId) != -1) {
                                delete g.uelInfo[key];
                            }
                        }
                        dom.remove();
                        e.stopPropagation();
                    }
                }]
            });


        });
        $(".flow-content > .flow-node").die().live({
            "mouseleave": function () {
                $(this).children("div.delete-node").remove();
            },
            "mouseenter": function () {
                var className = $(this).attr("class");
                var cssName = "";
                if (className.indexOf("flow-event-box") != -1) {
                    cssName = "flow-event-delete";
                } else if (className.indexOf("flow-task") != -1) {
                    cssName = "flow-task-delete";
                } else if (className.indexOf("flow-gateway-box") != -1) {
                    cssName = "flow-gateway-delete";
                }
                $(this).append('<div class="' + cssName + ' delete-node"><i class="ecmp-flow-delete" title="删除"></i></div>');
            }
        });
        $(document).bind({
            "mousemove": function (event) {
                if (dragging) {
                    var e = event || window.event;
                    var oX = e.clientX - 20;
                    var oY = e.clientY - 35;
                    var css = {
                        "left": oX + "px",
                        "top": oY + "px"
                    };
                    if (g.isInCenter(dragDom)) {
                        css.cursor = "alias";
                    } else {
                        css.cursor = "no-drop";
                    }
                    dragDom.css(css);
                }
            },
            "mouseup": function (e) {
                if (dragging) {
                    preNode.css("cursor", "auto");
                    if (!g.isInCenter(dragDom)) {
                        dragDom.remove();
                    } else {
                        var centerDom = EUI.getCmp("center").content;
                        var offset = centerDom.offset();
                        var doffset = dragDom.offset();
                        dragDom.css({
                            cursor: "pointer",
                            opacity: 1,
                            left: doffset.left - offset.left + centerDom.scrollLeft(),
                            top: doffset.top - offset.top - 12 + centerDom.scrollTop()
                        });
                        var type = dragDom.attr("type");
                        if (type.indexOf("EndEvent") == -1) {
                            dragDom
                                .append("<div class='node-dot' action='begin'></div>");
                        }
                        $(".flow-content").append(dragDom);
                        dragDom.focus();
                        g.initNode(dragDom[0]);
                    }
                    dragging = false;
                }
            }
        });
        $(".node-choosed").live({
            click: function () {
                $(this).focus();
            },
            "keyup": function (e) {
                var code = e.keyCode || e.charCode;
                if (code == 46) {
                    var dom = $(this);
                    var mes = EUI.MessageBox({
                        title: g.lang.hintText,
                        msg: "确认删除？",
                        buttons: [{
                            title: g.lang.cancelText,
                            handler: function () {
                                mes.remove();
                            }
                        }, {
                            title: g.lang.okText,
                            selected: true,
                            handler: function () {
                                mes.remove();
                                g.instance.detachAllConnections(dom);
                                var sourceId = dom.attr("id");
                                for (var key in g.connectInfo) {
                                    if (key.indexOf(sourceId) != -1) {
                                        delete g.connectInfo[key];
                                    }
                                }
                                for (var key in g.uelInfo) {
                                    if (key.indexOf(sourceId) != -1) {
                                        delete g.uelInfo[key];
                                    }
                                }
                                dom.remove();
                                e.stopPropagation();
                            }
                        }]
                    });
                }
            },
            "dblclick": function () {
                var dom = $(this);
                var type = dom.attr("type");
                // if (type == "StartEvent" || type.indexOf("EndEvent") != -1) {
                //     return;
                // }
                if (!g.businessModelId) {
                    EUI.ProcessStatus({
                        success: false,
                        msg: "请先选择流程类型"
                    });
                    return;
                }
                var input = dom.find(".node-title");
                if (type == "StartEvent" || type.indexOf("EndEvent") != -1 || type.endsWith("Gateway") || type == 'ManualTask') {
                    g.showSimpleNodeConfig(input.text(), null, null, type,dom.data().allowChooseInstancyNew, function (value, code,allowChooseInstancyNew) {
                        input.text(value);
                        input.attr("title", value);
                        // dom.data({"allowChooseInstancyNew":allowChooseInstancyNew});
                    });
                } else {
                    var nodeType = dom.attr("nodeType");
                    new EUI.FlowNodeSettingView({
                        title: input.text(),
                        businessModelId: g.businessModelId,
                        businessModelCode: g.businessModelCode,
                        flowDefinitionId: g.id,
                        data: dom.data(),
                        nodeType: nodeType,
                        type: type,
                        isSolidifyFlow: g.isSolidifyFlow,
                        afterConfirm: function (data) {
                            input.text(data.normal.name);
                            input.attr("title", data.normal.name);
                            dom.data(data);
                            if (data.normal.isSequential) {
                                dom.find(".countertask").addClass("serial-countertask").removeClass("parallel-countertask");
                            } else {
                                dom.find(".countertask").addClass("parallel-countertask").removeClass("serial-countertask");
                            }
                        }
                    });
                }
            }
        });
        $(".jtk-connector").live("keyup", function (e) {
            var code = e.keyCode || e.charCode;
            if (code == 46) {
                g.instance.detachAllConnections($(this));
                $(this).remove();
                e.stopPropagation();
            }
        });
        $(".node-delete").live("keyup", function (e) {
            var code = e.keyCode || e.charCode;
            if (code == 46) {
                g.instance.detachAllConnections($(this));
                $(this).remove();
                e.stopPropagation();
            }
        });
    },
    initTipBox: function () {
        if ($(".tipbox").length != 0) {
            return;
        }
        var $tipbox = $("<div class='tipbox' style='display:none;'></div>");
        var $h = $('<h3></h3>');
        var $c = $('<div class="tip_content"></div>');
        $tipbox.append($h).append($c);
        $tipbox.appendTo('body');
    },
    showTipBox: function (thisdom, content, addTop) {
        var tboxes = $("div.tipbox");
        var $tipbox, title = "描述";
        for (var i = 0; i < tboxes.length; i++) {
            if (tboxes[i].id === "") {
                $tipbox = $(tboxes[i]);
                break;
            }
        }
        var $h = $tipbox.find("h3");
        var $c = $tipbox.find("div");
        $h.html(title);
        $c.html(content);
        var pos = thisdom.offset();
        var top = thisdom.height() + addTop;
        var left = thisdom.width() / 2;
        //var width = 340;
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
            //"width": width,
            "max-width": 420,
            "max-height": 130,
            "z-index": "9999999"
        }).show();
    },
    isInCenter: function (dom) {
        var offset = EUI.getCmp("center").getDom().offset();
        var domOffset = dom.offset();
        if (offset.left < domOffset.left && offset.top < domOffset.top) {
            return true;
        }
    }
    ,
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
            }], ["Label", {
                location: 0.7,
                id: "delete",
                label: "&times",
                visible: false,
                cssClass: "node-delete",
                events: {
                    click: function (overlay, originalEvent) {
                        var connection = overlay.component;
                        if (g.gDeleteConnectionId) {
                            return;
                        } else {
                            g.gDeleteConnectionId = connection.id;
                        }
                        if (g.connectInfo && g.connectInfo[connection.sourceId + "," + connection.targetId]) {
                            var mes = EUI.MessageBox({
                                title: g.lang.hintText,
                                msg: '确认删除？',
                                buttons: [{
                                    title: g.lang.cancelText,
                                    handler: function () {
                                        g.gDeleteConnectionId = null;
                                        mes.remove();
                                    }
                                }, {
                                    title: g.lang.okText,
                                    selected: true,
                                    handler: function () {
                                        mes.remove();
                                        g.gDeleteConnectionId = null;
                                        delete g.uelInfo[connection.sourceId + "," + connection.targetId];
                                        delete g.connectInfo[connection.sourceId + "," + connection.targetId];
                                        g.instance.detach(connection);
                                    }
                                }]
                            });
                        }
                    }
                }
            }]],
            Container: $(".flow-content")
        });

        this.instance.registerConnectionType("basic", {
            anchor: "Continuous",
            connector: ["Flowchart", {
                stub: [0, 0],
                cornerRadius: 0
            }]
        });
        // 双击连线弹出UEL配置界面
        this.instance.bind("dblclick", function (connection) {
            if (!g.businessModelId) {
                EUI.ProcessStatus({
                    success: false,
                    msg: "请先选择流程类型"
                });
                return;
            }
            var ueldata = g.uelInfo[connection.sourceId + "," + connection.targetId];
            var type = $("#" + connection.sourceId).attr("type");
            var noUELSetting = false;
            if (type == "StartEvent") {
                noUELSetting = true;
            }
            else if (type == "UserTask") {
                var nodeType = $("#" + connection.sourceId).attr("nodetype");
                switch (nodeType) {
                    case "SingleSign":  //单签
                    case "Normal":      //普通
                    case "ParallelTask"://并行
                    case "SerialTask":  //串行
                        noUELSetting = true;
                        break;
                    default:
                        break;
                }
            }
            var busType = $("#" + connection.sourceId).attr("bustype");
            if (busType == "ManualExclusiveGateway" || busType == "ParallelGateway" || noUELSetting) {
                var name = ueldata ? ueldata.name : "";
                var code = ueldata ? ueldata.code : "";
                g.showSimpleNodeConfig(name, code, connection,busType,null, function (value, code,allowChooseInstancyNew) {
                    g.uelInfo[connection.sourceId + "," + connection.targetId] = {
                        name: value,
                        code: code,
                        groovyUel: "",
                        logicUel: ""
                    };
                    var overlay = connection.getOverlay("label");
                    overlay.setLabel(value);
                    $(overlay.canvas).attr("title", value);
                    overlay.show();
                });
                return;
            }
            var nodeType = $("#" + connection.sourceId).attr("nodetype");
            if (nodeType == "Approve" || nodeType == "CounterSign") {
                return;
            }
            new EUI.UELSettingView({
                title: "表达式配置",
                data: ueldata,
                businessModelId: g.businessModelId,
                businessModelCode: g.businessModelCode,
                flowTypeId: EUI.getCmp("formPanel").getFormValue().flowTypeId,
                afterConfirm: function (data) {
                    g.uelInfo[connection.sourceId + "," + connection.targetId] = data;
                    var overlay = connection.getOverlay("label");
                    overlay.setLabel(data.name);
                    $(overlay.canvas).attr("title", data.name);
                    overlay.show();
                }
            });
        });
        //delete删除连线
        this.instance.bind("mouseover", function (connection) {
            connection.getOverlay("delete").show();

            //连接即显示同意不同意
            if (g.connectInfo[connection.sourceId + "," + connection.targetId]) {
                // jsPlumb.detach(connection);
                return;
            }
            var busType = $("#" + connection.sourceId).attr("bustype");
            if (busType == "ExclusiveGateway" || busType == "InclusiveGateway") {
                var overlay = connection.getOverlay("label");
                overlay.setLabel("默认");
                $(overlay.canvas).attr("title", "默认");
                overlay.show();
            } else {
                var nodeType = $("#" + connection.sourceId).attr("nodetype");
                if (nodeType == "Approve") {
                    var result = g.getApproveLineInfo(connection.sourceId);
                    var name = "同意", agree = true;
                    if (result == 0) {
                        name = "不同意";
                        agree = false;
                    }
                    var overlay = connection.getOverlay("label");
                    overlay.setLabel(name);
                    $(overlay.canvas).attr("title", name);
                    overlay.show();
                } else if (nodeType == "CounterSign") {
                    var result = g.getApproveLineInfo(connection.sourceId);
                    var name = "通过", agree = true;
                    if (result == 0) {
                        name = "未通过";
                        agree = false;
                    }
                    var overlay = connection.getOverlay("label");
                    overlay.setLabel(name);
                    $(overlay.canvas).attr("title", name);
                    overlay.show();
                }
            }
        });
        this.instance.bind("mouseout", function (connection) {
            connection.hideOverlay("delete");
        });
        // 连接事件
        this.instance.bind("connection", function (connection, originalEvent) {
            if (g.connectInfo[connection.sourceId + "," + connection.targetId]) {
                jsPlumb.detach(connection);
                return;
            }
            g.connectInfo[connection.sourceId + "," + connection.targetId] = true;
            var uel = g.uelInfo[connection.sourceId + "," + connection.targetId];
            if (uel) {
                var overlay = connection.connection.getOverlay("label");
                overlay.setLabel(uel.name);
                $(overlay.canvas).attr("title", uel.name);
                overlay.show();
            } else {
                var busType = $("#" + connection.sourceId).attr("bustype");
                if (busType == "ExclusiveGateway" || busType == "InclusiveGateway") {
                    var overlay = connection.connection.getOverlay("label");
                    overlay.setLabel("默认");
                    $(overlay.canvas).attr("title", "默认");
                    overlay.show();
                    g.uelInfo[connection.sourceId + "," + connection.targetId] = {
                        name: "默认",
                        isDefault: true,
                        logicUel: "",
                        groovyUel: ""
                    };
                } else {
                    var nodeType = $("#" + connection.sourceId).attr("nodetype");
                    if (nodeType == "Approve") {
                        var bustype = $("#" + connection.targetId).attr("bustype");
                        if (bustype == "ManualExclusiveGateway") {
                            var nodeName = connection.source.innerText.trim();
                            EUI.ProcessStatus({
                                success: false,
                                msg: "审批任务后禁止连接人工网关"
                            });
                            jsPlumb.detach(connection);
                            delete g.uelInfo[connection.sourceId + "," + connection.targetId];
                            delete g.connectInfo[connection.sourceId + "," + connection.targetId];
                            return;
                        }
                        var result = g.getApproveLineInfo(connection.sourceId);
                        var name = "同意", agree = true;
                        if (result == 0) {
                            name = "不同意";
                            agree = false;
                        }
                        var overlay = connection.connection.getOverlay("label");
                        overlay.setLabel(name);
                        $(overlay.canvas).attr("title", name);
                        overlay.show();
                        if (agree) {
                            g.uelInfo[connection.sourceId + "," + connection.targetId] = {
                                name: name,
                                agree: agree,
                                groovyUel: "${approveResult == " + agree + "}",
                                logicUel: ""
                            };
                        } else {
                            g.uelInfo[connection.sourceId + "," + connection.targetId] = {
                                name: name,
                                isDefault: true,
                                logicUel: "",
                                groovyUel: ""
                            };
                        }

                    } else if (nodeType == "CounterSign") {
                        var bustype = $("#" + connection.targetId).attr("bustype");
                        if (bustype == "ManualExclusiveGateway") {
                            EUI.ProcessStatus({
                                success: false,
                                msg: "会签任务后禁止连接人工网关"
                            });
                            jsPlumb.detach(connection);
                            delete g.uelInfo[connection.sourceId + "," + connection.targetId];
                            delete g.connectInfo[connection.sourceId + "," + connection.targetId];
                            return;
                        }
                        var result = g.getApproveLineInfo(connection.sourceId);
                        var name = "通过", agree = true;
                        if (result == 0) {
                            name = "未通过";
                            agree = false;
                        }
                        var overlay = connection.connection.getOverlay("label");
                        overlay.setLabel(name);
                        $(overlay.canvas).attr("title", name);
                        overlay.show();
                        if (agree) {
                            g.uelInfo[connection.sourceId + "," + connection.targetId] = {
                                name: name,
                                agree: agree,
                                groovyUel: "${approveResult == " + agree + "}",
                                logicUel: ""
                            };
                        } else {
                            g.uelInfo[connection.sourceId + "," + connection.targetId] = {
                                name: name,
                                isDefault: true,
                                logicUel: "",
                                groovyUel: ""
                            };
                        }

                    }
                    var type = $("#" + connection.sourceId).attr("type");
                    var nodeType = $("#" + connection.sourceId).attr("nodetype");
                    var busType = $("#" + connection.targetId).attr("bustype");
                    var name = $("#" + connection.sourceId).children(".node-title").text();
                    if ((type == "StartEvent" || nodeType == "CallActivity") && busType == "ManualExclusiveGateway") {
                        EUI.ProcessStatus({
                            success: false,
                            msg: name + "任务后禁止连接人工网关"
                        });
                        jsPlumb.detach(connection);
                        delete g.uelInfo[connection.sourceId + "," + connection.targetId]
                        delete g.connectInfo[connection.sourceId + "," + connection.targetId];
                        return;
                    }
                }
            }
        });
    },
    getApproveLineInfo: function (id) {
        for (var key in this.uelInfo) {
            if (key.startsWith(id + ",")) {
                var uel = this.uelInfo[key];
                if (uel.agree) {
                    return 0;
                } else {
                    return 1;
                }
            }
        }
    },
    initNode: function (el) {
        this.instance.draggable(el);
        var maxConnections = -1;
        var nodeType = $(el).attr("nodetype");
        if (nodeType == "Approve" || nodeType == "CounterSign") {
            maxConnections = 2;
        } else if (nodeType) {
            maxConnections = 1;
        } else if ($(el).attr("type") == "StartEvent") {
            maxConnections = 1;
        }
        this.instance.makeSource(el, {
            filter: ".node-dot",
            anchor: "Continuous",
            connector: ["Flowchart", {
                stub: [0, 0],
                cornerRadius: 0
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
                outlineWidth: 5,
                outlineStroke: "white"
            },
            connectionType: "basic",
            maxConnections: maxConnections
        });

        if ($(el).attr("type") != "StartEvent") {
            this.instance.makeTarget(el, {
                anchor: "Continuous",
                allowLoopback: false,
                beforeDrop: function (params) {
                    if (params.sourceId == params.targetId) {
                        return false;
                    }
                    return true;
                }
            });
        }
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
    checkValid: function () {
        var nodes = $(".node-choosed");
        if (!nodes || nodes.length <= 0) {
            EUI.ProcessStatus({
                msg: "请完成流程设计",
                success: false
            });
            return false;
        }
        for (var i = 0; i < nodes.length; i++) {
            var item = $(nodes[i]);
            var id = item.attr("id");
            var type = item.attr("type");
            var nodeType = item.attr("nodetype");
            var name = item.find(".node-title").text();
            var nodeConfig = item.data();
            if ((type.indexOf("Task") != -1 || nodeType == "CallActivity") && Object.isEmpty(nodeConfig) && type != 'ManualTask') {
                EUI.ProcessStatus({
                    success: false,
                    msg: "请将节点：" + name + "，配置完整"
                });
                return;
            }

            if (nodeType == "Approve" || nodeType == "CounterSign") {
                var result = this.checkApproveAndCounterSign(id, name);
                if (!result) {
                    return;
                }
            }
            var flag = false;
            if (type == "StartEvent" || type == "EndEvent" || type == "TerminateEndEvent") {
                for (var key in this.connectInfo) {
                    if (key.indexOf(id) != -1) {
                        flag = true;
                        break;
                    }
                }
            } else {
                var ruIndex = false;
                var chuIndex = false;
                for (var key in this.connectInfo) {
                    var keyVar = key.split(",");
                    if (keyVar[0] == id) {
                        chuIndex = true;
                    } else if (keyVar[1] == id) {
                        ruIndex = true;
                    }
                    if (ruIndex && chuIndex) {
                        flag = true;
                        break;
                    }
                }
                if (!ruIndex) {
                    EUI.ProcessStatus({
                        success: false,
                        msg: String.format(this.lang.noConnectLineRuText, name)
                    });
                    return false;
                }
                if (!chuIndex) {
                    EUI.ProcessStatus({
                        success: false,
                        msg: String.format(this.lang.noConnectLineChuText, name)
                    });
                    return false;
                }
            }

            if (!flag) {
                EUI.ProcessStatus({
                    success: false,
                    msg: String.format(this.lang.noConnectLineText, name)
                });
                return false;
            }
        }
        return true;
    }
    ,
    checkApproveAndCounterSign: function (id, name) {
        var count = 0;
        for (var key in this.connectInfo) {
            if (key.startsWith(id + ",")) {
                count++;
            }
        }
        if (count != 2) {
            EUI.ProcessStatus({
                success: false,
                msg: "节点：" + name + "需要配置两条连线"
            });
            return false;
        }
        return true;
    },
    getFlowData: function () {
        if (!this.checkValid()) {
            return;
        }
        var headForm = EUI.getCmp("formPanel");
        if (!headForm.isValid()) {
            EUI.ProcessStatus({
                success: false,
                msg: "请将流程信息填写完整"
            });
            return;
        }
        var baseInfo = headForm.getFormValue();
        var nodes = $(".node-choosed");
        var baseDoms = $(".flow-info-text");
        var moreInfo = this.moreInfoView.getData();
        var process = {
            name: baseInfo.name,
            id: $.trim(baseInfo.id),
            flowDefVersionId: this.flowDefVersionId || "",
            isExecutable: true,
            nodes: {}
        };
        EUI.apply(process, moreInfo);
        delete process.subProcess;
        delete process.solidifyFlow;
        delete process.priority;
        var parentPos = $(".flow-content").position();
        for (var i = 0; i < nodes.length; i++) {
            var item = $(nodes[i]);
            var id = item.attr("id");
            var type = item.attr("type");
            var name = item.find(".node-title").text();
            var nodeConfig = item.data();
            if(this.isSolidifyFlow==true && nodeConfig.normal && nodeConfig.normal.singleTaskNoChoose){
               nodeConfig.normal.singleTaskNoChoose = false;
            }
            var node = {
                    type: type,
                    x: item.position().left - parentPos.left + 1,
                    y: item.position().top - parentPos.top + 1,
                    id: id,
                    nodeType: item.attr("nodeType"),
                    target: [],
                    name: name,
                    nodeConfig: nodeConfig
                }
            ;
            if (node.type.endsWith("Gateway")) {
                node.busType = item.attr("bustype");
            }
            var defaultCount = 0;
            for (var key in this.connectInfo) {
                if (key.startsWith(id + ",")) {
                    var item = {
                        targetId: key.split(",")[1],
                        uel: this.uelInfo[key] || ""
                    };
                    if ((node.busType == "ExclusiveGateway" || node.busType == "InclusiveGateway")
                        && item.uel && item.uel.isDefault) {
                        defaultCount++;
                    }
                    node.target.push(item);
                }
            }
            if (defaultCount > 1) {
                EUI.ProcessStatus({
                    success: false,
                    msg: node.name + "：最多只能有1个默认路径，请修改配置"
                });
                return;
            }
            process.nodes[id] = node;
        }
        return {
            flowTypeId: baseInfo.flowTypeId,
            //flowTypeName: baseInfo.flowTypeName,
            orgId: this.orgId,
            orgCode: this.orgCode,
            id: this.id,
            versionCode: this.versionCode,
            priority: moreInfo.priority,
            businessModelId: this.businessModelId,
            subProcess: moreInfo.subProcess,
            solidifyFlow: moreInfo.solidifyFlow,
            process: process
        };
    }
    ,
    loadData: function (data) {
        var g = this;
        var mask = EUI.LoadMask({
            msg: "正在获取数据，请稍候..."
        });
        EUI.Store({
            url: _ctxPath + "/design/getEntity",
            params: {
                id: this.id,
                versionCode: this.versionCode
            },
            success: function (status) {
                mask.hide();
                if (status.success && status.data) {
                    g.flowDefVersionId = status.data.id;
                    var data = JSON.parse(status.data.defJson);
                    if (g.isCopy) {
                        if (!g.isFromVersion) {
                            data.process.id = data.process.id + "COPY";
                            g.id = null;
                        }
                        data.process.name = data.process.name + "COPY";
                    }
                    data.flowTypeName = status.data.flowDefination.flowType.name;
                    g.showDesign(data);
                } else {
                    EUI.ProcessStatus(status);
                }
            },
            failure: function (status) {
                mask.hide();
                EUI.ProcessStatus(status);
            }
        });
    }
    ,
    showDesign: function (data) {
        this.loadHead(data);
        if (this.isCopy && !this.isFromVersion) {
            EUI.getCmp("orgtree").setSubmitValue({
                orgName: this.orgName,
                orgId: this.orgId,
                orgCode: this.orgCode,
            });
        }
        var html = "";
        for (var id in data.process.nodes) {
            var node = data.process.nodes[id];
            var type = node.type;
            if (type == "StartEvent") {
                html += this.showStartNode(id, node);
            } else if (type.indexOf("EndEvent") != -1) {
                html += this.showEndNode(id, node);
            } else if (type.indexOf("Task") != -1 || type == "CallActivity") {
                html += this.showTaskNode(id, node);
            } else if (type.indexOf("Gateway") != -1) {
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
            item.data(data.process.nodes[id].nodeConfig);
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
    },
    loadHead: function (data) {
        EUI.getCmp("formPanel").loadData({
            name: data.process.name,
            id: data.process.id,
            flowTypeId: data.flowTypeId,
            flowTypeName: data.flowTypeName
        });
        var moreInfo = EUI.apply({
            solidifyFlow: data.solidifyFlow,
            subProcess: data.subProcess,
            priority: data.priority
        }, data.process);
        this.initMoreInfo(moreInfo);
    },
    showStartNode: function (id, node) {
        return "<div tabindex=0 type='StartEvent' id='"
            + id
            + "' class='flow-event-box flow-node node-choosed'  style='cursor: pointer; left: "
            + node.x
            + "px; top: "
            + node.y
            + "px; opacity: 1;'>"
            + "<div class='flow-event-iconbox'><div class='flow-event-start'></div></div>"
            + "<div class='node-title' title='" + this.lang.startEventText + "'>" + this.lang.startEventText + "</div>"
            + "<div class='node-dot' action='begin'></div></div>";
    }
    ,
    showEndNode: function (id, node) {
        var css = "flow-event-end";
        if (node.type == "TerminateEndEvent") {
            css = "flow-event-terminateend";
        }
        return "<div tabindex=0 type='" + node.type + "' id='"
            + id
            + "' class='flow-event-box flow-node node-choosed' style='cursor: pointer; left: "
            + node.x
            + "px; top: "
            + node.y
            + "px; opacity: 1;'>"
            + "<div class='flow-event-iconbox'><div class='" + css + "'></div></div>"
            + "<div class='node-title' title='" + node.name + "'>" + node.name + "</div>	</div>";
    }
    ,
    showTaskNode: function (id, node) {
        var css = node.css;
        if (!css) {
            switch (node.nodeType) {
                case "Normal":
                    css = "usertask";
                    break;
                case "SingleSign":
                    css = "singletask";
                    break;
                case "CounterSign":
                    css = "countertask";
                    if (node.nodeConfig.normal.isSequential == "true") {
                        node.nodeConfig.normal.isSequential = true;
                    } else if (node.nodeConfig.normal.isSequential == "false") {
                        node.nodeConfig.normal.isSequential = false;
                    }
                    if (node.nodeConfig && node.nodeConfig.normal.isSequential) {
                        css = "countertask serial-countertask";
                    } else {
                        css = "countertask parallel-countertask";
                    }
                    break;
                case "Approve":
                    css = "approvetask";
                    break;
                case "ParallelTask":
                    css = "paralleltask";
                    break;
                case "SerialTask":
                    css = "serialtask";
                    break;
                case "ServiceTask":
                    css = "servicetask";
                    break;
                case "ManualTask":
                    css = "manualtask";
                    break;
                case "ReceiveTask":
                    css = "receiveTask";
                    break;
                case "PoolTask":
                    css = "poolTask";
                    break;
                case "CallActivity":
                    css = "callActivity";
                    break;
            }
        }
        return "<div tabindex=0 id='" + id
            + "' class='flow-task flow-node node-choosed' type='"
            + node.type + "' nodeType='" + node.nodeType + "' style='cursor: pointer; left: "
            + node.x + "px; top: " + node.y + "px; opacity: 1;'>"
            + "<div class='" + css + "'></div>"
            + "<div class='node-title' title='" + node.name + "'>" + node.name + "</div>"
            + "<div class='node-dot' action='begin'></div></div>";
    }
    ,
    showGatewayNode: function (id, node) {
        var css = node.type.toLowerCase();
        if (node.busType == "ManualExclusiveGateway") {
            css = "manualExclusivegateway";
        }
        return "<div tabindex=0 id='" + id
            + "' class='flow-event-box flow-node node-choosed' bustype='" + node.busType + "' type='"
            + node.type + "' style='cursor: pointer; left: "
            + node.x + "px; top: " + node.y + "px; opacity: 1;'>"
            + "<div class='flow-gateway-iconbox'>"
            + "<div class='" + css + "'></div></div>"
            + "<div class='node-title gateway-title' title='" + node.name + "'>" + node.name + "</div>"
            + "<div class='node-dot' action='begin'></div></div>";
    }
    ,
    save: function (deploy) {
        var g = this;
        var data = this.getFlowData();
        if (!data) {
            return;
        }
        var mask = EUI.LoadMask({
            msg: this.lang.nowSaveMsgText
        });
        EUI.Store({
            url: _ctxPath + "/design/save",
            params: {
                def: JSON.stringify(data),
                deploy: deploy
            },
            isUrlParam: false,
            postType: 'json',
            success: function (result) {
                mask.hide();
                EUI.ProcessStatus(result);
                if (result.success) {
                    // if(g.isCopy&&!g.deploy){
                    g.id = result.data.flowDefination ? result.data.flowDefination.id : result.data.data.flowDefination.id;
                    // }
                }
            },
            failure: function (result) {
                mask.hide();
                EUI.ProcessStatus(result);
            }
        })
    },
    clear: function () {
        this.count = 0;
        this.connectInfo = {};
        this.uelInfo = {};
        this.startUEL = null;
        this.instance.deleteEveryEndpoint();
        $(".node-choosed").remove();
    },
    showSimpleNodeConfig: function (title, code, connection, type,allowChooseInstancyOld, callback) {
        var g = this;
        var sourceId = '';
        var myItems = [{
            xtype: "TextField",
            title: "名称",
            labelWidth: 80,
            width: 220,
            maxlength: 80,
            id: "nodeName",
            name: "name",
            value: title
        }];
        // if (type == "StartEvent") {
        //     myItems.push({
        //         xtype: "CheckBox",
        //         title: "允许选择紧急状态",
        //         labelWidth: 140,
        //         id: "allowChooseInstancy",
        //         name: "allowChooseInstancy",
        //         value: allowChooseInstancyOld
        //
        //     });
        // }
        if (connection) {
            sourceId = connection.sourceId;
            myItems.push({
                xtype: "TextField",
                title: "代码",
                labelWidth: 80,
                width: 220,
                maxlength: 80,
                id: "nodeFlowCode",
                name: "code",
                value: code
            });
        }
        var win = EUI.Window({
            // height: connection ?(type == "StartEvent"?90:50) :(type == "StartEvent"?70:35),
            height: connection ?50 :35,
            padding: 30,
            items: myItems,
            buttons: [{
                title: "取消",
                handler: function () {
                    win.close();
                }
            }, {
                title: "保存",
                selected: true,
                handler: function () {
                    var name = EUI.getCmp("nodeName").getValue();
                    var codeNew = '';
                    if (connection) {
                        codeNew = EUI.getCmp("nodeFlowCode").getValue();
                    }
                    var allowChooseInstancyNew = null;
                    if(EUI.getCmp("allowChooseInstancy")){
                        allowChooseInstancyNew = EUI.getCmp("allowChooseInstancy").getValue();
                    }
                    if (codeNew) {
                        for (var key in g.connectInfo) {
                            if (key.startsWith(sourceId + ",")) {
                                if (key == sourceId + "," + connection.targetId) {
                                    continue;
                                }
                                var value = g.uelInfo[key];
                                if (value && value.code) {
                                    if (codeNew == value.code) {
                                        EUI.ProcessStatus({
                                            success: false,
                                            msg: "代码冲突，请检查！"
                                        });
                                        return;
                                    }
                                }
                            }
                        }
                    }
                    if (!EUI.getCmp("nodeName").sysValidater()) {
                        EUI.ProcessStatus({
                            success: false,
                            msg: "最大长度为80"
                        });
                        return;
                    }
                    callback && callback.call(this, name, codeNew,allowChooseInstancyNew);
                    win.close();
                }
            }]
        });
    }
})
;
