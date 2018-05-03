// 已办部分
EUI.CompleteTaskView = EUI.extend(EUI.CustomUI, {
    renderTo: null,
    pageInfo: {
        page: 1,
        rows: 10,
        total: 1
    },
    searchName:null,
    firstTime:true,
    initComponent: function () {
        this.getCompleteData();
        this.addEvents();
    },
    initHtml: function () {
        $("#" + this.renderTo).empty();
        var html = this.getCompleteTaskHtml();
        $("#" + this.renderTo).append(html);
    },
    //已办界面的外层容器部分
    getCompleteTaskHtml: function () {
        return '            <div class="content-info">' +
            '                    <div class="info-left todo-info"></div>' +
            '               </div>' +
            '               <div class="content-page">' +
            '                   <div class="record-total">共0条记录</div>' +
            '                    <div class="pege-right">' +
            '                        <a href="#" class="first-page pageDisable"><首页</a>' +
            '                        <a href="#" class="prev-page pageDisable"><上一页</a>' +
            '                        <input value="1" class="one">' +
            '                        <a href="#" class="next-page pageDisable">下一页></a>' +
            '                        <a href="#" class="end-page pageDisable">尾页></a>' +
            '                     </div>' +
            '               </div>';
    },
    //已办内容部分的数据调用
    getCompleteData: function () {
        var g = this;
        var myMask;
        if (g.firstTime) {
            myMask = EUI.LoadMask({
                msg: "正在加载请稍候..."
            });
        }
        EUI.Store({
            url: _ctxPath + "/flowHistory/listFlowHistory",
            params: {
                S_createdDate: "DESC",
                page: this.pageInfo.page,
                rows: this.pageInfo.rows,
                Quick_value:this.searchName
            },
            success: function (result) {
                if (g.firstTime) {
                    myMask.hide();
                    g.firstTime = false;
                }
                if (result.records==0) {
                    g.getNotWorkData();
                    return;
                } else if (result.rows) {
                    g.pageInfo.page = result.page;
                    g.pageInfo.total = result.total;
                    g.initHtml();
                    g.getCompleteHtml(result.rows);
                    g.pageJudge();
                    g.showPage(result.records);//数据请求成功后再给总条数赋值
                    $(".one").val(g.pageInfo.page);//数据请求成功后在改变class为one的val值，避免了点击下一页时val值变了却没有获取成功数据
                }
            },
            failure: function (result) {
                if (g.firstTime) {
                    myMask.hide();
                    g.firstTime = false;
                }
                EUI.ProcessStatus(result);
            }
        })
    },
    //已办分页的判断
    pageJudge: function () {
        var g = this;
        if (g.pageInfo.page == 1 && g.pageInfo.total > 1&&g.pageInfo.page < g.pageInfo.total) {
            $(".next-page", "#" + this.renderTo).removeClass("pageDisable");
            $(".next-page", "#" + this.renderTo).mouseenter(function () {
                $(this).addClass("hover");
            }).mouseleave(function () {
                $(this).removeClass("hover");
            });
            $(".end-page", "#" + this.renderTo).removeClass("pageDisable");
            $(".end-page", "#" + this.renderTo).mouseenter(function () {
                $(this).addClass("hover");
            }).mouseleave(function () {
                $(this).removeClass("hover");
            });
            $(".first-page", "#" + this.renderTo).addClass("pageDisable");
            $(".prev-page", "#" + this.renderTo).addClass("pageDisable");
        }else if (g.pageInfo.page > 1 && g.pageInfo.page < g.pageInfo.total) {
            $("a", "#" + this.renderTo).removeClass("pageDisable");
            $("a", "#" + this.renderTo).mouseenter(function () {
                $(this).addClass("hover");
            }).mouseleave(function () {
                $(this).removeClass("hover");
            });
        } else if (g.pageInfo.page > 1 && g.pageInfo.page == g.pageInfo.total) {
            $(".first-page", "#" + this.renderTo).removeClass("pageDisable");
            $(".first-page", "#" + this.renderTo).mouseenter(function () {
                $(this).addClass("hover");
            }).mouseleave(function () {
                $(this).removeClass("hover");
            });
            $(".prev-page", "#" + this.renderTo).removeClass("pageDisable");
            $(".prev-page", "#" + this.renderTo).mouseenter(function () {
                $(this).addClass("hover");
            }).mouseleave(function () {
                $(this).removeClass("hover");
            });
            $(".next-page", "#" + this.renderTo).addClass("pageDisable");
            $(".end-page", "#" + this.renderTo).addClass("pageDisable");
        }
    },
    //当页面没有数据时的显示内容
    getNotWorkData: function () {
        $("#" + this.renderTo).empty();
        var html = '<div class="empty-data">' +
            '<div class="not-data-msg">------------您当前没有已完成的工作------------</div></div>';
        $("#" + this.renderTo).append(html);
    },
    //已办内容部分的循环
    getCompleteHtml: function (items) {
        var g = this;
        $(".todo-info", '#' + this.renderTo).empty();
        for (var j = 0; j < items.length; j++) {
            /* var status = items[j].taskStatus;
             var statusStr = "待办";
             if (status == "INPROCESS") {
             statusStr = "处理中";
             } else if (status == "COMPLETE") {
             statusStr = "结束";
             }*/
            var backoutHtml = (items[j].canCancel == true && items[j].taskStatus == "COMPLETED" && items[j].flowInstance.ended == false) ? '<div class="todo-btn flow-backout-btn"><i class="ecmp-flow-backout backout-icon" title="撤回"></i><span>撤回</span></div>' : "";
            var itemdom = $('<div class="info-item">' +
                '                            <div class="item">' +
                '                                <span class="flow-text">' + items[j].flowName + '_' + items[j].flowTaskName + '</span>' +
                '                            </div>' +
                '                            <div class="item flow-digest">' +
                '                               <span class="digest">' + items[j].flowInstance.businessCode + '-' + items[j].flowInstance.businessModelRemark + '</span></span>' +
                '                            </div>' +
                '                            <div class="item">' +
                '                                <div class="end">' +
                backoutHtml +
                '                                    <div class="todo-btn look-approve-btn"><i class="ecmp-common-view look-icon look-approve" title="查看表单"></i><span>查看表单</span></div>' +
                '                                    <div class="todo-btn flowInstance-btn"><i class="ecmp-flow-history time-icon flowInstance icon-size" title="流程历史"></i><span>流程历史</span></div>' +
                '                                </div>' +
                '                                <span class="item-right task-item-right">' +
                '                                    <div class="userName">发起人：' + items[j].flowInstance.creatorName + '</div>' +
                '                                    <div class="todo-date"><i class="ecmp-flow-history flow-time-icon time-icon-size" title="流程历史"></i><span>处理时间：' + items[j].actEndTime + '</span></div>' +
                '                                </span>' +
                '                            </div>' +
                '</div>');
            itemdom.data(items[j]);
            $(".todo-info", '#' + this.renderTo).append(itemdom);
        }
    },
    //底部翻页部分
    showPage: function (records) {
        $(".record-total", "#" + this.renderTo).text("共" + records + "条记录");
    },
    //底部翻页绑定事件
    pagingEvent: function () {
        var g = this;
        //首页
        $(".first-page", "#" + this.renderTo).live("click", function () {
            if (g.pageInfo.page == 1) {
                $(".first-page", "#" + this.renderTo).addClass("pageDisable");
                return;
            }
            g.pageInfo.page = 1;
            g.getCompleteData();
        });
        //上一页
        $(".prev-page", "#" + this.renderTo).live("click", function () {
            if (g.pageInfo.page == 1) {
                return;
            }
            g.pageInfo.page--;
            g.getCompleteData();
        });
        //下一页
        $(".next-page", "#" + this.renderTo).live("click", function () {
            if (g.pageInfo.page == g.pageInfo.total) {
                return;
            }
            g.pageInfo.page++;
            g.getCompleteData();
        });
        //尾页
        $(".end-page", "#" + this.renderTo).live("click", function () {//点击尾页时
            if (g.pageInfo.page == g.pageInfo.total) {//如果page=total
                return; //就直接return
            }
            g.pageInfo.page = g.pageInfo.total;//page=total
            g.getCompleteData();//请求page=total时的数据
        });
    },
    show: function () {
        $("#" + this.renderTo).css("display", "block");
    },
    hide: function () {
        $("#" + this.renderTo).css("display", "none");
    },
    addEvents: function () {
        var g = this;
        g.pagingEvent();
        g.lookApproveViewWindow();
        g.flowInstanceWindow();
        g.backOutWindow();
    },
    //点击打开查看表单界面的新页签
    lookApproveViewWindow: function () {
        var g = this;
        $(".look-approve-btn", "#" + this.renderTo).live("click", function () {
            var itemdom = $(this).parents(".info-item");
            var data = itemdom.data();
            var url = data.flowInstance.flowDefVersion.flowDefination.flowType.businessModel.lookUrl;
            var tab = {
                title: "查看表单",
                url: _ctxPath + url + "?id=" + data.flowInstance.businessId,
                id: data.flowInstance.businessId
            };
            g.addTab(tab);
        });
    },
    //点击打开流程历史的新页签
    flowInstanceWindow: function () {
        var g = this;
        $(".flowInstance-btn", "#" + this.renderTo).live("click", function () {
            var itemdom = $(this).parents(".info-item");
            var data = itemdom.data();
            EUI.FlowHistory({
                businessId: data.flowInstance.businessId,
                instanceId: data.flowInstance.id
            })
        });
    },
    //撤销
    backOutWindow: function () {
        var g = this;
        $(".flow-backout-btn", "#" + this.renderTo).live("click", function () {
            var itemdom = $(this).parents(".info-item");
            var data = itemdom.data();
            var win = EUI.Window({
                title: "撤回",
                height: 100,
                items: [{
                    xtype: "TextArea",
                    title: "撤回说明",
                    name: 'opinion',
                    id: "opinion",
                    labelWidth: 90,
                    width: 220,
                    height: 80,
                    allowBlank: false
                }],
                buttons: [{
                    title: "取消",
                    handler: function () {
                        win.remove();
                    }
                },{
                    title: "确定",
                    selected: true,
                    handler: function () {
                        var opinion = EUI.getCmp("opinion").getValue();
                        var myMask = EUI.LoadMask({
                            msg: "处理中，请稍后.."
                        });
                        EUI.Store({
                            url: _ctxPath + "/flowClient/cancelTask",
                            params: {
                                preTaskId: data.id,
                                opinion: opinion
                            },
                            success: function (result) {
                                myMask.hide();
                                if (result.success) {
                                    win.close();
                                    //TODO:刷新当前页
                                    window.location.reload();
                                } else {
                                    EUI.ProcessStatus(result);
                                }
                            },
                            failure: function (result) {
                                myMask.hide();
                                EUI.ProcessStatus(result);
                            }
                        })
                    }
                }]
            })
        });
    },
    //在新的窗口打开（模拟新页签的打开方式）
    addTab: function (tab) {
        if (parent.homeView) {
            parent.homeView.addTab(tab);//获取到父窗口homeview，在其中新增页签
        } else {
            window.open(tab.url);
        }
    },
    refresh: function () {
        this.getCompleteData();
    }
});