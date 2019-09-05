/**
 * Created by fly on 2017/4/18.
 */
EUI.LookFlowNodeSettingView = EUI.extend(EUI.CustomUI, {
    title: null,
    data: null,
    nodeType: null,
    afterConfirm: null,
    businessModelId: null,
    flowTypeId: null,
    id: null,
    notifyBeforePositionData: null,
    notifyAfterPositionData: null,
    initComponent: function () {
        var g = this;
        if (g.nodeType == "CallActivity") {
            this.window = EUI.Window({
                title: "节点配置",
                width: 550,
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
                width: 550,
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
                    unit: "天"
                }, {
                    xtype: "NumberField",
                    name: "executeHour",
                    value: 0,
                    unit: "时"
                }, {
                    xtype: "NumberField",
                    name: "executeMinute",
                    value: 0,
                    unit: "分"
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
        if (this.nodeType != 'CallActivity' && this.nodeType != "CounterSign" && this.nodeType != "Approve") {
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
                title: "允许加签",
                name: "allowAddSign"
            }, {
                xtype: "CheckBox",
                title: "允许减签",
                name: "allowSubtractSign"
            }]);
        }
        else if (this.nodeType != "CounterSign" && this.nodeType != "ParallelTask" && this.nodeType != "SerialTask" && this.type != "ServiceTask" && this.type != "ReceiveTask" && this.nodeType != "CallActivity") {
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
                title: "允许转办",
                name: "allowTransfer"
            }]);
            if (this.nodeType == "Approve") {
                items = items.concat([{
                    xtype: "CheckBox",
                    title: "允许委托",
                    name: "allowEntrust"
                }]);
            }
        }
        if (this.nodeType == "Normal" || this.nodeType == "SingleSign" || this.nodeType == "CounterSign" || this.nodeType == "Approve"
            || this.nodeType == "ParallelTask" || this.nodeType == "SerialTask") {
            items = items.concat([{
                xtype: "CheckBox",
                title: "允许选择紧急状态",
                name: "allowChooseInstancy"
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
                items: [this.getSelfDef(), this.getSelfDefOfOrgAndSel(), this.getPositionGrid(),
                    this.getPositionOfOrgGrid(), this.getPositionOfOrgAndSelGrid(),
                    this.getPositionTypeGrid(), this.getPositionTypeAndOrgGrid(),
                    this.getOrganizationGrid(), this.getOrganizationOfSelGrid(), this.getOrgGrid()]
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
                title: "岗位+组织维度（自定义执行人）",
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
        }
        else if (userType == "Position") {
            EUI.getCmp("gridBox").show();
            EUI.getCmp("positionGrid").show();
            EUI.getCmp("positionTypeGrid").hide();
            EUI.getCmp("positionOfOrgGrid").hide();
            EUI.getCmp("positionOfOrgAndSelGrid").hide();
            EUI.getCmp("selfDef").hide();
            EUI.getCmp("selfDefOfOrgAndSel").hide();
            EUI.getCmp("organizationGrid").hide();
            EUI.getCmp("organizationOfSelGrid").hide();
            EUI.getCmp("positionTypeAndOrgGrid").hide();
            EUI.getCmp("orgGrid").hide();
            if (data && data.rowdata) {
                EUI.getCmp("positionGrid").setDataInGrid(data.rowdata);
            }
        }
        else if (userType == "PositionType") {
            EUI.getCmp("gridBox").show();
            EUI.getCmp("positionTypeGrid").show();
            EUI.getCmp("positionGrid").hide();
            EUI.getCmp("positionOfOrgGrid").hide();
            EUI.getCmp("positionOfOrgAndSelGrid").hide();
            EUI.getCmp("selfDef").hide();
            EUI.getCmp("selfDefOfOrgAndSel").hide();
            EUI.getCmp("organizationGrid").hide();
            EUI.getCmp("organizationOfSelGrid").hide();
            EUI.getCmp("positionTypeAndOrgGrid").hide();
            EUI.getCmp("orgGrid").hide();
            if (data && data.rowdata) {
                EUI.getCmp("positionTypeGrid").setDataInGrid(data.rowdata);
            }
        } else if (userType == "SelfDefinition") {
            EUI.getCmp("gridBox").show();
            EUI.getCmp("selfDef").show();
            EUI.getCmp("positionGrid").hide();
            EUI.getCmp("positionTypeGrid").hide();
            EUI.getCmp("positionOfOrgGrid").hide();
            EUI.getCmp("positionOfOrgAndSelGrid").hide();
            EUI.getCmp("organizationGrid").hide();
            EUI.getCmp("organizationOfSelGrid").hide();
            EUI.getCmp("selfDefOfOrgAndSel").hide();
            EUI.getCmp("positionTypeAndOrgGrid").hide();
            EUI.getCmp("orgGrid").hide();
            EUI.getCmp("selfDef").loadData(data);
        } else if (userType == "AnyOne") {
            EUI.getCmp("gridBox").hide();
        } else if (userType == "PositionAndOrg") {
            EUI.getCmp("gridBox").show();
            EUI.getCmp("positionOfOrgGrid").show();
            EUI.getCmp("organizationGrid").show();
            EUI.getCmp("positionGrid").hide();
            EUI.getCmp("positionTypeGrid").hide();
            EUI.getCmp("positionOfOrgAndSelGrid").hide();
            EUI.getCmp("selfDef").hide();
            EUI.getCmp("selfDefOfOrgAndSel").hide();
            EUI.getCmp("organizationOfSelGrid").hide();
            EUI.getCmp("positionTypeAndOrgGrid").hide();
            EUI.getCmp("orgGrid").hide();
            if (data && data.length == 2) {
                EUI.getCmp("positionOfOrgGrid").setDataInGrid(data[0].rowdata);
                EUI.getCmp("organizationGrid").setDataInGrid(data[1].rowdata);
            }
        } else if (userType == "PositionAndOrgAndSelfDefinition") {
            EUI.getCmp("selfDefOfOrgAndSel").show();
            EUI.getCmp("gridBox").show();
            EUI.getCmp("positionOfOrgAndSelGrid").show();
            EUI.getCmp("organizationOfSelGrid").show();
            EUI.getCmp("selfDef").hide();
            EUI.getCmp("positionGrid").hide();
            EUI.getCmp("positionOfOrgGrid").hide();
            EUI.getCmp("positionTypeGrid").hide();
            EUI.getCmp("organizationGrid").hide();
            EUI.getCmp("positionTypeAndOrgGrid").hide();
            EUI.getCmp("orgGrid").hide();
            if (data && data.length == 3) {
                EUI.getCmp("selfDefOfOrgAndSel").loadData(data[0]);
                EUI.getCmp("positionOfOrgAndSelGrid").setDataInGrid(data[1].rowdata);
                EUI.getCmp("organizationOfSelGrid").setDataInGrid(data[2].rowdata);
            }
        } else if (userType == "PositionTypeAndOrg") {
            EUI.getCmp("gridBox").show();
            EUI.getCmp("positionTypeAndOrgGrid").show();
            EUI.getCmp("orgGrid").show();
            EUI.getCmp("positionTypeGrid").hide();
            EUI.getCmp("positionGrid").hide();
            EUI.getCmp("positionOfOrgGrid").hide();
            EUI.getCmp("positionOfOrgAndSelGrid").hide();
            EUI.getCmp("selfDef").hide();
            EUI.getCmp("selfDefOfOrgAndSel").hide();
            EUI.getCmp("organizationGrid").hide();
            EUI.getCmp("organizationOfSelGrid").hide();
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
                    title: "任务执行前",
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
            '<div class="west-navbar select-navbar">任务达到时</div>' +
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
            '</div>' +
            '<div id="notify-before"></div>' +
            '</div>' +
            '<div class="notify-center" style="display: none;">' +
            '<div class="notify-user">' +

            '<div class="notify-user-item select">通知发起人</div>' +
            '<div class="notify-user-item">通知岗位</div>' +
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
                items: this.getNotifyItem()
            }, {
                hidden: true,
                //  items: this.getNotifyItem()
                items: this.getNotifyChoosePositionItem("notifyBefore")
            }];
        } else {
            items = [{
                items: this.getNotifyItem()
            }, {
                hidden: true,
                items: this.getNotifyItem()
            }, {
                hidden: true,
                //  items: this.getNotifyItem()
                items: this.getNotifyChoosePositionItem("notifyBefore")
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
                height: 310,
                padding: 0,
                itemspace: 10
            },
            items: [{
                items: this.getNotifyItem()
            }, {
                hidden: true,
                // items: this.getNotifyItem()
                items: this.getNotifyChoosePositionItem("notifyAfter")
            }]
        });
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
        return [{
            xtype: "CheckBoxGroup",
            title: "通知方式",
            labelWidth: 80,
            name: "type",
            readonly: true,
            defaultConfig: {
                labelWidth: 40
            },
            items: [{
                title: "邮件",
                name: "EMAIL"
            }, {
                title: "短信",
                name: "SMS"
            }, {
                title: "APP",
                name: "APP"
            }]
        }, {
            xtype: "Button",
            id: notifyType + "ChoosePositionBtn",
            width: 85,
            height: 25,
            title: "已选岗位(" + '<a class=' + notifyType + 'notifyChoosePositionNum>' + choosePositionNum + '</a>)',
            style: {
                "margin-left": "305px",
                "position": "absolute",
                "top": "67px"
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
    },
    getNotifyItem: function () {
        return [{
            xtype: "CheckBoxGroup",
            title: "通知方式",
            labelWidth: 80,
            name: "type",
            readonly: true,
            defaultConfig: {
                labelWidth: 60
            },
            items: [{
                title: "邮件",
                name: "EMAIL"
            }, {
                title: "短信",
                name: "SMS"
            }, {
                title: "APP",
                name: "APP"
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
            } else if (executorLength == 2) {
                var userTypeCmp = EUI.getCmp("userType");
                var userType = "";
                if (nodeConfig.executor[0].userType == "PositionType") {
                    userType = "PositionTypeAndOrg";
                } else {
                    userType = "PositionAndOrg";
                }
                userTypeCmp.setValue(userType);
                this.showChooseUserGrid(userType, nodeConfig.executor);
            } else if (executorLength == 3) {
                var userType = "PositionAndOrgAndSelfDefinition";
                var userTypeCmp = EUI.getCmp("userType");
                userTypeCmp.setValue(userType);
                this.showChooseUserGrid(userType, nodeConfig.executor);
            }
            // var userType = nodeConfig.executor.userType;
            // var userTypeCmp = EUI.getCmp("userType");
            // userTypeCmp.setValue(userType);
            // this.showChooseUserGrid(userType, nodeConfig.executor);
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
            EUI.getCmp(tab.items[tab.items.length - 1]).loadData(data.notifyPosition);
        } else {
            EUI.getCmp(tab.items[0]).loadData(data.notifyExecutor);
            EUI.getCmp(tab.items[1]).loadData(data.notifyStarter);
            EUI.getCmp(tab.items[tab.items.length - 1]).loadData(data.notifyPosition);
        }
    },
    loadNotifyDataAfter: function (tab, data) {
        // EUI.getCmp(tab.items[0]).loadData(data.notifyExecutor);
        EUI.getCmp(tab.items[0]).loadData(data.notifyStarter);
        EUI.getCmp(tab.items[1]).loadData(data.notifyPosition);
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