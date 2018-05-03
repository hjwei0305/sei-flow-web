/**
 * *************************************************************************************************
 * <br>
 * 实现功能：工作流组件
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 版本          变更时间             变更人                     变更原因
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 1.0.00      2017/6/20 15:29      詹耀(xxxlimit)                    新建
 * <br>
 * *************************************************************************************************<br>
 */
window.Flow = {};
EUI.ns("Flow.flow");
/*
 * 审批组件
 * */
EUI.FlowApprove = function (options) {
    options.busId = EUI.util.getUrlParam("id");
    options.taskId = EUI.util.getUrlParam("taskId");
    $("body").css({
        "min-width": "1260px",
        "overflow": "auto"
    });
    $("html").css({
        "overflow": "auto"
    });

    return new Flow.EUI.FlowApprove(options);
};
Flow.EUI.FlowApprove = EUI.extend(EUI.CustomUI, {
    renderTo: null,
    busId: null,
    taskId: null,
    desionType: 0,//0表示单选、1多选，2不需要选择
    instanceId: null,
    iframeHeight: 700,
    pageUrl: null,
    submitUrl: null,
    manualSelected: false,//是否是人工选择的网关类型
    goNext: null,
    iframe: null,
    counterApprove: "",//会签审批
    toChooseUserData: null,
    initComponent: function () {
        this.pageUrl += "?id=" + this.busId;
        EUI.Container({
            renderTo: this.renderTo,
            html: this.initHtml()
        });
        this.getHeadData();
        this.getNodeInfo();
        this.addEvents();
        this.iframe = $(".flow-iframe")[0].contentWindow;
    },
    initHtml: function () {
        var firstHtml = '<div class="flow-approve">' + this.initTopHtml() + this.initOperateHtml() + this.initFrameHtml() + '</div>';
        return firstHtml + this.initChooseUserHtml();
    },
    initTopHtml: function () {
        return '<div class="flow-info">' +
            '        <div class="flow-info-item">' +
            '            <div class="flow-ordernum">' + this.lang.businessUnitText + '</div>' +
            '            <div style="padding: 0 0 20px 20px;">' +
            '                <div class="flow-info-creater">' + this.lang.docMarkerText + '</div>' +
            '                <div class="flow-info-createtime"></div>' +
            '            </div>' +
            '        </div>' +
            '        <div class="flow-info-item" style="border-left:1px solid #dddddd ;">' +
            '            <div>' +
            '                <div class="flow-info-text">' + this.lang.preExecutorText + '</div>' +
            '                <div class="flow-info-excutor"></div>' +
            '            </div>' +
            '            <div style="padding-top: 6px;">' +
            '                <div class="flow-info-text">' + this.lang.preApprovalOpinionsText + '</div>' +
            '                <div class="flow-info-remark"></div>' +
            '            </div>' +
            '        </div>' +
            '    </div>';
    },
    initOperateHtml: function () {
        return '<div style="height: 200px;">' +
            '        <div class="flow-decision">' +
            '            <div class="flow-nodetitle">' + this.lang.decisionText + '</div>' +
            '            <div class="flow-decision-box">' +
            '        </div></div>' +
            '        <div class="flow-info-item" style="border-left:1px solid #dddddd;">' +
            '            <div class="flow-deal-opinion"><div class="flow-nodetitle">' + this.lang.handlingSuggestionText + '</div><div id="flow-deal-checkbox"></div></div>' +
            '            <textarea class="flow-remark"></textarea>' +
            '            <span class="flow-btn flow-next">' + this.lang.nextStepText + '</span>' +
            '        </div>' +
            '    </div>';
    },
    //处理意见中的选项框
    initDealCheckBox: function () {
        var g = this;
        g.counterApprove = true;
        var agree = "同意",disagree = "不同意";
        EUI.RadioBoxGroup({
            renderTo: "flow-deal-checkbox",
            name: "approved",
            items: [{
                title: agree,
                name: "true",
                value: true,
                onChecked: function (value) {
                    g.counterApprove = true;
                    $(".flow-remark").val(agree);
                }
            }, {
                title: disagree,
                name: "false",
                onChecked: function (value) {
                    g.counterApprove = false;
                    $(".flow-remark").val("");
                }
            }],
            afterRender: function(){
                $(".flow-remark").val(agree);
            }
        })
    },
    initFrameHtml: function () {
        var html = '<div>' +
            '        <div class="flow-order-titlebox">' +
            '            <div style="display: inline-block;">' +
            this.lang.formDetailText +
            '            </div>' +
            '            <div class="close">' + this.lang.collectText + '</div>' +
            '        </div>';
        html += '<iframe class="flow-iframe" height="700" src="' + this.pageUrl +  '"></iframe>';
    //    html += '<iframe class="flow-iframe" src="' + this.pageUrl + '" style="height:' + this.iframeHeight + 'px"></iframe>';
        return html += "</div>";
    },
    //选择下一步执行人页面
    initChooseUserHtml: function () {
        return '<div class="flow-chooseuser">' +
            '     <div class="chooseuser-title">' + this.lang.chooseNextExecutorText + '</div>' +
            '     <div class="flow-operate">' +
            '        <div class="flow-btn pre-step">' + this.lang.previousStepText + '</div>' +
            '        <div class="flow-btn submit">' + this.lang.submitText + '</div>' +
            '     </div>'+
            '   </div>';
    },
    addEvents: function () {
        var g = this;
        $(".flow-next").bind("click", function () {
            if (g.isEnd) {
                var endEventId = $(".select", ".flow-decision-box").attr("id");
                g.submit(endEventId);
            } else {
                g.goToNext();
            }
        });
        $(".pre-step").bind("click", function () {
            $(".flow-approve").show();
            $(".flow-chooseuser").hide();
        });

        $(".flow-order-titlebox").toggle(function () {
            $(".flow-iframe").show();
            $(".expand").text(g.lang.collectText).addClass("close").removeClass("expand");
        }, function () {
            $(".flow-iframe").hide();
            $(".close").text(g.lang.spreadText).addClass("expand").removeClass("close");
        });
        //决策选择
        $(".flow-decision-item").live("click", function () {
            if (g.desionType === 2) {
                return;
            }
            $(".flow-decision-item").removeClass("select");
            $(this).addClass("select");
            var type = $(this).attr("type");
            if (type.toLowerCase().indexOf("endevent") !== -1) {
                g.isEnd = true;
                $(".flow-next").text(g.lang.finishText);
            } else {
                $(".flow-next").text(g.lang.nextStepText);
                g.isEnd = false;
            }
        });
        //执行人选择
        $(".flow-user-item").die().live("click", function () {
            var type = $(this).attr("type").toLowerCase();
            if (type === "common"||type === "approve"|| type === "servicetask") {
                if ($(this).parent().children("div").length === 1) {
                    if ($(this).hasClass("select")) {
                        $(this).removeClass("select");
                    } else {
                        $(this).addClass("select");
                    }
                } else {
                    $(this).addClass("select").siblings().removeClass("select");
                }
            } else if (type === "singlesign" || type === "countersign" || type === "paralleltask" || type === "serialtask") {
                if ($(this).hasClass("select")) {
                    $(this).removeClass("select");
                } else {
                    $(this).addClass("select");
                }
            }
        });

        //选择任意执行人
        $(".choose-btn").die().live("click", function () {
            var currentChooseDivIndex = $(this).parent().parent().attr("index");
            var currentChooseTaskType = $(this).parent().parent().children().eq(0).attr("flowtasktype");
            g.showChooseExecutorWind(currentChooseDivIndex, currentChooseTaskType);
            return false;
        });

        //删除选择的执行人
        $(".choose-delete").die().live("click", function () {
            $(this).parent().remove();
        });

        $(".submit").bind("click", function () {
            g.submit();
        });
        g.showOmitContent();
    },
    getHeadData: function () {
        var g = this;
        EUI.Store({
            url: _ctxPath + "/flowClient/getApprovalHeaderInfo",
            params: {
                taskId: this.taskId
            },
            success: function (status) {
                if (status.success) {
                    g.showHeadData(status.data);
                } else {
                    EUI.ProcessStatus(status);
                }
            },
            failure: function (response) {
                EUI.ProcessStatus(response);
            }
        });
    },
    showHeadData: function (data) {
        $(".flow-ordernum").text(this.lang.businessUnitText + data.businessCode);
        $(".flow-info-creater").text(this.lang.docMarkerText + data.createUser);
        $(".flow-info-excutor").text(data.prUser);
        $(".flow-info-remark").text(data.prOpinion);
        $(".flow-remark").val(data.currentNodeDefaultOpinion);
    },
    getNodeInfo: function () {
        var g = this;
        var mask = EUI.LoadMask({
            msg: this.lang.queryMaskMessageText
        });
        EUI.Store({
            url: _ctxPath + "/flowClient/nextNodesInfo",
            params: {
                taskId: this.taskId
            },
            success: function (status) {
                mask.hide();
                g.showNodeInfo(status.data);
            },
            failure: function (response) {
                mask.hide();
                EUI.ProcessStatus(response);
            }
        });
    },
    showNodeInfo: function (data) {
        var g = this;
        var html = "";
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var taskMsg = item.name;
            if (item.currentTaskType === "CounterSign") {
                taskMsg+="-【会签任务】";
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="excutor-item-title" ><div class="flow-countersign" title="'+taskMsg+'">' + taskMsg +'</div></div></div>';
                g.initDealCheckBox(); //初始化同意、不同意单选框
                this.desionType = 2;
            } else if (item.currentTaskType === "ParallelTask" && !item.counterSignLastTask) {
                taskMsg+="-【并行任务】";
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="excutor-item-title"><div class="flow-countersign" title="'+taskMsg+'">' + taskMsg +'</div></div></div>';
                this.desionType = 2;
            } else if (item.currentTaskType === "SerialTask" && !item.counterSignLastTask) {
                taskMsg+="-【串行任务】";
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="excutor-item-title"><div class="flow-countersign" title="'+taskMsg+'">' + taskMsg +'</div></div></div>';
                this.desionType = 2;
            }else if(item.currentTaskType === "Approve"){
                taskMsg+="-【审批任务】";
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="excutor-item-title" ><div class="flow-countersign" title="'+taskMsg+'">' + taskMsg +'</div></div></div>';
                g.initDealCheckBox();//初始化同意、不同意单选框
                this.desionType = 2;
            } else {
                var iconCss = "choose-radio";
                if (item.uiType === "checkbox") {
                    iconCss = "choose-checkbox";
                    this.manualSelected = true;
                    this.desionType = 1;
                } else if (item.uiType === "readOnly") {
                    iconCss = "";
                    this.manualSelected = false;
                    this.desionType = 2;
                } else {
                    this.manualSelected = true;
                }
                var lineNameHtml = "";
                if (item.preLineName && item.preLineName !== "null") {
                    lineNameHtml = '<div class="gateway-name">' + item.preLineName + '</div>';
                    if (item.preLineName === "同意" || item.preLineName === "不同意") {
                        g.getCheackBoxValue();
                    }
                }
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">' + lineNameHtml + '<div class="approve-arrows-right"></div><div class="flow-decision-text" title="' + item.name + '">' + item.name + '</div></div></div>';

            }
        }

        if (data[0].currentTaskType === "CounterSign" || data[0].currentTaskType === "ParallelTask" || data[0].currentTaskType === "SerialTask") {
            if (data[0].counterSignLastTask) {
                $(".flow-next").text(this.lang.nextStepText);
            } else {
                $(".flow-next").text(this.lang.finishText);
            }
        }
        if (data[0].length === 1 && data[0].type.toLowerCase().indexOf("endevent") !== -1) {
            $(".flow-next").text(this.lang.finishText);
            g.isEnd = true;
        }
        $(".flow-decision-box").append(html);
    },
    getDesionIds: function () {
        var includeNodeIds = "";
        var doms;
        if (this.desionType !== 2) {
            doms = $(".select", ".flow-decision-box");
            for (var i = 0; i < doms.length; i++) {
                includeNodeIds += $(doms[i]).attr("id");
            }
        }
        return includeNodeIds;
    }
    ,
//获取选中的单选框的值
    getCheackBoxValue: function () {
        $(".flow-decision-box>div").live("click", function () {
            var clickId = $(".select", ".flow-decision-box").attr("id");
            var text = $(".gateway-name", "#" + clickId).text();
            if (text === "同意") {
                $(".flow-remark").val(text);
            } else if (text === "不同意") {
                $(".flow-remark").val("");
            }
        })
    }
    ,
//检查审批输入是否有效
    checkIsValid: function () {
        var flag = this.checkOpinion();
        if (this.desionType === 2) {
            if (!flag) {
                return false;
            }
            return true;
        }
        else if (this.desionType === 1) {
            var doms = $(".select", ".flow-decision-box");
            if (doms.length !== 1) {
                EUI.ProcessStatus({ success: false, msg: this.lang.chooseNextExecuteNodeText });
                return false;
            }
            if (!flag) {
                return false;
            }
            return true;
        }
        else if (this.desionType === 0) {
            var doms = $(".select", ".flow-decision-box");
            if (doms.length === 0) {
                EUI.ProcessStatus({
                    success: false,
                    msg: this.lang.chooseNextExecuteNodeText
                });
                return false;
            }
            if (!flag) {
                return false;
            }
            return true;
        }
        return false;
    }
    ,
    checkOpinion: function () {
        var opinionText = $(".flow-remark").val().trim();
        if (!opinionText) {
            EUI.ProcessStatus({
                msg: "处理意见不能为空",
                success: false,
                showTime: 6
            });
            $(".flow-remark").focus();
            return false;
        }
        return true;
    }
    ,
    goToNext: function () {

        if (!this.checkIsValid()) {
            return;
        }
        //执行子窗口方法
        if (this.goNext) {
            this.goNext.call(this);
        } else {
            this.doGoToNext();
        }
    }
    ,
    doGoToNext: function () {
        var g = this;
        var mask = EUI.LoadMask({
            msg: this.lang.nowSaveMsgText
        });
        EUI.Store({
            url: _ctxPath + "/flowClient/getSelectedNodesInfo",
            params: {
                taskId: this.taskId,
                includeNodeIdsStr: this.getDesionIds(),
                approved: this.counterApprove
            },
            success: function (status) {
                mask.hide();
                if (g.isEnd) {
                    g.close();
                    return;
                }
                if (status.data === "EndEvent") {
                    var msgbox = EUI.MessageBox({
                        title: g.lang.operationHintText,
                        msg: g.lang.stopFlowMsgText,
                        buttons: [{
                            title: g.lang.cancelText,
                            handler: function () {
                                msgbox.remove();
                            }
                        },{
                            title: g.lang.sureText,
                            selected: true,
                            handler: function () {
                                g.submit(true);
                                msgbox.remove();
                            }
                        }]
                    });
                    return;
                }
                if (status.data === "CounterSignNotEnd") {
                    g.submit();
                    return;
                }
                g.toChooseUserData = status.data;
                g.showChooseUser();
            },
            failure: function (response) {
                mask.hide();
                EUI.ProcessStatus(response);
            }
        });
    }
    ,
    //显示【选择下一步执行人】窗口
    showChooseUser: function () {
        var g = this;
        var data = this.toChooseUserData;
        $(".flow-approve").hide();
        $(".flow-chooseuser").show();
        $(".flow-node-box").remove();
        var html = "";
        for (var i = 0; i < data.length; i++) {
            var node = data[i];
            var nodeType = this.lang.generalTaskText;
            var iconCss = "choose-radio";
            if (node.uiUserType === "AnyOne") {
                var html = g.showAnyContainer(data[i], i);
                $(".flow-operate").before(html);
                continue;
            }
            var flowTaskType = "";
            if (node.flowTaskType) {
                flowTaskType = node.flowTaskType.toLowerCase();
            }
            if(node.uiType==="radiobox"){
                iconCss = "choose-radio";
            }else if(node.uiType==="checkbox"){
                iconCss = "choose-checkbox";
            }
            if (flowTaskType === "singlesign") {
                nodeType = this.lang.singleSignTaskText;
                // iconCss = "choose-checkbox";
            } else if (flowTaskType === "countersign") {
                nodeType = this.lang.counterSignTaskText;
                // iconCss = "choose-checkbox";
            } else if (flowTaskType === "approve") {
                nodeType = this.lang.approveTaskText;
            } else if (flowTaskType === "paralleltask") {
                nodeType = this.lang.ParallelTaskText;
                // iconCss = "choose-checkbox";
            } else if (flowTaskType === "serialtask") {
                nodeType = this.lang.SerialTaskText;
                // iconCss = "choose-checkbox";
            } else if(flowTaskType==="servicetask"){
                nodeType = this.lang.serviceTaskText;
            }else if(flowTaskType==="receiveTask"){
                nodeType = this.lang.receiveTaskText;
            }
            var nodeHtml = '<div class="flow-node-box" index="' + i + '">' +
                '<div class="flow-excutor-title">' + node.name + '-[' + nodeType +
                ']</div><div class="flow-excutor-content">';
            if (iconCss === "choose-radio") {
                if (node.executorSet && node.executorSet.length === 1) {
                    var html = g.showUserItem(node, nodeHtml, iconCss, nodeType);
                    $(".flow-operate").before(html);
                    $("div[index=" + i + "]").children().eq(1).children().eq(0).addClass("select");
                } else {
                    var html = g.showUserItem(node, nodeHtml, iconCss, nodeType);
                    $(".flow-operate").before(html);
                    $("div[index=" + i + "]").children().eq(1).children().eq(0).addClass("select");
                }
            }
            if (iconCss === "choose-checkbox") {
                var html = g.showUserItem(node, nodeHtml, iconCss, nodeType);
                $(".flow-operate").before(html);
                $("div[type='singleSign']").addClass("select");
                $("div[type='countersign']").addClass("select");
            }
        }
    }
    ,
    //选择下一步执行人-任意执行人
    showAnyContainer: function (data, i) {
        var g = this;
        var html = "";
        var node = data;
        var nodeType = g.lang.arbitraryExecutorText;
        var iconCss = "choose-delete";
        var nodeHtml = '<div class="flow-node-box" index="' + i + '">' +
                            '<div class="flow-excutor-title" flowTaskType="' + node.flowTaskType + '">' + node.name + '-[' + nodeType + ']</div>' +
                            '<div class="flow-excutor-content2-box">'+
                                '<div class="flow-excutor-content2"></div>' +
                                '<div class="choose-btn"><span class="btn-icon ecmp-common-add"></span><span class="btn-icon choose-btn-text">' + g.lang.chooseText + '</span></div>' +
                            '</div>'+
                       '</div>';
        return html += nodeHtml;
    }
    ,
    showUserItem: function (node, nodeHtml, iconCss, nodeType) {
        var html = "";
        for (var j = 0; j < node.executorSet.length; j++) {
            var item = node.executorSet[j];
            if (!item.positionId) {
                nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">' +
                    String.format(this.lang.showUserInfo2Text, item.name, item.organizationName, item.code) +
                    '</div>' +
                    '</div>';
            } else {
                nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">' +
                    String.format(this.lang.showUserInfoText, item.name, item.positionName, item.organizationName, item.code) +
                    '</div>' +
                    '</div>';
            }
        }
        nodeHtml += "</div></div>";
        return html += nodeHtml;
    }
    ,
    getSelectedUser: function () {
        var users = [];
        var nodeDoms = $(".flow-node-box");
        for (var i = 0; i < nodeDoms.length; i++) {
            var nodeDom = $(nodeDoms[i]);
            var index = nodeDom.attr("index");
            var data = this.toChooseUserData[index];
            var node = {
                nodeId: data.id,
                userVarName: data.userVarName,
                flowTaskType: data.flowTaskType,
                callActivityPath:data.callActivityPath
            };
            var itemDoms = $(".select", nodeDom);
            var ids = "";
            for (var j = 0; j < itemDoms.length; j++) {
                if (j > 0) {
                    ids += ",";
                }
                ids += $(itemDoms[j]).attr("id");
            }
            node.userIds = ids;
            users.push(node);
        }
        return users;
    }
    ,
    checkUserValid: function () {
        var nodeDoms = $(".flow-node-box");
        for (var i = 0; i < nodeDoms.length; i++) {
            var nodeDom = $(nodeDoms[i]);
            var index = nodeDom.attr("index");
            var data = this.toChooseUserData[index];
            var itemDoms = $(".select", nodeDom);
            if (itemDoms.length === 0) {
                EUI.ProcessStatus({
                    success: false,
                    //  msg: this.lang.chooseMsgText + data.name + this.lang.executorMsgText
                    msg: String.format(this.lang.chooseExecutorMsgText, data.name)
                });
                return false;
            }
        }
        return true;
    }
    ,
    submit: function (endEventId) {
        var g = this;
        if (!this.isEnd && !this.checkUserValid()) {
            return;
        }
        if (!this.checkOpinion()) {
            return;
        }
        var mask = EUI.LoadMask({
            msg: this.lang.nowSaveMsgText
        });
        EUI.Store({
            url: this.submitUrl,
            params: {
                taskId: this.taskId,
                businessId: this.busId,
                opinion: $(".flow-remark").val(),
                endEventId: endEventId,
                approved: this.counterApprove,
                taskList: this.isEnd ? "" : JSON.stringify(this.getSelectedUser()),
                manualSelected: g.manualSelected//是否是人工网关选择
            },
            success: function (status) {
                mask.hide();
                if (status.success) {
                    g.close();
                } else {
                    EUI.ProcessStatus(status);
                }
            },
            failure: function (response) {
                mask.hide();
                EUI.ProcessStatus(response);
            }
        });
    }
    ,
    close: function () {
        if (parent.homeView) {
            parent.homeView.closeNowTab();
        } else {
            window.close();
        }
    }
    ,
    showOmitContent: function () {
        $(".gateway-name").live("mouseover", function () {
            var text = $(this).text();
            $(this).attr("title", text);
        });
    }
    ,
    showChooseExecutorWind: function (currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var isChooseOneTitle;
        var saveBtnIsHidden;
        if (currentChooseTaskType === "common"||currentChooseTaskType === "approve"||currentChooseTaskType==="servicetask") {
            isChooseOneTitle = g.lang.chooseArbitraryExecutorMsgText;
            saveBtnIsHidden = true;
        } else {
            isChooseOneTitle = g.lang.chooseArbitraryExecutorText;
            saveBtnIsHidden = false;
        }
        g.chooseAnyOneWind = EUI.Window({
            title: isChooseOneTitle,
            width: 720,
            layout: "border",
            height: 500,
            padding: 8,
            itemspace: 0,
            items: [this.initChooseUserWindTree(), this.InitChooseUserGrid(currentChooseDivIndex, currentChooseTaskType)],
            buttons: [{
                title: g.lang.cancelText,
                handler: function () {
                    g.chooseAnyOneWind.remove();
                }
            },{
                title: g.lang.saveText,
                selected: true,
                hidden: saveBtnIsHidden,
                handler: function () {
                    var selectRow = EUI.getCmp("chooseUserGridPanel_approve").getSelectRow();
                    if (!selectRow||selectRow.length===0) {
                        return;
                    }
                    g.addChooseUsersInContainer(selectRow, currentChooseDivIndex, currentChooseTaskType);
                    g.chooseAnyOneWind.close();
                }
            }]
        });
    }
    ,
    initChooseUserWindTopBar: function () {
        var g = this;
        return  ['->', {
                xtype: "SearchBox",
                width: 200,
                displayText: g.lang.searchDisplayText,
                onSearch: function (v) {
                    EUI.getCmp("chooseAnyUserTree").search(v);
                    g.selectedOrgId = null;
                },
                afterClear: function () {
                    EUI.getCmp("chooseAnyUserTree").reset();
                    g.selectedOrgId = null;
                }
            }]
    } ,
    initChooseUserWindTree: function () {
        var g = this;
        return {
            xtype: "TreePanel",
            width: 250,
            tbar: this.initChooseUserWindTopBar(),
            region: "west",
            id: "chooseAnyUserTree",
            url: _ctxPath + "/flowDefination/listAllOrgs",
            border: true,
            searchField: ["name"],
            showField: "name",
            style: {
                "background": "#fff"
            },
            onSelect: function (node) {
                g.selectedOrgId = node.id;
                EUI.getCmp("chooseUserGridPanel_approve").setGridParams({
                    url: _ctxPath + "/customExecutor/listAllUser",
                    loadonce: true,
                    datatype: "json",
                    postData: {
                        organizationId: g.selectedOrgId
                    }
                }, true);
            },
            afterItemRender: function (nodeData) {
                if (nodeData.frozen) {
                    var nodeDom = $("#" + nodeData.id);
                    if (nodeDom.length === 0) {
                        return;
                    }
                    var itemCmp = $(nodeDom[0].children[0]);
                    itemCmp.addClass("ux-tree-freeze");
                    itemCmp.find(".ux-tree-title").text(itemCmp.find(".ux-tree-title").text() + g.lang.freezeText);
                }
            },
            afterShowTree: function (data) {
                this.setSelect(data[0].id);
            }
        };
    }
    ,
    initUserGridTbar : function(){
        var g = this;
        return ['->', {
            xtype: "SearchBox",
            displayText: g.lang.searchDisplayText,
            onSearch: function (value) {
                EUI.getCmp("chooseUserGridPanel_approve").localSearch(value);
            }
        }];
    },
    InitChooseUserGrid: function (currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var isShowMultiselect;
        if (currentChooseTaskType === "common"||currentChooseTaskType === "approve") {
            isShowMultiselect = false;
        } else {
            isShowMultiselect = true;
        }
        return  {
                xtype: "GridPanel",
                tbar: this.initUserGridTbar(),
                region: "center",
                id: "chooseUserGridPanel_approve",
                searchConfig: {
                    searchCols: ["code"]
                },
                style: {"border-radius": "3px"},
                gridCfg: {
                    loadonce: true,
                    datatype: "local",
                    multiselect: isShowMultiselect,
                    colModel: [{
                        label: g.lang.userIDText,
                        name: "id",
                        index: "id",
                        hidden: true
                    }, {
                        label: g.lang.userNameText,
                        name: "userName",
                        index: "userName",
                        width: 150,
                        align: "center"
                    }, {
                        label: g.lang.userNumberText,
                        name: "code",
                        index: "code",
                        width: 200
                    }, {
                        label: g.lang.organization2Text,
                        name: "organization.name",
                        index: "organization.name",
                        width: 150,
                        align: "center",
                        hidden: true
                    }],
                    ondblClickRow: function (rowid) {
                        var $content2 = $(".flow-excutor-content2","div[index=" + currentChooseDivIndex + "]");
                        var html = "";
                        if(isShowMultiselect){
                            html = $content2.html();
                        }
                        var rowData = EUI.getCmp("chooseUserGridPanel_approve").grid.jqGrid('getRowData', rowid);
                        var selectedUser = [];
                        $content2.children().each(function (index, domEle) {
                            selectedUser.push(domEle.id)
                        });
                        if (!g.itemIdIsInArray(rowData.id, selectedUser)) {
                            html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + rowData.id + '">' +
                                '<div class="choose-icon choose-delete"></div>' +
                                '<div class="excutor-item-title">' +
                                String.format(g.lang.showUserInfo2Text, rowData["userName"], rowData["organization.name"], rowData.code) +
                                '</div>' +
                                '</div>';
                            $(".flow-excutor-content2", "div[index=" + currentChooseDivIndex + "]").html(html);
                        }
                        g.chooseAnyOneWind.close();
                    }
                }
        };
    }
    ,
    addChooseUsersInContainer: function (selectRow, currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var html = "";
        var $content2 = $(".flow-excutor-content2","div[index=" + currentChooseDivIndex + "]");
        var selectedUser = [];
        $content2.children().each(function (index, domEle) {
            selectedUser.push(domEle.id)
        });
        for (var j = 0; j < selectRow.length; j++) {
            var item = selectRow[j];
            if (!g.itemIdIsInArray(item.id, selectedUser)) {
                html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon choose-delete"></div>' +
                    '<div class="excutor-item-title">' +
                    //  g.lang.nameText + item["userName"] +g.lang.organizationText + item["organization.name"] + g.lang.number2Text + item.code +
                    String.format(this.lang.showUserInfo2Text, item["userName"], item["organization.name"], item.code) +
                    '</div>' +
                    '</div>';
            }
        }
        $content2.append(html);
    },
    itemIdIsInArray: function (id, array) {
        for (var i = 0; i < array.length; i++) {
            if (id === array[i]) {
                return true;
            }
        }
        return false;
    }
})
;
/*
 * 流程启动组件
 * */
