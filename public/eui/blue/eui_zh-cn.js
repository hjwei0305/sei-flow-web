(function () {
    EUI.error = {
        managerIsExist: '组件ID冲突:{0}',
        noTitle: '\u6807\u9898\u4e0d\u80fd\u4e3a\u7a7a',
        noXtype: '组件类型未定义',
        noCmp: '不存在此类组件：{0}',
        loadError: '服务器出错',
        overLenght: '列长度之和超过1',
        dataError: "加载数据出错",
        neqField: "reader的field未配置完整",
        noCenter: "组件{0}未配置center区域",
        noUrl: "未配置url",
        noName: "组件{0}未配置name属性"
    };
    EUI.cmpText = {
        ok: "确定",
        cancel: "取消",
        reset: "重置",
        clear: "清空",
        refresh: "刷新",
        exportXls: "导出数据",
        adSearchTitle: '高级查询',
        pgtext: "{0} 共{1}页",
        recordtext: "共{2}条",
        flowStatus: "流程处理状态",
        startFlow: "启动业务流程",
        loadingFlow: "正在启动工作流，请稍后...",
        loadingText: "正在发送请求，请稍后..."
    };
    if (EUI.form.Field) {
        EUI.apply(EUI.form.Field.prototype, {
            validateText: "验证失败",
            eqDisplayText: "输入不能",
            loadText: "加载中，请稍候..."
        });
    }
    ;
    if (EUI.form.TextField) {
        EUI.apply(EUI.form.TextField.prototype, {
            minLengthText: '{0}最小长度为 {1} 个字符',
            maxLengthText: '{0}最大长度是 {1} 个字符',
            invalidCharText: '输入的值中含有非法字符:【{0}】!',
            emptyText: "当前无记录!",
            blankText: "{0}不能为空",
            hintPrefixText: "此项"
        });
    }
    ;
    if (EUI.form.NumberField) {
        EUI.apply(EUI.form.NumberField.prototype, {
            maxValueText: '{0}最大值为{1}',
            minValueText: '{0}最小值为{1}',
            notNumberText: '{0}必需为数字',
            negPrecision: '精度位数不能为负数'
        });
    }
    ;
    if (EUI.form.SearchBox) {
        EUI.apply(EUI.form.SearchBox.prototype, {
            displayText: '请输入关键字查询!'
        });
    }
    ;
    if (EUI.MessageBox) {
        EUI.apply(EUI.MessageBox, {
            buttonText: {
                ok: "确定",
                cancel: "取消",
                yes: "是",
                no: "否"
            }
        });

    }
    if (EUI.form.DateField) {
        EUI.apply(EUI.form.DateField.prototype, {
            invalidDateText: "{0} 是无效日期 - 必须符合格式： {1}",
            minDateText: "最小日期为：{0}",
            maxDateText: "最大日期为：{0}"
        });
    }
    if (EUI.form.MonthField) {
        EUI.apply(EUI.form.MonthField.prototype, {
            monthText: '月',
            okText: '确定',
            cancelText: '取消'
        });
    }
    if (EUI.other.Calendar) {
        EUI.apply(EUI.other.Calendar, {
            today: "今天",
            month: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            week: ["日", "一", "二", "三", "四", "五", "六"],
            weekAsc: ["一", "二", "三", "四", "五", "六","日"],
            weekAsc_showDay: ["周","一", "二", "三", "四", "五", "六","日"],
            week_showDay: ["周","日","一", "二", "三", "四", "五", "六"]
        });
    }
    ;
    if (EUI.container.TabPanel) {
        EUI.apply(EUI.container.TabPanel.prototype, {
            overflowText: "最多打开{0}个选项卡，请关闭其他选项卡再打开",
            initTooMuch: "页签数：{0}个，超过了容许打开的最大选项卡数目{1}个"
        });
    }
    if (EUI.other.LoadMask) {
        EUI.apply(EUI.other.LoadMask.prototype, {
            msg: '加载中...'
        });
    }
    ;
    if (EUI.msg && EUI.msg.ProcessStatus) {
        EUI.apply(EUI.msg.ProcessStatus.prototype, {
            defaultTitle: '操作提示',
            defaultError: '系统出现了异常，请与管理员联系!',
            successTitle: '操作成功',
            failureTitle: '操作失败'
        });
    }
    if (EUI.util.Date) {
        EUI.util.Date.lang('zh-cn', {
            months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
            monthsShort: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
            weekdays: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
            weekdaysShort: "周日_周一_周二_周三_周四_周五_周六".split("_"),
            weekdaysMin: "日_一_二_三_四_五_六".split("_"),
            longDateFormat: {
                LT: "Ah点mm",
                L: "YYYY年MMMD日",
                LL: "YYYY年MMMD日",
                LLL: "YYYY年MMMD日LT",
                LLLL: "YYYY年MMMD日ddddLT",
                l: "YYYY年MMMD日",
                ll: "YYYY年MMMD日",
                lll: "YYYY年MMMD日LT",
                llll: "YYYY年MMMD日ddddLT"
            },
            meridiem: function (hour, minute) {
                if (hour < 9) {
                    return "早上";
                } else if (hour < 11 && minute < 30) {
                    return "上午";
                } else if (hour < 13 && minute < 30) {
                    return "中午";
                } else if (hour < 18) {
                    return "下午";
                } else {
                    return "晚上";
                }
            },
            calendar: {
                sameDay: '[今天]LT',
                nextDay: '[明天]LT',
                nextWeek: '[下]ddddLT',
                lastDay: '[昨天]LT',
                lastWeek: '[上]ddddLT',
                sameElse: 'L'
            },
            ordinal: function (number, period) {
                switch (period) {
                    case "d":
                    case "D":
                    case "DDD":
                        return number + "日";
                    case "M":
                        return number + "月";
                    case "w":
                    case "W":
                        return number + "周";
                    default:
                        return number;
                }
            },
            relativeTime: {
                future: "%s内",
                past: "%s前",
                s: "几秒",
                m: "1分钟",
                mm: "%d分钟",
                h: "1小时",
                hh: "%d小时",
                d: "1天",
                dd: "%d天",
                M: "1个月",
                MM: "%d个月",
                y: "1年",
                yy: "%d年"
            }
        });
    }
    if (EUI.file.UploadFile) {
        EUI.apply(EUI.msg.ProcessStatus.prototype, {
            defaultTitle: '操作提示',
            defaultError: '系统出现了异常，请与管理员联系!',
            successTitle: '操作成功',
            failureTitle: '操作失败'
        });
    }
    if (EUI.flow.FlowApprove) {
        EUI.apply(EUI.flow.FlowApprove.prototype, {
            queryMaskMessageText: "正在加载，请稍候...",
            cancelText: "取消",
            okText: "确定",
            submitText: "提交",
            finishText: "完成",
            businessUnitText: "业务单号：",
            docMarkerText: "流程发起人：",
            nowSaveMsgText: "正在保存，请稍候...",
            preExecutorText: "上一步执行人：",
            preApprovalOpinionsText: "上一步审批意见：",
            decisionText: "决策：",
            handlingSuggestionText: "处理意见",
            nextStepText: "下一步",
            formDetailText: "表单明细",
            collectText: "收起",
            chooseNextExecutorText: "选择下一步执行人",
            previousStepText: "上一步",
            spreadText: "展开",
            chooseNextExecuteNodeText: "请选择下一步执行节点",
            operationHintText: "温馨提示",
            stopFlowMsgText: "当前操作流程将会结束，是否继续？",
            generalTaskText: "普通任务",
            singleSignTaskText: "单签任务",
            counterSignTaskText: "会签任务",
            approveTaskText: "审批任务",
            SerialTaskText: "串行任务",
            ParallelTaskText: "并行任务",
            serviceTaskText: "服务任务",
            receiveTaskText: "接收任务",
            poolTaskText:"工作池任务",
            poolTaskStartDecText:"工作池任务不需要在当前选择执行人，可直接执行",
            showUserInfoText: "名称：{0}，岗位：{1}，组织机构：{2}，编号：{3}",
            showUserInfo2Text: "名称：{0}，组织机构：{1}，编号：{2}",
            chooseExecutorMsgText: "请选择[{0}]的执行人",
            seachByIdOrNameText: "请输入名称或编号搜索",
            organization2Text: "组织机构",
            userNumberText: "员工编号",
            userNameText: "用户名称",
            userIDText: "用户ID",
            freezeText: "(已冻结)",
            arbitraryExecutorText: "任意执行人",
            chooseText: "添加执行人",
            searchDisplayText: "请输入关键字搜索",
            chooseArbitraryExecutorText: "选择任意执行人",
            chooseArbitraryExecutorMsgText: "选择任意执行人【可双击选择】"
        });
    }
    if (EUI.flow.FlowStart) {
        EUI.apply(EUI.flow.FlowStart.prototype, {
            launchMaskMsgText: "正在启动，请稍候",
            notFoundFlowDefinitionText: "找不到流程定义",
            notFoundFlowTypeText: "找不到流程类型",
            launchFlowText: "流程启动",
            chooseFlowTypeText: "选择流程类型",
            flowTypeText: "流程类型",
            generalTaskText: "普通任务",
            singleSignTaskText: "单签任务",
            counterSignTaskText: "会签任务",
            approveTaskText: "审批任务",
            SerialTaskText: "串行任务",
            ParallelTaskText: "并行任务",
            serviceTaskText: "服务任务",
            receiveTaskText: "接收任务",
            poolTaskText:"工作池任务",
            poolTaskStartDecText:"工作池任务不需要在当前选择执行人，可直接执行",
            showUserInfoText: "名称：{0}，岗位：{1}，组织机构：{2}，编号：{3}",
            showUserInfo2Text: "名称：{0}，组织机构：{1}，编号：{2}",
            chooseExecutorMsgText: "请选择[{0}]的执行人",
            launchSuccessText: "启动成功",
            searchDisplayText: "请输入关键字搜索"
        });
    }
    if (EUI.flow.FlowHistory) {
        EUI.apply(EUI.flow.FlowHistory.prototype, {
            queryMaskMessageText: "正在加载，请稍候...",
            startText: "发起",
            flowInfoText: "流程信息",
            launchHistoryText: "启动历史",
            showFlowDiagramText: "查看流程图",
            processStatusText: "当前处理状态",
            flowProcessHistoryText: "流程处理历史",
            flowEndText: "流程结束",
            flowLaunchText: "流程启动",
            processorText: "处理人：",
            timeCunsumingText: "耗时：",
            handleAbstractText: "处理摘要：",
            noneText: "无",
            flowFinishedText: "流程已处理完成",
            flowInSuspendText: "流程处理中，还未生成待办",
            waitProcessorText: "等待处理人：",
            taskArrivalTimeText: "任务到达时间：",
            dayText: "天",
            hourText: "小时",
            minuteText: "分",
            secondText: "秒",
            milliSecondsText: "毫秒",
            flowDiagramText: "流程图"
        });
    }
    if (EUI.flow.FlowHistoryTab) {
        EUI.apply(EUI.flow.FlowHistoryTab.prototype, {
            queryMaskMessageText: "正在加载，请稍候...",
            startText: "发起",
            flowInfoText: "流程信息",
            launchHistoryText: "启动历史",
            showFlowDiagramText: "查看流程图",
            processStatusText: "当前处理状态",
            flowProcessHistoryText: "流程处理历史",
            flowEndText: "流程结束",
            flowLaunchText: "流程启动",
            processorText: "处理人：",
            timeCunsumingText: "耗时：",
            handleAbstractText: "处理摘要：",
            noneText: "无",
            flowFinishedText: "流程已处理完成",
            flowInSuspendText: "流程处理中，还未生成待办",
            waitProcessorText: "等待处理人：",
            taskArrivalTimeText: "任务到达时间：",
            dayText: "天",
            hourText: "小时",
            minuteText: "分",
            secondText: "秒",
            milliSecondsText: "毫秒",
            flowDiagramText: "流程图"
        });
    }
})();
(function ($) {
    $.jgrid = {
        defaults: {
            recordtext: "共{2}条", // 共字前是全角空格
            emptyrecords: "无数据显示",
            loadtext: "正在获取数据...",
            pgtext: "{0}共{1}页"
        },
        search: {
            caption: "搜索...",
            Find: "查找",
            Reset: "重置",
            odata: ['等于\u3000\u3000', '不等\u3000\u3000', '小于\u3000\u3000', '小于等于', '大于\u3000\u3000', '大于等于',
                '开始于', '不开始于', '属于\u3000\u3000', '不属于', '结束于', '不结束于', '包含\u3000\u3000', '不包含'],
            groupOps: [{op: "AND", text: "所有"}, {op: "OR", text: "任一"}],
            matchText: " 匹配",
            rulesText: " 规则"
        },
        edit: {
            addCaption: "添加记录",
            editCaption: "编辑记录",
            bSubmit: "提交",
            bCancel: "取消",
            bClose: "关闭",
            saveData: "数据已改变，是否保存？",
            bYes: "是",
            bNo: "否",
            bExit: "取消",
            msg: {
                required: "此字段必需",
                number: "请输入有效数字",
                minValue: "输值必须大于等于 ",
                maxValue: "输值必须小于等于 ",
                email: "这不是有效的e-mail地址",
                integer: "请输入有效整数",
                date: "请输入有效时间",
                url: "无效网址。前缀必须为 ('http://' 或 'https://')",
                nodefined: " 未定义！",
                novalue: " 需要返回值！",
                customarray: "自定义函数需要返回数组！",
                customfcheck: "Custom function should be present in case of custom checking!"

            }
        },
        view: {
            caption: "查看记录",
            bClose: "关闭"
        },
        del: {
            caption: "删除",
            msg: "删除所选记录？",
            bSubmit: "删除",
            bCancel: "取消"
        },
        nav: {
            edittext: "",
            edittitle: "编辑所选记录",
            addtext: "",
            addtitle: "添加新记录",
            deltext: "",
            deltitle: "删除所选记录",
            searchtext: "",
            searchtitle: "查找",
            refreshtext: "",
            refreshtitle: "刷新表格",
            alertcap: "注意",
            alerttext: "请选择记录",
            viewtext: "",
            viewtitle: "查看所选记录"
        },
        col: {
            caption: "选择列",
            bSubmit: "确定",
            bCancel: "取消"
        },
        errors: {
            errcap: "错误",
            nourl: "没有设置url",
            norecords: "没有要处理的记录",
            model: "colNames 和 colModel 长度不等！"
        },
        formatter: {
            integer: {thousandsSeparator: " ", defaultValue: '0'},
            number: {decimalSeparator: ".", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0.00'},
            currency: {
                decimalSeparator: ".",
                thousandsSeparator: " ",
                decimalPlaces: 2,
                prefix: "",
                suffix: "",
                defaultValue: '0.00'
            },
            date: {
                dayNames: [
                    "Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat",
                    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
                ],
                monthNames: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                AmPm: ["am", "pm", "AM", "PM"],
                S: function (j) {
                    return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th'
                },
                srcformat: 'Y-m-d',
                newformat: 'm-d-Y',
                masks: {
                    ISO8601Long: "Y-m-d H:i:s",
                    ISO8601Short: "Y-m-d",
                    ShortDate: "Y/j/n",
                    LongDate: "l, F d, Y",
                    FullDateTime: "l, F d, Y g:i:s A",
                    MonthDay: "F d",
                    ShortTime: "g:i A",
                    LongTime: "g:i:s A",
                    SortableDateTime: "Y-m-d\\TH:i:s",
                    UniversalSortableDateTime: "Y-m-d H:i:sO",
                    YearMonth: "F, Y"
                },
                reformatAfterEdit: false
            },
            baseLinkUrl: '',
            showAction: '',
            target: '',
            checkbox: {disabled: true},
            idName: 'id'
        }
    };
})(jQuery);