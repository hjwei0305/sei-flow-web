/**
 * 显示页面
 */
EUI.TurnToDoView = EUI.extend(EUI.CustomUI, {
    initComponent: function () {
        this.gridCmp = EUI.GridPanel({
            renderTo: this.renderTo,
            title: "任意转办管理",
            border: true,
            tbar: this.initTbar(),
            gridCfg: this.initGrid()
        });
        this.addEvents();
    },
    initTbar: function () {
        var g = this;
        return [{
            xtype: "ComboBox",
            title: "<span style='font-weight: bold'>" + this.lang.modelText + "</span>",
            labelWidth: 60,
            width: 170,
            id: "appModuleComboBoxId",
            async: false,
            canClear: false,
            colon: false,
            name: "appModuleName",
            store: {
                url: _ctxPath + "/businessModel/listAllAppModule"
            },
            field: ["appModuleId"],
            reader: {
                name: "name",
                field: ["id"]
            },
            afterLoad: function (data) {
                var cobo = EUI.getCmp("appModuleComboBoxId");
                cobo.setSubmitValue({
                    appModuleId: data[0].id,
                    appModuleName: data[0].name,
                });
                EUI.getCmp("businessModelComboBoxId").store.params.appModuleId = data[0].id;
                g.getFlowTask();
            },
            afterSelect: function (data) {
                EUI.getCmp("businessModelComboBoxId").store.params.appModuleId = data.data.id;
                EUI.getCmp("businessModelComboBoxId").setValue("");
                EUI.getCmp("flowTypeComboBoxId").setValue("");
                EUI.getCmp("flowTypeComboBoxId").store.params.businessModelId = null;

                EUI.getCmp("businessModelComboBoxId").reset();
                EUI.getCmp("flowTypeComboBoxId").reset();
                g.getFlowTask();
            }
        }, {
            xtype: "ComboBox",
            title: "<span style='font-weight: bold'>" + this.lang.businessEntityText + "</span>",
            labelWidth: 60,
            width: 170,
            id: "businessModelComboBoxId",
            async: true,
            colon: false,
            name: "businessModelName",
            field: ["businessModelId"],
            reader: {
                name: "name",
                field: ["id"]
            },
            loadonce: false,
            store: {
                url: _ctxPath + "/businessModel/listBusinessModuleByAppModelId",
                params: {
                    appModuleId: null
                }
            },
            afterSelect: function (data) {
                EUI.getCmp("flowTypeComboBoxId").store.params.businessModelId = data.data.id;
                EUI.getCmp("flowTypeComboBoxId").setValue("");

                EUI.getCmp("flowTypeComboBoxId").reset();
                g.getFlowTask();
            }
        }, {
            xtype: "ComboBox",
            title: "<span style='font-weight: bold'>" + this.lang.flowTypeText + "</span>",
            labelWidth: 60,
            width: 170,
            id: "flowTypeComboBoxId",
            async: true,
            colon: false,
            name: "flowTypeName",
            field: ["flowTypeId"],
            reader: {
                name: "name",
                field: ["id"]
            },
            loadonce: false,
            store: {
                url: _ctxPath + "/flowInstance/listFlowTypeByBusinessModelId",
                params: {
                    businessModelId: null
                }
            },
            afterSelect: function (data) {
                g.getFlowTask();
            }
        }, '->', {
            xtype: "SearchBox",
            width: 180,
            id: "searchBox",
            displayText: g.lang.searchByNameText,
            onSearch: function (value) {
                g.getFlowTask(true);
            }
        }];
    },
    initGrid: function () {
        var g = this;
        return {
            loadonce: true,
            datatype: "local",
            colModel: [{
                label: this.lang.operateText,
                name: "operate",
                index: "operate",
                width: 80,
                align: "center",
                formatter: function (cellvalue, options, rowObject) {
                    return '<i class="ecmp-flow-turn-to-do turn-to-do-icon handle-icon-size" title="' + g.lang.turnToDoText + '"></i>';
                }
            }, {
                label: "ID",
                name: "id",
                index: "id",
                hidden: true
            }, {
                label: g.lang.flowName,
                name: "flowName",
                index: "flowName"
            }, {
                label: g.lang.taskNameText,
                name: "taskName",
                index: "taskName",
                width: 130
            }, {
                label: g.lang.businessCodeText,
                name: "flowInstance.businessCode",
                index: "flowInstance.businessCode",
                width: 140,
                title: false
            },
                //     {
                //     label: g.lang.taskStatusText,
                //     name: "taskStatus",
                //     index: "taskStatus",
                //     align: "center",
                //     width: 130,
                //     formatter: function (cellvalue, options, rowObject) {
                //         var strVar = '';
                //         if ('INIT' == rowObject.taskStatus) {
                //             strVar = g.lang.todoText;
                //         }
                //         else if ('CANCLE' == rowObject.taskStatus) {
                //             strVar = g.lang.reversedText;
                //         } else if ('COMPLETED' == rowObject.taskStatus) {
                //             strVar = g.lang.doneText;
                //         }
                //         return strVar;
                //     }
                // },
                {
                    label: g.lang.processorNameText,
                    name: "executorName",
                    index: "executorName",
                    width: 130
                }, {
                    label: g.lang.processorAccountText,
                    name: "executorAccount",
                    index: "executorAccount",
                    width: 130
                }, {
                    label: g.lang.depictText,
                    name: "depict",
                    index: "depict",
                    width: 340
                }, {
                    label: g.lang.createTimeText,
                    name: "createdDate",
                    index: "createdDate",
                    width: 160
                }],
            shrinkToFit: false //固定宽度
        };
    },
    addEvents: function () {
        var g = this;
        $(".ecmp-flow-turn-to-do").live("click", function () {
            var data = g.gridCmp.getSelectRow();
            g.showChooseExecutorWind(data.id,data.executorAccount);
        });
    },
    showChooseExecutorWind: function (taskId,executorCode) {
        var g = this;
        g.chooseAnyOneWind = EUI.Window({
            title: "选择转办执行人【可双击选择】",
            width: 720,
            layout: "border",
            height: 380,
            padding: 5,
            itemspace: 0,
            items: [this.initChooseUserWindLeft(), this.InitChooseUserGrid(taskId,executorCode)],
            buttons: [{
                title: "取消",
                handler: function () {
                    g.chooseAnyOneWind.remove();
                }
            }, {
                title: "确定",
                selected: true,
                hidden: false,
                handler: function () {
                    var selectRow = EUI.getCmp("chooseUserGridPanel").getSelectRow();
                    if (typeof(selectRow) == "undefined") {
                        return;
                    }
                    g.turnToDoSubmit(taskId, executorCode,selectRow.id,selectRow.code);
                }
            }]
        });
    },
    initChooseUserWindLeft: function () {
        var g = this;
        return {
            xtype: "Container",
            region: "west",
            border: false,
            width: 250,
            itemspace: 0,
            layout: "border",
            items: [this.initChooseUserWindTopBar(), this.initChooseUserWindTree()]
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
    initChooseUserWindTree: function () {
        var g = this;
        var mask = EUI.LoadMask({msg: "正在加载，请稍候"});
        return {
            xtype: "TreePanel",
            region: "center",
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
                var chooseUserGridPanel = EUI.getCmp("chooseUserGridPanel").setGridParams({
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
                    if (nodeDom == []) {
                        return;
                    }
                    var itemCmp = $(nodeDom[0].children[0]);
                    itemCmp.addClass("ux-tree-freeze");
                    itemCmp.find(".ux-tree-title").text(itemCmp.find(".ux-tree-title").text() + "(已冻结)");
                }
            },
            afterShowTree: function (data) {
                this.setSelect(data[0].id);
                mask.hide();
            }
        }
    },
    InitChooseUserGrid: function (taskId,executorCode) {
        var g = this;
        var isShowMultiselect = false;
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
                        EUI.getCmp("chooseUserGridPanel").localSearch(value);
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
                        name: "organization.name",
                        index: "organization.name",
                        width: 150,
                        align: "center",
                        hidden: true
                    }],
                    ondblClickRow: function (rowid) {
                        var rowData = EUI.getCmp("chooseUserGridPanel").grid.jqGrid('getRowData', rowid);
                        g.turnToDoSubmit(taskId,executorCode, rowData.id,rowData.code);
                    }
                }
            }]
        }
    }
    , turnToDoSubmit: function (taskId, executorCode,userId,userCode) {
        if (__SessionUser.userId == userId) {
            var status = {
                msg: "不能转办给自己",
                success: false,
                showTime: 4
            };
            EUI.ProcessStatus(status);
            return;
        }
        if(executorCode==userCode){
            var status = {
                msg: "不能转办给当前执行人",
                success: false,
                showTime: 4
            };
            EUI.ProcessStatus(status);
            return;
        }
        var g = this;
        var msgBox = EUI.MessageBox({
            title: '提示',
            msg: "转办后当前执行人将对该任务失去所有权，请确定是否继续?",
            buttons: [{
                title: "取消",
                handler: function () {
                    msgBox.remove();
                }
            }, {
                title: "确定",
                selected: true,
                handler: function () {
                    msgBox.remove();
                    var mask = EUI.LoadMask({
                        msg: "正在执行，请稍候..."
                    });
                    EUI.Store({
                        url: _ctxPath + "/flowTask/taskTurnToDo",
                        params: {
                            taskId: taskId,
                            userId: userId
                        },
                        success: function (status) {
                            mask.hide();
                            var status = {
                                msg: "执行成功",
                                success: true
                            };
                            EUI.ProcessStatus(status);
                            g.chooseAnyOneWind.close();
                            g.refresh();
                        },
                        failure: function (response) {
                            mask.hide();
                            EUI.ProcessStatus(response);
                        }
                    });
                }
            }]
        });
    },
    refresh: function () {
        var g=this;
        g.getFlowTask();
    },
    getFlowTask: function (isSearch) {
        var g = this;
        g.gridCmp.grid[0].p.postData = {};
        var postData = {
            "appModuleId": EUI.getCmp("appModuleComboBoxId").getSubmitValue().appModuleId,
            "businessModelId": EUI.getCmp("businessModelComboBoxId").getSubmitValue().businessModelId,
            "flowTypeId": EUI.getCmp("flowTypeComboBoxId").getSubmitValue().flowTypeId,
            "Quick_value": EUI.getCmp("searchBox").getValue(),
            "S_createdDate": "DESC"
        };
        var params = {
            url: _ctxPath + "/flowTask/listAllFlowTaskByTenant",
            loadonce: false,
            datatype: "json",
            postData: postData
        };
        if (isSearch) {
            params.page = 1;
        }
        g.gridCmp.setGridParams(params, true)
    }

});