EUI.FlowStart = function (options) {
    return new Flow.EUI.FlowStart(options);
};
Flow.EUI.FlowStart = EUI.extend(EUI.CustomUI, {
    data: null,
    businessId: null,
    businessModelCode: null,
    typeId: null,
    url: null,
    afterSubmit: null,
    selectedOrgId: null,  //当前选中的节点的ID
    initComponent: function () {
        this.getData();
    },
    getData: function () {
        var g = this;
        var myMask = EUI.LoadMask({
            msg: "正在启动，请稍后..."
        });
        EUI.Store({
            url: g.url,
            params: {
                businessModelCode: g.businessModelCode,
                businessKey: g.businessId
            },
            success: function (result) {
                myMask.hide();
                if (!result.data.flowTypeList && !result.data.flowInstance && !result.data.nodeInfoList) {
                    var status = {
                        msg: "找不到流程定义",
                        success: false,
                        showTime: 4
                    };
                    EUI.ProcessStatus(status);
                    return;
                }
                if (!result.data.flowTypeList) {
                    var status = {
                        msg: "找不到流程类型",
                        success: false,
                        showTime: 4
                    };
                    EUI.ProcessStatus(status);
                    return;
                }
                if (result.data.flowTypeList) {
                    var flowTypeList = result.data.flowTypeList;
                    g.data = result.data;
                    g.showWind();
                    g.showChooseUser();
                }
            },
            failure: function (result) {
                EUI.ProcessStatus(result);
                myMask.hide();
            }
        });
    },
    showWind: function () {
        var g = this;
        var title;
        if (typeof( this.data.flowTypeList[0].flowDefinations[0]) == "undefined") {
            title = "此流程未定义";
        } else {
            var defaultTitleName = this.data.flowTypeList[0].flowDefinations[0].name;
            var defaultTitleCode = this.data.flowTypeList[0].flowDefinations[0].defKey;
            title = "[" + defaultTitleCode + "]-" + defaultTitleName;
        }
        var item = [];
        if (this.data.flowTypeList.length === 1) {
            item = [this.initWindContainer()];
        } else {
            item = [ this.initWindContainer(g.data)];
           // item = [this.initWindTbar(g.data), this.initWindContainer()]
        }
        g.win = EUI.Window({
            title: title,
            width: 600,
            height: 450,
            id: "flowStartWind",
            isOverFlow: false,
            padding: 10,
            items: item,
            buttons: [{
                title: g.lang.cancelText,
                handler: function () {
                    g.win.remove();
                }
            },{
                title: g.lang.submitText,
                selected: true,
                handler: function () {
                    g.submit();
                }
            }]
        });
        g.addEvents();
    },
    addEvents: function () {
        var g = this;
        //执行人选择
        $(".flow-user-item").die().live("click", function () {
            var type = $(this).attr("type").toLowerCase();
            if (type === "common"||type === "approve"||type==="servicetask" || type === "receivetask") {
                if ($(this).parent().children("div").length === 1) {
                    if ($(this).hasClass("select")) {
                        $(this).removeClass("select");
                    } else {
                        $(this).addClass("select");
                    }
                } else {
                    $(this).addClass("select").siblings().removeClass("select");
                }
            }
            if (type === "singlesign" || type === "countersign" || type === "paralleltask" || type === "serialtask") {
                if ($(this).hasClass("select")) {
                    $(this).removeClass("select");
                } else {
                    $(this).addClass("select");
                }
            }
        });
        //选择任意执行人
        $(".flowstartchoose-btn").die().live("click", function () {
            var currentChooseDivIndex = $(this).parent().parent().attr("index");
            var currentChooseTaskType = $(this).parent().parent().children().eq(0).attr("flowtasktype");
            g.showChooseExecutorWind(currentChooseDivIndex, currentChooseTaskType);
            return false;
        });
        //删除选择的执行人
        $(".choose-delete").die().live("click", function () {
            $(this).parent().remove();
        })
    },
    showChooseFlowTypeAndExecutorWind: function (data) {
        var g = this;
        window = EUI.Window({
            title: "选择流程类型",
            width: 600,
           // layout: "border",
            padding: 10,
            items: [this.initWindContainer(data)]
        });
    },
    initWindTbar: function (data) {
        var g = this;
        g.typeId = data.flowTypeList[0].id;
        var flowTypeList = data.flowTypeList;
        return  [{
                xtype: "ComboBox",
                field: ["id"],
                width: 250,
                labelWidth: 100,
                name: "name",
            //    id: "flowTypeId",
                title: "<span style='font-weight: bold'>" + "流程类型" + "</span>",
                listWidth: 200,
                reader: {
                    name: "name",
                    field: ["id"]
                },
                data: flowTypeList,
                value: flowTypeList[0].name,
                submitValue: {
                    id: flowTypeList[0].id
                },
                afterSelect: function (data) {
                    var myMask = EUI.LoadMask({
                        msg: "正在加载，请稍候..."
                    });
                    g.typeId = data.data.id;
                    EUI.Store({
                        url: g.url,
                        params: {
                            businessKey: g.businessId,
                            businessModelCode: g.businessModelCode,
                            typeId: g.typeId
                        },
                        success: function (result) {
                            myMask.hide();
                            if (!result.data.flowInstance && !result.data.nodeInfoList) {
                                var status = {
                                    msg: "流程定义未找到",
                                    success: false,
                                    showTime: 4
                                };
                                EUI.ProcessStatus(status);
                                $(".flowstart-node-box").remove();
                                EUI.getCmp("flowStartWind").setTitle("此流程未定义");
                                return;
                            } else {
                                g.data = result.data;
                                var titleName = result.data.flowTypeList[0].flowDefinations[0].name;
                                var titleCode = result.data.flowTypeList[0].flowDefinations[0].defKey;
                                EUI.getCmp("flowStartWind").setTitle("[" + titleCode + "]-" + titleName);
                                $(".flowstart-node-box").remove();

                                g.showChooseUser();
                            }
                        }, failure: function (result) {
                            myMask.hide();
                        }
                    });
                }
            }];
    },
    initWindContainer: function (data) {
        var g = this;
        var con = {
            xtype: "Container",
          //  region: "center",
            id: "containerId",
            height: 450,
            width: 600,
            border: true,
            padding:0,
            style: {
                "border-radius": "3px"
            },
            html: g.getContainerHtml()
        };
        if(data.flowTypeList.length > 1){
            con.tbar = this.initWindTbar(data);
        }
        return con;
    },
    getContainerHtml: function () {
        return '<div class="chooseExecutor"></div>';
    },
    showChooseUser: function () {
        var g = this;
        var data = this.data.nodeInfoList;
        if (data == null) {
            var status = {
                msg: "流程定义未找到",
                success: false,
                showTime: 4
            };
            EUI.ProcessStatus(status);
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var node = data[i];
            var nodeType = "普通任务";
            var iconCss = "choose-radio";
            if (node.uiUserType === "AnyOne") {
                var html = g.showAnyContainer(data[i], i);
                $(".chooseExecutor").append(html);
                continue;
            }
            var flowTaskType = "";
            if (node.flowTaskType) {
                flowTaskType = node.flowTaskType.toLowerCase();
            }
            if(node.uiType==="radiobox") {
                iconCss = "choose-radio";
            }else if(node.uiType==="checkbox"){
                iconCss = "choose-checkbox";
            }
            if (flowTaskType === "singlesign") {
                nodeType = this.lang.singleSignTaskText;
            //    iconCss = "choose-checkbox";
            }else if(flowTaskType === "approve"){
                nodeType = this.lang.approveTaskText;
            }else if (flowTaskType === "countersign") {
                nodeType = this.lang.counterSignTaskText;
            //    iconCss = "choose-checkbox";
            } else if (flowTaskType === "paralleltask") {
                nodeType = this.lang.ParallelTaskText;
             //   iconCss = "choose-checkbox";
            } else if (flowTaskType === "serialtask") {
                nodeType = this.lang.SerialTaskText;
             //   iconCss = "choose-checkbox";
            } else if(flowTaskType === "servicetask"){
                nodeType = this.lang.serviceTaskText;
            } else if(flowTaskType === "receivetask"){
                nodeType = this.lang.receiveTaskText;
            }
            var nodeHtml = '<div class="flowstart-node-box" index="' + i + '">' +
                '<div class="flowstart-excutor-title" title="'+ node.name + '-[' + nodeType+']">' + node.name + '-[' + nodeType +
                ']</div><div class="flow-excutor-content">';
            if (iconCss === "choose-radio") {
                if (node.executorSet.length === 1) {
                    var html = g.showUserItem(node, nodeHtml, iconCss, nodeType);
                    $(".chooseExecutor").append(html);
                    $("div[index=" + i + "]").children().eq(1).children().eq(0).addClass("select");
                } else {
                    var html = g.showUserItem(node, nodeHtml, iconCss, nodeType);
                    $(".chooseExecutor").append(html);
                    $("div[index=" + i + "]").children().eq(1).children().eq(0).addClass("select");
                }
            }
            if (iconCss === "choose-checkbox") {
                var html = g.showUserItem(node, nodeHtml, iconCss, nodeType);
                $(".chooseExecutor").append(html);
                $("div[type='singleSign']").addClass("select");
                $("div[type='countersign']").addClass("select");
            }
        }
    },
    showAnyContainer: function (data, i) {
        var g = this;
        var html = "";
        var node = data;
        var nodeType = "任意执行人";
        var iconCss = "choose-delete";
        var nodeHtml = '<div class="flowstart-node-box" index="' + i + '">' +
                            '<div class="flowstart-excutor-title" title="'+ node.name + '-[' + nodeType + ']"  flowTaskType="' + node.flowTaskType + '">' +
                                node.name + '-[' + nodeType + ']</div>' +
                            '<div class="flowstart-excutor-content2-box">'+
                                '<div class="flowstart-excutor-content2"></div>'+
                                '<div class="flowstartchoose-btn"><span class="btn-icon ecmp-common-add"></span><span class="btn-icon choose-btn-text">添加执行人</span></div>' +
                            '</div>'+
                        '</div>';
        return html += nodeHtml;
    },
    showUserItem: function (node, nodeHtml, iconCss, nodeType) {
        var html = "";
        for (var j = 0; j < node.executorSet.length; j++) {
            var item = node.executorSet[j];
            if (!item.positionId) {
                nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">' +
                    // '姓名：' + item.name + '，组织机构：' + item.organizationName + '，编号：' + item.code +
                    String.format(this.lang.showUserInfo2Text, item.name, item.organizationName, item.code) +
                    '</div>' +
                    '</div>';
            } else {
                nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">' +
                    // '姓名：' + item.name + '，岗位：' + item.positionName +'，组织机构：' + item.organizationName + '，编号：' + item.code +
                    String.format(this.lang.showUserInfoText, item.name, item.positionName, item.organizationName, item.code) +
                    '</div>' +
                    '</div>';
            }
        }
        nodeHtml += "</div></div>";
        return html += nodeHtml;
    },
    getSelectedUser: function () {
        var users = [];
        var nodeDoms = $(".flowstart-node-box");
        for (var i = 0; i < nodeDoms.length; i++) {
            var nodeDom = $(nodeDoms[i]);
            var index = nodeDom.attr("index");
            var data = this.data.nodeInfoList[index];
            var node = {
                nodeId: data.id,
                userVarName: data.userVarName,
                flowTaskType: data.flowTaskType,
                callActivityPath:data.callActivityPath
            };
            var itemDoms = $(".select", nodeDom);
            var ids = "";
            for (var j = 0; j < itemDoms.length; j++) {
                if (j > 0) {
                    ids += ",";
                }
                ids += $(itemDoms[j]).attr("id");
            }
            node.userIds = ids;
            users.push(node);
        }
        return users;
    },
    checkUserValid: function () {
        var nodeDoms = $(".flowstart-node-box");
        if (nodeDoms.length === 0) {
            return false;
        }
        var msg = "";
        for (var i = 0; i < nodeDoms.length; i++) {
            var nodeDom = $(nodeDoms[i]);
            var index = nodeDom.attr("index");
            var data = this.data.nodeInfoList[index];
            var itemDoms = $(".select", nodeDom);
            if (itemDoms.length === 0) {
                msg = msg+data.name+"、";
            }
        }
        if(msg){
            msg = msg.substring(0,msg.length-1);
            EUI.ProcessStatus({
                success: false,
                msg: String.format(this.lang.chooseExecutorMsgText, msg)
            });
            return false;
        }
        return true;
    },
    submit: function () {
        var g = this;
        if (!g.checkUserValid()) {
            return;
        }
        var mask = EUI.LoadMask({
            msg: "正在启动，请稍候..."
        });
        EUI.Store({
            url: g.url,
            params: {
                businessKey: g.businessId,
                businessModelCode: g.businessModelCode,
                typeId: g.typeId,
                opinion: null,
                taskList: JSON.stringify(this.getSelectedUser())
            },
            success: function (status) {
                mask.hide();
                var status = {
                    msg: "启动成功",
                    success: true
                };
                EUI.ProcessStatus(status);
                g.win.close();
                g.afterSubmit && g.afterSubmit.call(g);
            },
            failure: function (response) {
                mask.hide();
                EUI.ProcessStatus(response);
            }
        });
    },
    showChooseExecutorWind: function (currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var isChooseOneTitle;
        var saveBtnIsHidden;
        if (currentChooseTaskType === "common"||currentChooseTaskType === "approve"||currentChooseTaskType==="servicetask") {
            isChooseOneTitle = "选择任意执行人【请双击进行选择】";
            saveBtnIsHidden = true;
        } else {
            isChooseOneTitle = "选择任意执行人";
            saveBtnIsHidden = false;
        }
        g.chooseAnyOneWind = EUI.Window({
            title: isChooseOneTitle,
            width: 720,
            layout: "border",
            height: 500,
            padding: 8,
            items: [this.initChooseUserWindTree(), this.InitChooseUserGrid(currentChooseDivIndex, currentChooseTaskType)],
            buttons: [{
                title: g.lang.cancelText,
                handler: function () {
                    g.chooseAnyOneWind.remove();
                }
            },{
                title: g.lang.saveText,
                selected: true,
                hidden: saveBtnIsHidden,
                handler: function () {
                    var selectRow = EUI.getCmp("chooseUserGridPanel_start").getSelectRow();
                    if (!selectRow||selectRow.length===0) {
                        return;
                    }
                    g.addChooseUsersInContainer(selectRow, currentChooseDivIndex, currentChooseTaskType);
                    g.chooseAnyOneWind.close();
                }
            }]
        });
    },
    initChooseUserWindTopBar: function () {
        var g = this;
        return   ['->', {
                xtype: "SearchBox",
                width: 200,
                displayText: g.lang.searchDisplayText,
                onSearch: function (v) {
                    EUI.getCmp("chooseAnyUserTree").search(v);
                    g.selectedOrgId = null;
                },
                afterClear: function () {
                    EUI.getCmp("chooseAnyUserTree").reset();
                    g.selectedOrgId = null;
                }
            }];
    },
    initChooseUserWindTree: function () {
        var g = this;
        return {
            xtype: "TreePanel",
            width: 250,
            tbar: this.initChooseUserWindTopBar(),
            region: "west",
            id: "chooseAnyUserTree",
            url: _ctxPath + "/flowDefination/listAllOrgs",
            border: true,
            searchField: ["name"],
            showField: "name",
            style: {
                "background": "#fff"
            },
            onSelect: function (node) {
                g.selectedOrgId = node.id;
                //   EUI.getCmp("gridPanel").grid[0].p.postData={}
                EUI.getCmp("chooseUserGridPanel_start").setGridParams({
                    url: _ctxPath + "/customExecutor/listAllUser",
                    loadonce: true,
                    datatype: "json",
                    postData: {
                        organizationId: g.selectedOrgId
                    }
                }, true);
            },
            afterItemRender: function (nodeData) {
                if (nodeData.frozen) {
                    var nodeDom = $("#" + nodeData.id);
                    if (nodeDom.length === 0) {
                        return;
                    }
                    var itemCmp = $(nodeDom[0].children[0]);
                    itemCmp.addClass("ux-tree-freeze");
                    itemCmp.find(".ux-tree-title").text(itemCmp.find(".ux-tree-title").text() + "(已冻结)");
                }
            },
            afterShowTree: function (data) {
                this.setSelect(data[0].id);
            }
        }
    },
    initUserGridTbar: function(){
        var g =this;
        return  ['->', {
                xtype: "SearchBox",
                displayText: g.lang.searchDisplayText,
                onSearch: function (value) {
                    EUI.getCmp("chooseUserGridPanel_start").localSearch(value);
                },
                afterClear: function () {
                    EUI.getCmp("chooseUserGridPanel_start").restore();
                }
            }];
    },
    InitChooseUserGrid: function (currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var isShowMultiselect;
        if (currentChooseTaskType === "common"||currentChooseTaskType === "approve"||currentChooseTaskType ==="servicetask") {
            isShowMultiselect = false;
        } else {
            isShowMultiselect = true;
        }
        return  {
                xtype: "GridPanel",
                tbar: this.initUserGridTbar(),
                region: "center",
                id: "chooseUserGridPanel_start",
                searchConfig: {
                    searchCols: ["userName", "code"]
                },
                style: {"border-radius": "3px"},
                gridCfg: {
                    loadonce: true,
                    datatype: "local",
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
                        name: "organization.name",
                        index: "organization.name",
                        width: 150,
                        align: "center",
                        hidden: true
                    }],
                    ondblClickRow: function (rowid) {
                        var $content2 = $(".flowstart-excutor-content2","div[index=" + currentChooseDivIndex + "]");
                        var html = "";
                        if(isShowMultiselect){
                            html = $content2.html();
                        }
                        var rowData = EUI.getCmp("chooseUserGridPanel_start").grid.jqGrid('getRowData', rowid);
                        var selectedUser = [];
                        $content2.children().each(function (index, domEle) {
                            selectedUser.push(domEle.id)
                        });
                        if (!g.itemIdIsInArray(rowData.id, selectedUser)) {
                            html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + rowData.id + '">' +
                                '<div class="choose-icon choose-delete"></div>' +
                                '<div class="excutor-item-title">' +
                                String.format(g.lang.showUserInfo2Text, rowData["userName"], rowData["organization.name"], rowData.code) +
                                '</div>' +
                                '</div>';
                            $content2.html(html);
                        }
                        g.chooseAnyOneWind.close();
                    }
                }
        };
    },
    addChooseUsersInContainer: function (selectRow, currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var $content2 = $(".flowstart-excutor-content2","div[index=" + currentChooseDivIndex + "]");
        var html = "";
        var selectedUser = [];
        $content2.children().each(function (index, domEle) {
            selectedUser.push(domEle.id)
        });
        for (var j = 0; j < selectRow.length; j++) {
            var item = selectRow[j];
            if (!g.itemIdIsInArray(item.id, selectedUser)) {
                html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon choose-delete"></div>' +
                    '<div class="excutor-item-title">' +
                    String.format(g.lang.showUserInfo2Text, item["userName"], item["organization.name"], item.code) +
                    '</div>' +
                    '</div>';
            }
        }
        $content2.append(html);
    },
    itemIdIsInArray: function (id, array) {
        for (var i = 0; i < array.length; i++) {
            if (id == array[i]) {
                return true;
            }
        }
        return false;
    }
});
/*
 * 流程历史组件
 * */
