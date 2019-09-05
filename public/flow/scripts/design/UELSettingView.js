/**
 * Created by fly on 2017/4/18.
 */
EUI.UELSettingView = EUI.extend(EUI.CustomUI, {
    data: null,
    showName: true,
    afterConfirm: null,
    businessModelId: null,
    businessModelCode: null,
    properties: null,
    isDefault: false,
    flowTypeId:null,

    initComponent: function () {
        this.isDefault = this.data ? this.data.isDefault : false;
        var items, height = 450;
        if (!this.showName) {
            items = [this.initLeft(), this.initCenter()];
            height = 400;
        } else {
            items = [this.initTop(), this.initLeft(), this.initCenter()];
        }
        this.window = EUI.Window({
            width: 710,
            height: height,
            padding: 10,
            title: this.title,
            iconCss: "ecmp-eui-setting",
            buttons: this.getButtons(),
            layout: "border",
            items: items
        })
        ;
        this.logicUelCmp = EUI.getCmp("logicUel");
        this.groovyUelCmp = EUI.getCmp("groovyUel");
        this.addEvents();
        this.getProperties();
        if (this.data && !Object.isEmpty(this.data)) {
            this.loadData();
        }
    },
    initTop: function () {
        var g = this;
        return {
            xtype: "FormPanel",
            id: "uelform",
            region: "north",
            height: 40,
            padding: 0,
            isOverFlow: false,
            border: false,
            itemspace: 20,
            layout: "auto",
            items: [{
                xtype: "TextField",
                name: "name",
                id: "name",
                title: "表达式名称",
                labelWidth: 100,
                width: 250,
                checkHtmlStr:false,
                readonly: this.isDefault,
                value: this.data ? this.data.name : "",
                allowBlank: false
            }, {
                xtype: "CheckBox",
                name: "isDefault",
                title: "默认路径",
                labelFirst: false,
                value: this.isDefault,
                onChecked: function (value) {
                    g.setDefault(value);
                }
            },{
                xtype: "TextField",
                name: "code",
                id: "nodeFlowCode",
                title: "代码",
                labelWidth: 50,
                width: 100,
                value: this.data ? this.data.code : ""
            }]
        };
    },
    setDefault: function (isDefault) {
        var nameCmp = EUI.getCmp("name");
        nameCmp.setReadOnly(isDefault);
        this.logicUelCmp.setReadOnly(isDefault);
        if (isDefault) {
            this.logicUelCmp.reset();
            this.groovyUelCmp.reset();
            nameCmp.setValue("默认");
        }
        this.isDefault = isDefault;
    },
    getButtons: function () {
        var g = this;
        return [{
            title: "取消",
            handler: function () {
                g.window.close();
            }
        },{
            title: "保存",
            selected: true,
            handler: function () {
                var name, isDefault = false;
                var code='';
                if (g.showName) {
                    var formPanel = EUI.getCmp("uelform");
                    var headData = formPanel.getFormValue();
                    isDefault = headData.isDefault;
                    name = headData.name;
                    code = headData.code;
                    if (!headData.name) {
                        EUI.ProcessStatus({
                            success: false,
                            msg: "请填写表达式名称"
                        });
                        return;
                    }
                }
                var logicUel=g.logicUelCmp.getValue();
                if(!g.isDefault&&!logicUel&&g.showName){
                    EUI.ProcessStatus({
                        success: false,
                        msg: "请填写表达式"
                    });
                    return;
                }
                if((!g.isDefault&&!logicUel&&!g.showName)||g.isDefault){
                    var data = {
                        name: name,
                        code:code,
                        isDefault: isDefault,
                        logicUel:logicUel ,
                        groovyUel: g.groovyUelCmp.getValue()
                    };
                    g.afterConfirm && g.afterConfirm.call(this, data);
                    g.window.close();
                    return;
                }
                var myMask = EUI.LoadMask({
                    msg: "正在验证表达式，请稍后..."
                });
                EUI.Store({
                    url: _ctxPath + "/flowDefination/validateExpression",
                    params: {
                        flowTypeId:g.flowTypeId,
                        expression:g.groovyUelCmp.getValue()
                    },
                    success: function (result) {
                        myMask.hide();
                        var data = {
                            name: name,
                            code:code,
                            isDefault: isDefault,
                            logicUel:logicUel ,
                            groovyUel: g.groovyUelCmp.getValue()
                        };
                        g.afterConfirm && g.afterConfirm.call(this, data);
                        g.window.close();
                    },
                    failure: function (result) {
                        myMask.hide();
                        EUI.ProcessStatus(result);
                    }
                })
            }
        }];
    },
    initLeft: function () {
        return {
            region: "west",
            width: 165,
            html: "<div class='property-box'></div>"
        };
    },
    initCenter: function () {
        var g = this;
        return {
            region: "center",
            items: [{
                xtype: "Container",
                height: 100,
                isOverFlow: false,
                id: "calculate",
                html: this.initCalculateBtns()
            }, {
                xtype: "TextArea",
                width: 489,
                height: 120,
                id: "logicUel",
                readonly: this.isDefault,
                checkHtmlStr:false,
                style: {
                    "margin-left": "10px"
                },
                name: "logicUel",
                afterValidate: function (value) {
                    if (g.isDefault || !g.properties) {
                        return;
                    }
                    for (var key in g.properties) {
                        var reg = new RegExp(g.properties[key], "g");
                        value = value.replace(reg, key);
                    }
                    if (!value) {
                        g.groovyUelCmp.setValue("");
                        return;
                    }
                    g.groovyUelCmp.setValue("#{" + value + "}");
                }
            }, {
                xtype: "TextArea",
                width: 489,
                height: 120,
                name: "groovyUel",
                checkHtmlStr:false,
                style: {
                    "margin-left": "10px"
                },
                id: "groovyUel",
                readonly: true
            }
            ]
        };
    },
    initCalculateBtns: function () {
        var html = "";
        for (var i = 0; i < _flowUelBtn.length; i++) {
            var item = _flowUelBtn[i];
            html += "<div class='calculate-btn' uel='" + item.uel + "' operator='" + item.operator + "'>" + item.name + " " + item.operator + "</div>";
        }
        return html;
    }
    ,
    addEvents: function () {
        var g = this;
        $(".calculate-btn").bind("click", function () {
            if (g.isDefault) {
                return;
            }
            // var operator = " " + $(this).attr("operator") + " ";
            var uel = " " + $(this).attr("uel") + " ";
            var value = g.logicUelCmp.getValue() + uel;
            g.logicUelCmp.setValue(value);
        });
        $(".property-item").live("click", function () {
            if (g.isDefault) {
                return;
            }
            var text = $(this).text();
            var key = $(this).attr("key");
            var value = g.logicUelCmp.getValue() + " " + text + " ";
            g.logicUelCmp.setValue(value);
        });
    }
    ,
    getProperties: function () {
        var g = this;
        EUI.Store({
            url: _ctxPath + "/businessModel/getProperties",
            params: {
                businessModelCode: this.businessModelCode
            },
            success: function (result) {
                g.properties = result.data;
                g.showProperties(result.data);
            },
            failure: function (result) {
                EUI.ProcessStatus(result);
            }
        });
    }
    ,
    showProperties: function (data) {
        var html = "";
        for (var key in data) {
            html += "<div class='property-item' key='" + key + "'>" + data[key] + "</div>";
        }
        $(".property-box").append(html);
    },
    loadData: function () {
        this.logicUelCmp.setValue(this.data.logicUel);
        this.groovyUelCmp.setValue(this.data.groovyUel);
    }
})
;
