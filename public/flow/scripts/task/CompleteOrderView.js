//处理完成单据
EUI.CompleteOrderView = EUI.extend(EUI.CustomUI, {
    renderTo: null,
    params: {
        page: 1,
        rows: 5,
        records:0,
        S_createdDate: "DESC",
        Quick_value: null,
        Q_GE_startDate__Date: null,
        Q_LE_endDate__Date: null,
        Q_EQ_ended__Boolean: true
    },
    initComponent: function () {
        this.params.Q_GE_startDate__Date = this.startDate;
        this.params.Q_LE_endDate__Date = this.endDate;
        this.boxCmp = EUI.Container({
            renderTo: this.renderTo,
            padding: 0,
            html: '<div class="info-left invoice-info"></div>'
                // +'<div class="load-more"><span>获取更多</span></div>'
                +'<div class="footer"><div id="pagination-box" class="pagination"></div></div>'
            + '<div class="empty-data"><div class="not-data-msg">------------您当前没有已完成的单据------------</div></div>'
        });
        this.dataDom = $(".invoice-info", "#" + this.renderTo);
        this.emptyDom = $(".empty-data", "#" + this.renderTo);
     //   this.loadMoreDom = $(".load-more", "#" + this.renderTo);
        this.initPagination();
        this.getData();
        this.addEvents();
    },
    initPagination: function(){
        var g = this;
        this.paginationDom = $("#pagination-box", "#" + this.renderTo);
        this.paginationDom.jqPaginator({
            totalPages: 1,
            pageSize: this.params.rows,
            visiblePages: 10,
            currentPage: 1,
            first: '<li class="first"><a href="javascript:void(0);">首页<\/a><\/li>',
            prev: '<li class="prev"><a href="javascript:void(0);">上一页<\/a><\/li>',
            next: '<li class="next"><a href="javascript:void(0);">下一页<\/a><\/li>',
            last: '<li class="last"><a href="javascript:void(0);">末页<\/a><\/li>',
            page: '<li class="page"><a href="javascript:void(0);">{{page}}<\/a><\/li>',
            onPageChange: function (pageNum, type) {
                g.params.page = pageNum;
                g.getData();
            }
        });
    },
//已办单据的数据调用
    getData: function () {
        var g = this;
        var myMask = EUI.LoadMask({
            msg: "正在加载,请稍候..."
        });
        EUI.Store({
            url: _ctxPath + "/flowInstance/getMyBills",
            params: this.params,
            success: function (result) {
                if (result.records == 0) {
                    g.params.page = 1;
                    g.showEmptyWorkInfo();
                } else if (result.rows.length > 0) {
                    g.showContent(result);
                    g.showData(result.rows);
                } else {
                    EUI.ProcessStatus({
                        success: true,
                        msg: "没有更多数据"
                    });
                }
               /* if (result.rows.length == this.params.rows) {
                    g.params.page++;
                }*/
                myMask.hide();
            },
            failure: function (result) {
                myMask.hide();
                EUI.ProcessStatus(result);
            }
        })
    }
    ,
//已办单据界面内容部分的循环
    showData: function (datas) {
        var html = "";
        var fragment = $("<div></div>");
        if (datas) {
            for (var i = 0; i < datas.length; i++) {
                var item = datas[i];
                var businessModelRemark = '';
                if(item.businessModelRemark&&item.businessModelRemark!='null'){
                    businessModelRemark = item.businessModelRemark;
                }
                var businessName = '';
                var flowText="";
                if(item.businessName&&item.businessName!='null'){
                    businessName = item.businessName;
                    flowText = '【' + item.businessCode + '】' + '-' + businessName;
                }else{
                    flowText = '【' + item.businessCode + '】';
                }
                html = $('<div class="info-items">' +
                    ' <div class="item">' +
                    '     <span class="flow-text">' + flowText + '</span>' +
                    ' </div>' +
                    ' <div class="item">' +
                    '     <div class="remark">' + businessModelRemark +
                    '     </div>' +
                    ' </div>' +
                    ' <div class="item">' +
                    '    <div class="end">' +
                    '         <div class="todo-btn look-approve-btn"><i class="ecmp-common-view look-icon look-approve" title="查看表单"></i><span>查看表单</span></div>' +
                    '         <div class="todo-btn todo-end-btn flowInstance-btn"><i class="ecmp-flow-history time-icon flowInstance icon-size" title="流程历史"></i><span>流程历史</span></div>' +
                    '    </div>' +
                    '     <span class="item-right general" title="流程结束时间">' + item.endDate + '</span>' +
                    ' </div>' +
                    '</div>');
                html.data(item);
           //     this.dataDom.append(html);
                fragment.append(html)
            }
            this.dataDom.html(fragment);
        }
    }
    ,
    show: function () {
        this.boxCmp.show();
    }
    ,
    hide: function () {
        this.boxCmp.hide();
    }
    ,
    /*showContent: function (result) {
        this.dataDom.show();
        if (this.params.page == 1) {
            this.dataDom.empty();
        } else {
            var index = (this.params.page - 1) * this.params.rows - 1;
            $(".info-items:gt(" + index + ")", this.dataDom).remove();
        }
        var loaded = result.rows.length + (this.params.page - 1) * this.params.rows;
        if (result.records > loaded) {
            this.loadMoreDom.show();
        } else {
            this.loadMoreDom.hide();
        }
        this.emptyDom.hide();
    },*/
    showContent: function (result) {
        this.dataDom.show();
        $(".footer").show();
        if (this.params.page == 1) {
            this.dataDom.empty();
        }
        if(!this.paginationDom.html()){
        }else{
            this.paginationDom.jqPaginator('option', {
                totalPages: result.total,//根据返回的总条目数动态显示页码总数
                currentPage: result.page
            });
        }
        this.emptyDom.hide();
    },
    //当页面没有数据时的显示内容
    showEmptyWorkInfo: function () {
        this.emptyDom.show();
        this.dataDom.hide();
       // this.loadMoreDom.hide();
        $(".footer").hide();
        this.dataDom.empty();
    }
    ,
    refresh: function (params) {
        this.params.page = 1;
        EUI.apply(this.params, params);
        this.getData();
    }
    ,
    addEvents: function () {
        var g = this;
        this.lookApproveViewWindow();
        this.flowInstanceWindow();
        $(".not-data-msg", "#" + this.renderTo).bind("click", function () {
            g.getData();
        });
       /* this.loadMoreDom.click(function () {
            g.getData();
        });*/
    }
    ,
//点击打开查看表单界面的新页签
    lookApproveViewWindow: function () {
        var g = this;
        $(".look-approve-btn", "#" + this.renderTo).live("click", function () {
            var itemdom = $(this).parents(".info-items");
            var data = itemdom.data();
            // console.log(data);
            var url = data.lookUrl;
            var webBaseAddress = data.webBaseAddress;
            if(webBaseAddress.charAt(0)!='/'){
                webBaseAddress = '/'+webBaseAddress;
            }
            if(webBaseAddress.charAt(webBaseAddress.length-1)!='/' && url.charAt(0)!='/'){
                webBaseAddress = webBaseAddress+'/';
            }else if(webBaseAddress.charAt(webBaseAddress.length-1)=='/' && url.charAt(0)=='/'){
                webBaseAddress = webBaseAddress.substring(0,webBaseAddress.length-1);
            }
            webBaseAddress = webBaseAddress+url;
            var tab = {
                title: "查看表单",
                url: _basePath +  webBaseAddress + "?id=" + data.businessId,
                id: data.businessId
            };
            g.addTab(tab);
        });
    }
    ,
//点击打开流程历史的新页签
    flowInstanceWindow: function () {
        var g = this;
        $(".flowInstance-btn", "#" + this.renderTo).live("click", function () {
            var itemdom = $(this).parents(".info-items");
            var data = itemdom.data();
            EUI.FlowHistory({
                businessId: data.businessId,
                instanceId: data.flowInstanceId
            })
        });
    }
    ,
//在新的窗口打开（模拟新页签的打开方式）
    addTab: function (tab) {
        if (parent.homeView) {
            parent.homeView.addTab(tab);//获取到父窗口homeview，在其中新增页签
        } else {
            window.open(tab.url);
        }
    }
})
;