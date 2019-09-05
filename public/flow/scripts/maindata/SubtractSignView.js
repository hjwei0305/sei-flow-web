/**
 * 显示页面
 */
EUI.SubtractSignView = EUI.extend(EUI.CustomUI, {
    renderTo: null,
    selData: [],
    win: null,
    num: 0,
    initComponent: function () {
        this.gridCmp = EUI.GridPanel({
            renderTo: this.renderTo,
            title: "减签管理",
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
            url: _ctxPath + "/flowTask/getSubtractSignList",
            loadonce: true,
            searchConfig: {
                searchCols: ["businessName", "flowName", "nodeName"]
            },
            colModel: [{
                label: this.lang.operateText, name: "operate", index: "operate", width: 80, align: "center",
                formatter: function (cellvalue, options, rowObject) {
                    return "<i class='ecmp-common-suspend  icon-space' title='" + g.lang.subtractText + "'></i>";
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
        $(".ecmp-common-suspend").live("click", function () {
            var data = g.gridCmp.getSelectRow();
            g.selData = [];
            g.showExecutorWindow(data);
        });
    },
    showExecutorWindow: function (data) {
        var g = this;
        g.win = EUI.Window({
            title: "选择减签【双击左侧执行人列表剔除】",
            padding: 15,
            width: 820,
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
                        g.message("请选择要剔除的执行人!");
                        return false;
                    } else {
                        g.saveSubtractSign();
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
            width: 400,
            id: "selExecutorGrid",
            region: "west",
            gridCfg: {
                hasPager: true,
                multiselect: false,
                loadonce: true,
                rowNum: 15,
                sortname: 'code',
                url: _ctxPath + "/flowTask/getExecutorList?actInstanceId=" + data.actInstanceId + "&taskActKey=" + data.nodeKey,
                colModel: this.executorGridColModel(),
                ondblClickRow: function (rowid) {
                    var cmp = EUI.getCmp("selExecutorGrid");
                    var data = cmp.getGridData();
                    if (data.length == 1) {
                        g.message("执行人不能全部剔除!");
                        return false;
                    }
                    var row = cmp.grid.jqGrid('getRowData', rowid);
                    if (!row) {
                        g.message("请选择一条要剔除的执行人!");
                        return false;
                    }
                    g.deleteRowData([row], cmp);
                    EUI.getCmp("selUserGridGrid").addRowData(row, true);
                    g.selData.push(row.id);
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
            width: 60,
            itemspace: 0,
            layout: "border",
            items: [this.getCenterIcon()]
        }
    },
    getCenterIcon: function () {
        var g = this;
        return {
            xtype: "Container",
            region: "center",
            width: 40,
            border: false,
            isOverFlow: false,
            html: "<div class='ecmp-flow-rightarrow arrow-right' ></div>"
        }
    },
    InitChooseUserGrid: function (taskId) {
        var g = this;
        return {
            xtype: "GridPanel",
            border: true,
            title: "已选择",
            width: 380,
            id: "selUserGridGrid",
            region: "east",
            gridCfg: {
                datatype: "local",
                hasPager:false,
                rowNum: 150,
                loadonce: true,
                multiselect: false,
                sortname: 'code',
                colModel: this.executorGridColModel(),
                ondblClickRow: function (rowid) {

                }
            }
        }

    },
    deleteRowData: function (data, cmp) {
        var g = this;
        for (var i = 0; i < data.length; i++) {
            cmp.deleteRow(data[i].id);
        }
        cmp.setDataInGrid([].concat(cmp.getGridData()), false);
    },
    message: function (msg) {
        EUI.ProcessStatus({msg: msg, success: false});
    },
    saveSubtractSign: function () {
        var g = this;
        var data = g.gridCmp.getSelectRow();
        var myMask = EUI.LoadMask({
            msg: g.lang.subtractMaskMessageText
        });
        EUI.Store({
            url: _ctxPath + "/flowTask/setSubtractSign",
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
        //     msg: g.lang.subtractMessageText,
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
        //                 msg: g.lang.subtractMaskMessageText
        //             });
        //             EUI.Store({
        //                 url: _ctxPath + "/flowTask/setSubtractSign",
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