EUI.FlowHistory = function (options) {
    return new Flow.EUI.FlowHistory(options);
};
Flow.EUI.FlowHistory = EUI.extend(EUI.CustomUI, {
    instanceId: null,
    businessId: null,
    defaultData: null,
    instanceData: null,
    designInstanceId: null,
    designFlowDefinationId: null,
    versionCode: null,
    isManuallyEnd: false,
    initComponent: function () {
        var g = this;
        g.getData();
    },
    getData: function () {
        var g = this;
        var myMask = EUI.LoadMask({
            msg: g.lang.queryMaskMessageText
        });
        EUI.Store({
            url: _ctxPath + "/flowHistoryInfo/getFlowHistoryInfo",
            params: {
                businessId: g.businessId,
                instanceId: g.instanceId
            },
            success: function (result) {
                var flag = true;
                g.initData(result);
                g.showWind();
                g.flowDefVersionId=g.defaultData.data.flowInstance.flowDefVersion.id;
                g.showFlowHistoryTopData(g.defaultData.data.flowInstance);
                g.showFlowHistoryData(g.defaultData.data.flowHistoryList);
                g.showFlowStatusData(g.defaultData.data.flowTaskList,g.defaultData.data.flowInstance);
                myMask.hide();
            }, failure: function (result) {
                myMask.hide();
            }
        });
    },
    initData: function (data) {
        var instanceData = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i].flowInstance;
            var instanceItem = {
                id: item.id,
                name: item.flowName + "," + item.creatorName + "," + item.createdDate + this.lang.startText,
                instanceId: item.id,
                data: data[i]
            };
            instanceData.push(instanceItem);
            if (this.instanceId === item.id) {
                this.defaultData = instanceItem;
                this.designInstanceId = instanceItem.id;
                this.designFlowDefinationId = instanceItem.data.flowInstance.flowDefVersion.flowDefination.id;
                this.versionCode = instanceItem.data.flowInstance.flowDefVersion.versionCode
            }
        }
        this.instanceData = instanceData;
        if (!this.defaultData) {
            this.defaultData = instanceData[0];
            this.designInstanceId = instanceData[0].id;
            this.designFlowDefinationId = instanceData[0].data.flowInstance.flowDefVersion.flowDefination.id;
            this.versionCode = instanceData[0].data.flowInstance.flowDefVersion.versionCode;
        }
    },
    showWind: function () {
        var g = this;
        g.win = EUI.Window({
            title: g.lang.flowInfoText,
            width: 620,
            height: 523,
            padding: 5,
            items: [this.initContent()]
        });
        EUI.getCmp("flowInstanceId").loadData(this.defaultData);
        g.topEvent();
    },
    initContent: function () {
        var g = this;
        return {
            xtype: "Container",
            tbar: [{
                xtype: "ComboBox",
                title: "<span style='font-weight: bold'>" + g.lang.launchHistoryText + "</span>",
                width: 365,
                field: ["id"],
                canClear: false,
                labelWidth: 80,
                name: "name",
                id: "flowInstanceId",
                reader: {
                    name: "name",
                    field: ["id"]
                },
                data: this.instanceData,
                afterSelect: function (data) {
                    g.designInstanceId = data.data.id;
                    g.flowDefVersionId=data.data.data.flowInstance.flowDefVersion.id;
                    g.designFlowDefinationId = data.data.data.flowInstance.flowDefVersion.flowDefination.id;
                    g.versionCode = data.data.data.flowInstance.flowDefVersion.versionCode;
                    $(".statuscenter-info").html("").removeClass("text-center");
                    $(".flow-historyprogress").html("");
                    $(".flow-end").css("display", "none");
                    g.showFlowHistoryData(data.data.data.flowHistoryList);
                    g.showFlowStatusData(data.data.data.flowTaskList,data.data.data.flowInstance);
                }
            }, {
                xtype: "Button",
                title: g.lang.showFlowDiagramText,
                iconCss: "ecmp-common-view",
                handler: function () {
                    $(".toptop-right").addClass("flowselect");
                    g.showDesgin()
                }
            }],
            border: true,
            isOverFlow: false,
            html: g.getTopHtml() + g.getCenterHtml()
        }
    },
    getTopHtml: function () {
        return '<div class="top">' +
            '				<div class="top-left navbar flowselect">' +
            '					<div class="flow-tabicon flow-statusimg ecmp-flow-handlestatus"></div>' +
            '					<div class="flow-stutsfield text">' +
            this.lang.processStatusText +
            '					</div>' +
            '				</div>' +
            '				<div class="flow-line"></div>' +
            '				<div class="top-center navbar">' +
            '					<div class="flow-tabicon flow-historyimg  ecmp-flow-handlehistory"></div>' +
            '					<div class="flow-historyfield text">' +
            this.lang.flowProcessHistoryText +
            '					</div>' +
            '				</div>' +
            '			</div>';
    },
    getCenterHtml: function () {
        var g = this;
        return g.getFlowStatusHtml() + g.getFlowHistoryHtml()
    },
    getFlowStatusHtml: function () {
        return '<div class="flow-statuscenter" style="display: block;">' +
            '					<div class="statuscenter-info ">' +
            '					</div>' +
            '				</div>';
    },
    getFlowHistoryHtml: function () {
        return '<div class="flow-hsitorycenter" style="display: none;">' +
            '					<div class="historycenter-info">' +
            '						<div class="flow-start">' +
            '						</div>' +
            '						<div class="flow-historyprogress">' +
            '						</div>' +
            '                       <div class="flow-end" style="display: none;">' +
            '							<div class="flow-endImg ecmp-flow-end"></div>' +
            '							<div class="flow-endfield">' + this.lang.flowEndText + '</div>' +
            '							<div class="flow-endright">' +
            '							</div>' +
            '						</div>';
        '					</div>' +
        '				</div>';
    },

    //拼接流程历史头部数据的html
    showFlowHistoryTopData: function (data) {
        var g = this;
        var html = "";
        html = '<div class="flow-startimg ecmp-flow-flag"></div>' +
            '							<div class="flow-startfield">' + g.lang.flowLaunchText + '</div>' +
            '							<div class="flow-startright">' +
            '								<div class="flow-startuser">' + data.creatorName + '</div>' +
            '								<div class="flow-startline"></div>' +
            '								<div class="flow-starttime">' + data.createdDate + '</div>' +
            '							</div>';
        $(".flow-start").html(html);
    },
    //拼接流程历史数据的html
    showFlowHistoryData: function (data) {
        var g = this;
        var html = "";
        var ended = false;
        var flowInstance = null;
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            html += '<div class="flow-historyinfoone">' +
                '							<div class="flow-historydot ecmp-flow-nodedot"></div>' +
                '							<div class="flow-historyinfotop">' +
                '								<div class="flow-historystatus">' + item.flowTaskName + '</div>' +
                '								<div class="flow-historyright">' + g.lang.processorText + item.executorName + ' (' + item.actEndTime + ')</div>' +
                '							</div>' +
                '							<div class="flow-usetime">' + g.lang.timeCunsumingText + g.changeLongToString(item.actDurationInMillis) + '</div>' +
                '							<div class="flowhistory-remark">' + g.lang.handleAbstractText + (item.depict || g.lang.noneText) + '</div>' +
                '							 <div class="clear"></div> ' +
                '						</div>';
            flowInstance = data[0].flowInstance;
            while(flowInstance.parent){
                flowInstance = flowInstance.parent;
            }
            ended = flowInstance.ended;
            if (ended) {
                if (flowInstance.manuallyEnd === true) {
                    g.isManuallyEnd = true;
                    $(".flow-end").css("display", "block");
                    $(".flow-endright").html(flowInstance.endDate);
                } else {
                    $(".flow-end").css("display", "block");
                    $(".flow-endright").html(flowInstance.endDate);
                }
            }
        }
        $(".flow-historyprogress").append(html);
    },
    //拼接流程状态数据的html
    showFlowStatusData: function (data,flowInstance) {
        var g = this;
        var html = "";
        if (data.length === 0) {
            if (g.isManuallyEnd) {
                html = "流程已被发起人终止";
            } else if(!flowInstance || flowInstance.ended){
                html = g.lang.flowFinishedText;
            }else {
                html = g.lang.flowInSuspendText;
            }
            $(".statuscenter-info").addClass("text-center")
        } else {
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                html += '<div class="flow-progress">' +
                    '						<div class="flow-progresstitle">' + item.taskName + '</div>' +
                    '						<div class="flow-progressinfo">' +
                    '							<div class="flow-progressinfoleft">' + g.lang.waitProcessorText + item.executorName + '</div>' +
                    '							<div class="flow-progressline"></div>' +
                    '							<div class="flow-progressinforight">' + g.lang.taskArrivalTimeText + item.createdDate + '</div>' +
                    '						</div>' +
                    '					</div>';
            }
        }
        $(".statuscenter-info").append(html)
    },
    changeLongToString: function (value) {
        var strVar = '';
        var day = Math.floor(value / (60 * 60 * 1000 * 24));
        var hour = Math.floor((value - day * 60 * 60 * 1000 * 24) / (60 * 60 * 1000));
        var minute = Math.floor((value - day * 60 * 60 * 1000 * 24 - hour * 60 * 60 * 1000) / (60 * 1000));
        var second = Math.floor((value - day * 60 * 60 * 1000 * 24 - hour * 60 * 60 * 1000 - minute * 60 * 1000) / 1000);
        var milliSeconds = Math.floor((value - day * 60 * 60 * 1000 * 24 - hour * 60 * 60 * 1000 - minute * 60 * 1000-second * 60 * 1000));
        if (day > 0) {
            strVar += day + this.lang.dayText;
        }
        if (hour > 0) {
            strVar += hour + this.lang.hourText;
        }
        if (minute > 0) {
            strVar += minute + this.lang.minuteText;
        }
        if (second > 0) {
            strVar += second + this.lang.secondText;
        }
        if (milliSeconds > 0) {
            strVar += milliSeconds + this.lang.milliSecondsText;
        }
        return strVar;
    },
    topEvent: function () {
        var g = this;
        $(".navbar").click(function () {
            $(this).addClass("flowselect").siblings().removeClass("flowselect");
            $(".toptop-right").removeClass("flowselect");
        });
        $(".top-left").click(function () {
            $(".flow-statuscenter").css("display", "block");
            $(".flow-hsitorycenter").css("display", "none");
        });
        $(".top-center").click(function () {
            $(".flow-statuscenter").css("display", "none");
            $(".flow-hsitorycenter").css("display", "block");
        });
    },
    showDesgin: function () {
        var g = this;
        var tab = {
            title: g.lang.flowDiagramText,
            url: _ctxPath + "/design/showLook?id=" + this.flowDefVersionId + "&instanceId=" + this.designInstanceId,
            id: this.designInstanceId
        };
        g.addTab(tab);
    },
    addTab: function (tab) {
        window.open(tab.url);
    }
});