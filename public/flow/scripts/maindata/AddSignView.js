/**
 * 显示页面
 */
EUI.AddSignView = EUI.extend(EUI.CustomUI, {
    renderTo: null,
    selData: [],
    win: null,
    initComponent: function () {
        this.gridCmp = EUI.GridPanel({
            renderTo: this.renderTo,
            title: "加签管理",
            border: true,
            tbar: this.initTbar(),
            gridCfg: this.initGrid()
        });
        this.addEvents();
    },
    initTbar: function () {
        var g = this;
        return ['->', {
            xtype: "SearchBox",
            displayText: g.lang.searchBoxText,
            onSearch: function (value) {
                g.gridCmp.localSearch(value);
            },
            afterClear: function () {
                g.gridCmp.localSearch("");
            }
        }];
    },
    initGrid: function () {
        var g = this;
        return {
            url: _ctxPath + "/flowTask/getAddSignList",
            loadonce: true,
            searchConfig: {
                searchCols: ["businessName", "flowName", "nodeName"]
            },
            colModel: [{
                label: this.lang.operateText, name: "operate", index: "operate", width: 80, align: "center",
                formatter: function (cellvalue, options, rowObject) {
                    return "<i  class='ecmp-common-add  icon-space' title='" + g.lang.addText + "'></i>";
                }
            },
                {name: "actInstanceId", index: "actInstanceId", hidden: true},
                {name: "businessId", index: "businessId", hidden: true},
                {label: g.lang.flowDefKeyText, name: "flowDefKey", index: "flowDefKey", width: 160},
                {label: g.lang.flowNameText, name: "flowName", index: "flowName", width: 160},
                {label: g.lang.nodeKeyText, name: "nodeKey", index: "nodeKey", width: 160, sortable: true},
                {label: g.lang.nodeNameText, name: "nodeName", index: "nodeName", width: 160, sortable: true},
                {label: g.lang.businessCodeText, name: "businessCode", index: "businessCode", width: 120, sortable: true},
                {label: g.lang.businessNameText, name: "businessName", index: "businessName", width: 160},
                {
                    label: g.lang.businessModelRemarkText,
                    name: "businessModelRemark",
                    index: "businessModelRemark",
                    width: 380
                }
            ],
            rowNum: 15,
            sortname: "rank",
            shrinkToFit: false
        };
    },
    addEvents: function () {
        var g = this;
        $(".ecmp-common-add").live("click", function () {
            var data = g.gridCmp.getSelectRow();
            g.selData = [];
            g.showExecutorWindow(data);
        });
    },
    showExecutorWindow: function (data) {
        var g = this;
        g.win = EUI.Window({
            title: "选择加签【双击右侧用户列表添加】",
            padding: 15,
            width: 920,
            height: 400,
            buttons: [{
                title: "取消",
                handler: function () {
                    g.win.close();
                }
            }, {
                title: "确定",
                selected: true,
                handler: function () {
                    if (g.selData.length == 0) {
                        g.message("请添加执行人!");
                        return false;
                    } else {
                        g.saveAddSign();
                    }
                }
            }],
            items: [{
                xtype: "Container",
                layout: "border",
                border: false,
                padding: 0,
                itemspace: 0,
                items: [this.initExecutorWind(data), this.initChooseUserWindLeft(), this.InitChooseUserGrid()]
            }]
        });
    },
    initExecutorWind: function (data) {
        var g = this;
        return {
            xtype: "GridPanel",
            border: true,
            title: "会签执行人",
            width: 320,
            id: "selExecutorGrid",
            region: "west",
            gridCfg: {
                hasPager: false,
                multiselect: false,
                loadonce: true,
                sortname: 'code',
                rowNum: 150,
                url: _ctxPath + "/flowTask/getExecutorList?actInstanceId=" + data.actInstanceId + "&taskActKey=" + data.nodeKey,
                colModel: this.executorGridColModel(),
                ondblClickRow: function (rowid) {

                }
            }
        }
    },
    executorGridColModel: function () {
        return [{
            name: "id",
            index: "id",
            hidden: true
        }, {
            label: this.lang.nameText,
            name: "name",
            index: "name",
            width: 100
        }, {
            label: this.lang.codeText,
            name: "code",
            index: "code",
            width: 100
        }, {
            label: this.lang.organizationNameText,
            name: "organizationName",
            index: "organizationName",
            width: 100,
            hidden: true
        }];
    },
    initChooseUserWindLeft: function () {
        var g = this;
        return {
            xtype: "Container",
            region: "center",
            border: false,
            width: 250,
            itemspace: 0,
            layout: "border",
            items: [this.getCenterIcon(), this.initChooseUserWindTopBar(), this.initChooseUserWindTree()]
        }
    },
    getCenterIcon: function () {
        var g = this;
        return {
            xtype: "Container",
            region: "west",
            width: 40,
            border: false,
            isOverFlow: false,
            html: "<div class='ecmp-flow-leftarrow arrow-left' ></div>"
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
                displayText: g.lang.searchText,
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
    InitChooseUserGrid: function (taskId) {
        var g = this;
        return {
            xtype: "Container",
            region: "east",
            itemspace: 0,
            width: 320,
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
                    displayText: g.lang.searchAndCodeText,
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
                    multiselect: false,
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
                        width: 150
                    }, {
                        label: "组织机构",
                        name: "organization.name",
                        index: "organization.name",
                        align: "center",
                        hidden: true
                    }],
                    ondblClickRow: function (rowid) {
                        var rowData = EUI.getCmp("chooseUserGridPanel").grid.jqGrid('getRowData', rowid);
                        var setData = {};
                        if (!rowData) {
                            g.message("请选择一条要操作的行项目!");
                            return false;
                        } else {
                            var data = EUI.getCmp("selExecutorGrid").getGridData();
                            for (var i = 0; i < data.length; i++) {
                                var dataRow = data[i];
                                if (dataRow.id == rowData.id) {
                                    g.message("已存的执行人不能再进行添加!");
                                    return false;
                                }
                            }
                            setData.id = rowData.id;
                            setData.name = rowData.userName;
                            setData.code = rowData.code;
                            setData.organizationName = rowData["organization.name"];
                        }
                        EUI.getCmp("selExecutorGrid").addRowData(setData, true);
                        g.selData.push(setData.id);
                    }
                }
            }]
        }
    },
    message: function (msg) {
        EUI.ProcessStatus({msg: msg, success: false});
    },
    saveAddSign: function () {
        var g = this;
        var data = g.gridCmp.getSelectRow();

        var myMask = EUI.LoadMask({
            msg: g.lang.addMaskMessageText
        });
        EUI.Store({
            url: _ctxPath + "/flowTask/setAddSign",
            params: {
                "actInstanceId": data.actInstanceId,
                "taskActKey": data.nodeKey,
                "userIds": g.selData
            },
            success: function (result) {
                var status = {
                    msg: result.msg,
                    success: result.success,
                    showTime:6
                };
                EUI.ProcessStatus(status);
                myMask.hide();
                g.win.close();
            },
            failure: function (re) {
                myMask.hide();
                g.message(re.msg);
            }
        });

        // var infoBox = EUI.MessageBox({
        //     title: g.lang.tiShiText,
        //     msg: g.lang.addMessageText,
        //     buttons: [{
        //         title: g.lang.cancelText,
        //         handler: function () {
        //             infoBox.remove();
        //         }
        //     }, {
        //         title: g.lang.okText,
        //         selected: true,
        //         handler: function () {
        //             infoBox.remove();
        //             var myMask = EUI.LoadMask({
        //                 msg: g.lang.addMaskMessageText
        //             });
        //             EUI.Store({
        //                 url: _ctxPath + "/flowTask/setAddSign",
        //                 params: {
        //                     "actInstanceId": data.actInstanceId,
        //                     "taskActKey": data.nodeKey,
        //                     "userIds": g.selData
        //                 },
        //                 success: function (result) {
        //                     var status = {
        //                         msg: result.msg,
        //                         success: result.success
        //                     };
        //                     EUI.ProcessStatus(status);
        //                     myMask.hide();
        //                     g.win.close();
        //                 },
        //                 failure: function (re) {
        //                     myMask.hide();
        //                     g.message(re.msg);
        //                 }
        //             });
        //         }
        //     }]
        // });


    }

});