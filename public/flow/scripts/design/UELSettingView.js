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
  flowTypeId: null,
  propertiesRemark: null,
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
        checkHtmlStr: false,
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
      }, {
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
    }, {
      title: "保存",
      selected: true,
      handler: function () {
        var name, isDefault = false;
        var code = '';
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
        var logicUel = g.logicUelCmp.getValue();
        if (!g.isDefault && !logicUel && g.showName) {
          EUI.ProcessStatus({
            success: false,
            msg: "请填写表达式"
          });
          return;
        }
        if ((!g.isDefault && !logicUel && !g.showName) || g.isDefault) {
          var data = {
            name: name,
            code: code,
            isDefault: isDefault,
            logicUel: logicUel,
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
            flowTypeId: g.flowTypeId,
            expression: g.groovyUelCmp.getValue()
          },
          success: function (result) {
            myMask.hide();
            var data = {
              name: name,
              code: code,
              isDefault: isDefault,
              logicUel: logicUel,
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
        checkHtmlStr: false,
        style: {
          "margin-left": "10px"
        },
        name: "logicUel",
        afterValidate: function (value) {
          if (g.isDefault || !g.properties) {
            return;
          }

          //将后台返回的map键值对按照值的长短进行倒序排列，这样就不会出现有包含关系的属性替换错误
          const map = new Map();
          for (var key in g.properties) {
            map.set(key,g.properties[key]);
          }
          var arrProperties = Array.from(map);
          var propertiesArray =  arrProperties.sort((a,b) => { return b[1].length - a[1].length });
          for (var i in propertiesArray) {
            const property = propertiesArray[i];
            var reg = new RegExp(property[1], "g");
            value = value.replace(reg, property[0]);
          }

          // for (var key in g.properties) {
          //   var reg = new RegExp(g.properties[key], "g");
          //   value = value.replace(reg, key);
          // }

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
        checkHtmlStr: false,
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
    $(".property-item").live({
      "click": function () {
        if (g.isDefault) {
          return;
        }
        var text = $(this).text();
        var key = $(this).attr("key");
        var value = g.logicUelCmp.getValue() + " " + text + " ";
        g.logicUelCmp.setValue(value);
      },
      "mouseenter": function () {
        var dom = $(this);
        if (g.propertiesRemark == null) {
          g.getProperRemark(dom, $(this).attr("key"));
        } else {
          g.showProperRemark(dom, $(this).attr("key"));
        }
      },
      "mouseleave": function () {
        var $tipbox = $("div.tipbox");
        $tipbox.hide();
      }
    });
  },
  getProperRemark: function (dom, key) {
    var g = this;
    if (g.propertiesRemark == null) {
      EUI.Store({
        url: _ctxPath + "/businessModel/getPropertiesRemark",
        params: {
          businessModelCode: this.businessModelCode
        },
        success: function (result) {
          if (result.success) {
            g.propertiesRemark = result.data;
            g.showProperRemark(dom, key);
          } else {
            g.propertiesRemark = [];
          }
        },
        failure: function (result) {
          g.propertiesRemark = [];
        }
      });
    } else {
      g.showProperRemark(dom, key);
    }
  },
  showProperRemark: function (dom, key) {
    var g = this;
    g.initTipBox();
    var addTop = 5;
    if (g.propertiesRemark != null) {
      var propertiesRemark = this.propertiesRemark;
      for (var i  in  propertiesRemark) {
        if (key == i) {
          g.showTipBox(dom, "<span>" + propertiesRemark[i] + "</span>", addTop);
          return;
        }
      }
      g.showTipBox(dom, "<span>无</span>", addTop);
    }
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
    var boxtop = pos.top + top;
    var boxleft = pos.left + left * 2;
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
      "max-width": 420,
      "max-height": 130,
      "z-index": "9999999"
    }).show();
  },
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
