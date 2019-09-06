/**
 * UI框架核心架构文件
 */
window.EUI = {
    version: '1.0.15',
    namespace: function () {
        var o, d, s;
        for (var i = 0; i < arguments.length; i++) {
            d = arguments[i].split(".");
            o = window[d[0]] = window[d[0]] || {};
            s = d.slice(1);
            for (var m = 0; m < s.length; m++) {
                o = o[s[m]] = o[s[m]] || {};
            }
        }
        return o;
    },
    BLANK_IMAGE_URL: 'http://' + window.location.host
    + '/EasyFee/UI/resources/images/s.gif',
    managers: {},
    managerCount: 0,
    zindex: 100,
    isDefined: function (v) {
        return typeof v !== 'undefined';
    },
    getId: function (type) {
        var prefix = type ? type : "";
        var id = prefix + (1000 + EUI.managerCount);
        EUI.managerCount++;
        return id;
    },
    applyIf: function (o, c) {
        if (o) {
            for (var p in c) {
                if (!EUI.isDefined(o[p])) {
                    o[p] = c[p];
                }
            }
        }
        return o;
    },
    apply: function (o, c, defaults) {
        if (!o) {
            o = {};
        }
        if (defaults) {
            EUI.apply(o, defaults);
        }
        if (c && typeof c == 'object') {
            for (var p in c) {
                o[p] = c[p];
            }
        }
        return o;
    },
    applyHave: function (o, c) {
        if (o && c && typeof c == 'object') {
            for (var p in o) {
                if (c[p] != undefined && c[p] != null)
                    o[p] = c[p];
            }
        }
        return o;
    },
    override: function (origclass, overrides) {
        if (overrides) {
            var p = origclass.prototype;
            EUI.apply(p, overrides);
            if (overrides.hasOwnProperty('toString')) {
                p.toString = overrides.toString;
            }
        }
    },
    extend: function () {
        // inline overrides
        var io = function (o) {
            for (var m in o) {
                this[m] = o[m];
            }
        };
        var oc = Object.prototype.constructor;

        return function (sb, sp, overrides) {
            if (typeof sp == 'object') {
                overrides = sp;
                sp = sb;
                sb = overrides.constructor != oc
                    ? overrides.constructor
                    : function () {
                        sp.apply(this, arguments);
                    };
            }
            var F = function () {
            }, sbp, spp = sp.prototype;

            F.prototype = spp;
            sbp = sb.prototype = new F();
            sbp.constructor = sb;
            sb.superclass = spp;
            if (spp.constructor == oc) {
                spp.constructor = sp;
            }
            sb.override = function (o) {
                EUI.override(sb, o);
            };
            sbp.superclass = sbp.supr = (function () {
                return spp;
            });
            sbp.override = io;
            EUI.override(sb, overrides);
            sb.extend = function (o) {
                return EUI.extend(sb, o);
            };
            return sb;
        };
    }(),
    remove: function (arg) {
        var cmp = null;
        if (typeof arg == "string") {
            cmp = this.managers[arg];
        } else if (typeof arg == "object" && arg instanceof EUI.UIComponent) {
            cmp = this.managers[arg.id];
        }
        if (cmp) {
            if (cmp.items) {
                for (var i = 0; i < cmp.items.length; i++) {
                    this.remove(EUI.getCmp(cmp.items[i]));
                }
            }
            cmp.remove();
        }

    },
    getCmp: function () {
        return EUI.managers[arguments[0]];
    },
    resizeAll: function () {
        var cmps = EUI.managers;
        for (var cmp in cmps) {
            if (cmps[cmp] || cmps[cmp].type == "Window"
                && cmps[cmp].ismax === true) {
                cmps[cmp].onResize();
            }
        }
    },
    resize: function () {
        var cmp = arguments[0];
        if (!cmp) {
            return;
        }
        cmp.onResize();
        if (cmp.items) {
            for (var i = 0; i < cmp.items.length; i++)
                EUI.resize(EUI.getCmp(cmp.items[i]));
        }
    },
    onReady: function () {
        if (arguments)
            $(window).load(arguments[0]);
    },
    importJs: function (js, fn, cache) {
        var fnJs = function (j, f, c, num, sum) {
            $.ajax({
                url: j[num],
                dataType: "script",
                cache: c == undefined ? true : false,
                success: function (e) {
                    if (num == (sum - 1)) {
                        f.call(f, e);
                    } else {
                        num++;
                        fnJs(j, f, c, num, sum);
                    }
                }
            });
        };
        if (js instanceof Array) {
            fnJs(js, fn, cache, 0, js.length);
        } else {
            fnJs([js], fn, cache, 0, 1);
        }
    },
    toArray: function () {
        return function (a, i, j) {
            return Array.prototype.slice.call(a, i || 0, j || a.length);
        };
    }(),
    checkAuth: function (code) {
        return true;
    },
    addTokenToUrl: function (url) {
        var _s = EUI.util.getUrlParam("_s");
        if (!_s) {
            if (!__SessionUser) {
                return url;
            }
            _s = __SessionUser.sessionId;
        }

        if (url.indexOf("?") != -1) {
            return url + "&_s=" + _s;
        } else {
            return url + "?_s=" + _s;
        }
    }
};

/**
 * 组件基类
 */
EUI.UIComponent = function (options) {
    // 保存初始配置文件
    this.options = options || {};
    EUI.apply(this, options);
    // 生成组件Id
    this.genCmpId();
    if (this.CHECK_AUTH) {
        if (EUI.checkAuth(this.CHECK_AUTH)) {
            this.initComponent();
        }
    } else {
        this.initComponent();
    }
    return this;
};

EUI.UIComponent.prototype = {
    id: null,
    renderTo: null,
    options: null,
    items: null,
    CHECK_AUTH: null,

    getType: function () {
        return "UIComponent";
    },

    genCmpId: function () {
        var options = this.options;
        if (!options || (!options.id && !options.renderTo)) {
            var prefix = this.getType();
            this.id = prefix + (1000 + EUI.managerCount);
            EUI.managerCount++;
        } else {
            this.id = options.id ? options.id : options.renderTo;
            if (EUI.managers[this.id]) {
                throw new Error(String
                    .format(EUI.error.managerIsExist, this.id));
            }
        }
    },
    initComponent: function () {

        this.initItems();
        this.initDom();
        this.preRender();
        this.render();
        EUI.managers[this.id] = this;
        this.addItems();
        this.afterRender();
    },
    initItems: function () {
        var items = this.options.items;
        if (items) {
            this.items = [];
            for (var i = 0; i < items.length; i++) {
                items[i].parentCmp = this.id;
            }
        }
    },
    initDom: function () {
        this.dom = this.renderTo ? $("#" + this.renderTo) : $("<div></div>");
        this.dom.attr("id", this.id);
        if (this.style) {
            this.dom.css(this.style);
        }
    },
    preRender: function () {
    },
    render: function () {
    },
    afterRender: function () {
        if (this.hidden) {
            this.dom.hide();
        }
    },
    addItems: function () {
        var items = this.options.items;
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                EUI.applyIf(item, this.defaultConfig);
                EUI.applyIf(item, this.defaultStyle);
                var xtype = item.xtype;
                if (!xtype) {
                    throw new Error(EUI.error.noXtype);
                }
                var cmp = eval("EUI." + xtype);
                if (!cmp) {
                    throw new Error(String.format(EUI.error.noCmp, xtype));
                }
                cmp = cmp.call(cmp, item);
                this.items.push(cmp.id);
            }
        }
    },
    show: function () {
        this.dom && this.dom.show();
        this.changeVisiable(true);
        EUI.resize(this);
    },
    hide: function () {
        this.dom && this.dom.hide();
        this.changeVisiable(false);
    },
    changeVisiable: function (visiable) {
        this.hidden = !visiable;
    },
    getDom: function () {
        return this.dom;
    },
    onResize: function () {
    },
    remove: function () {
        this.dom.remove();
        delete EUI.managers[this.id];
        if (!this.items) {
            return;
        }
        for (var i = 0; i < this.items.length; i++) {
            var cmp = EUI.getCmp(this.items[i]);
            cmp && cmp.remove();
        }
    }
};

EUI.CustomUI = function () {
    EUI.apply(this, arguments[0]);
    this.initComponent();
    return this;
};
EUI.CustomUI.prototype = {
    lang: {},
    initComponent: function () {

    }
};
/**
 * UI框架初始化
 */
(function ($) {
    /**
     * 窗口变化事件
     */
    $(window).bind("resize", function () {
        var overflow = $("body").css("overflow");
        if (overflow != "hidden") {
            $("body").css("overflow", "hidden");
        }
        EUI.resizeAll();
        if (overflow != "hidden") {
            $("body").css("overflow", overflow);
        }
    });

    EUI.ns = EUI.namespace;
    EUI.ns("EUI.core", "EUI.util", "EUI.container", "EUI.grid", "EUI.msg",
        "EUI.form", "EUI.layout", "EUI.window", "EUI.widgets", "EUI.data",
        "EUI.other", "EUI.calendar", "EUI.flow", "EUI.file");
    Date.prototype.format = function (fmt) { // author: meizz
        var o = {
            "M+": this.getMonth() + 1, // 月份
            "d+": this.getDate(), // 日
            "h+": this.getHours(), // 小时
            "m+": this.getMinutes(), // 分
            "s+": this.getSeconds(), // 秒
            "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
            "S": this.getMilliseconds()
            // 毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4
                - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                    ? (o[k])
                    : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    EUI.applyIf(String, {
        format: function (format) {
            var args = EUI.toArray(arguments, 1);
            return format.replace(/\{(\d+)\}/g, function (m, i) {
                return args[i];
            });
        }
    });
    EUI.applyIf(Object, {
        isEmpty: function (obj) {
            for (var key in obj) {
                return false;
            }
            return true;
        },
        toFormValue: function (a, traditional) {
            if (!a) {
                return a;
            }
            var r20 = /%20/g;

            var s = [];

            if (traditional === undefined) {
                traditional = jQuery.ajaxSettings.traditional;
            }
            if (jQuery.isArray(a) || a.jquery) {
                jQuery.each(a, function () {
                    add(this.name, this.value);
                });

            } else {
                for (var prefix in a) {
                    buildParams(prefix, a[prefix]);
                }
            }
            return s.join("&").replace(r20, "+");

            function buildParams(prefix, obj) {
                if (jQuery.isArray(obj)) {
                    jQuery.each(obj, function (i, v) {
                        if (traditional) {
                            add(prefix, v);
                        } else {
                            buildParams(
                                prefix
                                + "["
                                + (typeof v === "object"
                                || jQuery
                                    .isArray(v)
                                ? i
                                : "") + "]",
                                v);
                        }
                    });

                } else if (!traditional && obj != null
                    && typeof obj === "object") {
                    jQuery.each(obj, function (k, v) {
                        buildParams(prefix + "." + k, v);
                    });

                } else {
                    add(prefix, obj);
                }
            }

            function add(key, value) {
                value = jQuery.isFunction(value) ? value() : value;
                if (value == null) {
                    s[s.length] = encodeURIComponent(key) + "=";
                } else {
                    s[s.length] = encodeURIComponent(key) + "="
                        + encodeURIComponent(value);
                }
            }
        }
    });
})(jQuery);
EUI.util = {

    htmlEncode: function (html) {
        return $("<div>").text(html).html();
    },

    htmlDecode: function (encodedHtml) {
        return $("<div>").html(encodedHtml).text();
    },

    getUrlParam: function (name) {
        var url = window.location.href;
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg) || url.substr(url.indexOf("?") + 1).match(reg);
        if (r != null)
            return unescape(r[2]);
        return null;
    },

    parseParam: function (param) {
      console.log(param);
      let paramArray = []
      for(var key in param) {
        paramArray.push(key+"="+param[key]);
      }

      return paramArray.join('&');
    },
    //获取控件左绝对位置
    getAbsoluteLeft: function (element) {
        var left = element[0].offsetLeft
        while (element.offsetParent != null) {
            var parentElement = element.offsetParent;
            left += parentElement.offsetLeft;
            element = parentElement;
        }
        return left
    }
    ,
    //获取控件上绝对位置
    getAbsoluteTop: function (element) {
        var top = element[0].offsetTop;
        while (element.offsetParent != null) {
            var parentElement = o.offsetParent;
            top += parentElement.offsetTop;  // Add parent top position
            element = parentElement;
        }
        return top
    },
    downloadFile:function(url) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.overrideMimeType("application/octet-stream;charset=utf-8");
        xhr.onload = function () {
            var blob = xhr.response;
            var fileStr = xhr.getResponseHeader("Content-Disposition").toLowerCase();
            var fileName = "下载文件";
            try {
                fileName = fileStr.split(";")[1].split("filename=")[1];
            } catch (e) {

            }
            EUI.util.downloadBlobFile(blob, fileName);
        };
        xhr.send();
    },
    downloadBlobFile:function (blob, fileName) {
        let fName = window.decodeURIComponent(fileName);
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fName);
        } else {
            let link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = fName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            setTimeout(function () {
                window.URL.revokeObjectURL(link.href);
                document.body.removeChild(link);
            }, 50);
        }
    },
    getFileBlob: function (img, url,autoHide) {
        return new function (img, url) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "blob";
            xhr.onload = function () {
                var blob = xhr.response;
                // img.onload = function (e) {
                //     window.URL.revokeObjectURL(img.src);
                // };
                img.attr("src",window.URL.createObjectURL(blob)).attr("loaded",true).show();
                autoHide && img.hide();
            };
            xhr.send();
        }(img, url);
    }

};
﻿EUI.Store = function () {
    return new EUI.data.Store(arguments[0]);
};

EUI.data.Store = function () {
    EUI.apply(this, arguments[0]);
    if (this.url && this.type.toLowerCase() != "get") {
        var tmp = this.url.split("/");
        if (tmp[tmp.length - 1].indexOf(".") > -1) {
            this.type = "GET";
        }
    }

    if (this.autoLoad == true) {
        this.doLoad();
    }
};

EUI.apply(EUI.data.Store.prototype, {
    url: null,
    data: null,
    async: true,
    type: 'POST',
    params: null,
    autoLoad: true,
    dataType: "json",
    postType: "form",
    timeout: 0,
    cache: true,
    isUrlParam: true,
    success: null,
    failure: null,
    loaded: false,
    contentType: "application/x-www-form-urlencoded",
    doLoad: function () {
        var g = arguments[0] ? arguments[0] : this;
        this.transParams(g);
        let tempUrl = g.url;
        /** 拼接参数到url地址 */
        if (g.isUrlParam && g.params && g.postType !== 'json' ) {
          tempUrl = g.url+'?' + Object.toFormValue(g.params, true);
        }
        $.ajax({
            url: tempUrl,
            type: g.type,
            dataType: g.dataType,
            headers: { Authorization: JSON.parse(sessionStorage.getItem('Authorization')).accessToken },
            timeout: g.timeout,
            async: g.async,
            contentType: g.isUrlParam ? undefined : g.contentType,
            data: !g.isUrlParam && g.params ? g.postParam : undefined,
            success: function (response) {
                console.log(1);
                if (!response || typeof response == "string") {
                    g.requestFailure.call(g, response);
                } else {
                    g.loaded = true;
                    if (response.success === false) {
                        g.requestFailure.call(g, response);
                    } else {
                        g.success
                        && g.success.call(g, response);
                    }
                }
            },
            error: function (response) {
                console.log(3);
                var resultStr = response.responseText.trim();
                g.requestFailure.call(g, resultStr);
            }, complete: function (XHR, TS) {
                console.log(2);
            }
        });
    },
    requestFailure: function (response) {
        if (!response) {
            response = {
                success: false,
                msg: "操作失败，请稍后重试"
            };
        } else if (typeof response != "object") {
            try {
                response = JSON.parse(response);
            } catch (e) {
                response = {
                    success: false,
                    msg: response
                };
            }
        }
        if (response.status == 401 || response.data == 401 || response.data == "401") {
            if(response.status==401){
                response.msg="会话失效，请重新登录！"
            }
            // window.top.location.reload();
        } else if (response.status == 403 || response.data == 403 || response.data == "403") {
            if(response.status==403){
                response.msg="用户无【"+response.path+"】访问权限，请联系管理员！"
            }
            response.showTime = -1;
        }
        this.failure && this.failure.call(this, response);
    },
    load: function () {
        var config = arguments[0] || {};
        EUI.applyIf(config, this);
        config.autoLoad = true;
        this.doLoad(config);
    },
    transParams: function () {
        var cfg = arguments[0];
        cfg.postParam = {};
        EUI.apply(cfg.postParam, cfg.params);
        if (cfg.postType == "json") {
            cfg.postParam = JSON.stringify(cfg.postParam);
            cfg.contentType = "application/json;charset=utf-8";
        } else if (cfg.postType == "form") {
            cfg.postParam = Object.toFormValue(cfg.postParam, true);
        }
    }
});﻿EUI.LoadMask = function(cfg) {
	return new EUI.other.LoadMask(cfg);
};
EUI.other.LoadMask = EUI.extend(EUI.UIComponent, {
	targetDom : null,
	msg : null,

	initComponent : function() {
		EUI.other.LoadMask.superclass.initComponent.call(this);
	},

	getType : function() {
		return 'LoadMask';
	},
	initDom : function() {
	},
	render : function() {
		var parentHeight;
		if (this.target instanceof EUI.UIComponent) {
			this.targetDom = this.target.dom;
		} else if (!this.target || this.target.length == 0) {
			this.targetDom = $("body");
		} else {
			this.targetDom = this.target;
		}
		this.dom = $("<div class='ux-loadmask-div'><div class='ux-loadmask-box'>"
				+ "<span class='ux-loadmask-icon'></span><span class='ux-loadmask-msg'>"
				+ this.msg + "</span></div></div>");
		$("body").append(this.dom);
		this.setShadow();
		this.setPosition();
		this.shadow.css("z-index", ++EUI.zindex);
		this.dom.css("z-index", ++EUI.zindex);
	},

	hide : function() {
		this.dom.remove();
		this.shadow.remove();
	},
	setMsg : function(msg) {
		$('.ux-loadmask-msg', this.dom).html(msg);
		return this;
	},
	setShadow : function() {
		this.shadow = $("<div class='ux-shadow'></div>");
		$("body").append(this.shadow);
	},
	setPosition : function() {
		var parentHeight = this.targetDom.outerHeight();
		var parentWidth = this.targetDom.outerWidth();
		if (this.targetDom[0].tagName.toUpperCase() == "BODY") {
			parentHeight = $(window).height();
			parentWidth = $(window).width();
		}
		var offset = this.targetDom.offset();
		this.dom.css({
					height : parentHeight + "px",
					width : parentWidth + "px",
					"line-height" : parentHeight + "px",
					top : offset.top,
					left : offset.left
				});
		this.shadow.css({
					height : parentHeight + "px",
					width : parentWidth + "px",
					top : offset.top,
					left : offset.left
				});
	},
	onResize : function() {
		this.setPosition();
	},
	remove : function() {
		this.shadow.remove();
		EUI.other.LoadMask.superclass.remove.call(this);
	}
});
﻿EUI.Button = function (cfg) {
    return new EUI.other.Button(cfg);
};
EUI.other.Button = EUI.extend(EUI.UIComponent, {
    title: null,
    width: null,
    height: null,
    disable: false,
    selected: false,
    CHECK_AUTH: null,
    iconCss: null,
    domCss: "ux-button",
    disableCss: null,
    selectCss: "ux-button-select",
    handler: null,
    border: true,

    initComponent: function () {
        EUI.other.Button.superclass.initComponent.call(this);
    },

    getType: function () {
        return 'Button';
    },

    render: function () {
        this.dom.addClass(this.domCss);
        if (!this.border) {
            this.dom.addClass("ux-button-noborder");
        }
        if (this.selected) {
            this.dom.addClass(this.selectCss);
        }
        if (this.width) {
            this.dom.css("width", this.width);
        }
        if (this.height) {
            this.dom.css("height", this.height + "px");
            this.dom.css("line-height", this.height + "px");
        }
        if (this.iconCss) {
            this.dom.append('<span class="ux-btn-icon ' + this.iconCss + '"></span>');
        }
        this.dom.title = $('<span class="ux-btn-title">' + (this.title || '') + '</span>')
        this.dom.append(this.dom.title);
        this.setTitle(this.title);
        this.setDisable(this.disable);
        this.initEvents();
    },
    setTitle: function (title) {
        this.dom.title.html(title);
        this.title = title;
    },
    setDisable: function (disable) {
        if (disable) {
            this.dom.addClass(this.disableCss);
        } else {
            this.dom.removeClass(this.disableCss);
        }
        this.disable = disable;
    },
    setSelected: function (selected) {
        if (selected) {
            if (this.selected) {
                return;
            } else {
                this.dom.addClass(this.selectCss)
                    .removeClass(this.domCss);
                this.selected = true;
            }
        } else {
            if (!this.selected) {
                return;
            } else {
                this.dom.removeClass(this.selectCss)
                    .addClass(this.domCss);
                this.selected = false;
            }
        }
    },
    initEvents: function () {
        var g = this;
        if (g.handler && typeof g.handler == 'function') {
            g.dom.click(function () {
                if (g.disable)
                    return false;
                g.handler.call(g);
            });
        }
    }
});
﻿EUI.Calendar = function () {
    return new EUI.other.Calendar(arguments[0]);
};

EUI.other.Calendar = EUI.extend(EUI.UIComponent, {
    format: "yyyy-MM-dd",
    showTime: false,
    domCss: "ux-date",
    width: 210,
    showDate: null,
    maxDate: null,
    minDate: null,
    mondayFirst: false,//星期日开始
    showWeek: false,//不显示周数
    weekStart: 0,//计算周 从周几开始计算
    thursdayFlag: false, //是否以1月4日所在的那个星期为当年的第一个星期
    initComponent: function () {
        EUI.other.Calendar.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'Calendar';
    },

    render: function () {
        var g = this;
        g.dom.addClass(g.domCss);
        if (g.showTime) {
            g.format = "yyyy-MM-dd HH:mm";
        }
        var nowDate = new Date();
        g.now = {
            year: nowDate.getFullYear(),
            month: nowDate.getMonth() + 1, // 注意这里
            day: nowDate.getDay(),
            date: nowDate.getDate(),
            hour: nowDate.getHours(),
            minute: nowDate.getMinutes()
        };
        if (this.showDate) {
            var date = new Date(this.showDate);
            g.currentDate = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDay(),
                date: date.getDate(),
                hour: date.getHours(),
                minute: date.getMinutes()
            };
        } else {
            // 当前的时间
            g.currentDate = {
                year: nowDate.getFullYear(),
                month: nowDate.getMonth() + 1,
                day: nowDate.getDay(),
                date: nowDate.getDate(),
                hour: nowDate.getHours(),
                minute: nowDate.getMinutes()
            };
        }

        g.setWidth(g.width);
        g.initHeader();
        g.initBody();
        this.initBottom();
        g.buttons = {
            btnPrevYear: $(".ux-box-dateeditor-header-prevyear", g.header),
            btnNextYear: $(".ux-box-dateeditor-header-nextyear", g.header),
            btnPrevMonth: $(".ux-box-dateeditor-header-prevmonth", g.header),
            btnNextMonth: $(".ux-box-dateeditor-header-nextmonth", g.header),
            btnYear: $(".ux-box-dateeditor-header-year", g.header),
            btnMonth: $(".ux-box-dateeditor-header-month", g.header)
        };

        // 选择的时间
        g.selectedDate = g.currentDate;
        // 使用的时间
        g.usedDate = null;
        g.initDate();
        // 设置主体
        g.bulidContent();
        g.addEvents();
    },

    setWidth: function () {
        var width = parseInt(arguments[0]);
        if (width)
            this.dom.width(width);
    },
    setHeight: function () {
        var height = parseInt(arguments[0]);
        if (height) {
            this.dom.height(height);
        }
    },

    initHeader: function () {
        var g = this;
        var header = "";
        header += "<div class='ux-box-dateeditor-header'>";
        header += "<div class='ux-box-dateeditor-header-btn ux-box-dateeditor-header-prevyear'><span></span></div>";
        header += "<div class='ux-box-dateeditor-header-btn ux-box-dateeditor-header-prevmonth'><span></span></div>";
        header += "<div class='ux-box-dateeditor-header-text'><a class='ux-box-dateeditor-header-month'></a>  <a  class='ux-box-dateeditor-header-year'></a></div>";
        header += "<div class='ux-box-dateeditor-header-btn ux-box-dateeditor-header-nextmonth'><span></span></div>";
        header += "<div class='ux-box-dateeditor-header-btn ux-box-dateeditor-header-nextyear'><span></span></div>";
        header += "</div>";
        g.header = $(header);
        g.dom.append(g.header);

    },

    initBody: function () {
        var g = this;
        var body = "";
        body += "<div class='ux-box-dateeditor-body'>";
        body += "<table cellpadding='0' cellspacing='0' border='0' class='ux-box-dateeditor-calendar'>";
        body += "<thead>";
        if (this.showWeek) {
            body += "<tr><td align='center' class='ux-box-week-show' ></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>";
        } else {
            body += "<tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>";
        }
        body += "</thead>";
        body += "<tbody>";
        if (this.showWeek) {
            body += "<tr class='ux-first'><td align='center' class='ux-box-week-show' ></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center' class='ux-box-week-show' ></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center' class='ux-box-week-show' ></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center' class='ux-box-week-show' ></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center' class='ux-box-week-show' ></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center' class='ux-box-week-show' ></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>";
        } else {
            body += "<tr class='ux-first'><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>" +
                "<tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>";

        }
        body += "</tbody>";
        body += "</table>";
        body += "<ul class='ux-box-dateeditor-monthselector'><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>";
        body += "<ul class='ux-box-dateeditor-yearselector'><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>";
        body += "<ul class='ux-box-dateeditor-hourselector'><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>";
        body += "<ul class='ux-box-dateeditor-minuteselector'><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>";
        body += "</div>";
        g.body = $(body);
        g.dom.append(g.body);
        g.body.table = $("table", g.body);
        g.body.thead = $("thead", g.body);
        g.body.tbody = $("tbody", g.body);
        g.body.monthselector = $(".ux-box-dateeditor-monthselector", g.body);
        g.body.yearselector = $(".ux-box-dateeditor-yearselector", g.body);
        g.body.hourselector = $(".ux-box-dateeditor-hourselector", g.body);
        g.body.minuteselector = $(".ux-box-dateeditor-minuteselector", g.body);
    },

    initBottom: function () {
        var html = "<div class='ux-box-time'>";
        var hour = this.currentDate.hour < 10 ? "0" + this.currentDate.hour : this.currentDate.hour;
        var minute = this.currentDate.minute < 10 ? "0" + this.currentDate.minute : this.currentDate.minute;
        if (this.showTime) {
            html += "<div class='ux-box-time-content'><span class='hour'>" + hour + "</span>:" +
                "<span class='minute'>" + minute + "</span></div>" +
                "<div class='ux-box-btn confirm right'>确定</div><div class='ux-box-btn today right'>今天</div></div>";
        } else {
            html += "<div class='ux-box-btn today'>今天</div></div>";
        }
        this.dom.append(html);
    },

    initDate: function () {
        var g = this;
        // 初始化数据
        // 设置周日至周六
        $("td", g.body.thead).each(function (i, td) {
            //todo 显示周数
            if (g.showWeek) {
                //todo 从周一到周日
                if (g.mondayFirst) {
                    $(td).html(EUI.other.Calendar.weekAsc_showDay[i]);
                } else {
                    $(td).html(EUI.other.Calendar.week_showDay[i]);
                }
            } else {
                //todo 从周一到周日
                if (g.mondayFirst) {
                    $(td).html(EUI.other.Calendar.weekAsc[i]);
                } else {
                    $(td).html(EUI.other.Calendar.week[i]);
                }
            }

        });
        // 设置一月到十一二月
        $("li", g.body.monthselector).each(function (i, li) {
            $(li).html(EUI.other.Calendar.month[i]);
        });

        // 设置时间
        if (g.showTime) {
            $("li", g.body.hourselector).each(function (i) {
                var str = i;
                if (i < 10)
                    str = "0" + i.toString();
                $(this).html(str);
            });
            $("li", g.body.minuteselector).each(function (i) {
                var str = i;
                if (i < 10)
                    str = "0" + i.toString();
                $(this).html(str);
            });
        }
    }
    ,

    addEvents: function () {
        var g = this;
        //点击今天
        $(".today", this.dom).bind("click", function () {
            EUI.apply(g.currentDate, {
                year: g.now.year,
                month: g.now.month,
                day: g.now.day,
                date: g.now.date
            });
            EUI.apply(g.selectedDate, {
                year: g.now.year,
                month: g.now.month,
                day: g.now.day,
                date: g.now.date
            });
            g.setDate();
            return false;
        });
        //点击确定
        $(".confirm", this.dom).bind("click", function () {
            g.selectedDate = {
                year: g.currentDate.year,
                month: g.currentDate.month,
                date: g.currentDate.date,
                hour: g.currentDate.hour,
                minute: g.currentDate.minute
            };
            g.setDate();
            return false;
        });
        // 日期点击
        $("td", g.body.tbody).hover(function () {
            if ($(this).hasClass("ux-box-dateeditor-today"))
                return;
            $(this).addClass("ux-box-dateeditor-over");
        }, function () {
            $(this).removeClass("ux-box-dateeditor-over");
        }).click(function () {
            if($(this).hasClass("ux-box-week-show")) {//周不能点
                return false;
            }
            $(".ux-box-dateeditor-selected", g.body.tbody)
                .removeClass("ux-box-dateeditor-selected");
            if (!$(this).hasClass("ux-box-dateeditor-today"))
                $(this).addClass("ux-box-dateeditor-selected");
            if ($(this).hasClass("ux-box-dateeditor-out")) {
                if ($("tr", g.body.tbody).index($(this).parent()) == 0) {
                    if (--g.currentDate.month == 0) {
                        g.currentDate.month = 12;
                        g.currentDate.year--;
                    }
                } else {
                    if (++g.currentDate.month == 13) {
                        g.currentDate.month = 1;
                        g.currentDate.year++;
                    }
                }
             }else {
                g.currentDate.year = parseInt(g.buttons.btnYear.html());
                $("li", g.body.monthselector).each(function (i) {
                    if ($(this).html() == g.buttons.btnMonth.html()) {
                        g.currentDate.month = i + 1;
                    }
                });
            }
            g.currentDate.date = parseInt($(this).html());
            g.currentDate.day = new Date(g.currentDate.year,
                g.currentDate.month - 1, g.currentDate.date).getDay();
            g.selectedDate = {
                year: g.currentDate.year,
                month: g.currentDate.month,
                date: g.currentDate.date,
                hour: g.currentDate.hour,
                minute: g.currentDate.minute
            };
            g.setDate();
            return false;
        });

        $(".ux-box-dateeditor-header-btn", g.header).hover(function () {
            $(this).addClass("ux-box-dateeditor-header-btn-over");
        }, function () {
            $(this).removeClass("ux-box-dateeditor-header-btn-over");
        });
        // 选择年份
        g.buttons.btnYear.click(function () {
            // build year list
            if (!g.body.yearselector.is(":visible")) {
                $("li", g.body.yearselector).each(function (i) {
                    var currentYear = g.currentDate.year
                        + (i - 4);
                    if (currentYear == g.currentDate.year)
                        $(this).addClass("ux-selected");
                    else
                        $(this).removeClass("ux-selected");
                    $(this).html(currentYear);
                });
            }
            g.body.yearselector.show().siblings().hide();
            ;
            return false;
        });

        $("li", g.body.yearselector).click(function () {
            g.currentDate.year = parseInt($(this).html());
            g.body.yearselector.hide();
            g.bulidContent();
            g.body.table.show();
            return false;
        });
        // select month
        g.buttons.btnMonth.click(function () {
            g.body.table.hide();
            $("li", g.body.monthselector).each(function (i) {
                // add selected style
                if (g.currentDate.month == i + 1)
                    $(this).addClass("ux-selected");
                else
                    $(this).removeClass("ux-selected");
            });
            g.body.monthselector.show().siblings().hide();
            ;
            return false;
        });

        $("li", g.body.monthselector).click(function () {
            var index = $("li", g.body.monthselector).index(this);
            g.currentDate.month = index + 1;
            g.body.monthselector.hide();
            g.bulidContent();
            g.body.table.show();
            return false;
        });

        // 上个月
        g.buttons.btnPrevMonth.click(function () {
            if (--g.currentDate.month == 0) {
                g.currentDate.month = 12;
                g.currentDate.year--;
            }
            g.bulidContent();
            return false;
        });
        // 下个月
        g.buttons.btnNextMonth.click(function () {
            if (++g.currentDate.month == 13) {
                g.currentDate.month = 1;
                g.currentDate.year++;
            }
            g.bulidContent();
            return false;
        });
        // 上一年
        g.buttons.btnPrevYear.click(function () {
            g.currentDate.year--;
            g.bulidContent();
            return false;
        });
        // 下一年
        g.buttons.btnNextYear.click(function () {
            g.currentDate.year++;
            g.bulidContent();
            return false;
        });

        //点击小时
        $(".hour", this.dom).click(function () {
            g.body.table.hide();
            if (g.currentDate.hour) {
                var index = parseInt(g.currentDate.hour);
                $("li:eq(" + index + ")", g.body.hourselector).addClass("ux-selected").siblings().removeClass("ux-selected");
            }
            g.body.hourselector.show().siblings().hide();
            return false;
        });
        // 选择小时
        $("li", g.body.hourselector).click(function () {
            var hour = $(this).text();
            g.currentDate.hour = hour;
            g.body.hourselector.hide();
            g.body.table.show();
            $(".hour", g.dom).text(hour);
            return false;
        });
        //点击分钟
        $(".minute", this.dom).click(function () {
            if (g.currentDate.minute) {
                var index = parseInt(g.currentDate.minute);
                $("li:eq(" + index + ")", g.body.minuteselector).addClass("ux-selected").siblings().removeClass("ux-selected");
            }
            g.body.minuteselector.show().siblings().hide();
            return false;
        });
        // 选择分钟
        $("li", g.body.minuteselector).click(function () {
            var minute = $(this).text();
            g.currentDate.minute = minute;
            g.body.minuteselector.hide();
            g.body.table.show();
            $(".minute", g.dom).text(minute);
            return false;
        });
    }
    ,
    setDate: function () {
        var g = this;
        if (!this.selectedDate)
            return;
        var year = g.selectedDate.year;
        var month = g.selectedDate.month;
        var day = g.selectedDate.date;
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        var date = g.format;
        date = date.replace(/yyyy/g, g.selectedDate.year);
        date = date.replace(/MM/g, month);
        date = date.replace(/dd/g, day);
        if (this.showTime) {
            var hour = g.selectedDate.hour + "";
            var minute = g.selectedDate.minute + "";
            if (hour.length < 2) {
                hour = "0" + hour;
            }
            if (minute.length < 2) {
                minute = "0" + minute;
            }
            date = date.replace(/HH/g, hour);
            date = date.replace(/mm/g, minute);
        }
        if (g.callback) {
            g.callback.call(this, date);
        }
    }
    ,
    bulidContent: function () {
        var g = this;
        // 当前月第一天星期
        var thismonthFirstDay = new Date(g.currentDate.year,
            g.currentDate.month - 1, 1).getDay();
        // 当前月天数
        var nextMonth = g.currentDate.month;
        var nextYear = g.currentDate.year;
        if (++nextMonth == 13) {
            nextMonth = 1;
            nextYear++;
        }
        var monthDayNum = new Date(nextYear, nextMonth - 1, 0).getDate();
        // 当前上个月天数
        var prevMonthDayNum = new Date(g.currentDate.year, g.currentDate.month
            - 1, 0).getDate();

        g.buttons.btnMonth.html(EUI.other.Calendar.month[g.currentDate.month
        - 1]);
        g.buttons.btnYear.html(g.currentDate.year);
        $("td", this.body.tbody).each(function () {
            this.className = "";
        });
        var trs = $("tr", this.body.tbody);
        for (var i = 0; i < trs.length; i++) {
            var tr = $(trs[i]).show();
            var isEnd = false;
            var $td0;
            $("td", tr).each(function (j, td) {//j=0...7
                var id = 0, tempDay = thismonthFirstDay;
                //显示周数
                if (g.showWeek && j == 0) {
                    $td0 = $(td);
                    $td0.addClass("ux-box-week-show");
                    return true;
                }
                //todo 从周一到周日
                if (g.showWeek) {
                    if (g.mondayFirst) {
                        if (tempDay == 0) {
                            tempDay = 7;
                        }
                        id = i * 7 + (j - tempDay);
                    } else {
                        id = i * 7 + (j - tempDay - 1);
                    }
                } else {
                    if (g.mondayFirst) {
                        if (tempDay == 0) {
                            tempDay = 7;
                        }
                        id = i * 7 + (j - tempDay + 1);
                    } else {
                        id = i * 7 + (j - tempDay);
                    }
                }
                var showDay = id + 1;
                if (g.selectedDate && g.currentDate.year == g.selectedDate.year
                    && g.currentDate.month == g.selectedDate.month
                    && id + 1 == g.selectedDate.date) {
                    if(g.showWeek){
                        if(g.mondayFirst){
                            if (j == 6 || j == 7) {
                                $(td).addClass("ux-box-dateeditor-holiday");
                            }
                        }else{
                            if (j == 1 || j == 7) {
                                $(td).addClass("ux-box-dateeditor-holiday");
                            }
                        }
                    }else{
                        if(g.mondayFirst){
                            if (j == 5 || j == 6) {
                                $(td).addClass("ux-box-dateeditor-holiday");
                            }
                        }else{
                            if (j == 0 || j == 6) {
                                $(td).addClass("ux-box-dateeditor-holiday");
                            }
                        }
                    }
                    $(td).addClass("ux-box-dateeditor-selected");
                    $(td).siblings().removeClass("ux-box-dateeditor-selected");
                } else if (g.currentDate.year == g.now.year
                    && g.currentDate.month == g.now.month
                    && id + 1 == g.now.date) {
                    if(g.showWeek){
                        if(g.mondayFirst){
                            if (j == 6 || j == 7) {
                                $(td).addClass("ux-box-dateeditor-holiday");
                            }
                        }else{
                            if (j == 1 || j == 7) {
                                $(td).addClass("ux-box-dateeditor-holiday");
                            }
                        }
                    }else{
                        if(g.mondayFirst){
                            if (j == 5 || j == 6) {
                                $(td).addClass("ux-box-dateeditor-holiday");
                            }
                        }else{
                            if (j == 0 || j == 6) {
                                $(td).addClass("ux-box-dateeditor-holiday");
                            }
                        }
                    }
                    $(td).addClass("ux-box-dateeditor-today");
                } else if (id < 0) {
                    showDay = prevMonthDayNum + showDay;
                    $(td).addClass("ux-box-dateeditor-out")
                        .removeClass("ux-box-dateeditor-selected");
                } else if (id > monthDayNum-1) {
                    if(g.showWeek){
                        if (j == 1) {
                            tr.hide();
                        }
                    }else{
                        if (j == 0) {
                            tr.hide();
                        }
                    }
                    showDay = showDay - monthDayNum;
                    $(td).addClass("ux-box-dateeditor-out")
                        .removeClass("ux-box-dateeditor-selected");
                    isEnd = true;
                } else{
                    if(g.showWeek){
                        if(g.mondayFirst){
                            if (j == 6 || j == 7) {
                                $(td).addClass("ux-box-dateeditor-holiday")
                                    .removeClass("ux-box-dateeditor-selected");
                            }else {
                                td.className = "";
                            }
                        }else{
                            if (j == 1 || j == 7) {
                                $(td).addClass("ux-box-dateeditor-holiday")
                                    .removeClass("ux-box-dateeditor-selected");
                            }else {
                                td.className = "";
                            }
                        }
                    }else{
                        if(g.mondayFirst){
                            if (j == 5 || j == 6) {
                                $(td).addClass("ux-box-dateeditor-holiday")
                                    .removeClass("ux-box-dateeditor-selected");
                            }else {
                                td.className = "";
                            }
                        }else{
                            if (j == 0 || j == 6) {
                                $(td).addClass("ux-box-dateeditor-holiday")
                                    .removeClass("ux-box-dateeditor-selected");
                            }else {
                                td.className = "";
                            }
                        }
                    }
                }
                $(td).html(showDay);
                //显示周,给第一列周赋值
                if(g.showWeek&&j==7){
                    var day = showDay;
                    if (i === 0) {
                        day = 1;
                    }
                    if (isEnd) {
                        day = monthDayNum;
                    }
                    var month = g.currentDate.month+"";
                    var day = day+"";
                    if(month.length<2){
                        month = "0"+month;
                    }
                    if(day.length<2){
                        day = "0"+day;
                    }
                    var date = g.currentDate.year+"-"+month+"-"+day,weekNum;
                    if(g.thursdayFlag){
                        weekNum =   g.getWeekOfYear4(new Date(date),g.weekStart);
                    }else{
                        weekNum =   g.getWeekOfYear(new Date(date),g.weekStart);
                    }
                    $td0.html(weekNum);
                }
            });

            if (isEnd) {
                tr.nextAll().hide();
                break;
            }
        }
    }
    ,

    isDateTime: function (dateStr) {
        var r = dateStr.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
        if (r == null)
            return false;
        var d = new Date(r[1], r[3] - 1, r[4]);
        if (d == "NaN")
            return false;
        return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d
            .getDate() == r[4]);
    }
    ,
    isLongDateTime: function (dateStr) {
        var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2})$/;
        var r = dateStr.match(reg);
        if (r == null)
            return false;
        var d = new Date(r[1], r[3] - 1, r[4], r[5], r[6]);
        if (d == "NaN")
            return false;
        return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3]
            && d.getDate() == r[4] && d.getHours() == r[5] && d
                .getMinutes() == r[6]);
    }
    ,
    getFormatDate: function (date) {
        var g = this;
        if (date == "NaN")
            return null;
        var format = g.format;
        var o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3),
            "S": date.getMilliseconds()
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    }
    ,

    getValue: function () {
        return this.usedDate;
    },
    getWeekOfYear: function (date,weekStart) {
        // weekStart：每周开始于周几：周日：0，周一：1，周二：2 ...，默认为周日
        weekStart = (weekStart || 0) - 0;
        if(isNaN(weekStart) || weekStart > 6)
            weekStart = 0;
        var year = date.getFullYear();
        var firstDay = new Date(year, 0, 1);
        var firstWeekDays = 7 - firstDay.getDay() + weekStart;
        var dayOfYear = (((new Date(year, date.getMonth(), date.getDate())) - firstDay) / (24 * 3600 * 1000)) + 1;
        return Math.ceil((dayOfYear - firstWeekDays) / 7) + 1;
    },
    getWeekOfYear4: function (date,weekStart) {
        var time,checkDate = new Date(date.getTime());
        // Find Thursday of this week starting on Monday
        var dayOfThisWeek = 4; //以1月4日所在的那个星期为当年的第一个星期
        weekStart = weekStart || 0;
        var temp = weekStart ? (checkDate.getDay() || 7) : checkDate.getDay();
        checkDate.setDate(checkDate.getDate() + dayOfThisWeek - temp);

        time = checkDate.getTime();
        checkDate.setMonth(0); // Compare with Jan 1
        checkDate.setDate(1);
        return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
    }
})
;
/**
 * 消息框
 */

EUI.MessageBox = function (cfg) {
    return new EUI.msg.MessageBox(cfg);
};

EUI.msg.MessageBox = EUI.extend(EUI.UIComponent, {
    title: "提示消息",
    msg: "",
    buttons: null,
    showClose: true,

    initComponent: function () {
        EUI.msg.MessageBox.superclass.initComponent.call(this);
    },

    getType: function () {
        return 'MessageBox';
    },
    initDom: function () {
        var html = "<div class='ux-msgbox'><div class='ux-msgbox-titlebar'>";
        if (this.iconCss) {
            html += "<span class='icon " + this.iconCss + "'></span>";
        }
        html += "<span class='ux-msgbox-title'>"
            + (this.title || "")
            + "</span><span class='ecmp-eui-close'></span></div><div class='ux-msgbox-content'><div>"
            + this.msg
            + "</div></div><div class='ux-msgbox-optbox'></div></div>";
        this.dom = $(html);
        $("body").append(this.dom);
        this.setShadow();
        this.setPosition();
        this.shadow.css("z-index", ++EUI.zindex);
        this.dom.css("z-index", ++EUI.zindex);
    },
    render: function () {
        this.initButtons();
        this.addEvents();
    },
    initButtons: function () {
        if (this.buttons) {
            var optbox = $(".ux-msgbox-optbox", this.dom);
            for (var i = 0; i < this.buttons.length; i++) {
                var id = this.buttons[i].id || EUI.getId("Button");
                var html = "<div id='" + id + "'></div>";
                optbox.append(html);
                EUI.applyIf(this.buttons[i], {
                    xtype: "Button",
                    renderTo: id
                });
                EUI.Button(this.buttons[i]);
            }
        }
    },
    addEvents: function () {
        var g = this;
        if (!this.showClose) {
            $(".ecmp-eui-close", this.dom).hide();
        } else {
            $(".ecmp-eui-close", this.dom).bind("click", function () {
                g.remove();
            });
        }
    },
    setTitle: function (title) {
        $(".ux-msgbox-title", this.dom).html(title);
    },
    setMsg: function (msg) {
        $(".ux-msgbox-content", this.dom).html(title);
    },
    setShadow: function () {
        this.shadow = $("<div class='ux-shadow'></div>");
        $("body").append(this.shadow);
    },
    setPosition: function () {
        var parentHeight = $(window).height();
        var parentWidth = $(window).width();
        var left = (parentWidth - this.dom.width()) / 2;
        var top = (parentHeight - this.dom.height()) / 2;
        if (top > 100) {
            top -= 50;
        }
        this.dom.css({
            top: top,
            left: left
        });
        this.shadow.css({
            "height": parentHeight + "px"
        });
    },
    onResize: function () {
        this.setPosition();
    },
    remove: function () {
        this.shadow.remove();
        EUI.msg.MessageBox.superclass.remove.call(this);
    },
    hide: function () {
        this.remove();
    }
});﻿EUI.ProcessStatus = function (cfg) {
    return new EUI.msg.ProcessStatus(cfg);
};

EUI.msg.ProcessStatus = EUI.extend(EUI.UIComponent, {
    width: 260,
    height: 65,
    showTime: null,
    titleCss: "ux-status-title",
    titleBoxCss: "ux-status-titlebox",

    initComponent: function () {
        if (!this.showTime) {
            if (this.success) {
                this.showTime = 2;
            } else {
                this.showTime = 4;
            }
        }
        EUI.msg.ProcessStatus.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'ProcessStatus';
    },
    genCmpId: function () {
        this.id = "eui_status";
    },
    render: function () {
        var preStatus = EUI.getCmp("eui_status");
        if (preStatus) {
            preStatus.remove();
        }
        this.dom.addClass("ux-status");
        $("body").append(this.dom);
        this.show();
        this.addEvents();
    },
    show: function () {
        var g = this;
        var title = this.success ? this.successTitle : this.failureTitle;
        var iconCss = this.success ? "ecmp-eui-success" : "ecmp-eui-fault";
        var msgNxt = this.message != undefined ? this.message : this.msg;
        var html = "<div class='" + this.titleBoxCss + "'>" +
            "<span class='status-icon " + iconCss + "'></span>" +
            "<span class='" + this.titleCss + "'>" + title + "</span>" +
            "</div><div class='ux-status-content'>" + msgNxt
            + "</div><span class='ux-status-close'></span>";
        this.dom.append(html);
        this.setPosition();
        if (g.showTime > 0) {
            setTimeout(function () {
                g.remove();
            }, g.showTime * 1000);
        }
    },
    addEvents: function () {
        var g = this;
        $(".ux-status-close").bind("click", function () {
            g.remove();
        });
    },
    setPosition: function () {
        this.dom.css({
            top: 10,
            left: ($(window).width() - this.dom.width()) / 2
        }).slideDown("normal");
    },
    onResize: function () {
        this.setPosition();
    },
    remove: function () {
        var g = this;
        this.dom.slideUp("normal", function () {
            g.dom.remove();
        });
    }
});﻿EUI.Container = function () {
    return new EUI.container.Container(arguments[0]);
};
EUI.container.Container = EUI.extend(EUI.UIComponent, {
    layout: "form",
    title: null,
    simpleTitle:true,
    padding: 6,
    border: false,
    width: "100%",
    height: "100%",
    tbar: null,
    collapsible: false,
    collapsed: false,
    closeWith: 30,
    isOverFlow: true,
    defaultStyle: null,
    domCss: "ux-container",
    titleBoxCss: "ux-container-titlebox",
    simpleTitleBoxCss: "ux-container-simple-titlebox",
    titleCss: "ux-container-title",
    expandCss: "ux-container-expand",
    closeCss: "ux-container-close",
    borderCss: "ux-container-border",
    afterCollapse: null,
    afterExpand: null,

    initComponent: function () {
        EUI.container.Container.superclass.initComponent.call(this);
    },

    getType: function () {
        return 'Container';
    },

    render: function () {
        var g = this;
        g.dom.addClass(g.domCss);
        if (this.title) {
            this.initTitle();
        }
        if (this.tbar) {
            this.initTbar();
        }
        if (this.collapsible) {
            this.initCollapse();
        }
        this.initContent();
        if (g.padding) {
            g.content.css({
                padding: g.padding
            });
        }
        if (!g.isOverFlow) {
            g.content.css("overflow", "hidden");
        } else {
            g.content.css("overflow", "auto");
        }
        if (g.border) {
            g.showBorder();
        }
        g.setWidth(g.width);
        g.setHeight(g.height);
        this.addEvent();
    },
    showBorder: function () {
        this.content.addClass(this.borderCss);
        if (this.tbar) {
            this.content.css("border-top", "none");
        }
    },
    initTitle: function () {
        var titleBoxCss = this.simpleTitle ? this.simpleTitleBoxCss : this.titleBoxCss;
        this.titleBox = $("<div class='" + titleBoxCss + "'><div class='" + this.titleCss + "'>" + (this.title || "") + "</div></div>");
        this.dom.prepend(this.titleBox);
        this.titleDom = $("." + this.titleCss, this.titleBox);
    },
    initTbar: function () {
        var tbarId = EUI.getId("ToolBar");
        this.dom.append("<div id='" + tbarId + "'></div>");
        this.tbarCmp = EUI.ToolBar({
            renderTo: tbarId,
            border: true,
            defaultConfig: {
                xtype: "Button",
                border: false
            },
            style: {
                background: "#F3F8FC"
            },
            items: this.tbar
        });
    },
    initCollapse: function () {
        if (!this.titleBox) {
            this.initTitle();
        }
        this.titleBox.append("<div class='" + this.expandCss + "'></div>");
    },
    initContent: function () {
        this.content = $("<div class='ux-container-content'></div>");
        this.dom.append(this.content);
    },
    addEvent: function () {
        this.addCollapseEvent();
    },
    addCollapseEvent: function () {
        var g = this;
        $("." + this.expandCss, this.dom).bind("click", function () {
            g._doCollapseAndExpand();
        });
    },
    _doCollapseAndExpand: function () {
        var g = this;
        if (g.collapsed) {
            $(this).removeClass(g.closeCss);
            g.expand();
        } else {
            $(this).addClass(g.closeCss);
            g.collapse();
        }
        g._setCollapseCss();
    },
    _setCollapseCss: function () {
        this.collapsed = !this.collapsed;
        if (!this.collapsed) {
            $("." + this.expandCss, this.dom).removeClass(this.closeCss);
        } else {
            $("." + this.expandCss, this.dom).addClass(this.closeCss);
        }
    },
    collapse: function () {
        this.tbarCmp && this.tbarCmp.hide();
        this.content.hide();
        this.afterCollapse && this.afterCollapse.call(this);
    },
    expand: function () {
        this.tbarCmp && this.tbarCmp.show();
        this.content.show();
        this.afterExpand && this.afterExpand.call(this);
    },
    setTitle: function (title) {
        if (!title || !this.titleDom) {
            return;
        }
        this.titleDom.text(title);
    },
    setWidth: function () {
        var width = parseFloat(arguments[0]);
        var parent = this.dom.parent();
        if (!parent || parent.length == 0) {
            return;
        }
        if (width) {
            var overflow = this.content.css("overflow");
            this.content.css("overflow", "hidden");
            if (typeof arguments[0] == "string"
                && arguments[0].indexOf("%") > -1) {
                width /= 100;
                width *= this.dom.parent().width();
            }
            width -= parseFloat(this.dom.css("paddingLeft")) || 0;
            width -= parseFloat(this.dom.css("paddingRight")) || 0;
            width -= parseFloat(this.dom.css("marginLeft")) || 0;
            width -= parseFloat(this.dom.css("marginRight")) || 0;
           /* if (this.dom.outerHeight(true) > parent.height()) {
                width -= 17;
            }*/
            this.dom.width(width);
            this.tbarCmp && this.tbarCmp.dom.width(width);
            this.width = arguments[0];
            this.content.css("overflow", overflow);
        }
    },
    setHeight: function () {
        var height = parseFloat(arguments[0]);
        var parent = this.dom.parent();
        if (!parent || parent.length == 0) {
            return;
        }
        if (height) {
            var overflow = this.content.css("overflow");
            this.content.css("overflow", "hidden");
            var pheight = parent.height();
            if (parent[0].tagName.toLowerCase() == "body") {
                pheight = $(window).height();
                pheight -= parseFloat(parent.css("paddingTop")) || 0;
                pheight -= parseFloat(parent.css("paddingBottom")) || 0;
                pheight -= parseFloat(parent.css("marginTop")) || 0;
                pheight -= parseFloat(parent.css("marginBottom")) || 0;
            }
            if (typeof arguments[0] == "string"
                && arguments[0].indexOf("%") > -1) {
                height /= 100;
                height *= pheight;
            }
            if (this.titleDom) {
                height -= 35;
            }
            if (this.tbarCmp) {
                height -= this.tbarCmp.dom.outerHeight();
            }
            height -= parseFloat(this.dom.css("paddingTop")) || 0;
            height -= parseFloat(this.dom.css("paddingBottom")) || 0;
            height -= parseFloat(this.dom.css("marginTop")) || 0;
            height -= parseFloat(this.dom.css("marginBottom")) || 0;
            height -= parseFloat(this.content.css("paddingTop")) || 0;
            height -= parseFloat(this.content.css("paddingBottom")) || 0;
            height -= parseFloat(this.content.css("marginTop")) || 0;
            height -= parseFloat(this.content.css("marginBottom")) || 0;
            height -= parseFloat(this.content.css("borderTopWidth")) || 0;
            height -= parseFloat(this.content.css("borderBottomWidth")) || 0;
            this.content.height(height);
            this.height = arguments[0];
            this.content.css("overflow", overflow);
        } else {
            this.content.css("height", "auto");
            // if (this.dom.height() > parent.height()) {
            //     var width = this.content.width();
            //     this.content.width(width - 17);
            // }
        }
    },
    doLayout: function () {
        var type = arguments[0];
        switch (this.layout) {
            case "form" :
                if (type == "init")
                    EUI.FormLayout(this, "layout");
                else {
                    EUI.FormLayout(this, "resize");
                }
                break;
            case "column" :
                if (type == "init")
                    EUI.ColumnLayout(this, "layout");
                else {
                    EUI.ColumnLayout(this, "resize");
                }
                break;
            case "border" :
                if (type == "init")
                    EUI.BorderLayout(this, "layout");
                else {
                    EUI.BorderLayout(this, "resize");
                }
                break;
            case "accordion" :
                if (type == "init")
                    EUI.AccordionLayout(this, "layout");
                else {
                    EUI.AccordionLayout(this, "resize");
                }
                break;
            case "auto" :
                if (type == "init")
                    EUI.AutoLayout(this, "layout");
                else {
                    EUI.AutoLayout(this, "resize");
                }
                break;
            default :
                if (type == "init")
                    EUI.FormLayout(this, "layout");
                else {
                    EUI.FormLayout(this, "resize");
                }
        }
    },
    addItems: function () {
        if (this.html) {
            this.getDom().append(this.html);
            return;
        }
        var items = this.options.items;
        if (items) {
            this.doLayout("init");
        }
    },
    getDom: function () {
        return this.content;
    },
    onResize: function () {
        var g = this;
        if (typeof g.width == "string" && g.width.indexOf("%") > -1) {
            g.setWidth(g.width);
        }
        if (typeof g.height == "string" && g.height.indexOf("%") > -1) {
            g.setHeight(g.height);
        }
        g.doResize();
    },

    doResize: function () {
        var items = this.items;
        if (items) {
            this.doLayout("resize");
        }
    },
    remove:function () {
        EUI.container.Container.superclass.remove.call(this);
        this.tbarCmp && this.tbarCmp.remove();
    }

});﻿EUI.GridPanel = function () {
    return new EUI.grid.GridPanel(arguments[0]);
};

/**
 * @fileOverview 封装jqGrid数据表格
 * @author flyChan
 */

/**
 * @class EUI.grid.GridPanel
 * @constructor
 * @param {Object}
 *            cfg ：配置参数
 * @return {Object} grid ： grid组件，其中grid为jqGrid实例
 */
EUI.grid.GridPanel = EUI.extend(EUI.container.Container, {
    gridCss: "ux-grid",
    contentCss: "ux-panel-grid",
    padding: null,
    searchConfig: null,
    autoLoad: true,
    subheight: 59,
    data: null,
    isJson: true,
    initComponent: function () {
        this.isOverFlow = false;
        EUI.grid.GridPanel.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'GridPanel';
    },

    initGridCfg: function () {
        var g = this;
        var grid = $("<table id='g_" + this.id + "'></table>");
        grid.addClass(this.gridCss);
        this.content.append(grid);
        var cfg = this.gridCfg;
        if (cfg.autowidth != true) {
            cfg.width = this.content.width();
        }
        this.initHeight(cfg);
        /**
         * 设置colModel不排序
         */
        for (var i = 0; i < cfg.colModel.length; i++) {
            EUI.applyIf(cfg.colModel[i], {
                sortable: false
            });
        }
        /**
         * @description 初始化pager
         */
        if (cfg.hasPager != false) {
            cfg.hasPager = true;
            cfg.pager = cfg.pager || this.id + "_pager";
            grid.after("<div id='" + cfg.pager + "'></div>");
            cfg.pager = "#" + cfg.pager;
            cfg.pagerpos = "center";

            /**
             * @description 初始化页显示数目
             */
            if (!cfg.rowList) {
                var rowNum = cfg.rowNum = cfg.rowNum ? cfg.rowNum : 15;
                if (rowNum == 15) {
                    cfg.rowList = [15, 30, 50, 100];
                } else {
                    var rowList = [rowNum, rowNum + 20, rowNum + 50,
                        rowNum + 100];
                    cfg.rowList = rowList;
                }
            }
        } else {
            cfg.rowNum = 10000;
            cfg.rowList = [10000];
        }
        /**
         * @description 初始化数据类型
         */
            // if (cfg.loadonce == true) {
            //     cfg.datatype = "local";
            // }
        var basecfg = {
                mtype: "post",
                pagerpos: "left",
                recordpos: "right",
                headers:{ Authorization: JSON.parse(sessionStorage.getItem('Authorization')).accessToken, "content-type": g.isJson ? 'application/json': undefined,},
                altRows: true,
                hidegrid: false,
                isJson: true,
                data: this.data || [],
                pgtext: EUI.cmpText.pgtext,
                viewrecords: true,
                rownumbers: true,
                autowidth: true,
                loadError: function (response) {
                    if (response && response.responseText) {
                        if (typeof response.responseText != "object") {
                            try {
                                response = JSON.parse(response.responseText);
                            } catch (e) {
                                response = {
                                    success: false,
                                    msg: response.responseText
                                };
                            }
                        }
                        if (response.status == 401 || response.data == 401 || response.data == "401") {
                            if(response.status==401){
                                response.msg="会话失效，请重新登录！"
                            }
                            // window.top.location.reload();
                        } else if (response.status == 403 || response.data == 403 || response.data == "403") {
                            if(response.status==403){
                                response.msg="用户无【"+response.path+"】访问权限，请联系管理员！"
                            }
                            response.showTime = -1;
                        }
                        EUI.ProcessStatus && EUI.ProcessStatus(response);
                    }
                },
                datatype: "json"
            };
        cfg = EUI.apply(basecfg, cfg);
        this.grid = grid.jqGrid(cfg);
        $(cfg.pager).addClass("ui-jqgrid-pagerbar");
        // if (cfg.loadonce == true && this.autoLoad) {
        //     this.refreshGrid();
        // }
    },
    initHeight: function (cfg) {
        if (this.height != "auto") {
            cfg.height = this.content.height() - this.subheight;
            if (cfg.footerrow) {
                cfg.height -= 34;
            }
            if (cfg.multihead) {
                cfg.height -= 28;
            }
            if (cfg.caption) {
                cfg.height -= 31;
            }
            if (cfg.hasPager != false) {
                cfg.height += 28;
            }
        } else {
            cfg.height = "auto";
        }
    },
    afterRender: function () {
        EUI.grid.GridPanel.superclass.afterRender.call(this);
        this.initGridCfg();
        this.postDataParam = EUI.apply({}, this.grid
            .getGridParam("postData"));
        this.onResize();
    },
    localSearch: function (keyValue) {
        var g = this;
        var value = $.trim(keyValue).toLowerCase();
        var keyColum;
        if (!g.searchConfig || !g.searchConfig.searchCols) {
            keyColum = g.getGridCols().visibleCols.colsName;
        } else {
            keyColum = g.searchConfig.searchCols;
        }
        if (!g.data) {
            g.data = g.grid.jqGrid("getGridParam", "data");
        }
        var gridData = g.data;
        if (value == "") {
            g.setDataInGrid(gridData, true);
            return;
        } else {
            if (gridData && gridData.length == 0)
                return;
            else {
                var results = [];
                for (var i = 0; gridData && i < gridData.length; i++) {
                    var item = gridData[i];
                    for (var k = 0; k < keyColum.length; k++) {
                        var colName = keyColum[k];
                        if (item[colName] != null) {
                            if (item[colName].toString().toLowerCase()
                                    .indexOf(value) >= 0) {
                                results.push(item);
                                break;
                            }
                        } else if (colName.indexOf(".") != -1) {
                            var tmp = colName.split(".");
                            if (item[tmp[0]] != null
                                && item[tmp[0]][tmp[1]] != null) {
                                if (item[tmp[0]][tmp[1]].toString()
                                        .toLowerCase().indexOf(value) >= 0) {
                                    results.push(item);
                                    break;
                                }
                            }
                        }
                    }
                }
                g.setDataInGrid(results, true);
            }
        }
    },
    getGridCols: function () {
        var g = this, cols = {
            allCols: [],
            visibleCols: {
                colsName: [],
                colsLabel: []
            }
        };
        var gcols = g.grid.getGridParam("colModel");
        var glabels = g.grid.getGridParam("colNames");
        for (var i = 0; i < gcols.length; i++) {
            var colProp = g.grid.getColProp(gcols[i].name);
            if (!colProp.hidden) {
                cols.visibleCols.colsName.push(gcols[i].name);
            }
            cols.allCols.push(gcols[i].name);
        }
        for (var m = 0; m < glabels.length; m++) {
            cols.visibleCols.colsLabel.push(glabels[m].label);
        }
        return cols;
    },
    setDataInGrid: function (data, notRefresh) {
        var g = this;
        g.grid.jqGrid("clearGridData", true);
        // if (!this.gridCfg.hasPager) {
        //     this.addRowData(data);
        // } else {
        g.grid.jqGrid("setGridParam", {
            datatype: "local",
            page: 1,
            data: data
        }).trigger("reloadGrid");
        // }
        if (!notRefresh) {
            g.data = data;
        }
    },
    addRowData: function (rowdata, noRepeat) {
        if (!this.data) {
            this.data = [];
        }
        if (rowdata instanceof Array) {
            for (var i = 0; i < rowdata.length; i++) {
                if (!noRepeat || !this.checkIsExist(rowdata[i])) {
                    this.grid.addRowData(rowdata[i].id, rowdata[i]);
                    this.data.push(rowdata[i]);
                }
            }
        } else {
            if (!noRepeat || !this.checkIsExist(rowdata)) {
                this.grid.addRowData(rowdata.id, rowdata);
                this.data.push(rowdata);
            }
        }
    },
    checkIsExist: function (data) {
        if (!this.data) {
            return false;
        }
        for (var i = 0; i < this.data.length; i++) {
            if (data.id == this.data[i].id) {
                return true;
            }
        }
        return false;
    },
    restore: function () {
        this.setDataInGrid([].concat(this.data));
    },
    refreshGrid: function () {
        var g = this;
        if (this.isLoadOnce()) {
            var page = g.grid.jqGrid('getGridParam', 'page');//获取当前页
            var url = g.grid.jqGrid("getGridParam", "url");
            if (url) {
                $.post(url, this.postDataParam, function (data) {
                    g.grid.jqGrid('clearGridData', true);
                    g.grid.jqGrid("setGridParam", {
                        data: data,
                        page: page,
                        localReader: {id: "id"}
                    }).trigger("reloadGrid");
                    g.data=data;
                });
            }
        } else {
            this.grid.trigger("reloadGrid");
        }
    },
    getRowData: function () {
        var g = this, args = arguments;
        if (args.length != 0) {
            return g.grid.getRowData(args[0]);
        }
        return null;
    },
    setSelectRowById: function (id, cancel) {
        if (id) {
            if (!this.gridCfg.multiselect) {
                this.grid.resetSelection();
            }
            if (cancel) {
                this.grid.setSelection(id, false);
            } else {
                this.grid.setSelection(id, true);
            }
        }
    },
    getSelectRow: function () {
        var g = this;
        var rows;
        var muti = g.grid.jqGrid("getGridParam", "multiselect");
        if (muti) {
            rows = [];
            var rowIds = g.grid.jqGrid('getGridParam', 'selarrrow');
            for (var i = 0; i < rowIds.length; i++) {
                rows.push(g.getRowData(rowIds[i]));
            }
        } else {
            var rowId = g.grid.jqGrid('getGridParam', 'selrow');
            if (rowId) {
                rows = g.getRowData(rowId);
            }
        }
        return rows;
    },
    getGridData: function () {
        var g = this;
        var rows = [];
        if (g.isLoadOnce()) {
            rows = g.grid.jqGrid("getGridParam", "data");
        } else {
            var ids = g.grid.getDataIDs();
            for (var i = 0; i < ids.length; i++) {
                rows.push(g.getRowData(ids[i]));
            }
        }
        return rows instanceof Array ? rows : [];
    },
    onResize: function () {
        EUI.grid.GridPanel.superclass.onResize.call(this);
        if (this.grid) {
            if (this.gridCfg.autowidth != true) {
                this.grid.jqGrid("setGridWidth", this.content.width());
            }
            if (this.height != "auto") {
                var pheight = this.content.height() - this.subheight;
                if (this.gridCfg.footerrow) {
                    pheight -= 34;
                }
                if (this.gridCfg.multihead) {
                    pheight -= 28;
                }
                if (this.gridCfg.hasPager == false) {
                    pheight += 28;
                }
                if (this.gridCfg.caption) {
                    pheight -= 31;
                }
                this.grid.jqGrid("setGridHeight", pheight);
                this.content.css("overflow", "hidden");
            } else {
                this.content.css("overflow", "auto");
            }
        }
    },
    setPostParams: function (params, refresh) {
        var g = this;
        var grid = this.grid;
        EUI.apply(this.postDataParam, params);
        var jqgrid = grid.each(function () {
            if (this.grid
                && typeof g.postDataParam === 'object') {
                this.p.postData = g.postDataParam;
            }
        });
        jqgrid.setGridParam({page: 1, datatype: 'json'});
        if (refresh) {
            jqgrid.trigger("reloadGrid");
        }
        return jqgrid;
    },
    setGridParams: function (params, refresh) {
        var jqgrid = this.grid.jqGrid("setGridParam", params);
        if (refresh) {
            jqgrid.trigger("reloadGrid");
        }
        this.postDataParam = EUI.apply({}, this.grid
            .getGridParam("postData"));
    },
    resetParam: function () {
        this.setPostParams(this.postDataParam);
    },
    reset: function () {
        this.setDataInGrid([]);
        this.data = [];
    },
    isLoadOnce: function () {
        return this.grid.jqGrid("getGridParam", "loadonce");
    },
    deleteRow: function (id) {
        this.grid.jqGrid("delRowData", id);
        if (this.isLoadOnce()) {
            this.data = [].concat(this.grid.jqGrid("getGridParam", "data"));
        }
    }
});EUI.TabPanel = function () {
    return new EUI.container.TabPanel(arguments[0]);
};
EUI.container.TabPanel = EUI.extend(EUI.container.Container, {
    maxWidth: 200,
    maxTabs: 20,
    padding: 0,
    tabWidth: null,
    totalWidth: 1,
    showTabMenu: true,
    overflowText: null,
    autoScroll: true,
    tabCss: "ux-tab",
    itemCloseCss: "ux-tab-item-close",
    ulCss: "ux-tab-ul",
    liCss: "ux-tab-li",
    aCss: "ux-tab-li-a",
    iconCss: "ux-tab-icon",
    headerCss: "ux-tab-header",
    contentCss: "ux-tab-content",
    activeCss: "ux-tab-actived",
    wrapCss: "ux-tab-wrap",
    disableLeft: "ux-tab-scrollLeft-disable",
    disableRight: "ux-tab-scrollRight-disable ",
    onActive: null,
    beforeClose: null,
    afterClose: null,

    initComponent: function () {
        EUI.container.TabPanel.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'TabPanel';
    },
    render: function () {
        EUI.container.TabPanel.superclass.render.call(this);
        this.tab = this.content;
        this.initCmp();
        this.addEvents();
        this.setTabHeight();
    },
    showBorder: function () {
        // 重载父类设置border方法，该方法不能去掉
    },
    initCmp: function () {
        var g = this;
        var header = $("<div></div>").addClass(g.headerCss);
        var left = $("<div class='ux-tab-scroll scrollLeft'><span></span></div>")
            .hide();
        var right = $("<div class='ux-tab-scroll scrollRight'><span></span></div>")
            .hide();
        var ul = $("<ul class='" + g.ulCss + "'></ul>").width(6000);
        var wrap = $("<div class='" + g.wrapCss + "'></div>");
        wrap.append(ul);
        header.append(left).append(wrap).append(right);
        header.left = left;
        header.right = right;
        header.ul = ul;
        header.wrap = wrap;
        var content = $("<div class='" + g.contentCss + "'></div>");
        g.tab.append(header).append(content);
        g.tab.header = header;
        g.tab.content = content;
        g.wrapWidth = wrap.width();
    },
    addEvents: function () {
        var g = this;
        // 右移按钮事件
        g.tab.header.right.bind("click", function () {
            if ($(this).hasClass(g.disableRight)) {
                return;
            }
            var last = $("li:last", g.tab.header.ul);
            var lastLeft = last.offset().left;
            var rightBtn = g.tab.header.right.offset().left;
            if (lastLeft + last.outerWidth() > rightBtn) {
                var scrollWidth = g.tabWidth ? g.tabWidth : 150;
                if (lastLeft + last.outerWidth() - rightBtn < scrollWidth) {
                    scrollWidth = lastLeft + last.outerWidth() - rightBtn + 6;
                }
                var ul = g.tab.header.ul;
                var ulLeft = ul.offset().left;
                scrollWidth = ulLeft - scrollWidth - g.tab.header.offset().left;
                ul.animate({
                    left: scrollWidth
                }, function () {
                    if (last.offset().left + last.outerWidth() <= rightBtn) {
                        g.tab.header.right.addClass(g.disableRight);
                    }
                });
            }
            g.tab.header.left.removeClass(g.disableLeft);
        });
        // 左移按钮事件
        g.tab.header.left.bind("click", function () {
            if ($(this).hasClass(g.disableLeft)) {
                return;
            }
            var first = $("li:first", g.tab.header.ul);
            var firstLeft = first.offset().left;
            var leftBtn = g.tab.header.left.offset().left;
            var leftWidth = g.tab.header.left.outerWidth();
            if (firstLeft < leftBtn + leftWidth) {
                var scrollWidth = g.tabWidth ? g.tabWidth : 150;
                if (leftBtn + leftWidth - firstLeft < scrollWidth) {
                    scrollWidth = leftBtn + leftWidth - firstLeft + 2;
                }
                var ul = g.tab.header.ul;
                scrollWidth += ul.position().left;
                // 设置绝对位移
                ul.animate({
                    left: scrollWidth
                }, function () {
                    if (first.offset().left >= leftBtn + leftWidth) {
                        g.tab.header.left.addClass(g.disableLeft);
                    }
                });
            }
            g.tab.header.right.removeClass(g.disableRight);
        });
        if (g.showTabMenu) {
            $("." + g.liCss, g.dom).live("contextmenu", function (e) {
                var tabId = $(this).attr("tabid");
                var index = $("." + g.liCss).index(this);
                var item = g.options.items[index];
                var refreshable = false, closeable = item.closable;
                if (g.activeId == tabId && item.iframe) {
                    refreshable = true;
                }
                g.showMenu($(this), refreshable, closeable);
                return false;
            });
            $(document).bind({
                "blur": function () {
                    g.hideMenu();
                },
                "click": function (e) {
                    if ($(e.target).parents(".ux-menu").length == 0) {
                        g.hideMenu();
                    }
                }
            });
        }
    },
    showMenu: function (dom, refreshable, closeable) {
        var g = this;
        if (!this.menu) {
            this.menu = $("<div class='ux-menu'><div class='ux-menu-yline'></div>"
                + "<div class='ux-menu-over' style='top: -24px;'><div class='ux-menu-over-l'></div> <div class='ux-menu-over-r'></div></div>"
                + "<div class='ux-menu-inner'>"
                + "<div class='ux-menu-item' type='refresh'><div class='ux-menu-icon ux-menu-refresh'></div><div class='ux-menu-title'>刷新</div></div>"
                + "<div class='ux-menu-xline'>"
                + "</div><div class='ux-menu-item' type='close'><div class='ux-menu-icon ux-menu-close'></div><div class='ux-menu-title'>关闭</div></div>"
                + "<div class='ux-menu-item' type='closeother'><div class='ux-menu-icon'></div><div class='ux-menu-title'>关闭其他</div></div>"
                + "<div class='ux-menu-item' type='closeall'><div class='ux-menu-icon'></div><div class='ux-menu-title'>关闭所有</div></div></div></div>");
            $("body").append(this.menu);
            var hoverDom = $(".ux-menu-over", g.menu);
            $(".ux-menu-item", this.menu).hover(function () {
                var itemDom = $(this);
                hoverDom.css({
                    top: itemDom.position().top + 4
                });
            }, function () {
                hoverDom.css({
                    top: -24
                });
            });
            $(".ux-menu-item", this.menu).bind("click", function () {
                var tabId = g.menu.attr("tabid");
                var type = $(this).attr("type");
                switch (type) {
                    case "refresh" :
                        g.refresh(tabId);
                        break;
                    case "close" :
                        g.close(tabId);
                        break;
                    case "closeother" :
                        g.closeOther(tabId);
                        break;
                    case "closeall" :
                        g.closeAll();
                        break;
                    default :
                        break;
                }
                g.hideMenu();
            });
        }
        this.menu.attr("tabid", dom.attr("tabid"));
        this.menu.show();
        if (!refreshable) {
            $(".ux-menu-refresh", this.menu).parent().hide();
            $(".ux-menu-xline", this.menu).hide();
        } else {
            $(".ux-menu-refresh", this.menu).parent().show();
            $(".ux-menu-xline", this.menu).show();
        }
        if (!closeable) {
            $(".ux-menu-close", this.menu).parent().hide();
        } else {
            $(".ux-menu-close", this.menu).parent().show();
        }
        var offset = dom.offset();
        this.menu.offset({
            top: offset.top + 15,
            left: offset.left + dom.width() / 2
        });
    },
    hideMenu: function () {
        this.menu && this.menu.hide();
    },
    setTabHeight: function () {
        var heigth = this.tab.height() - 33;
        this.tab.content.height(heigth);

    },
    setTitle: function (index, title) {
        var li = $("li:eq(" + index + ")", this.tab.header.ul);
        li.attr("title", title);
        $(".ux-tab-title", li).html(title);
    },
    addItems: function () {
        var g = this, items = g.options.items;
        var activeId;
        if (items) {
            if (g.maxTabs && items.length > g.maxTabs) {
                throw new Error(String.format(g.initTooMuch, items.length,
                    g.maxTabs));
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var fn = g.initItem(item);
                g.doAddTitle(item);
                g.doAddContent(fn, item);
                if (i == 0 || item.actived) {
                    activeId = item.id;
                }
            }
            g.activeId = activeId;
            g.active(activeId);
        }
    },
    initItem: function () {
        var item = arguments[0], g = this;
        var defaultConf = {
            closable: true,
            iframe: true,
            xtype: "Container"
        };
        EUI.applyIf(item, g.defaultConfig);
        EUI.applyIf(item, defaultConf);
        if (!item.id) {
            item.id = EUI.getId("tabitem");
        }
        if (!item.iframe) {
            var xtype = item.xtype ? item.xtype : g.defaultType;
            if (!xtype) {
                throw new Error(EUI.error.noXtype);
            }
            var fn = eval("EUI." + xtype);
            if (!fn) {
                throw new Error(String.format(EUI.error.noCmp, xtype));
            }
            return fn;
        } else {
            return null;
        }
    },
    doAddTitle: function (item) {
        var g = this;
        var title = item.title ? item.title : "";
        delete item.title;
        var li = $("<li title='" + title + "'></li>").addClass(g.liCss).attr(
            "tabid", item.id);
        li.bind("click", function () {
            g.active(item.id,item);
        });
        var a = $("<a></a>").addClass(g.aCss);
        if (item.iconCls)
            a.append("<span class='" + g.iconCss + " " + item.iconCls
                + "'></span>&nbsp;");
        var titleDiv = $("<span class='ux-tab-title'>" + title + "</span>");
        a.append(titleDiv);
        li.append(a);
        // 关闭事件
        if (item.closable) {
            var close = $("<div class='" + g.itemCloseCss + "'></div>");
            close.bind("click", function () {
                g.close(item.id);
                return false;
            });
            li.append(close);
        }
        g.tab.header.ul.append(li);
        // title宽度
        if (g.tabWidth) {
            titleDiv.width(g.tabWidth);
        } else {
            var tw = titleDiv.width();
            if (tw > g.maxWidth) {
                titleDiv.width(g.maxWidth);
            }
        }
        delete item.iconCls;
        var wrap = g.tab.header.wrap;
        // 记录所有tab标题的长度
        g.totalWidth += (1 + li.width());
        if (g.autoScroll && !g.scrolled && wrap.width() < g.totalWidth) {
            g.tab.header.left.show();
            g.tab.header.right.show();
            g.tab.header.ul.animate({
                left: g.tab.header.left.width()
            }, function () {
                g.tab.header.right.removeClass(g.disableRight);
            });
            g.scrolled = true;
        }
    },
    doAddContent: function () {
        var g = this, item = arguments[1], id, fn = arguments[0];
        var height = this.tab.content.height();
        var tabItem = $("<div class='ux-tab-content-item'></div>");
        tabItem.attr("tabid", item.id);
        g.tab.content.append(tabItem);
        if (!item.iframe) {
            var div = $("<div id='" + item.id + "'></div>");
            tabItem.append(div);
            item.renderTo = item.id;
            if (!item.async) {
                var cmp = fn.call(fn, item);
                g.items.push(cmp.id);
            }
        } else {
            if (!item.url) {
                throw new Error(EUI.error.noUrl);
            }
            tabItem.append("<div class='ux-tab-loading'></div>");
            // var iframe = $('<iframe frameborder="0" width="100%" height="100%"></iframe>')
            //     .attr("src", item.url);
            var iframe = $('<iframe frameborder="0" width="100%" height="100%"></iframe>');
            iframe.bind("load", function () {
                $(this).prev().hide();
            });
            iframe.data(g.iframeData);
            item.renderTo = item.id;
            iframe.attr("id", item.id);
            if (!item.async) {
                iframe.attr("src", item.url);
            }
            tabItem.append(iframe);
        }
        tabItem.hide();
    },
    addTab: function (item) {
        var g = this;
        if (item.id) {
            for (var i = 0; i < g.options.items.length; i++) {
                if (g.options.items[i].renderTo == item.id) {
                    if (item.cover == true) {
                        var iframe = $("#" + item.id).attr("src", item.url);
                        iframe.prev().show();
                    }
                    g.active(item.id);
                    return null;
                }
            }
        }
        if (g.maxTabs && g.options.items.length >= g.maxTabs) {
            EUI.ProcessStatus({
                title: "提示",
                success: false,
                msg: String.format(g.overflowText, g.maxTabs)
            });
            return null;
        }
        item.parentCmp = g.id || g.renderTo;
        var fn = g.initItem(item);
        g.doAddTitle(item);
        g.doAddContent(fn, item);
        g.options.items.push(item);
        g.active(item.id);
        return this;
    },
    // show: function () {
    //     var index = $("li", this.tab.header.ul).length;
    //     this.active(index);
    // },
    active: function (id,item) {
        var g = this, ul = g.tab.header.ul;
        var li = $("." + g.liCss + "[tabid='" + id + "']", ul);
        li.addClass(g.activeCss).siblings().removeClass(g.activeCss);
        var content = $(".ux-tab-content-item[tabid='" + id + "']",
            g.tab.content);
        content.show().siblings().hide();
        // 记录激活Id
        g.activeId = id;
        g.autoScroll && g.scrollVisible(id);
        // 触发激活事件
        var iframeWin = null;
        if ($("iframe#" + id).length != 0) {
            if(!$("iframe#" + id).attr("src")){
                $("iframe#" + id).attr("src", item.url);
            }
            iframeWin = $("iframe#" + id)[0].contentWindow;
        } else {
            if(EUI.getCmp(id)){
                EUI.resize(EUI.getCmp(id));
            }else{
                var fn = g.initItem(item);
                var cmp = fn.call(fn, item);
                g.items.push(id);
            }
        }
        this.onActive && this.onActive.call(this, id, iframeWin);
    },
    scrollVisible: function (activeId) {
        var g = this, activedTab, leftBtn, rightBtnLeft, scrollWidth;
        var ul = g.tab.header.ul;
        if (g.scrolled) {
            var wrapWidth = g.tab.header.wrap.width() - 36
            activedTab = $("." + g.liCss + "[tabid='" + activeId + "']", ul);
            var activeLeft = activedTab.offset().left;
            var firstLeft = $("." + g.liCss + ":first", ul).offset().left;
            var last = $("." + g.liCss + ":last", ul);
            var lastLeft = last.offset().left;
            var ulLeft = ul.offset().left;
            var leftBtn = g.tab.header.left;
            leftBtnLeft = leftBtn.offset().left;
            var rightBtn = g.tab.header.right;
            rightBtnLeft = rightBtn.offset().left;
            var leftBtnWidth = g.tab.header.left.is(":visible")
                ? g.tab.header.left.outerWidth()
                : 0;
            // 如果在左边被隐藏
            if (activeLeft < leftBtn + leftBtnWidth) {
                scrollWidth = leftBtn + leftBtnWidth;
            } else if (activeLeft + activedTab.width() > rightBtnLeft) {
                // 如果在右边被隐藏
                scrollWidth = ulLeft
                    - (activedTab.outerWidth() + activeLeft - rightBtnLeft);
            } else {
                if (activeLeft + activedTab.outerWidth() - firstLeft <= wrapWidth) {
                    ul.css("left", leftBtn.width());
                    scrollWidth = undefined;
                } else if (lastLeft - activeLeft + last.outerWidth() <= wrapWidth) {
                    var wrapWidth = g.tab.header.wrap.width();
                    ul.css("left", wrapWidth - g.totalWidth - rightBtn.width()*2);
                    scrollWidth = undefined;
                }
            }
            if (scrollWidth != undefined) {
                g.tab.header.ul.offset({
                    left: scrollWidth
                });
            }
            if (firstLeft >= leftBtn + leftBtnWidth) {
                g.tab.header.left.addClass(g.disableLeft);
            } else {
                g.tab.header.left.removeClass(g.disableLeft);
            }
            if (lastLeft + last.outerWidth() <= rightBtnLeft) {
                g.tab.header.right.addClass(g.disableRight);
            } else {
                g.tab.header.right.removeClass(g.disableRight);
            }
        }
    },
    onResize: function () {
        EUI.container.TabPanel.superclass.onResize.call(this);
        var g = this, ul = g.tab.header.ul, wrapWidth = g.tab.header.wrap.width() - 36;
        g.setTabHeight();
        if (g.autoScroll && wrapWidth != g.wrapWidth) {
            if (g.totalWidth > wrapWidth) {
                if (!g.scrolled) {
                    g.tab.header.left.show();
                    g.tab.header.right.show();
                    g.scrolled = true;
                }
                g.scrollVisible(g.activeId);
            } else {
                if (g.scrolled) {
                    g.tab.header.left.hide();
                    g.tab.header.right.hide();
                    ul.css({
                        left: 0
                    });
                    g.scrolled = false;
                }
            }
        }

        g.wrapWidth = g.tab.header.wrap.width();
        g.tab.content.width(g.wrapWidth);
        var $tabItem = $(".ux-tab-content-item", g.tab.content);
        $tabItem.length>0&&$tabItem.width(g.wrapWidth);
    },
    close: function (id) {
        var g = this, ul = g.tab.header.ul, items = g.options.items, index;
        for (var i = 0; i < items.length; i++) {
            if (items[i].renderTo == id) {
                index = i;
                break;
            }
        }
        var li = $("." + g.liCss + "[tabid='" + id + "']", ul);
        if (li.length == 0) {
            return;
        }
        var isActived = li.hasClass(g.activeCss);
        // 触发关闭前事件
        if (g.beforeClose) {
            var flag = g.beforeClose.call(this, id);
            if (flag == false)
                return;
        }
        var nowTabWidth = li.width() + 1;
        g.totalWidth -= nowTabWidth;
        // 删除对应html元素
        li.remove();
        $(".ux-tab-content-item[tabid='" + id + "']", g.tab.content).remove();

        // 删除options中item
        items.splice(index, 1);
        // 删除组件items中item,组件管理器删除组件，删除所有子组件
        var cmp = EUI.getCmp(id);
        if (cmp) {
            var cmpItems = g.items;
            for (var j in cmpItems) {
                if (cmpItems[j] == id) {
                    cmpItems.splice(j, 1);
                    break;
                }
            }
            cmp.remove();
        }
        // 激活当前标签的下一个标签
        if (isActived) {
            g.activeId = null;
            if (index < items.length)
                g.active(items[index].id);
            else if (index > 0)
                g.active(items[index - 1].id);
        }
        g.setScroll();
        // 关闭后事件
        if (g.afterClose) {
            g.afterClose.call(this, id);
        }
    },
    closeOther: function (tabId) {
        var g = this;
        var items = g.options.items;
        for (var i = 0; i < items.length; i++) {
            var id = items[i].id;
            if (id != tabId && items[i].closable) {
                g.doClose(id, i);
                i--;
                if (g.activeId == id) {
                    g.activeId = null;
                }
            }
        }
        if (!g.activeId && items.length > 0) {
            g.active(items[0].id);
        }
        g.setScroll();
    },
    closeAll: function () {
        var g = this;
        var items = g.options.items;
        for (var i = 0; i < items.length; i++) {
            if (!items[i].closable) {
                continue;
            }
            var id = items[i].id;
            g.doClose(id, i);
            i--;
            if (g.activeId == id) {
                g.activeId = null;
            }
        }
        if (!g.activeId && items.length > 0) {
            g.active(items[0].id);
        }
        g.setScroll();
    },
    doClose: function (id, index) {
        var g = this, ul = g.tab.header.ul, items = g.options.items;
        var li = $("." + g.liCss + "[tabid='" + id + "']", ul);
        if (li.length == 0) {
            return;
        }
        var cmpContent = $(".ux-tab-content-item[tabid='" + id + "']",
            g.tab.content);
        // 触发关闭前事件
        if (g.beforeClose) {
            var flag = g.beforeClose.call(this, id);
            if (flag == false)
                return;
        }
        g.totalWidth -= li.width() + 1;
        // 删除对应html元素
        li.remove();
        cmpContent.remove();
        // 删除options中item
        items.splice(index, 1);
        // 删除组件items中item,组件管理器删除组件，删除所有子组件
        var cmp = EUI.getCmp(id);
        if (cmp) {
            var cmpItems = g.items;
            for (var j in cmpItems) {
                if (cmpItems[j] == id) {
                    cmpItems.splice(j, 1);
                    break;
                }
            }
            cmp.remove();
        }
        // 关闭后事件
        if (g.afterClose) {
            g.afterClose.call(this, id);
        }
    },
    refresh: function (id, url) {
        var g = this;
        var iframe = $("iframe#" + id, g.tab.content);
        url = url || iframe.attr("src");
        iframe.prev().show();
        iframe.attr("src", url);
        iframe[0].contentWindow.location.reload();
    },
    setScroll: function () {
        var g = this;
        var header = g.tab.header, ul = header.ul;
        if (g.scrolled) {
            var wrapWidth = header.wrap.width() - header.left.width()
                - header.right.width();
            // 判断是否需要左右移动按钮
            if (wrapWidth >= g.totalWidth) {
                header.left.hide();
                header.right.hide();
                // 将第一个Tab页签移动到最左边
                header.wrap.animate({
                    left: 0
                }, function () {
                    ul.offset({
                        left: header.offset().left + 31
                    });
                });
                g.scrolled = false;
            } else {
                var firstLi = $("." + g.liCss + ":first", ul);
                var firstLeft = firstLi.offset().left;
                var leftBtnLeft = header.left.offset().left;
                var leftBtnWidth = header.left.width();
                if (firstLeft <= leftBtnLeft + leftBtnWidth + 1) {
                    ul.offset({
                        left: leftBtnLeft + leftBtnWidth + 3
                    });
                }
            }
        }
    }
});﻿EUI.FormPanel = function() {
	return new EUI.container.FormPanel(arguments[0]);
};

EUI.container.FormPanel = EUI.extend(EUI.container.Container, {
	url : null,
	store : null,
	afterLoad : null,
	layout : "form",
	formCss : "ux-form",
	initComponent : function() {
		EUI.container.FormPanel.superclass.initComponent.call(this);
		if (this.store) {
			this.initStore();
		}
	},
	getType : function() {
		return 'FormPanel';
	},

	submit : function() {
		if (this.isValid()) {
			var config = arguments[0] || {};
			var data = this.getFormValue();
			EUI.applyIf(config, {
						params : data
					});
			EUI.applyIf(config, {
						url : this.url
					});
			config.autoLoad = true;
			EUI.Store(config);
		}
	},
	isValid : function() {
		return this.doValidate(this.items);
	},
	doValidate : function() {
		var items = arguments[0];
		var flag = true;
		if (items) {
			for (var i = 0; i < items.length; i++) {
				var item = EUI.getCmp(items[i]);
				if (item.isFormField || item.needValid) {
					var tmp = item.sysValidater();
					flag = flag && tmp;
				} else if(item.items){
					flag = this.doValidate(item.items) && flag;
				}
			}
		}
		return flag;
	},

	getFormValue : function() {
		var items = this.items;
		var data = {};
		for (var i = 0; i < items.length; i++) {
			var item = EUI.getCmp(items[i]);
			EUI.applyIf(data, this.getItemValue(item));
		}
		return data;
	},

	getItemValue : function() {
		var item = arguments[0];
		var data = {};
		if (item.isFormField) {
			EUI.applyIf(data, item.getSubmitValue());
		}
		if (item.items) {
			for (var i = 0; i < item.items.length; i++) {
				EUI.applyIf(data, this.getItemValue(EUI.getCmp(item.items[i])));
			}
		}
		return data;
	},

	reset : function() {
		this.doReset(this.items);
	},

	doReset : function() {
		var items = arguments[0];
		if (items) {
			for (var i = 0; i < items.length; i++) {
				var item = EUI.getCmp(items[i]);
				if (item.isFormField) {
					item.reset();
				}
				this.doReset(item.items);
			}
		}
	},

	loadData : function() {
		if (arguments[0]) {
			this.data = arguments[0];
		}
		this.doLoadData(this.items);
		this.isValid();
	},
	doLoadData : function() {
		var items = arguments[0];
		if (items) {
			for (var i = 0; i < items.length; i++) {
				var item = EUI.getCmp(items[i]);
				if (item.isFormField) {
					item.loadData(this.data);
				}
				this.doLoadData(item.items);
			}
		}
	},
	initStore : function() {
		var g = this;
		g.store.success = function(response) {
			g.data = response.data;
			g.loadData();
			g.afterLoad && g.afterLoad.call(this, g.data);
		};
		g.store.autoLoad = true;
		g.beforeLoad && g.beforeLoad.call(this, g);
		var store = EUI.Store(g.store);
		g.store = store;
	},

	getCmpByName : function() {
		var name = arguments[0];
		var items = this.items;
		return this.doGetCmp(items, name);
	},

	doGetCmp : function() {
		var items = arguments[0], name = arguments[1];
		if (items) {
			for (var i = 0; i < items.length; i++) {
				var item = EUI.getCmp(items[i]);
				if (item.isFormField && item.name == name) {
					return item;
				} else {
					var cmp = this.doGetCmp(item.items, name);
					if (cmp != null) {
						return cmp;
					}
				}
			}
		}
		return null;
	}

});﻿EUI.TreePanel = function () {
    return new EUI.container.TreePanel(arguments[0]);
};

EUI.container.TreePanel = EUI.extend(EUI.container.Container, {
    url: null,
    params: null,
    data: null,
    showSearch: false,
    showField: "name",
    beforeLoad: null,
    afterLoad: null,
    showIcon: null,
    index: 1,
    originData: null,
    searchField: ["name"],
    async: false,
    cascadeSelect: true,
    onSelect: null,
    itemRender: null,
    afterItemRender: null,
    afterShowTree: null,
    getAsyncUrl: null,
    normalCss: "ecmp-eui-moreselect",
    selectCss: "ecmp-eui-checkbox-select",

    initComponent: function () {
        this.isOverFlow = false;
        EUI.container.TreePanel.superclass.initComponent.call(this);
        if (this.data && this.data.length > 0) {
            this.originData = this.data;
        }
    },
    getType: function () {
        return 'TreePanel';
    },
    render: function () {
        this.initSearch();
        EUI.container.TreePanel.superclass.render.call(this);
        this.treebox = $("<div class='ux-tree-box'></div>");
        this.content.append(this.treebox);
        if (this.url) {
            this.loadData();
        } else if (this.data) {
            this.initTree();
        }
        this.addEvents();
    },
    initSearch: function () {
        var g = this;
        if (!this.showSearch) {
            return;
        }
        if (this.tbar) {
            this.tbar.push("->");
            this.tbar.push({
                xtype: "SearchBox",
                onSearch: function (value) {
                    g.onSearch(value);
                }
            });
        } else {
            this.tbar = ["->", {
                xtype: "SearchBox",
                onSearch: function (value) {
                    g.onSearch(value);
                }
            }];
        }
    },
    onSearch: function (value) {
        this.search(value);
    },
    loadData: function (params) {
        var g = this;
        EUI.apply(this.params, params);
        if (this.beforeLoad) {
            var result = this.beforeLoad.call(this);
            if (!result) {
                return false;
            }
        }
        EUI.Store({
            url: this.url,
            params: this.params,
            success: function (result) {
                g.afterLoad && g.afterLoad.call(g, result.data);
                g.data = result.data;
                g.originData = result.data;
                g.initTree();
                g.afterShowTree
                && g.afterShowTree.call(g, result.data);
            },
            failure: function (result) {
                EUI.ProcessStatus(result);
            }
        });
    },
    initTree: function () {
        this.treebox.html("");
        var html = this.doInitTree(this.data, "", 0);
        this.treebox.append(html);
        if (this.afterItemRender) {
            this.renderItem(this.data);
        }
    },
    doInitTree: function (data, preLvStr, level) {
        var html = "";
        if (preLvStr) {
            preLvStr += "-";
        }
        for (var i = 0; i < data.length; i++) {
            var itemdata = data[i];
            var id = itemdata.id || ++this.id;
            var lvStr = preLvStr + i;
            var itemHtml = "<li id='" + id + "' dx='" + lvStr + "' lv='" + level + "'>";
            var expandCss, iconCss;
            if (itemdata.hasChild
                || (itemdata.children && itemdata.children.length > 0)) {
                expandCss = "ux-expandable-close ecmp-eui-righttriangle";
                if (itemdata.isexpand) {
                    expandCss = "ux-expandable-open";
                    iconCss = "ux-tree-folder-open";
                } else {
                    iconCss = "ux-tree-folder-close ecmp-eui-folder";
                }
            } else {
                expandCss = "ux-expandable-hide";
                iconCss = "ecmp-eui-leaf";
            }
            if (this.showIcon) {
                var showCss = this.showIcon.call(this, itemdata);
                if (showCss) {
                    iconCss = showCss;
                }
            }
            var text = itemdata[this.showField];
            if (this.itemRender) {
                text = this.itemRender.call(this, itemdata);
            }
            var paddingLeft = level * 22;
            var checkboxHtml = "";
            if (this.multiSelect) {
                checkboxHtml = "<div class='ux-multiselect " + this.normalCss + "'></div>";
            }
            var titleHtml = "<div class='ux-body' style='padding-left:"
                + paddingLeft
                + "px;'><div class='ux-icon-box'><div class='expandable "
                + expandCss + "'></div></div>" + checkboxHtml
                + "<div class='ux-tree-icon " + iconCss
                + "'></div><div class='ux-tree-title' title='" + text + "'>" + text
                + "</div></div>";
            itemHtml += titleHtml;
            if (itemdata.children) {
                var ul = "<ul class='ux-tree-children'>";
                if (!itemdata.isexpand) {
                    ul = "<ul class='ux-tree-children' style='display:none;'>";
                }
                var childrenHtml = this.doInitTree(itemdata.children, lvStr,
                    level + 1);
                ul += childrenHtml + "</ul>";
                itemHtml += ul;
            }
            html += itemHtml + "</li>";
        }
        return html;
    },
    renderItem: function (data) {
        for (var i = 0; i < data.length; i++) {
            $("#" + data[i].id).data(data[i]);
            this.afterItemRender.call(this, data[i]);
            if (data[i].children) {
                this.renderItem(data[i].children);
            }
        }
    },
    expandAll: function () {
        $("ul", this.treebox).show();
        $(".expandable", this.treebox).addClass("expanded");
    },
    closeAll: function () {
        $("ul", this.treebox).hide();
        $(".expandable", this.treebox).removeClass("expanded");
    },
    expand: function (id) {
        var dom = $("li[id='" + id + "']", this.treebox);
        var data = this.getNodeData(id);
        if (this.async && data.hasChild && !data.children) {
            this.getExtraData(data, dom);
        }
        var uls = dom.parents("ul");
        for (var i = 0; i < uls.length; i++) {
            var ul = $(uls[i]);
            var expandDom = ul.prev().find(".expandable");
            this.expandOpt(expandDom);
        }
        dom.find(".ux-icon-box:first").click();
        dom.addClass("ux-tree-selected");
    },
    getExtraData: function (data, dom) {
        var g = this;
        var url;
        if (g.getAsyncUrl) {
            url = g.getAsyncUrl.call(this, data);
        }
        if (!url) {
            EUI.ProcessStatus({
                success: false,
                msg: "获取数据地址不能为空"
            });
            return;
        }
        EUI.Store({
            url: url,
            success: function (result) {
                var lvStr = dom.attr("dx");
                var lv = lvStr.split("-").length;
                g.doInitTree(result.data, lvStr, lv);
                data.children = result.data;
            },
            failure: function (result) {
                EUI.ProcessStatus(result);
            }
        });
    },
    close: function (id) {
        var dom = $("li[id='" + id + "']", this.treebox);
        dom.find(".ux-icon-box").click();
    },
    addEvents: function () {
        var g = this;
        $(".ux-icon-box", this.dom).live("click", function () {
            var iconDom = $(this).find(".expandable");
            if (iconDom.is(":hidden")) {
                return;
            }
            if (!iconDom.hasClass("expanded")) {
                var dom = $(this).parent().parent();
                var id = dom.attr("id");
                var data = g.getNodeData(id);
                if (g.async && data.hasChild && (!data.children || data.children.length == 0)) {
                    g.getExtraData(data, dom);
                }
                g.expandOpt(iconDom);
            } else {
                g.closeOpt(iconDom);
            }
            return false;
        });
        if (!this.multiSelect) {
            $(".ux-body", this.dom).live("click", function () {
                $(".selected", g.dom).removeClass("selected");
                $(this).addClass("selected");
                var id = $(this).parent().attr("id");
                var data = g.getNodeData(id);
                g.onSelect && g.onSelect.call(g, data);
            });
        }
        if (this.multiSelect) {
            $(".ux-multiselect", this.dom).live("click", function () {
                var dom = $(this);
                var bodyDom = dom.parent();
                var id = bodyDom.parent().attr("id");
                var data = g.getNodeData(id);
                if (bodyDom.hasClass("selected")) {
                    g._setChecked(false, data);
                } else {
                    g._setChecked(true, data);

                }
            });
            $(".ux-body", this.dom).live("select", function (event, checked) {
                var id = $(this).parent().attr("id");
                var data = g.getNodeData(id);
                g.onSelect && g.onSelect.call(g, data, checked);
            });
            $(".ux-body", this.dom).live("dblclick", function (event, checked) {
                var dom = $(this);
                var id = dom.parent().attr("id");
                var data = g.getNodeData(id);
                if (dom.hasClass("selected")) {
                    g._setChecked(false, data);
                } else {
                    g._setChecked(true, data);
                }
            });
        }
    },
    _setChecked: function (checked, data) {
        var g = this;
        var dom = $("li#" + data.id, this.dom);
        var bodyDom
        var checkDom;
        if (this.cascadeSelect) {
            bodyDom = $(".ux-body", dom);
            checkDom = $(".ux-multiselect", dom);
        } else {
            bodyDom = $(".ux-body:first", dom);
            checkDom = $(".ux-multiselect:first", dom);
        }
        if (!checked) {
            bodyDom.removeClass("selected");
            checkDom.removeClass(this.selectCss);
        } else {
            bodyDom.addClass("selected");
            checkDom.addClass(this.selectCss);
        }
        bodyDom.trigger("select", [checked]);
    },
    expandOpt: function (dom) {
        dom.addClass("expanded");
        dom.parent().nextAll(".ux-tree-icon").addClass("ecmp-eui-folder-open");
        dom.parent().parent().next().show("normal");
    },
    closeOpt: function (dom) {
        dom.removeClass("expanded");
        dom.parent().nextAll(".ux-tree-icon").removeClass("ecmp-eui-folder-open");
        dom.parent().parent().next().hide("normal");
    },
    setData: function (data, isOrigin) {
        if (data instanceof Array) {
            if (isOrigin) {
                this.originData = data;
            }
            this.data = data;
            this.initTree();
        }
    },
    deleteItem: function (id) {
        var g = this;
        $("li[id='" + id + "']", this.dom).hide("fast", function () {
            g._updateIndex($(this));
            $(this).remove();
        });
    },
    _updateIndex: function (dom) {
        var nexts = dom.nextAll();
        var dx = dom.attr("dx");
        this.deleteData(dx);
        var indexPre = dx.substr(0, dx.length - 1);
        var index = parseInt(dx.substr(dx.length - 1));
        for (var i = 0; i < nexts.length; i++) {
            var itemdx = indexPre + (index + i);
            var children = $("li[dx^='" + itemdx + "']", this.dom);
            for (var k = 0; k < children.length; k++) {
                var child = $(children[k]);
                var childDx = child.attr("dx");
                childDx = childDx.replace(itemdx, itemdx - 1);
                child.attr("dx", childDx);
            }
        }
    },
    deleteData: function (dx) {
        var data = this.data;
        var lvs = dx.split("-");
        for (var i = 0; i < lvs.length; i++) {
            var index = parseInt(lvs[i]);
            if (i == lvs.length - 1) {
                data.splice(index, 1);
            } else {
                data = data[index].children;
            }
        }
    },
    setSelect: function (ids) {
        if (this.multiSelect) {
            if (!(ids instanceof Array)) {
                ids = [ids];
            }
            for (var i = 0; i < ids.length; i++) {
                if (this.cascadeSelect) {
                    $("#" + ids[i] + " .ux-body", this.dom).addClass("selected");
                    $(".ux-multiselect", "#" + ids[i] + " .ux-body").addClass("ecmp-eui-checkbox-select");
                } else {
                    $("#" + ids[i] + " .ux-body:first", this.dom).addClass("selected");
                    $(".ux-multiselect:first", "#" + ids[i]).addClass("ecmp-eui-checkbox-select");
                }
                this.expand(ids[i]);
                if (this.onSelect) {
                    var data = this.getNodeData(ids[i]);
                    this.onSelect.call(this, data, true);
                }
            }
        } else {
            var id = ids;
            var dom = $("#" + id + " .ux-body:first", this.dom);
            if (dom.length == 0) {
                return;
            }
            if (!dom.hasClass("selected")) {
                dom.addClass("selected");
                // 展开当前节点
                this.expand(id);
            }

            var data = this.getNodeData(id);
            this.onSelect && this.onSelect.call(this, data);
        }
    },
    getSelectData: function () {
        if (this.multiSelect) {
            var data = []
            var doms = $(".selected", this.dom);
            for (var i = 0; i < doms.length; i++) {
                var dom = $(doms[i]).parent();
                var id = dom.attr("id");
                var domdata = this.getNodeData(id);
                data.push(domdata);
            }
            return data;
        } else {
            var dom = $(".selected", this.dom).parent();
            var id = dom.attr("id");
            return this.getNodeData(id);
        }
    },
    clearSelect: function () {
        $(".selected", this.dom).removeClass("selected");
        $(".ux-multiselect,ecmp-eui-checkbox-select", this.dom).removeClass("ecmp-eui-checkbox-select");
    },
    getParentData: function (id) {
        var dom = $("#" + id, this.dom);
        if (dom.length == 0) {
            return null;
        }
        var lvStr = dom.attr("dx");
        lvStr = lvStr.substring(0, lvStr.lastIndexOf("-"));
        return this.getDataByLv(lvStr);
    },
    getNodeData: function (id) {
        var dom = $("#" + id, this.dom);
        if (dom.length == 0) {
            return null;
        }
        var lvStr = dom.attr("dx");
        return this.getDataByLv(lvStr);
    },
    getDataByLv: function (lvStr) {
        var data = this.data;
        var lvs = lvStr.split("-");
        for (var i = 0; i < lvs.length; i++) {
            var index = parseInt(lvs[i]);
            if (i == lvs.length - 1) {
                return data[index];
            } else {
                data = data[index].children;
            }
        }
        return data;
    },
    search: function (value) {
        var data = JSON.parse(JSON.stringify(this.originData));
        value = value.toLowerCase();
        var searchResult = this.doSearch(value, data);
        this.setData(searchResult);
        this.expandAll();
    },
    checkIsExist: function (value, data) {
        for (var i = 0; i < this.searchField.length; i++) {
            var key = this.searchField[i];
            var nodeValue = data[key].toLowerCase();
            if (nodeValue.indexOf(value) != -1) {
                return true;
            }
        }
    },
    doSearch: function (value, data) {
        var fitdata = [];
        for (var i = 0; i < data.length; i++) {
            if (this.checkIsExist(value, data[i])) {
                fitdata.push(data[i]);
            } else if (data[i].children && data[i].children.length > 0) {
                var searchdata = this.doSearch(value, data[i].children);
                if (searchdata.length > 0) {
                    data[i].children = searchdata;
                    fitdata.push(data[i]);
                }
            }
        }
        return fitdata;
    },
    reset: function () {
        this.setData(this.originData);
    },
    remove: function () {
        EUI.container.TreePanel.superclass.remove.call(this);
        $(".ux-icon-box", this.dom).die("click");
        $(".ux-body", this.dom).die("click");
        $(".ux-multiselect", this.dom).die("click");
    }
});﻿EUI.Window = function () {
    return new EUI.container.Window(arguments[0]);
};
EUI.container.Window = EUI.extend(EUI.container.Container, {
    width: 340,
    height: 400,
    padding: 10,
    iconCss: null,
    showTitle: true,
    showClose: true,
    isOverFlow: true,
    closeAction: "close",
    afterClose: null,
    beforeClose:null,

    initComponent: function () {
        EUI.container.Window.superclass.initComponent.call(this);
    },

    getType: function () {
        return 'Window';
    },

    initDom: function () {
        var html = "<div class='ux-window'><div class='ux-window-titlebar'>";
        if (this.iconCss) {
            html += "<span class='icon " + this.iconCss + "'></span>";
        }
        html += "<span class='ux-window-title'>"
            + (this.title || "")
            + "</span><span class='ecmp-eui-close'></span></div><div class='ux-window-content'><div id='"
            + this.id
            + "'></div><div class='ux-window-optbox'></div></div></div>";
        this.dom = $(html);
        $("body").append(this.dom);
        this.dom.title = $(".ux-window-titlebar", this.dom);
        if (!this.title) {
            this.dom.title.hide();
        }
        this.setShadow();
        this.shadow.css("z-index", ++EUI.zindex);
        this.dom.css("z-index", ++EUI.zindex);
    },
    render: function () {
        this.dom.content = $("#" + this.id);
        if (this.padding) {
            this.dom.content.css({
                padding: this.padding
            });
        }
        if (!this.isOverFlow) {
            this.dom.content.css("overflow", "hidden");
        } else {
            this.dom.content.css("overflow", "auto");
        }
        this.setWidth(this.width);
        this.setHeight(this.height);
        this.setPosition();
        this.initButtons();
        this.addEvents();
    },
    setTitle: function (title) {
        if (title) {
            this.dom.title.show();
        }
        $(".ux-window-title", this.dom.title).text(title);
    },
    setWidth: function (width) {
        this.dom.content.width(width);
        this.width = width;
    },
    setHeight: function (height) {
        this.dom.content.height(height);
        this.height = height;
    },
    setShadow: function () {
        this.shadow = $("<div class='ux-shadow'></div>");
        $("body").append(this.shadow);
    },
    setPosition: function () {
        var parentHeight = $(window).height();
        var parentWidth = $(window).width();
        var left = (parentWidth - this.dom.width()) / 2;
        var top = (parentHeight - this.dom.height()) / 2;
        left = left < 0 ? 0 : left;
        top = top < 0 ? 0 : top;
        if (top > 100) {
            top -= 50;
        }
        this.dom.css({
            top: top,
            left: left
        });
        this.shadow.css({
            "height": parentHeight + "px"
        });
    },
    initButtons: function () {
        var optbox = $(".ux-window-optbox", this.dom);
        if (this.buttons) {
            for (var i = 0; i < this.buttons.length; i++) {
                var id = this.buttons[i].id || EUI.getId("Button");
                var html = "<div id='" + id + "'></div>";
                optbox.append(html);
                EUI.applyIf(this.buttons[i], {
                    xtype: "Button",
                    renderTo: id
                });
                EUI.Button(this.buttons[i]);
            }
        } else {
            optbox.hide();
        }
    },
    addEvents: function () {
        var g = this;
        if (!this.showClose) {
            $(".ecmp-eui-close", this.dom.title).hide();
        } else {
            $(".ecmp-eui-close", this.dom.title).bind("click", function () {
                if (g.closeAction == "close") {
                    g.close();
                } else {
                    g.hide();
                }
            });
        }
        // 移动事件
        $(".ux-window-titlebar", this.dom).bind({
            mousedown: function (event) {
                $(this).css("cursor", "move");
                var e = event || window.event;
                $(this).data("draggable", true);
                $(this).data("dragData", {
                    startX: e.pageX,
                    startY: e.pageY
                });
            },
            mousemove: function (event) {
                var data = $(this).data("dragData");
                if (!$(this).data("draggable")) {
                    return;
                }
                var e = event || window.event;
                var position = g.dom.position();
                var css = {
                    "left": position.left + (e.pageX - data.startX),
                    "top": position.top + (e.pageY - data.startY)
                };
                g.dom.css(css);
                $(this).data("dragData", {
                    startX: e.pageX,
                    startY: e.pageY
                });
            },
            mouseup: function () {
                $(this).css("cursor", "");
                $(this).data("draggable", false);
            },
            mouseleave: function () {
                $(this).css("cursor", "");
                $(this).data("draggable", false);
            }
        });
    },
    onResize: function () {
        this.setPosition();
    },
    getDom: function () {
        return this.dom.content;
    },
    hide: function () {
        this.dom.hide();
        this.shadow.hide();
    },
    show: function () {
        this.dom.show();
        this.shadow.show();
    },
    close: function () {
        if(this.beforeClose){
            var result = this.beforeClose.call(this);
            if(result == false){
                return;
            }
        }
        this.remove();
        this.afterClose && this.afterClose.call(this);
    },
    remove: function () {
        this.shadow.remove();
        EUI.container.Window.superclass.remove.call(this);
    }
});﻿EUI.ToolBar = function (cfg) {
    return new EUI.container.ToolBar(cfg);
};
EUI.container.ToolBar = EUI.extend(EUI.container.Container, {
    padding: 5,
    height: 42,
    border: false,
    isOverFlow: false,
    domCss: "ux-toolbar",
    itemCss: "ux-toolbar-item",

    initComponent: function () {
        EUI.container.ToolBar.superclass.initComponent.call(this);
    },

    getType: function () {
        return 'ToolBar';
    },

    addItems: function () {
        var g = this, items = this.options.items;
        if (items) {
            var tb = g.content;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item == "->") {
                    g.content.rightbox = $('<div class="ux-bar-right"></div>');
                    g.content.append(g.content.rightbox);
                    tb = g.content.rightbox;
                    continue;
                }
                var div;
                if (i == items.length - 1) {
                    div = $("<div class='" + this.itemCss
                        + "' style='margin-right:0px;'></div>");
                } else {
                    div = $("<div class='" + this.itemCss + "'></div>");
                }
                if (!item.renderTo) {
                    var id = item.id || EUI.getId(item.xtype);
                    if (items.length > 1) {
                        div.append("<div id='" + id + "'>");
                    } else {
                        div.attr("id", id);
                    }
                    item.renderTo = id;
                }
                tb.append(div);
                EUI.applyIf(item, g.defaultConfig);
                var xtype = item.xtype;
                if (!xtype) {
                    throw new Error(EUI.error.noXtype);
                }
                var cmp = eval("EUI." + xtype);
                if (!cmp) {
                    throw new Error(String.format(EUI.error.noCmp,
                        xtype));
                }
                cmp = cmp.call(cmp, item);
                this.items.push(cmp.id);
            }
        }
    },
    onResize: function () {
        EUI.container.ToolBar.superclass.onResize.call(this);
    }

});
﻿EUI.FormLayout = function() {
	return new EUI.layout.FormLayout(arguments[0], arguments[1]);
};

EUI.layout.FormLayout = function() {
	this.scope = arguments[0];
	var type = arguments[1];
	if (type == "layout") {
		this.layout();
	} else if (type == "resize") {
		this.resize();
	}
};

EUI.apply(EUI.layout.FormLayout.prototype, {

			itemspace : 5,
			rowCss : "ux-line-row",

			layout : function() {
				var items = this.scope.options.items, scope = this.scope;
				var dom = scope.getDom();
				var itemspace = scope.itemspace == undefined
						? this.itemspace
						: scope.itemspace;
				var rowCss = scope.rowCss || this.rowCss;

				var parentWidth = dom.outerWidth();
				parentWidth -= parseFloat(dom.css("marginLeft")) || 0;
				parentWidth -= parseFloat(dom.css("marginRight")) || 0;
				var flag = false;
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					EUI.applyIf(item, scope.defaultConfig);
					if (!item.xtype) {
						throw new Error(EUI.error.noXtype);
					}
					var cmpFn = eval("EUI." + item.xtype);
					if (!cmpFn) {
						throw new Error(EUI.error.noXtype + ":" + "EUI."
								+ item.xtype);
					}
					var div = $("<div class='" + rowCss + "'></div>");
					if (!item.hidden) {
						if (flag) {
							div.css("margin-top", itemspace);
						}else {
							flag = true;
						}
					}
					if (!item.renderTo) {
						var id = item.id || EUI.getId(item.xtype);
						if (items.length > 1) {
							div.append("<div id='" + id + "'>");
						} else {
							div.attr("id", id);
						}
						item.renderTo = id;
					}
					dom.append(div);
					item.changeVisiable = function(visiable){
						var lineRow = this.dom.parent();
						var index = lineRow.index();
						if(visiable && index != 0){
							lineRow.css("margin-top", itemspace);
						}else{
							lineRow.css("margin-top", 0);
						}
					};
					item = cmpFn.call(cmpFn, item);
					scope.items.push(item.id);
				}
				if (dom[0].clientWidth != dom[0].offsetWidth) {
					EUI.resize(scope);
				}
			},

			resize : function() {
				var items = this.scope.items;
				var dom = this.scope.getDom();
				var parentWidth = dom.outerWidth();
				parentWidth -= parseFloat(dom.css("marginLeft")) || 0;
				parentWidth -= parseFloat(dom.css("marginRight")) || 0;
				var isScrolled = dom[0].scrollWidth > dom[0].offsetWidth;
				if (isScrolled && this.scope.isOverFlow) {
					for (var i = 0; i < items.length; i++) {
						var item = EUI.getCmp(items[i]);
						var row = item.dom.parent();
						row.width(parentWidth - 17);
					}
				}
			}
		});﻿EUI.ColumnLayout = function () {
    return new EUI.layout.ColumnLayout(arguments[0], arguments[1]);
};

EUI.layout.ColumnLayout = function () {
    this.scope = arguments[0];
    var type = arguments[1];
    if (type == "layout") {
        this.layout();
    } else if (type == "resize") {
        this.resize();
    }
};

EUI.apply(EUI.layout.ColumnLayout.prototype, {

    itemspace: 20,
    columnCss: "ux-column-layout",

    layout: function () {
        var items = this.scope.options.items, g = this, scope = this.scope;
        var dom = scope.getDom();
        var totalLength = 0;
        var parentWidth = dom.width(), parentHeight = dom.height();
        parentWidth -= parseFloat(dom.css("marginLeft")) || 0;
        parentWidth -= parseFloat(dom.css("marginRight")) || 0;
        parentHeight -= parseFloat(dom.css("marginTop")) || 0;
        parentHeight -= parseFloat(dom.css("marginBottom")) || 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i], id;
            EUI.applyIf(item, scope.defaultConfig);
            if (!item.xtype) {
                throw new Error(EUI.error.noXtype);
            }
            var cmpFn = eval("EUI." + item.xtype);
            if (!cmpFn) {
                throw new Error(EUI.error.noXtype + ":" + "EUI." + item.xtype);
            }
            var div = $("<div></div>");
            if (item.columnWidth && !item.hidden) {
                div.addClass(this.columnCss);
                if (item.columnWidth <= 1) {
                    div.width(parentWidth * item.columnWidth);
                } else {
                    div.width(item.columnWidth);
                }
                if (!item.height) {
                    div.height(parentHeight);
                }
                if (!item.renderTo) {
                    id = item.id || EUI.getId(item.xtype);
                    div.append($("<div id='" + id + "'>"));
                    item.renderTo = id;
                }
            } else {
                div.addClass(scope.rowCss);
                div.width(parentWidth);
                if (!item.height) {
                    div.height(parentHeight);
                }
                if (!item.renderTo) {
                    id = item.id || EUI.getId(item.xtype);
                    div.append($("<div id='" + id + "'>"));
                    item.renderTo = id;
                }
            }
            dom.append(div);
            item = cmpFn.call(cmpFn, item);
            scope.items.push(item.id);
        }
    },

    resize: function () {
        var items = this.scope.items;
        var dom = this.scope.getDom();
        var parentWidth = dom.width(), parentHeight = dom.height();
        parentWidth -= parseFloat(dom.css("marginLeft")) || 0;
        parentWidth -= parseFloat(dom.css("marginRight")) || 0;
        parentHeight -= parseFloat(dom.css("marginTop")) || 0;
        parentHeight -= parseFloat(dom.css("marginBottom")) || 0;
        for (var i = 0; i < items.length; i++) {
            var item = EUI.getCmp(items[i]);
            if (item.columnWidth && !item.hidden) {
                var column = item.dom.parent();
                if (item.columnWidth <= 1) {
                    column.width(parentWidth * item.columnWidth);
                } else {
                    column.width(item.columnWidth);
                }
                column.height(parentHeight);
            } else {
                var row = item.dom.parent();
                row.width(parentWidth);
                if (!item.height) {
                    row.height(parentHeight);
                }
            }
        }
    }
});﻿EUI.BorderLayout = function () {
    return new EUI.layout.BorderLayout(arguments[0], arguments[1]);
};

EUI.layout.BorderLayout = function () {
    this.scope = arguments[0];
    var type = arguments[1];
    if (type == "layout") {
        this.layout();
    } else if (type == "resize") {
        this.resize();
    }
};

EUI.apply(EUI.layout.BorderLayout.prototype, {
    itemspace: 4,
    leftCss: "ux-left-expand",
    leftCloseCss: "ux-left-close",
    rightCss: "ux-right-expand",
    rightCloseCss: "ux-right-close",
    collapsedCss: "ux-layout-collapsed",

    layout: function () {
        var items = this.scope.options.items, scope = this.scope, g = this;
        var east, south, west, north, center;
        var itemspace = scope.itemspace == undefined
            ? this.itemspace
            : scope.itemspace;
        var dom = this.scope.getDom();
        var parentWidth = dom.width();
        var parentHeight = dom.height();
        var centerWidth = parentWidth;
        var centerHeight = parentHeight;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            EUI.applyIf(item, scope.defaultConfig);
            EUI.applyIf(item, {
                border: true,
                xtype: "Container"
            });
            if (item.region == "east") {
                item.expandCss = this.rightCss;
                item.closeCss = this.rightCloseCss;
                if (item.collapsible) {
                    item.collapse = function () {
                        if (!this.collapsed) {
                            g.collapseEast();
                        }
                    };
                    item.expand = function () {
                        $("#" + east.renderTo + "_collapse").click();
                    };
                }
                if (!item.width) {
                    item.width = "20%";
                    item.defaultWidth = "20%";
                }
                east = item;
                if (typeof east.width == "string"
                    && east.width.indexOf("%") > -1) {
                    width = parseFloat(east.width) / 100;
                    east.width = parseInt(parentWidth * width);
                }
                centerWidth -= (east.width + itemspace);
            } else if (item.region == "west") {
                item.expandCss = this.leftCss;
                item.closeCss = this.leftCloseCss;
                if (item.collapsible) {
                    item.collapse = function () {
                        if (!this.collapsed) {
                            g.collapseWest();
                        }
                    };
                    item.expand = function () {
                        $("#" + item.renderTo + "_collapse").click();
                    };
                }
                if (!item.width) {
                    item.width = "20%";
                    item.defaultWidth = "20%";
                }
                west = item;
                if (typeof west.width == "string"
                    && west.width.indexOf("%") > -1) {
                    width = parseFloat(west.width) / 100;
                    west.width = parseInt(parentWidth * width);
                }
                centerWidth -= (west.width + itemspace);
            } else if (item.region == "south") {
                item.collapse = function () {
                    g.collapseSouth();
                };
                item.expand = function () {
                    g.expandSouth();
                };
                if (!item.height) {
                    item.height = "15%";
                    item.defaultHeight = "15%";
                }
                south = item;
                if (typeof south.height == "string"
                    && south.height.indexOf("%") > -1) {
                    height = parseFloat(south.height) / 100;
                    south.height = parseInt(parentHeight * height);
                    south.defaultHeight = "15%";
                }
                centerHeight -= (south.height + itemspace);
            } else if (item.region == "north") {
                item.collapse = function () {
                    g.collapseNorth();
                };
                item.expand = function () {
                    g.expandNorth();
                };
                if (!item.height) {
                    item.height = "15%";
                    item.defaultHeight = "15%";
                }
                north = item;
                if (typeof north.height == "string"
                    && north.height.indexOf("%") > -1) {
                    height = parseFloat(north.height) / 100;
                    north.height = parseInt(parentHeight * height);
                }
                centerHeight -= (north.height + itemspace);
            } else if (item.region == "center") {
                center = item;
            }
        }

        if (!center) {
            throw new Error(String.format(EUI.error.noCenter, scope.id));
        } else {
            center.width = centerWidth;
            center.height = centerHeight;
            var height, width, panel, top, left;
            var div, id, xtype, cmp;
            if (north) {
                xtype = north.xtype;
                id = north.id || EUI.getId(xtype);
                div = $("<div id='" + id + "'></div>");
                dom.append(div);
                div.css({
                    "position": "absolute"
                });
                north.renderTo = id;
                cmp = eval("EUI." + xtype);
                if (!cmp) {
                    throw new Error(String.format(EUI.error.noCmp,
                        xtype));
                }
                panel = cmp.call(cmp, north);
                scope.items.push(panel.id);
                this.scope.north = panel.id;
                top = panel.height + panel.dom.offset().top + itemspace;
            }
            if (west) {
                west.height = center.height;
                xtype = west.xtype;
                cmp = eval("EUI." + xtype);
                if (!cmp) {
                    throw new Error(String.format(EUI.error.noCmp,
                        xtype));
                }
                id = west.id || EUI.getId(xtype);
                div = $("<div id='" + id + "'></div>");
                dom.append(div);
                div.css({
                    "position": "absolute"
                });
                if (north)
                    div.offset({
                        top: top
                    });
                west.renderTo = id;
                panel = cmp.call(cmp, west);
                scope.items.push(panel.id);
                this.scope.west = panel.id;
                left = panel.width + panel.dom.offset().left
                    + itemspace;
            }
            if (center) {
                xtype = center.xtype;
                cmp = eval("EUI." + xtype);
                if (!cmp) {
                    throw new Error(String.format(EUI.error.noCmp,
                        xtype));
                }
                id = center.id || EUI.getId(xtype);
                div = $("<div id='" + id + "'></div>");
                dom.append(div);
                div.css({
                    "position": "absolute"
                });
                if (north)
                    div.offset({
                        top: top
                    });
                if (west)
                    div.offset({
                        left: left
                    });
                center.renderTo = id;
                panel = cmp.call(cmp, center);
                scope.items.push(panel.id);
                this.scope.center = panel.id;
                left = panel.width + panel.dom.offset().left
                    + itemspace;
            }
            if (east) {
                east.height = center.height;
                xtype = east.xtype;
                cmp = eval("EUI." + xtype);
                if (!cmp) {
                    throw new Error(String.format(EUI.error.noCmp,
                        xtype));
                }
                id = east.id || EUI.getId(xtype);
                div = $("<div id='" + id + "'></div>");
                dom.append(div);
                div.css({
                    "position": "absolute"
                });
                if (north)
                    div.offset({
                        top: top
                    });
                div.offset({
                    left: left
                });
                east.renderTo = id;
                panel = cmp.call(cmp, east);
                scope.items.push(panel.id);
                this.scope.east = panel.id;
            }
            top = EUI.getCmp(this.scope.center).dom.offset().top
                + EUI.getCmp(this.scope.center).height + itemspace;
            if (south) {
                south.height = south.height;
                xtype = south.xtype ? south.xtype : scope.defaultType;
                EUI.applyIf(south, this.defaultStyle);
                cmp = eval("EUI." + xtype);
                if (!cmp) {
                    throw new Error(String.format(EUI.error.noCmp,
                        xtype));
                }
                id = south.id || EUI.getId(xtype);
                div = $("<div id='" + id + "'></div>");
                dom.append(div);
                div.css({
                    "position": "absolute"
                });
                div.offset({
                    top: top
                });
                south.renderTo = id;
                panel = cmp.call(cmp, south);
                scope.items.push(panel.id);
                this.scope.south = panel.id;
            }
        }
    },

    resize: function () {
        var dom = this.scope.getDom();
        var parentWidth = dom.width();
        var parentHeight = dom.height();
        var centerWidth = parentWidth;
        var centerHeight = parentHeight;
        var itemspace = this.scope.itemspace == undefined ? this.itemspace : this.scope.itemspace;
        var height, width, panel, top = 0, left = 0, div;
        if (this.scope.north) {
            panel = EUI.getCmp(this.scope.north);
            height = panel.height;
            if (panel.options.defaultHeight) {
                height = parseFloat(panel.options.defaultHeight) / 100;
                height = parseInt(parentHeight * height);
                panel.setHeight(height);
                panel.setWidth(parentWidth);
            }
            centerHeight -= (panel.dom.outerHeight() + itemspace);
            panel.dom.css({
                "position": "absolute"
            });
            top = panel.dom.outerHeight() + panel.dom.offset().top
                + itemspace;
            EUI.resize(panel);
        }
        if (this.scope.south) {
            panel = EUI.getCmp(this.scope.south);
            height = panel.height;
            if (panel.options.defaultHeight) {
                height = parseFloat(panel.options.defaultHeight) / 100;
                height = parseInt(parentHeight * height);
                panel.setHeight(height);
                panel.setWidth(parentWidth);
            }
            centerHeight -= (panel.dom.outerHeight() + itemspace);
            EUI.resize(panel);
        }
        if (this.scope.west) {
            panel = EUI.getCmp(this.scope.west);
            div = panel.collDiv;
            width = panel.width;
            panel.setHeight(centerHeight);
            if (panel.options.defaultWidth) {
                width = parseFloat(panel.options.defaultWidth) / 100;
                width = parseInt(parentWidth * width);
                panel.setWidth(width);
            }
            if (this.scope.north) {
                panel.dom.offset({
                    top: top
                });
            }
            if (div) {
                div.height(centerHeight - 2);
                if (this.scope.north) {
                    div.offset({top: top});
                }
            }
            if (panel.collapsed) {
                width = div.outerWidth();
                left = width + div.offset().left + itemspace;
            } else {
                left = width + panel.dom.offset().left + itemspace;
            }
            centerWidth -= (width + itemspace);
            EUI.resize(panel);
        }
        if (this.scope.east) {
            panel = EUI.getCmp(this.scope.east);
            div = panel.collDiv;
            width = panel.width;
            panel.setHeight(centerHeight);
            if (panel.options.defaultWidth) {
                width = parseFloat(panel.options.defaultWidth) / 100;
                width = parseInt(parentWidth * width);
                panel.setWidth(width);
            }
            if (this.scope.north) {
                panel.dom.offset({
                    top: top
                });
            }
            if (div) {
                div.height(centerHeight - 2);
                if (this.scope.north) {
                    div.offset({top: top});
                }
            }
            if (panel.collapsed) {
                width = div.outerWidth();
            }
            centerWidth -= (width + itemspace);
            EUI.resize(panel);
        }
        if (this.scope.center) {
            panel = EUI.getCmp(this.scope.center);
            panel.setHeight(centerHeight);
            panel.setWidth(centerWidth);
            if (this.scope.west){
                var  westCmp  = EUI.getCmp(this.scope.west);
                if(westCmp.leftCollapsed){ //处理自定义的collapse
                    var newWidth = panel.dom.outerWidth() + westCmp.dom.outerWidth();
                    panel.setWidth(newWidth);
                    panel.dom.offset({left: 10});
                    EUI.resize(panel);
                }else{
                    panel.dom.offset({
                        "left": left
                    });
                }
            }

            if (this.scope.north)
                panel.dom.offset({
                    top: top
                });
            left = panel.dom.outerWidth() + panel.dom.offset().left + itemspace;
            if (this.scope.east) {
                var eastCmp = EUI.getCmp(this.scope.east);
                eastCmp.dom.offset({
                    "left": left
                });
                if (eastCmp.collDiv) {
                    eastCmp.collDiv.offset({
                        "left": left
                    });
                }
            }
            top = panel.dom.outerHeight() + panel.dom.offset().top + itemspace;
            EUI.resize(panel);
        }
        if (this.scope.south) {
            var  bottomCmp  = EUI.getCmp(this.scope.south);
            if(bottomCmp.bottomCollapsed){//处理自定义的collapse
                var newHeight =  panel.dom.outerHeight() + bottomCmp.dom.outerHeight();
                panel.setHeight(newHeight - 45);
                EUI.resize(panel);
            }else{
                EUI.getCmp(this.scope.south).dom.offset({
                    "top": top
                });
            }
        }
    },

    collapseNorth: function () {
        var scope = this.scope, north = EUI.getCmp(scope.north), east = EUI.getCmp(scope.east),
            west = EUI.getCmp(scope.west), center = EUI.getCmp(scope.center);
        var itemspace = scope.itemspace == undefined ? this.itemspace : scope.itemspace;
        north.content.hide();
        var top = north.dom.offset().top + itemspace + north.dom.outerHeight();
        var height = center.dom.outerHeight() + north.content.outerHeight();
        center.setHeight(height);
        center.dom.offset({top: top});
        if (west) {
            west.setHeight(height);
            if (west.collapsed) {
                west.collDiv.height(height - 2 * (parseFloat(west.collDiv.css("borderBottomWidth")) || 0));
                west.collDiv.offset({top: top});
            }
            west.dom.offset({top: top});
            EUI.resize(west);
        }
        if (east) {
            east.setHeight(height);
            if (east.collapsed) {
                east.collDiv.height(height - 2 * (parseFloat(east.collDiv.css("borderBottomWidth")) || 0));
                east.collDiv.offset({top: top});
            }
            east.dom.offset({top: top});
            EUI.resize(east);
        }
        EUI.resize(center);
        north.afterCollapse && north.afterCollapse.call(scope, div);
    },
    expandNorth: function () {
        var scope = this.scope, north = EUI.getCmp(scope.north), east = EUI.getCmp(scope.east),
            west = EUI.getCmp(scope.west), center = EUI.getCmp(scope.center);
        var itemspace = scope.itemspace == undefined ? this.itemspace : scope.itemspace;
        north.content.show();
        var top = north.dom.offset().top + itemspace + north.dom.outerHeight();
        var height = center.dom.outerHeight() - north.content.outerHeight();
        center.setHeight(height);
        center.dom.offset({top: top});
        if (west) {
            west.setHeight(height);
            if (west.collapsed) {
                west.collDiv.height(height - 2 * (parseFloat(west.collDiv.css("borderBottomWidth")) || 0));
                west.collDiv.offset({top: top});
            }
            west.dom.offset({top: top});
            EUI.resize(west);
        }
        if (east) {
            east.setHeight(height);
            if (east.collapsed) {
                east.collDiv.height(height - 2 * (parseFloat(east.collDiv.css("borderBottomWidth")) || 0));
                east.collDiv.offset({top: top});
            }
            east.dom.offset({top: top});
            EUI.resize(east);
        }
        EUI.resize(center);
        north.afterExpand && north.afterExpand.call(scope);
    },
    collapseWest: function () {
        var g = this, scope = this.scope, west = EUI.getCmp(scope.west), div = west.collDiv,
            center = EUI.getCmp(scope.center);
        var itemspace = scope.itemspace == undefined ? this.itemspace : scope.itemspace;
        if (!div) {
            div = $("<div class='" + g.collapsedCss + "' id='" + west.renderTo + "_collapse" + "'><div class='" + g.leftCloseCss + "'></div></div>");
            div.width(west.closeWith);
            div.bind("click", function () {
                if (west.collapsed) {
                    g.expandWest();
                }
            });
            west.dom.before(div);
            west.collDiv = div;
        } else {
            div.show();
        }
        var top = west.dom.offset().top;
        div.css({
            "position": "absolute",
            height: west.dom.outerHeight() - 2
        });
        if (EUI.getCmp(scope.north)) {
            div.offset({top: top});
        }
        var left = div.offset().left + div.outerWidth() + itemspace;
        var width = center.dom.outerWidth() - div.outerWidth() + west.dom.outerWidth();
        west.hide();
        center.setWidth(width);
        var $tabItem = $(".ux-tab-content-item", center.dom);
        $tabItem.length>0&&$tabItem.width(width);
        center.dom.offset({left: left});
        EUI.resize(center);
        west.afterCollapse && west.afterCollapse.call(scope, div);
    },
    expandWest: function () {
        var scope = this.scope, west = EUI.getCmp(scope.west), div = west.collDiv, center = EUI.getCmp(scope.center);
        var itemspace = scope.itemspace == undefined ? this.itemspace : scope.itemspace;
        west.show();
        var left = west.dom.offset().left + west.dom.outerWidth() + itemspace;
        var width = center.dom.outerWidth() + div.outerWidth() - west.dom.outerWidth();
        div.hide();
        west._setCollapseCss();
        center.setWidth(width);
        center.dom.offset({left: left});
        EUI.resize(center);
        west.afterExpand && west.afterExpand.call(scope);
    },
    collapseEast: function () {
        var g = this, scope = this.scope, east = EUI.getCmp(scope.east), div = east.collDiv,
            center = EUI.getCmp(scope.center);
        if (!div) {
            div = $("<div class='" + g.collapsedCss + "' id='" + east.renderTo + "_collapse" + "'><div class='" + g.rightCloseCss + "' style='float: left;'></div></div>");
            div.width(east.closeWith);
            div.bind("click", function () {
                if (east.collapsed) {
                    g.expandEast();
                }
            });
            east.dom.before(div);
            east.collDiv = div;
        } else {
            div.show();
        }
        var top = east.dom.offset().top;
        var left = east.dom.offset().left - div.outerWidth() + east.dom.outerWidth();
        div.css({
            "position": "absolute",
            height: east.dom.height() - 2
        });
        div.offset({left: left, top: top});
        var width = center.dom.outerWidth() - div.outerWidth() + east.dom.outerWidth();
        east.hide();
        center.setWidth(width);
        EUI.resize(center);
        east.afterCollapse && east.afterCollapse.call(scope, div);
    },
    expandEast: function () {
        var scope = this.scope, east = EUI.getCmp(scope.east), div = east.collDiv, center = EUI.getCmp(scope.center);
        var itemspace = scope.itemspace == undefined ? this.itemspace : scope.itemspace;
        east.show();
        var width = center.dom.outerWidth() + div.outerWidth() - east.dom.outerWidth();
        div.hide();
        east._setCollapseCss();
        center.setWidth(width);
        var left = center.dom.offset().left + width + itemspace;
        east.dom.offset({left: left});
        EUI.resize(center);
        east.afterExpand && east.afterExpand.call(scope);
    },
    collapseSouth: function () {
        var scope = this.scope, south = EUI.getCmp(scope.south), east = EUI.getCmp(scope.east),
            west = EUI.getCmp(scope.west), center = EUI.getCmp(scope.center);
        south.content.hide();
        var contentHeight = south.content.outerHeight();
        var height = center.dom.outerHeight() + contentHeight;
        var top = south.dom.offset().top + contentHeight;
        south.dom.offset({top: top});
        if (west) {
            if (west.collapsed) {
                west.collDiv.height(height - 2 * (parseFloat(west.collDiv.css("borderBottomWidth")) || 0));
            }
            west.setHeight(height);
            EUI.resize(west);
        }
        if (east) {
            if (east.collapsed) {
                east.collDiv.height(height - 2 * (parseFloat(east.collDiv.css("borderBottomWidth")) || 0));
            }
            east.setHeight(height);
            EUI.resize(east);
        }
        center.setHeight(height);
        EUI.resize(center);
        south.afterCollapse && south.afterCollapse.call(scope, div);
    },

    expandSouth: function () {
        var scope = this.scope, south = EUI.getCmp(scope.south), east = EUI.getCmp(scope.east),
            west = EUI.getCmp(scope.west), center = EUI.getCmp(scope.center);
        south.content.show();
        var contentHeight = south.content.outerHeight();
        var height = center.dom.outerHeight() - contentHeight;
        var top = south.dom.offset().top - contentHeight;
        center.setHeight(height);
        south.dom.offset({top: top});
        if (west) {
            if (west.collapsed) {
                west.collDiv.height(height - 2 * (parseFloat(west.collDiv.css("borderBottomWidth")) || 0));
            }
            west.setHeight(height);
            EUI.resize(west);
        }
        if (east) {
            if (east.collapsed) {
                east.collDiv.height(height - 2 * (parseFloat(east.collDiv.css("borderBottomWidth")) || 0));
            }
            east.setHeight(height);
            EUI.resize(east);
        }
        EUI.resize(center);
        south.afterExpand && south.afterExpand.call(scope);
    }
});﻿EUI.AutoLayout = function () {
    return new EUI.layout.AutoLayout(arguments[0], arguments[1]);
};

EUI.layout.AutoLayout = function () {
    this.scope = arguments[0];
    var type = arguments[1];
    if (type == "layout") {
        this.layout();
    } else if (type == "resize") {
        this.resize();
    }
};

EUI.apply(EUI.layout.AutoLayout.prototype, {
    itemspace: 10,
    floatCss: "ux-layout-auto",

    layout: function () {
        var items = this.scope.options.items, g = this, scope = this.scope;
        var dom = scope.getDom();
        var itemspace = scope.itemspace == undefined
            ? this.itemspace
            : scope.itemspace;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var config = {
                parentCmp: scope.id || scope.renderTo,
                isDefined: true
            };
            EUI.applyIf(item, config);
            EUI.applyIf(item, scope.defaultConfig);
            EUI.applyIf(item, scope.defaultStyle);
            if (!item.renderTo) {
                var id = item.id || EUI.getId(item.xtype);
                var div = $("<div id='" + id + "' style='float:left;margin:0 " + itemspace + "px 10px 0'>");
                dom.append(div);
                item.renderTo = id;
            }
            if (!item.xtype) {
                throw new Error(EUI.error.noXtype);
            }
            var cmpFn = eval("EUI." + item.xtype);
            if (!cmpFn) {
                throw new Error(EUI.error.noXtype + ":" + "EUI."
                    + item.xtype);
            }
            item = cmpFn.call(cmpFn, item);
            scope.items.push(item.id);
        }
    },

    resize: function () {

    }
});﻿EUI.form.Field = EUI.extend(EUI.UIComponent, {
	inputType : 'text',
	textType : "input",
	readonly : false,
	name : null,
	field : null,
	submitValue : null,
    submitName:true,//是否提交name字段
	isFormField : true,
	title : null,
	value : null,
	colon : true,// 是否显示冒号
	labelFirst : true,
	labelAlign:"left",
	invalidText : null,
	domCss : "ux-field",
	readonlyCss : "ux-field-readonly",
	disabledCss : "ux-field-disable",
	labelCss : "ux-field-label",
	elementCss : "ux-field-element",
	requiredCss : "ux-field-must",
	labelStyle : null,// 自定义label样式

	initComponent : function() {
		EUI.form.Field.superclass.initComponent.call(this);
		if (!this.labelFirst) {
			this.labelCss = "ux-field-label-right";
		}
	},

	getType : function() {
		return 'Field';
	},
	render : function() {
		var g = this;
		g.dom.addClass(g.domCss);
		g.initLabel();
		g.initField();
		g.addCss();
		g.initAttribute();
		g.addEvents();
		if (g.value != null && g.value != "" && g.value != undefined) {
			if (!(typeof g.value == "object")) {
				g.setValue(g.value);
			} else
				g.loadData(g.value);
		} else {
			g.initSubmitValue();
		}
	},
	show : function() {
		EUI.form.Field.superclass.show.call(this);
		this.hidden = false;
	},
	hide : function() {
		EUI.form.Field.superclass.hide.call(this);
		this.hidden = true;
	},
	initLabel : function() {
		var g = this;
		if (g.title) {
			var title = g.title;
			if (g.colon) {
				title = g.title + "：";
			}
			var titleText = !g.labelFirst ? g.title : title;
			var label = $("<div>" + titleText + "</div>");
			label.addClass(g.labelCss);
			if (this.labelStyle) {
				label.css(this.labelStyle);
			}
			g.dom.label = label;
			g.dom.append(label);
			g.setLabelWidth(g.labelWidth ? g.labelWidth : 70);
		}
	},
	setTitle : function() {
		var g = this, ags = arguments;
		if (ags.length > 0) {
			g.title = ags[0];
			var title = g.title;
			if (g.colon) {
				title = g.title + "：";
			}
			var titleText = !g.labelFirst ? g.title : title;
			g.dom.label.html(titleText);
		}
	},
	setLabelWidth : function() {
		var width = parseInt(arguments[0]);
		if (this.dom.label && width) {
			this.dom.label.width(width);
		}
	},
	initField : function() {
		var g = this;
		var input;
		if (g.textType == "input") {
			input = $("<input type='"
					+ g.inputType
					+ "' autocomplete='off'  autocorrect='off' autocapitalize='off' spellcheck='false'>");
		} else if (g.textType == "textarea") {
			input = $("<textarea></textarea>");
		}
		input.addClass(g.fieldCss);
		g.dom.field = input;
		g.dom.fieldwrap = $("<div></div>").addClass(g.elementCss);

		g.dom.fieldwrap.append(g.dom.field);
		if (g.labelFirst) {
			g.dom.append(g.dom.fieldwrap);
		} else {
			g.dom.fieldwrap.insertBefore(g.dom.label);
		}
		g.dom.append('<div class="ux-clear"></div>');
	},

	addCss : function() {
		var g = this;
		if (g.readonly) {
			g.dom.field.attr("readonly", g.readonly);
			g.dom.fieldwrap.addClass(g.readonlyCss);
		}
	},

	initAttribute : function() {
		var g = this;
		if (g.readonly) {
			g.dom.fieldwrap.addClass(g.readonlyCss);
		}
		if (g.disabled) {
			g.dom.field.attr("disabled", g.disabled);
		}
		if (g.name) {
			g.dom.field.attr("name", g.name);
		}
		if (g.submitValue) {
			g.dom.field.data('submitValue', g.submitValue);
		}
		g.dom.field.attr("name", g.name);
	},
	addEvents : function() {
		var g = this;
		g.dom.field.bind("click", function() {
					if (!g.dom.fieldwrap.hasClass(g.focusCss)) {
						g.dom.fieldwrap.addClass(g.focusCss);
					}
				});
		if (this.handler) {
			g.dom.field.bind("click", this.handler);
		}
		var listener = this.listener;
		if (listener) {
			for (var key in listener)
				g.dom.field.bind(key, listener[key]);
		}
	},

	sysValidater : function() {
	},
	keyup : function() {
		this.sysValidater();
	},

	getValue : function() {
		var value = this.dom.field.val();
		if (value) {
			value = value.trim();
		}
		return value;
	},
	initSubmitValue : function() {
		var g = this, value = {};
		if (g.field) {
			for (var i = 0; i < g.field.length; i++) {
				var name = g.field[i];
				value[name] = "";
			}
		}
		g.submitValue = value;
	},
	getSubmitValue : function() {
		var data = {};
		if (this.submitName && this.name)
			data[this.name] = this.getValue();
		EUI.applyIf(data, this.submitValue);
		return data;
	},
	setSubmitValue : function(data) {
		var g = this, value = {};
		if (!data) {
			return;
		}
		this.setValue(data[this.name]);
        value[this.name] = data[this.name];
		if (g.field) {
			for (var i = 0; i < g.field.length; i++) {
				var name = g.field[i];
				var filedValue = g.getJsonData(data, name);
				value[name] = (filedValue != undefined && filedValue != null
						? filedValue
						: "");
			}
		}
		g.submitValue = value;
	},
	getJsonData : function(data, name) {
		var filedValue
		if (data[name]) {
			return data[name];
		}
		if (name.indexOf(".") != -1) {
			var key = name.split(".");
			var field1 = key[0];
			var field2 = key[1];
			if (!data[field1]) {
				return "";
			}
			filedValue = data[field1][field2];
		} else {
			filedValue = data[name];
		}
		return filedValue;
	},
	loadData : function() {
		var data = arguments[0];
		this.setSubmitValue(data);
		if (data) {
			this.setValue(this.getJsonData(data, this.name));
		}
	},
	setReadOnly : function() {
		var args = arguments;
		if (args.length != 0) {
			var arg = args[0] == "true" || args[0] == true ? true : false;
			this.dom.field.attr("readonly", arg);
			this.readonly = arg;
			if (arg) {
				if (!this.dom.fieldwrap.hasClass(this.readonlyCss)) {
					this.dom.fieldwrap.addClass(this.readonlyCss);
				}
			} else {
				this.dom.fieldwrap.removeClass(this.readonlyCss);
			}
		}
	},
	setWidth : function() {
		this.dom.field.width(arguments[0]);
	},
	setValue : function(value) {
		if (value && typeof value == "string") {
			value = value.trim();
		}
		this.dom.field.val(value);
		this.value = value;
	},
	reset : function() {
		this.dom.field.val("");
		this.initSubmitValue();
	}
});
﻿EUI.TextField = function () {
    return new EUI.form.TextField(arguments[0]);
};

EUI.form.TextField = EUI.extend(EUI.form.Field, {
    inputType: 'text',
    width: 220,
    height: 20,
    minlength: 0,
    canClear: false,
    maxlength: Number.MAX_VALUE,
    allowChar: null,
    allowBlank: true,
    validater: null,
    validateText: null,
    displayText: null,
    hintText: null,
    unit: null,
    hintPrefixText: null,
    hintCss: "ux-field-hint",
    displayCss: "ux-field-display",
    fieldCss: "ux-field-text",
    focusCss: "ux-field-focus",
    invalidCss: "ux-field-invalid",
    unitCss: "ux-unitfield-unit",
    clearCss: "ux-field-clear",
    clearBoxCss: "ux-field-clearbox",
    triggerBoxCss: "ux-trigger-box",
    checkInitValue: true,
    afterValidate: null,
    afterClear: null,
    checkHtmlStr:true,

    initComponent: function () {
        EUI.form.TextField.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'TextField';
    },
    render: function () {
        EUI.form.TextField.superclass.render.call(this);
        this.setWidth(this.width);
        this.setHeight(this.height);
    },
    initField: function () {
        EUI.form.TextField.superclass.initField.call(this);
        if (this.hintText) {
            var hintDom = $("<div class='" + this.hintCss + "'>"
                + this.hintText + "</div>");
            $(".ux-clear", this.dom).before(hintDom);
            this.dom.hintDom = hintDom;
        }
        if (this.canClear) {
            this.initClear();
        }
        if (this.unit) {
            this.initUnit();
        }
        this.initDisplayText();
    },
    initUnit: function () {
        var g = this;
        var unitDom = $("<span class='" + this.unitCss + "'>" + this.unit
            + "</span>");
        g.dom.field.after(unitDom);
    },
    initClear: function () {
        var g = this;
        var clearbtn = $("<div class='" + this.clearBoxCss
            + "'><span class='" + this.clearCss + "'></span></div>");
        if (g.canClear) {
            g.dom.field.after(clearbtn);
            g.clearBtn = clearbtn;
        }
        if (g.readonly) {
            clearbtn.hide();
        }
    },
    initLabel: function () {
        var g = this;
        if (g.title) {
            var title = "<span >" + g.title + "</span>";
            if (g.colon) {
                title = "<span>" + g.title + "：</span>";
            }
            var titleText = !g.allowBlank ? title + "<span class='"
                + g.requiredCss + "'>*</span>" : title;
            var label = $("<div>" + titleText + "</div>");
            label.addClass(g.labelCss);
            label.css("text-align", this.labelAlign);
            if (this.labelStyle) {
                label.css(this.labelStyle);
            }
            g.dom.label = label;
            g.dom.append(label);
            g.setLabelWidth(g.labelWidth ? g.labelWidth : 70);
        }
    },
    setAllowBlank: function (v) {
        var g = this;
        if (typeof v != "boolean") {
            return;
        }
        if (!g.title) {
            g.allowBlank = v;
            return;
        }
        if (v === false) {
            if (g.dom.label.find("span." + g.requiredCss).length > 0)
                return;
            g.dom.label.append("<span class='" + g.requiredCss + "'>*</span>");
            g.allowBlank = false;
        } else {
            g.dom.label.find("span." + g.requiredCss).remove();
            g.allowBlank = true;
            g.sysValidater();
        }
    },
    setWidth: function () {
        var width = parseInt(arguments[0]);
        if (width) {
            if (typeof arguments[0] == "string"
                && arguments[0].indexOf("%") > -1) {
                width /= 100;
                width *= this.dom.parent().width();
                if (this.dom.label) {
                    if (!this.labelWidth) {
                        if (width * 7 / 23 < 40) {
                            this.setLabelWidth(40);
                            width -= 40;
                        }
                        if (width * 7 / 23 > 70) {
                            this.setLabelWidth(70);
                            width -= 70;
                        } else {
                            this.setLabelWidth(width * 7 / 23);
                            width -= (width * 7 / 23);
                        }
                    } else {
                        this.setLabelWidth(this.labelWidth);
                        width -= this.labelWidth;
                    }
                }
            }
            width -= this._getOtherWidth();
            this.dom.field.width(width);
            this.width = arguments[0];
        }
    },
    _getOtherWidth: function () {
        var doms = this.dom.fieldwrap.children();
        var width = 13;//element边框+input内边距
        if (doms.length > 1) {
            for (var i = 1; i < doms.length; i++) {
                var itemdom = $(doms[i]);
                // if(itemdom.is(":visible")) {
                    var tmp = itemdom.clone().show().appendTo("body").css({left:-100000,top:-100000});
                    width += tmp.outerWidth();
                    tmp.remove();
                // }
            }
        }
        return width;
    },
    setHeight: function () {
        var height = parseInt(arguments[0]);
        if (height) {
            this.dom.field.height(height);
        }
    },
    initDisplayText: function () {
        var g = this;
        if (g.displayText) {
            g.dom.field.val(g.displayText);
            g.dom.field.addClass(g.displayCss);
        }
    },
    addEvents: function () {
        var g = this;
        var fieldwrap = g.dom.fieldwrap;
        var field = g.dom.field;
        field.bind("keypress", function (e) {
            var code = e.keyCode || e.charCode;
            if (code == 37 || code == 39 || code == 8
                || (e.ctrlKey && code > 0)) {
                return true;
            } else {
                var chr = String.fromCharCode(code);
                if (g.allowChar && g.allowChar.indexOf(chr) == -1) {
                    return false;
                }
            }
        });
        field.bind("click", function () {
            if (g.hintText) {
                g.dom.hintDom.css("display", "inline-block");
            }
        });
        field.bind("blur", function () {
            if (g.hintText) {
                g.dom.hintDom.hide();
            }
            if (!g.getValue()) {
                g.submitValue = null;
            }
            g.sysValidater();
            fieldwrap.removeClass(g.focusCss);
        });
        field.bind("keyup", function (e) {
            g.sysValidater();
        });
        field.hover(function () {
            if (g.tooltip && g.invalidText) {
                g.showTip().show();
            }
        }, function () {
            g.hideTip();
        });
        if (g.displayText) {
            g.doDisplayEvents();
        }
        g.clearBtn && g.clearBtn.bind("click", function () {
            g.reset();
            g.afterClear && g.afterClear.call(g);
            return false;
        });
        EUI.form.TextField.superclass.addEvents.call(this);
    },
    doDisplayEvents: function () {
        var g = this;
        g.dom.field.bind("blur", function () {
            var value = g.dom.field.val();
            if (!value) {
                g.dom.field.addClass(g.displayCss);
                g.dom.field.val(g.displayText);
            }
        });
        g.dom.field.bind("focus", function () {
            if (!g.readonly) {
                var value = g.dom.field.val();
                if (g.displayText == value) {
                    g.dom.field.val("");
                }
                g.dom.field.removeClass(g.displayCss);
                g.sysValidater();
            }
        });
    },

    sysValidater: function () {
        var g = this;
        if (g.hidden)
            return true;
        var value = g.getValue();
        if (g.validater) {
            if (g.validater(value) == false) {
                g.invalidText = g.validateText ? g.validateText : "";
                g.afterValid(false);
                return false;
            }
        }
        if (g.allowChar && value.length > 0 && g.displayText != value) {
            for (var i = 0; i < value.length; i++) {
                var c = value.charAt(i);
                if (g.allowChar.indexOf(c) == -1) {
                    g.invalidText = String.format(g.invalidCharText, value, c);
                    g.afterValid(false);
                    return false;
                }
            }
        }
        if (!g.checkLength()) {
            g.afterValid(false);
            return false;
        }
        if (!g.allowBlank
            && (value == null || value === "" || g.displayText == value || value.length == 0)) {
            var text = g.title ? g.title : g.hintPrefixText;
            g.invalidText = String.format(g.blankText, text);
            g.afterValid(false);
            return false;
        }
        if(value && value.length > 0 && value.toLowerCase().indexOf("script")!==-1){
            g.invalidText = String.format(g.invalidCharText, "script");
            g.afterValid(false);
            return false;
        }
        var checkCharArr="\'>\"<\\;";
        if (g.checkHtmlStr && checkCharArr && value.length > 0 && g.displayText != value) {
            var reg = new RegExp("<[^<>]+?>","g")
            if(reg.test(value)){
                g.invalidText = String.format("'输入的值中含有非法字符【<>】!'");
                g.afterValid(false);
                return false;
            }
            if(value.indexOf(")")>-1 && value.indexOf("(")==-1||(value.indexOf("(") > value.indexOf(")"))){
                g.invalidText = String.format("'输入的值中括号不匹配!'");
                g.afterValid(false);
                return false;
            }
            for (var i = 0; i < value.length; i++) {
                var c = value.charAt(i);
                if (checkCharArr.indexOf(c) != -1) {
                    g.invalidText = String.format("'输入的值中含有非法字符:【{0}】!'", c);
                    g.afterValid(false);
                    return false;
                }
            }
        }
        g.afterValid(true);
        g.afterValidate && g.afterValidate.call(this, value);
        return true;
    },
    afterValid: function () {
        var g = this, flag = arguments[0];
        if (!flag) {
            if (!g.dom.field.hasClass(g.invalidCss)) {
                g.dom.field.addClass(g.invalidCss);
                g.dom.fieldwrap.removeClass(g.focusCss);
            }
            g.showTip();
        } else {
            g.dom.field.removeClass(g.invalidCss);
            g.dom.fieldwrap.removeClass(g.focusCss);
            if (g.tooltip) {
                g.tooltip.remove();
                g.tooltip = null;
            }
        }
        if (this.canClear) {
            if (this.getValue()) {
                this.clearBtn.css("visibility","visible");
            } else {
                this.clearBtn.css("visibility","hidden");
            }
        }
    },
    checkLength: function () {
        var g = this;
        var value = g.dom.field.val();
        var text = g.title ? g.title : g.hintPrefixText;
        if (value.length < g.minlength) {
            g.invalidText = String.format(g.minLengthText, text, g.minlength);
            return false;
        }
        if (value.length > g.maxlength) {
            g.invalidText = String.format(g.maxLengthText, text, g.maxlength);
            return false;
        }
        return true;
    },
    getValue: function () {
        var g = this, v = g.dom.field.val();
        if (g.displayText === v) {
            return "";
        }
        var value = g.dom.field.val();
        if (value && typeof value == "string") {
            value = value.trim();
        }
        return value;
    },
    setValue: function () {
        var g = this;
        EUI.form.TextField.superclass.setValue.call(this, arguments[0]);
        if (arguments.length != 0 && arguments[0]) {
            g.dom.field.removeClass(g.displayCss);
            g.clearBtn && g.clearBtn.children().css("display", "inline-block");
        } else {
            g.initDisplayText();
            g.clearBtn && g.clearBtn.children().hide();
        }
        if (this.checkInitValue) {
            g.sysValidater();
        }
    },
    appendText: function (text) {
        var value = this.value + text;
        this.setValue(value);
    },
    onResize: function () {
        var g = this;
        if (typeof g.width == "string" && g.width.indexOf("%") > -1) {
            g.setWidth(g.width);
        }
    },
    reset: function () {
        var g = this;
        if (!g.displayText || g.displayText == "") {
            g.dom.field.val("");
        } else {
            g.initDisplayText();
        }
        this.value = "";
        this.initSubmitValue();
        this.sysValidater();
    },
    showTip: function () {
        if (!this.tooltip) {
            this.tooltip = $("<div class='ux-tooltip'>" + this.invalidText
                + "</div>");
            $("body").append(this.tooltip);
        } else {
            this.tooltip.html(this.invalidText);
        }
        var offset = this.dom.field.offset();
        this.tooltip.css({
            top: offset.top + this.dom.field.height() + 15,
            left: offset.left + 5
        });
        return this.tooltip;
    },
    hideTip: function () {
        this.tooltip && this.tooltip.hide();
    },
    focus:function () {
        this.dom.field.focus();
    }
});
﻿EUI.TriggerField = function () {
    return new EUI.form.TriggerField(arguments[0]);
};
EUI.form.TriggerField = EUI.extend(EUI.form.TextField, {
    editable: false,
    canClear: true,
    shadow: true,
    loadonce: true,
    showTrigger: true,
    maxListHeight: 200,
    beforeSelect: null,
    afterSelect: null,
    listCss: "ux-list",
    triggerCss: "ux-trigger",
    triggerHoverCss: "ux-trigger-hover",
    triggerClickCss: "ux-trigger-click",
    triggerDisableCss: "ux-trigger-disable",
    multiBoxCls: "ux-list-multibox",
    reader: null,
    afterHideList:null,//隐藏下拉列表后触发事件

    initComponent: function () {
        EUI.form.TriggerField.superclass.initComponent.call(this);
        this.initReader();
        this.loading = false;
    },
    getType: function () {
        return 'TriggerField';
    },

    initField: function () {
        EUI.form.TriggerField.superclass.initField.call(this);
        if (!this.editable) {
            this.dom.field.attr("readonly", true);
            this.dom.field.addClass("ux-hand");
        }
        this.initTrigger();
        if (this.readonly) {
            this.setReadOnly(true);
        }
    },
    setWidth: function () {
        var width = parseInt(arguments[0]);
        if (width) {
            if (typeof arguments[0] == "string"
                && arguments[0].indexOf("%") > -1) {
                width /= 100;
                width *= this.dom.parent().width();
                if (this.dom.label) {
                    if (!this.labelWidth) {
                        if (width * 7 / 23 < 40) {
                            this.setLabelWidth(40);
                            width -= 40;
                        }
                        if (width * 7 / 23 > 70) {
                            this.setLabelWidth(70);
                            width -= 70;
                        } else {
                            this.setLabelWidth(width * 7 / 23);
                            width -= (width * 7 / 23);
                        }
                    } else {
                        this.setLabelWidth(this.labelWidth);
                        width -= this.labelWidth;
                    }
                }
            }
            width -= this._getOtherWidth();
            this.dom.field.width(width);
            this.width = arguments[0];
        }
    },
    setHeight: function () {
        var height = parseInt(arguments[0]);
        if (height) {
            this.dom.field.height(height);
        }
    },
    setValue: function () {
        var g = this, args = arguments[0];
        EUI.form.TriggerField.superclass.setValue.call(this, args);
    },
    initTrigger: function () {
        var g = this;
        var triggerbtn = $("<div class='" + this.triggerBoxCss + "'><span class='"
            + this.triggerCss + "'></span></div>");
        g.dom.triggerbtn = triggerbtn;
        g.dom.field.after(triggerbtn);
        if (!g.showTrigger) {
            g.dom.triggerbtn.hide();
        }
    },
    addEvents: function () {
        var g = this;
        g.dom.field.bind("keydown", function (e) {
            if (!g.editable) {
                e.returnValue = false;
                return false;
            }
        });
        g.dom.fieldwrap.bind("click", function () {
            if (!g.readonly)
                g.onClick();
        });
        $(document).bind("click", function (evt) {
            if (evt.button == 2) {
                return;
            }
            var el = evt.target;
            if (el) {
                if ($(el).parents("#" + g.id).length != 0) {
                    return;
                }
                if ($(el).parents("div[euiid='" + g.id + "']").length != 0) {
                    return;
                }
            }
            g.hideList();
        }).bind("scroll", function () {
            g.hideList();
        });

        EUI.form.TriggerField.superclass.addEvents.call(this);
    },
    setReadOnly: function (readonly) {
        var g = this;
        EUI.form.TriggerField.superclass.setReadOnly.call(this, readonly);
        if (readonly == "true" || readonly == true) {
            g.dom.triggerbtn.addClass(g.triggerDisableCss);
        } else {
            g.dom.triggerbtn.removeClass(g.triggerDisableCss);
            g.dom.triggerbtn.show();
        }
        if (!g.editable) {
            g.dom.field.attr("readonly", true);
        }
    },
    onClick: function () {
        var g = this;
        if (!g.dom.fieldwrap.hasClass(g.focusCss)) {
            g.dom.fieldwrap.addClass(g.focusCss);
        }
        g.dom.triggerbtn.addClass(g.triggerClickCss);
        this.showList();
    },
    addLoadMask: function () {
        var g = this;
        var load = $('<div class="ux-combo-list-loading"></div>');
        load.html(this.loadText);
        g.list.loadMask = load;
        g.list.append(load);
        g.list.show();
        this.setListPos();
    },
    removeLoadMask: function () {
        this.list && this.list.loadMask && this.list.loadMask.remove();
    },
    initReader: function () {
        var g = this, sysReader = {};
        var rfield = g.field, name = g.name, field;
        if (g.reader) {
            name = g.reader.name ? g.reader.name : name;
            if (g.reader.field) {
                if (g.reader.field.length != g.field.length) {
                    throw new Error(EUI.error.neqField);
                }
                rfield = g.reader.field;
            }
            if (rfield) {
                field = rfield.push(name);
            } else {
                field = [name];
            }
            sysReader.mixField = field;
        }
        sysReader.name = name;
        sysReader.field = rfield;
        g.sysReader = sysReader;
    },
    initList: function () {
        var g = this;
        g.loading = true;
        if (g.store) {
            if (g.beforeLoad) {
                var result = g.beforeLoad.call(this, g.store);
                if (result == false) {
                    g.loading = false;
                    return;
                }
            }
            var timestamp = new Date().getTime();
            g.timeStamp = timestamp;
            var list = $('<div></div>');
            list.attr("euiid", g.id).addClass(g.listCss);
            g.list = list;
            $("body").append(list);
            g.addLoadMask();
            g.store.load({
                success: function (response) {
                    if (g.timeStamp == timestamp) {
                        if (!response.data) {
                            var txt = $("<span style='color:gray;line-height:20px;padding:0 3px;'>"
                                + g.emptyText + "</span>");
                            g.list.html(txt);
                            g.setListPos();
                            return;
                        }
                        g.data = response.data;
                        g.afterLoad
                        && g.afterLoad.call(this, response.data);
                        g.showComboList();
                    }
                }
            });
        } else {
            this.initWithData();
        }
    },
    initWithData: function () {
        var g = this;
        var timestamp = new Date().getTime();
        g.timeStamp = timestamp;
        var list = $('<div></div>');
        list.attr("euiid", g.id).addClass(g.listCss);
        g.list = list;
        $("body").append(list);
        g.addLoadMask();
        g.showComboList();
    },
    showComboList: function () {
        var g = this, data = g.getData();
        g.removeLoadMask();
        var sv = g.getValue();
        g.listbox = $('<div euiid="' + g.id + '" class="' + g.listInner
            + '"></div>');
        g.listbox.css("max-height", g.maxListHeight);
        g.list.append(g.listbox);
        g.addListItem(data, sv);
    },
    addListItem: function (data, sv) {
        var g = this;
        var txt = $("<span style='color:gray;line-height:20px;padding:0 3px;'>"
            + g.emptyText + "</span>");
        g.listbox.empty();
        for (var i = 0; i < data.length; i++) {
            var itemvalue = data[i];
            var name = g.sysReader.name;
            var item = $("<div>" + itemvalue[name] + "</div>");
            item.addClass(g.listItemCss);
            item.data("itemdata", itemvalue);
            if (itemvalue[name] == sv) {
                item.addClass(g.seletedCss);
            }
            g.listbox.append(item);
        }
        if (!data || data.length == 0) {
            g.listbox.append(txt);
        }
        g.addListItemEvent();
        g.loading = false;
        g.dom.triggerbtn.addClass(g.triggerClickCss);
    },
    showList: function () {
        var g = this;
        var data = this.getData();
        if (!g.loadonce) {
            g.list && g.list.remove();
            g.initList();
        } else {
            if (g.loading || g.list) {
                g.setListPos();
            } else if (data) {
                g.initWithData();
            } else {
                g.initList();
            }
        }
    },
    setListPos: function () {
        var g = this;
        var iptpos = g.dom.field.offset();
        var ipth = g.dom.field.outerHeight();
        var top = iptpos.top + ipth - 1;
        var listh = g.list.height();
        var tw = 0;
        var wrapWidth = g.dom.fieldwrap.outerWidth();
        var width = wrapWidth;
        width = width < g.listWidth ? g.listWidth : width;
        if ($(window).height() <= (listh + top)) {
            var tmp = iptpos.top - listh - 4;
            if (tmp > 0) {
                top = tmp;
            }
        }
        var left = iptpos.left - 1;
        if (iptpos.left + width > $(window).width()) {
            left = left + wrapWidth - width - 2;
        }
        g.list.css({
            "left": left,
            "top": top,
            "width": width,
            "z-index": ++EUI.zindex
        }).slideDown("fast");
    },
    getData: function () {
        return this.data;
    },
    hideList: function () {
        var g = this;
        g.dom.triggerbtn && g.dom.triggerbtn.removeClass(g.triggerClickCss);
        g.list && g.list.is(":visible") && g.afterHideList && g.afterHideList.call(g,g.getSubmitValue());
        g.list && g.list.slideUp("fast");
    },
    remove: function () {
        var g = this;
        if (g.list) {
            g.list.remove();
        }
        EUI.form.TriggerField.superclass.remove.call(this);
    }
});﻿EUI.ComboBox = function () {
    return new EUI.form.ComboBox(arguments[0]);
};
EUI.form.ComboBox = EUI.extend(EUI.form.TriggerField, {
    data: null,
    async: true,
    store: null,
    editable: false,
    loadMask: true,
    showSearch: false,
    searchText: null,
    beforeLoad: null,
    afterLoad: null,
    listWidth: 0,
    listInner: "ux-combo-list-inner",
    listItemCss: "ux-combo-list-item",
    seletedCss: "ux-combo-item-selected",
    initComponent: function () {
        EUI.form.ComboBox.superclass.initComponent.call(this);
        if (this.readonly) {
            this.async = true;
        }
        if (this.store)
            this.initStore();
    },
    getType: function () {
        return 'ComboBox';
    },
    addListItemEvent: function () {
        var g = this;
        $("." + g.listItemCss, g.list).each(function () {
            var item = $(this);
            item.bind("click", function () {
                var value = $(this).data("itemdata");
                if (g.beforeSelect) {
                    var before = {};
                    before.oldText = g.getValue();
                    before.oldValue = g.getSubmitValue();
                    before.data = value;
                    if (g.beforeSelect(before) == false) {
                        g.hideList();
                        return;
                    }
                }
                g.selectData(value);
                g.sysValidater();
                g.hideList();
                $(this).addClass(g.seletedCss).siblings()
                    .removeClass(g.seletedCss);
                if (g.afterSelect) {
                    var after = {};
                    after.text = g.getValue();
                    after.value = g.getSubmitValue();
                    after.data = value;
                    g.afterSelect(after);
                }
                return false;
            });
        });
    },
    selectData: function () {
        var g = this;
        var name = g.sysReader.name, data = arguments[0], value, i;
        g.setValue(data[name]);
        if (g.field) {
            var rfield = g.sysReader.field, rname;
            value = {};
            for (i = 0; i < g.field.length; i++) {
                rname = rfield[i];
                name = g.field[i];
                var filedValue = g.getJsonData(data, rname);
                value[name] = filedValue != undefined
                && filedValue != null ? filedValue : "";
            }
            g.submitValue = value;
        }
    },

    initStore: function () {
        var g = this;
        g.store.autoLoad = !g.async;
        g.store.success = function (response) {
            g.data = response.data;
            g.afterLoad && g.afterLoad.call(this, response.data, g);
        };
        if (!g.async) {
            g.beforeLoad && g.beforeLoad.call(this, g.store);
        }
        var store = EUI.Store(g.store);
        g.store = store;
    },
    showComboList: function () {
        var g = this;
        EUI.form.ComboBox.superclass.showComboList.call(g);
        g.setListPos();
    },
    remove: function () {
        var g = this;
        EUI.form.ComboBox.superclass.remove.call(g);
        if (g.showSearch) {
            g.searchCmp.remove();
        }
    }
});﻿EUI.AutoCompleteBox = function() {
	return new EUI.form.AutoCompleteBox(arguments[0]);
};
EUI.form.AutoCompleteBox = EUI.extend(EUI.form.ComboBox, {
	editable : true,
	data : null,
	renderTo : null,
	store : null,
	async : true,
	searchField : null,
	showField : null,
	loaded : false,
	tbar : null,

	initComponent : function() {
		EUI.form.AutoCompleteBox.superclass.initComponent.call(this);
		if (this.store) {
			this.initStore();
		}
		if (!this.showField) {
			this.showField = this.name;
		}
		if (!this.searchField) {
			this.searchField = [this.showField];
		}
		if (this.data) {
			this.loaded = true;
		}
	},
	initStore : function() {
		var g = this;
		g.store.autoLoad = !g.async;
		g.store.success = function(response) {
			g.data = response.data;
			g.loaded = true;
			g.afterLoad && g.afterLoad.call(this, response.data);
			if (g.loading) {
				g.dom.field.trigger("keyup");
			}
		};
		if (!g.async) {
			if (g.beforeLoad) {
				var result = g.beforeLoad.call(this, g.store);
				if (result == false) {
					return;
				}
			}
			g.store.autoLoad = true;
		}
		g.store = EUI.Store(g.store);
	},
	initList : function() {
		var g = this;
		g.loading = true;
		if (!g.getData()) {
			if (g.store) {
				if (g.beforeLoad) {
					var result = g.beforeLoad.call(this, g.store);
					if (result == false) {
						g.loading = false;
						return;
					}
				}
				var timestamp = new Date().getTime();
				g.timeStamp = timestamp;
				var list = $('<div></div>');
				list.attr("euiid", g.id).addClass(g.listCss).css("overflow",
						"hidden");;
				g.list = list;
				$("body").append(list);
				g.store.load({
					success : function(response) {
						if (g.timeStamp == timestamp) {
							if (!response.data) {
								var txt = $("<span style='color:gray;line-height:20px;padding:0 3px;'>"
										+ g.emptyText + "</span>");
								g.list.html(txt);
								g.setListPos();
								return;
							}
							g.data = response.data;
							g.afterLoad
									&& g.afterLoad.call(this, response.data);
							g.showComboList(g.data);
//							g.setListPos();
						}
					}
				});
			} else {
				throw new Error(EUI.error.dataError);
			}
		} else {
			var timestamp = new Date().getTime();
			g.timeStamp = timestamp;
			var list = $('<div></div>');
			list.attr("euiid", g.id).addClass(g.listCss).css("overflow",
					"hidden");;
			g.list = list;
			$("body").append(list);
			g.showComboList(g.getData());
		}
	},
	addEvents : function() {
		var g = this;
		EUI.form.AutoCompleteBox.superclass.addEvents.call(this);
		g.dom.field.bind({
			"keyup" : function(e) {
				var code = e.keyCode || e.charCode;
				// 按下键事件
				if (code == 40) {
					if (!g.listbox) {
						return;
					}
					var selectItem = g.listbox.find("." + g.seletedCss);
					if (selectItem.length == 0) {
						selectItem = g.listbox.find("." + g.listItemCss
								+ ":first").addClass(g.seletedCss);
					} else if (selectItem.next().length != 0) {
						selectItem.removeClass(g.seletedCss);
						selectItem.next().addClass(g.seletedCss);
						var top = selectItem.next().offset().top;
						if (top + 26 > g.list.offset().top + g.listbox.height()) {
							g.listbox[0].scrollTop += 26;
						}
					}
				} else if (code == 38) {
					if (!g.listbox) {
						return;
					}
					// 按上键事件
					var selectItem = g.listbox.find("." + g.seletedCss);
					if (selectItem.length != 0 && selectItem.prev().length != 0) {
						selectItem.removeClass(g.seletedCss);
						selectItem.prev().addClass(g.seletedCss);
						var top = selectItem.prev().offset().top;
						if (top < g.list.offset().top) {
							g.listbox[0].scrollTop -= 26;
						}
					}
				} else if (code == 13) {
					// 回车事件
					if (!g.listbox) {
						return;
					}
					g.listbox.find("." + g.seletedCss).click();
				} else if (code == 9) {
					return false;
				} else {
					g.submitValue = null;
					var value = $(this).val();
					g.onSearch(value);
				}
			}
		});
		if (g.dom.clearTrigger) {
			g.dom.clearTrigger.hover(function() {
						$(this).addClass("ux-trigger-over");
					}, function() {
						$(this).removeClass("ux-trigger-over");
					});
		}
	},
	onClick : function() {
		var g = this;
		if (!g.loadonce) {
			g.data = null;
			g.list && g.list.remove();
		}
		if (!g.list && !g.getData()) {
			g.initList();
			return;
		}
		if (g.list) {
			g.setListPos();
		} else {
			g.showComboList(g.getData());
		}
	},
	onSearch : function(value) {
		var g = this;
		if (!g.loaded) {
			if (!g.store) {
				if (!g.getData() || g.getData().length == 0) {
					g.list.html("<div class='ux-combo-list-item'>没有数据</div>");
					g.setListPos();
					return;
				}
			} else {
				if (g.beforeLoad) {
					var result = g.beforeLoad.call(this, g.store);
					if (result == false) {
						return;
					}
				}
				g.store.autoLoad = true;
				g.loading = true;
				g.store.load();
				// 设置加载图标
				g.list.empty();
				var load = $('<div class="ux-combo-list-loading"></div>');
				load.html(EUI.LoadMask.prototype.msg);
				g.list.loadMask = load;
				g.list.append(load);
				g.setListPos();
				return;
			}
		}
		this.doSearch(value, this.searchField);
	},
	doSearch : function(value, field) {
		var g = this;
		g.filterData = [];
		var value = value ? value.toLowerCase() : "";
		if (this.getData()) {
			if (value == "") {
				g.filterData = this.getData();
			} else {
				for (var i = 0; i < this.getData().length; i++) {
					var itemData = this.getData()[i];
					for (var j = 0; j < field.length; j++) {
						var fieldData = itemData[field[j]];
						if (!fieldData) {
							continue;
						}
						var tmpData = fieldData.toLowerCase();
						if (tmpData.indexOf(value) != -1) {
							if (tmpData == value) {
								itemData.selected = true;
							} else {
								itemData.selected = false;
							}
							g.filterData.push(itemData);
							break;
						}
					}
				}
			}
			if (g.filterData.length > 0) {
				g.showComboList(g.filterData);
			} else {
				g.list.html("<div class='ux-combo-list-item'>没有匹配的数据</div>");
				g.setListPos();
			}
		}
	},
	setData : function(data) {
		this.data = data;
		this.loaded = true;
		if (this.list && this.list.is(":visible")) {
			this.showComboList(this.getData());
		}
	},
	showComboList : function(data) {
		var g = this;
		if (!this.list) {
			this.initList();
			return;
		}
		if (!data || data.length == 0) {
			var txt = $("<span style='color:gray;line-height:26px;padding:0 3px;'>"
					+ g.emptyText + "</span>");
			g.list.html(txt);
			if (this.tbar) {
				g.list.append(this.tbar);
			}
			g.setListPos();
			return;
		}
		g.removeLoadMask();
		g.list.empty();
		var sv = g.getValue();
		g.listbox = $('<div euiid="' + g.id + '" class="' + g.listInner
				+ '"></div>').css("overflow", "auto");
		g.list.append(g.listbox);
		g.listbox.css("max-height", g.maxListHeight);
		if (this.tbar) {
			g.list.append(this.tbar);
		}
		g.addListItem(data, sv);
	},
	addListItem : function(data, sv) {
		var g = this;
		g.listbox.empty();
		for (var i = 0; i < data.length; i++) {
			var itemvalue = data[i];
			var name = g.sysReader.name;
			var item = $("<div></div>");
			item.addClass(g.listItemCss);
			if (this.itemRender) {
				var html = this.itemRender.call(this, itemvalue);
				item.html(html);
			} else {
				item.html(itemvalue[g.showField]);
			}
			item.data("itemdata", itemvalue);
			if (itemvalue[name] == sv || data.length == 1) {
				item.addClass(g.seletedCss);
			} else if (itemvalue.selected) {
				item.removeClass(g.seletedCss);
			}
			g.listbox.append(item);
		}
		if (!(data instanceof Array) || data instanceof Array
				&& data.length == 0) {
			var txt = $("<span style='color:gray;line-height:26px;'>"
					+ g.emptyText + "</span>");
			g.listbox.append(txt);
		}
		g.addListItemEvent();
		g.loading = false;
		g.setListPos();
	},
	addListItemEvent : function() {
		var g = this;
		$("." + g.listItemCss, g.list).each(function() {
			var item = $(this);
			item.bind("click", function() {
						var value = $(this).data("itemdata");
						if (g.beforeSelect) {
							var before = {};
							before.oldText = g.getValue();
							before.oldValue = g.getSubmitValue();
							before.data = value;
							if (g.beforeSelect(before) == false) {
								g.hideList();
								return;
							}
						}
						g.selectData(value);
						g.sysValidater();
						g.hideList();
						$(this).addClass(g.seletedCss).siblings()
								.removeClass(g.seletedCss);
						if (g.afterSelect) {
							var after = {};
							after.text = g.getValue();
							after.value = g.getSubmitValue();
							after.data = value;
							g.afterSelect(after);
						}
						return false;
					});
		});
	},
	setValue : function() {
		var g = this, args = arguments[0];
		EUI.form.TriggerField.superclass.setValue.call(this, args);
	},
	getData:function(){
		return this.data;
	}
});﻿EUI.ComboTree = function () {
    return new EUI.form.ComboTree(arguments[0]);
};
EUI.form.ComboTree = EUI.extend(EUI.form.TriggerField, {
    async: true,
    searchText: null,
    listHeight: 240,
    listWidth: 400,
    treeCfg: null,
    multiSelectRowIds: null,//记录多选时的行ID，查重用

    initComponent: function () {
        EUI.form.ComboTree.superclass.initComponent.call(this);
        if (this.readonly) {
            this.async = true;
        }
    },
    getType: function () {
        return 'ComboTree';
    },
    afterRender: function () {
        !this.async && this.initList(true);
        EUI.form.ComboTree.superclass.afterRender.call(this);
    },

    initList: function (background) {
        var g = this;
        g.loading = true;
        var list = $('<div></div>');
        list.attr("euiid", g.id).addClass(g.listCss);
        g.list = list;
        g.addLoadMask();
        $("body").append(list);
        g.showComboList(background);
    },

    showComboList: function (background) {
        var g = this;
        g.removeLoadMask();
        var id = EUI.getId("TreePanel");
        g.list.append($("<div id='" + id + "'></div>"));
        var defaultCfg = {
            renderTo: id,
            height: g.listHeight,
            width: g.listWidth,
            data: g.data,
            padding: 0
        };
        EUI.applyIf(g.treeCfg, defaultCfg);
        if (!g.treeCfg.multiSelect) {
            g.treeCfg.onSelect = function (data) {
                g.selectNode(data);
            };
        } else {
            g.multiSelectRowIds = (g.multiSelectRowIds instanceof Array) ? g.multiSelectRowIds : [];
            g.treeCfg.onSelect = function (data,status) {
                if(status){
                    g.multiSelectNode.call(g, data);
                }else{
                    g.multiCancelSelectNode.call(g, data);
                }
            };
            g.treeCfg.afterItemRender = function (data) {
                if (g.multiSelectRowIds instanceof Array){
                    for (var i=0;i<g.multiSelectRowIds.length;i++){
                        if(data.id==g.multiSelectRowIds[i]){
                            $("#"+g.multiSelectRowIds[i],g.list).children(".ux-body:first").addClass("selected");
                            $("#"+g.multiSelectRowIds[i],g.list).children(".ux-body:first").children(".ux-multiselect.ecmp-eui-moreselect:first").addClass("ecmp-eui-checkbox-select");
                            break;
                        }
                    }
                }
            }
        }
        var tree = EUI.TreePanel(g.treeCfg);
        tree.parentCmp = this.id;
        g.tree = tree;
        g.dom.triggerbtn.addClass(g.triggerClickCss);
        g.loading = false;
        if (background) {
            g.list.hide();
        } else {
            g.setListPos();
        }
    },
    selectNode: function (data) {
        var g = this;
        if (g.beforeSelect) {
            var before = {};
            before.oldText = g.getValue();
            before.oldValue = g.getSubmitValue();
            before.data = data;
            if (g.beforeSelect(before) == false) {
                return;
            }
        }
        g.selectData(data);
        if (g.afterSelect) {
            var after = {};
            after.text = g.getValue();
            after.value = g.getSubmitValue();
            after.data = data;
            g.afterSelect(after);
        }
        g.hideList();
    },
    multiSelectNode: function (data) {
        var g = this;
        if ($.inArray(data.id, g.multiSelectRowIds) != -1) {
            return;
        }
        var field = [this.name];
        var rfield = [this.sysReader.name];
        if (g.field) {
            field = field.concat(g.field);
            rfield = rfield.concat(g.sysReader.field);
        }
        var submitValue = this.getSubmitValue();
        if (!submitValue) {
            submitValue = {};
        }
        for (var i = 0; i < field.length; i++) {
            submitValue[field[i]] = submitValue[field[i]] || [];
            var fieldValue = g.getJsonData(data, rfield[i]);
            console.log(field[i] + "====" + submitValue[field[i]]);
            submitValue[field[i]].push(fieldValue != undefined && fieldValue != null
                ? fieldValue : "");
        }
        this.submitValue = submitValue;
        this.setValue(submitValue[this.name]);
        g.multiSelectRowIds.push(data.id);
    },
    multiCancelSelectNode: function (data) {
        var index = $.inArray(data.id, this.multiSelectRowIds);
        if (index == -1) {
            return;
        }
        var submitValue = this.getSubmitValue();
        for (var key in this.submitValue) {
            var item = this.submitValue[key];
            item.splice(index, 1);
        }
        this.setValue(submitValue[this.name].join(","));
        this.multiSelectRowIds.splice(index, 1);
    },
    setListPos: function () {
        var g = this;
        var fieldPos = g.dom.field.offset();
        var ipth = g.dom.field.outerHeight(), iptw = g.dom.field
            .outerWidth();
        var top = fieldPos.top + ipth, left = fieldPos.left;
        var listh = g.list.height(), listtw = g.list.width();
        if ($(window).height() <= (listh + top)) {
            var tmp = (fieldPos.top - ipth - listh + 20);
            if (tmp > 0) {
                top = tmp;
            }
        }
        if ($(window).width() <= (listtw + left)) {
            var tmpleft = (left + iptw + 15 - listtw);
            if (!g.clear) {
                tmpleft += 17;
            }
            if (tmpleft > 0) {
                left = tmpleft;
            }
        }
        var tw = 0;
        var width = g.dom.field.width() + tw + 6;
        width = g.listWidth ? g.listWidth : width;
        g.list.css({
            "left": left - 1,
            "top": top,
            "width": width,
            "z-index": ++EUI.zindex
        }).show();
        g.shadow && g.dom.shadow && g.dom.shadow.updateShadow(g.list);
    },
    selectData: function (data) {
        var g = this;
        if (!data) {
            return;
        }
        var name = g.sysReader.name, value, i, submitValue = {};
        g.setValue(data[name]);
        submitValue[this.name] = data[name];
        if (g.field) {
            var rfield = g.sysReader.field, rname;
            for (i = 0; i < g.field.length; i++) {
                rname = rfield[i];
                name = g.field[i];
                var fieldValue = g.getJsonData(data, rname);
                if (fieldValue != undefined && fieldValue != null) {
                    submitValue[name] = fieldValue;
                } else {
                    submitValue[name] = "";
                }
            }
        }
        g.submitValue = submitValue;
        g.sysValidater();
    },
    readSelectData: function (data) {
        var g = this;
        var readData = {};
        var key = data[this.sysReader.name];
        readData[this.name] = data[this.sysReader.name];
        if (g.field) {
            var rfield = g.sysReader.field, rname, field;
            for (var j = 0; j < g.field.length; j++) {
                rname = rfield[j];
                field = g.field[j];
                var fieldValue = g.getJsonData(data, rname);
                readData[field] = fieldValue != undefined && fieldValue != null
                    ? fieldValue
                    : "";
                key += readData[field];
            }
        }
        return [key, readData];
    },
    getValue: function () {
        var value = EUI.form.ComboTree.superclass.getValue.call(this);
        return value;
    },
    setSubmitValue: function (data) {
        if (this.treeCfg.multiSelect) {
            this.submitValue = {};
            var nameArray = this.getJsonData(data, this.name);
            if(nameArray instanceof Array){
                this.setValue(nameArray.join(","));
                this.submitValue[this.name] = [].concat(nameArray);
            }else {
                this.submitValue[this.name] = [];
            }
            if (this.field) {
                for (var i = 0; i < this.field.length; i++) {
                    var fieldValue = this.getJsonData(data, this.field[i]);
                    fieldValue = (fieldValue && fieldValue instanceof Array)
                        ? fieldValue
                        : [];
                    this.submitValue[this.field[i]] = [].concat(fieldValue);
                    if(this.reader.field[i]=="id"){
                        this.multiSelectRowIds=[].concat(fieldValue);
                    }
                }
            }
        } else {
            var nameValue = this.getJsonData(data, this.name);
            this.setValue(nameValue);
            this.submitValue = {};
            this.submitValue[this.name] = nameValue;
            if (this.field) {
                for (var i = 0; i < this.field.length; i++) {
                    var fieldValue = this.getJsonData(data, this.field[i]);
                    fieldValue = (fieldValue != undefined && fieldValue != null)
                        ? fieldValue
                        : "";
                    this.submitValue[this.field[i]] = fieldValue;
                }
            }
        }
    },
    getSubmitValue: function () {
        if (!this.submitName) {
            delete this.submitValue[this.name];
        }
        return this.submitValue;
    },
    addEvents: function () {
        var g = this;
        EUI.form.ComboTree.superclass.addEvents.call(this);
        g.canClear && g.clearBtn.bind("click", function () {
            g.tree && g.tree.clearSelect();
        });
    },
    showList: function () {
        EUI.form.ComboTree.superclass.showList.call(this);
        //焦点定位到搜索框
        if (this.tree.tbarCmp) {
            var items = this.tree.tbarCmp.items;
            EUI.getCmp(items[items.length - 1]).focus();
        }
    },
    reset: function () {
        EUI.form.ComboTree.superclass.reset.call(this);
        this.tree && this.tree.clearSelect();
        if(this.treeCfg.multiSelect){
            this.multiSelectRowIds=[];
        }
    },
    remove: function () {
        var g = this;
        EUI.form.ComboTree.superclass.remove.call(this);
        EUI.remove(g.tree);
        g.tree = null;
    }
});﻿EUI.ComboGrid = function () {
    return new EUI.form.ComboGrid(arguments[0]);
};
EUI.form.ComboGrid = EUI.extend(EUI.form.TriggerField, {
    async: true,
    searchConfig: {},
    listHeight: 200,
    gridCfg: {},
    showSearch: false,
    showButtons: false,//显示确定取消按钮
    tbarItems: null,//自定义表格工具栏
    onSearch: null,
    gridCss: "ux-combo-grid",
    multiSelectRowIds: null,//记录多选时的行ID，查重用

    initComponent: function () {
        EUI.form.ComboGrid.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'ComboGrid';
    },
    render: function () {
        EUI.form.ComboGrid.superclass.render.call(this);
        !this.async && this.initList(true);
    },
    initList: function (background) {
        var g = this;
        var tbarId = EUI.getId("ToolBar");
        var id = EUI.getId("GridPanel");
        var list = $("<div class='"
            + g.listCss
            + "'><div id='"
            + tbarId
            + "' style='border-bottom: 1px solid #ddd;'></div><div id='"
            + id + "'></div></div>");
        list.bind("click", function (e) {
            e.stopPropagation();
        });
        g.list = list;
        $("body").append(list);
        g.setListPos();
        if(this.showButtons||this.showSearch||this.tbarItems){
            var items = [] ;
            if(this.showButtons){
                items = items.concat([
                {
                    xtype: "Button",
                    title: "确定",
                    selected: true,
                    handler: function(){
                        g.hideList();
                    }
                },
                {
                    xtype: "Button",
                    title: "取消",
                    handler: function(){
                        g.reset();
                        g.hideList();
                    }
                }]);
            }
            if (this.showSearch) {
                items = items.concat(["->", {
                    xtype: "SearchBox",
                    width: 200,
                    onSearch: function (v) {
                        g.onSearch && g.onSearch.call(g, v);
                    }
                }]);
            }
            if(this.tbarItems&&this.tbarItems.length>0){
                items = this.tbarItems.concat(items);
            }
            this.tbar = EUI.ToolBar({
                renderTo: tbarId,
                items: items
            });
        }
        g.gridCfg.recordtext = EUI.cmpText.recordtext;
        g.gridCfg.pager = null;
        var cfg = {
            renderTo: id,
            height: g.listHeight,
            searchConfig: g.searchConfig,
            gridCfg: g.gridCfg,
            gridCss: g.gridCss,
            contentCss: g.contentCss,
            subheight: 53
        };
        if (!g.gridCfg.multiselect) {
            g.gridCfg.ondblClickRow = function () {
                g.selectRow();
            }
        } else {
            g.multiSelectRowIds = (g.multiSelectRowIds instanceof Array) ? g.multiSelectRowIds : [];
            g.gridCfg.gridComplete = function (data) {
                g._setSelect.call(g);
            };
            g.gridCfg.onSelectRow = function (rowid, status) {
                if (status) {
                    g.multiSelectRow.call(g, rowid);
                } else {
                    g.multiCancelSelectRow.call(g, rowid);
                }
            };
            g.gridCfg.onSelectAll = function (rowids, status) {
                if (status) {
                    for (var i = 0; i < rowids.length; i++) {
                        g.multiSelectRow.call(g, rowids[i]);
                    }
                } else {
                    for (var i = 0; i < rowids.length; i++) {
                        g.multiCancelSelectRow.call(g, rowids[i]);
                    }
                }
            };
        }
        var grid = EUI.GridPanel(cfg);
        grid.parentCmp = this.id;
        g.grid = grid;
        g.dom.triggerbtn.addClass(g.triggerClickCss);
        g.loading = false;
        if (background) {
            g.list.hide();
        } else {
            g.setListPos();
        }
        // g.showShadow();
    },
    _setSelect: function () {
        if (!this.grid) {
            return;
        }
        if (this.name == "id" || this.field.includes("id")) {
            var submitValue = this.getSubmitValue();
            if (!submitValue) {
                return;
            }
            for (var key in submitValue) {
                var item = submitValue[key];
                var id = item["id"];
                this.grid.grid.setSelection(id, false);
            }
        }
    },
    multiSelectRow: function (rowid) {
        var g = this;
        if ($.inArray(rowid, g.multiSelectRowIds) != -1) {
            return;
        }
        var data = this.grid.getRowData(rowid);
        var field = [this.name];
        var rfield = [this.sysReader.name];
        if (g.field) {
            field = field.concat(g.field);
            rfield = rfield.concat(g.sysReader.field);
        }
        var submitValue = this.getSubmitValue();
        if (!submitValue) {
            submitValue = {};
        }
        for (var i = 0; i < field.length; i++) {
            submitValue[field[i]] = submitValue[field[i]] || [];
            var fieldValue = g.getJsonData(data, rfield[i]);
            submitValue[field[i]].push(fieldValue != undefined && fieldValue != null
                ? fieldValue : "");
        }
        this.submitValue = submitValue;
        this.setValue(submitValue[this.name]);
        g.multiSelectRowIds.push(rowid);
    },

    multiCancelSelectRow: function (rowid) {
        var index = $.inArray(rowid, this.multiSelectRowIds);
        if (index == -1) {
            return;
        }
        var submitValue = this.getSubmitValue();
        for (var key in this.submitValue) {
            var item = this.submitValue[key];
            item.splice(index, 1);
        }
        this.setValue(submitValue[this.name].join(","));
        this.multiSelectRowIds.splice(index, 1);
    },
    readSelectData: function (data) {
        var g = this;
        var readData = {};
        var key = data[this.sysReader.name];
        readData[this.name] = data[this.sysReader.name];
        if (g.field) {
            var rfield = g.sysReader.field, rname, field;
            for (var j = 0; j < g.field.length; j++) {
                rname = rfield[j];
                field = g.field[j];
                var fieldValue = g.getJsonData(data, rname);
                readData[field] = fieldValue != undefined && fieldValue != null
                    ? fieldValue
                    : "";
                key += readData[field];
            }
        }
        return [key, readData];
    },
    selectRow: function () {
        var g = this;
        var value = g.grid.getSelectRow();
        if (value) {
            if (g.beforeSelect) {
                var before = {};
                before.oldText = g.getValue();
                before.oldValue = g.getSubmitValue();
                before.data = value;
                before.isMulti = g.gridCfg.multiselect;
                if (g.beforeSelect(before) == false) {
                    g.hideList();
                    return;
                }
            }
            g.selectData(value);
            if (g.afterSelect) {
                var after = {};
                after.text = g.getValue();
                after.value = g.getSubmitValue();
                after.data = value;
                g.afterSelect(after);
            }
            // g.showClear();
        }
        g.hideList();
    },
    setListPos: function () {
        var g = this;
        var iptpos = g.dom.field.offset();
        var ipth = g.dom.field.outerHeight(), iptw = g.dom.field.outerWidth();
        var top = iptpos.top + ipth, left = iptpos.left;
        var listh = g.list.height(), listtw = g.list.width();
        if ($(window).height() <= (listh + top)) {
            var tmptop = (iptpos.top - ipth - listh + 20);
            if (tmptop > 0) {
                top = tmptop;
            }
        }
        if ($(window).width() <= (listtw + left)) {
            var tmpleft = (left + iptw + 15 - listtw);
            if (g.canClear && !g.clear) {
                tmpleft += 17;
            }
            if (tmpleft > 0) {
                left = tmpleft;
            }
        }
        var tw = 0;
        var width = g.dom.field.width() + tw + 6;
        width = g.listWidth ? g.listWidth : width;
        g.list.css({
            "left": left - 1,
            "top": top,
            "width": width,
            "z-index": ++EUI.zindex
        }).show();
        g.shadow && g.dom.shadow && g.dom.shadow.updateShadow(g.list);
    },

    selectData: function () {
        var g = this;
        var name = g.sysReader.name, data = arguments[0], submitValue = {}, i, chkCmp = null;
        g.setValue(data[name]);
        submitValue[this.name] = data[name];
        if (g.field) {
            var rfield = g.sysReader.field, rname;
            for (i = 0; i < g.field.length; i++) {
                rname = rfield[i];
                name = g.field[i];
                var fieldValue = g.getJsonData(data, rname);
                if (fieldValue != undefined && fieldValue != null) {
                    submitValue[name] = fieldValue;
                } else {
                    submitValue[name] = "";
                }
            }
        }
        g.submitValue = submitValue;
        g.sysValidater();
    },
    loadData: function (data) {
        this.setSubmitValue(data);
    },
    setSubmitValue: function (data) {
        if (this.gridCfg.multiselect) {
            this.submitValue = {};
            var nameArray = this.getJsonData(data, this.name);
            if(nameArray instanceof Array){
                this.setValue(nameArray.join(","));
                this.submitValue[this.name] = [].concat(nameArray);
            }else {
                this.submitValue[this.name] = [];
            }
            if (this.field) {
                for (var i = 0; i < this.field.length; i++) {
                    var fieldValue = this.getJsonData(data, this.field[i]);
                    fieldValue = (fieldValue && fieldValue instanceof Array)
                        ? fieldValue
                        : [];
                    this.submitValue[this.field[i]] = [].concat(fieldValue);
                    if(this.reader.field[i]=="id"){
                        this.multiSelectRowIds=[].concat(fieldValue);
                    }
                }
            }
        } else {
            var nameValue = this.getJsonData(data, this.name);
            this.setValue(nameValue);
            this.submitValue = {};
            this.submitValue[this.name] = nameValue;
            if (this.field) {
                for (var i = 0; i < this.field.length; i++) {
                    var fieldValue = this.getJsonData(data, this.field[i]);
                    fieldValue = (fieldValue != undefined && fieldValue != null)
                        ? fieldValue
                        : "";
                    this.submitValue[this.field[i]] = fieldValue;
                }
            }
        }
    },
    getSubmitValue: function () {
        if (!this.submitName) {
            delete this.submitValue[this.name];
        }
        return this.submitValue;
    },
    remove: function () {
        var g = this;
        EUI.form.ComboGrid.superclass.remove.call(this);
        EUI.remove(g.grid);
        g.grid = null;
    },
    reset: function () {
        EUI.form.ComboGrid.superclass.reset.call(this);
        this.grid && this.grid.grid.resetSelection();
        if(this.gridCfg.multiselect){
            this.multiSelectRowIds=[];
        }
    },
    showList: function () {
        var g = this;
        if (!g.loadonce) {
            g.list && g.list.remove();
            g.initList();
        } else {
            if (g.loading || g.list) {
                g.list.show();
                g.setListPos();
                g.grid.onResize();
            } else {
                g.initList();
            }
        }
        //焦点定位到搜索框
        if(this.showSearch){
            EUI.getCmp(this.tbar.items[0]).focus();
        }
    },
    updatePostParam: function (nowParams) {
        if (this.grid) {
            this.grid.resetParam();
            this.grid.setPostParams(nowParams);
        }
    }
});﻿EUI.FieldGroup = function() {
	return new EUI.form.FieldGroup(arguments[0]);
};

EUI.form.FieldGroup = EUI.extend(EUI.form.TextField, {
			width : 400,
			isFormField : false,
			needValid : false,
			itemspace : 20,
			spaceCss : "ux-fieldgroup-space",
			itemCss : "ux-fieldgroup-item",
			initComponent : function() {
				EUI.form.FieldGroup.superclass.initComponent.call(this);
				if (this.readonly) {
					var ds = this.defaultStyle || {};
					this.defaultStyle = EUI.apply(ds, {
								readonly : true
							});
				}
			},
			getType : function() {
				return 'FieldGroup';
			},

			render : function() {
				var g = this;
				g.dom.addClass(g.domCss);
				g.initLabel();
				g.setWidth(g.width);
			},
			sysValidater : function() {
				var g = this;
				if (g.hidden)
					return true;
				if (g.needValid)
					return g.doValidate(g.items);
				return true;
			},
			doValidate : function() {
				var items = arguments[0];
				var flag = true;
				if (items) {
					for (var i = 0; i < items.length; i++) {
						var item = EUI.getCmp(items[i]);
						if (item.isFormField) {
							var tmp = item.sysValidater();
							flag = flag && tmp;
						} else if(item.items){
							flag = this.doValidate(item.items) && flag;
						}
					}
				}
				return flag;
			},
			setAllowBlank : function(v) {
				var g = this;
				EUI.form.FieldGroup.superclass.setAllowBlank.call(this);
				if (g.items) {
					for (var i = 0; i < g.items.length; i++) {
						var item = EUI.getCmp(g.items[i]);
						item.setAllowBlank(v);
					}
				}
			},
			setWidth : function() {
				var width = parseInt(arguments[0]);
				if (width) {
					if (typeof arguments[0] == "string"
							&& arguments[0].indexOf("%") > -1) {
						width /= 100;
						width *= this.dom.parent().width();
						width -= 10;
					}
					this.dom.width(width);
					this.width = arguments[0];
				}
			},
			addItems : function() {
				var g = this, items = g.options.items;
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					var id = item.id || EUI.getId("groupitem");
					var div = $("<div id='" + id + "'></div>")
							.addClass(g.itemCss);
					if (i != items.length - 1) {
						div.css("margin-right", g.itemspace);
					}
					g.dom.append(div);
					if (typeof item == "string") {
						div.html(item).css("margin-top", 4);
					} else {
						item.renderTo = id;
						EUI.applyIf(item,g.defaultConfig);
						if (!item.xtype) {
							throw new Error(EUI.error.noXtype);
						}
						var cmp = eval("EUI." + item.xtype);
						if (!cmp) {
							throw new Error(String.format(EUI.error.noCmp,
                                item.xtype));
						}
						cmp = cmp.call(cmp, item);
						g.items.push(cmp.id);
					}
				}
			},
			addChild : function(item, preId) {
				var g = this;
				var id = item.id || EUI.getId("groupitem");
				var div = $("<div id='" + id + "'></div>").addClass(g.itemCss)
						.css("margin-right", g.itemspace);
				if (preId != undefined) {
					$("#" + preId, g.dom).after(div);
				} else {
					g.dom.append(div);
				}
				if (typeof item == "string") {
					div.html(item).css("margin-top", 4);
				} else {
					item.renderTo = id;
					var xtype = item.xtype ? item.xtype : g.defaultConfig;
					if (!xtype) {
						throw new Error(EUI.error.noXtype);
					}
					var cmp = eval("EUI." + xtype);
					if (!cmp) {
						throw new Error(String.format(EUI.error.noCmp, xtype));
					}
					cmp = cmp.call(cmp, item);
					g.items.push(cmp.id);
				}
			},
			removeChild : function(agr) {
				if (typeof agr == "number") {
					var childCmp = EUI.getCmp(this.items[agr]);
					childCmp.remove();
					this.items.splice(agr, 1);
				} else {
					for (var i = 0; i < this.items.length; i++) {
						if (agr == this.items[i]) {
							var childCmp = EUI.getCmp(agr);
							childCmp.remove();
							this.items.splice(i, 1);
						}
					}
				}
			},
			getData : function() {
				var data = [];
				for (var i = 0; i < this.items.length; i++) {
					var tmpcmp = EUI.getCmp(this.items[i]);
					if (tmpcmp instanceof EUI.form.FieldGroup) {
						var itemdata = tmpcmp.getData();
						if (itemdata != false) {
							data.push(itemdata);
						} else {
							return false;
						}
					} else if (tmpcmp instanceof EUI.form.Field) {
						if (tmpcmp.sysValidater()) {
							if (tmpcmp.getValue()) {
								data.push(tmpcmp.getSubmitValue());
							}
						} else {
							return false;
						}
					}
				}
				return data;
			},
			reset : function() {
				for (var i = 0; i < this.items.length; i++) {
					var tmpcmp = EUI.getCmp(this.items[i]);
					if (tmpcmp instanceof EUI.form.Field) {
						tmpcmp.reset();
					}
				}
			},
			remove : function() {
				for (var i = 0; i < this.items.length; i++) {
					var childCmp = EUI.getCmp(this.items[i]);
					childCmp && childCmp.remove();
				}
				this.dom.remove();
				delete EUI.managers[this.id];
			}
		});﻿EUI.ComboSearch = function () {
    return new EUI.form.ComboSearch(arguments[0]);
};
EUI.form.ComboSearch = EUI.extend(EUI.UIComponent, {
    labelWidth: 60,
    width: 150,
    unit: "",
    editable: false,
    onSearch: null,
    onConfirm: null,
    afterClear:null,
    listForm: null,
    onClickUnit: null,
    clearBoxCss: "ux-field-clearbox",
    clearCss: "ux-field-clear",
    triggerBoxCss: "ux-trigger-box",
    triggerCss: "ux-trigger",
    triggerClickCss: "ux-trigger-click",
    labelStyle: {
        "font-weight": "bold"
    },
    initComponent: function () {
        EUI.form.ComboSearch.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'ComboSearch';
    },

    render: function () {
        this.dom.addClass("ux-field");
        this.initLabel();
        this.initField();
        this.addEvents();
        if (this.value) {
            this.setValue(this.value);
        }
    },
    initLabel: function () {
        this.label = $("<label title='" + this.title
            + "' class='ux-field-label' style='font-weight:bold;'>"
            + this.title + "</label>").width(this.labelWidth);
        this.dom.append(this.label);
    },
    initField: function () {
        var unitHtml = "";
        if (this.unit) {
            unitHtml = "<span class='ux-unitfield-unit'>" + this.unit
                + "</span>";
        }
        var clearHtml = "";
        if (this.canClear) {
            clearHtml = "<div class='" + this.clearBoxCss
                + "'><span class='" + this.clearCss + "'></span></div>";
        }
        var html = "<div class='ux-field ux-fieldgroup-item' style='margin: 0 20px 0 0;padding:0;'>"
            + "<div class='ux-field-element'><input class='ux-field-text ux-combosearch-input' style='display: inline-block;'"
            + (this.editable ? "" : "readonly='readonly'")
            + "/>"
            + unitHtml
            + "<div class='"
            + this.triggerBoxCss
            + "'><span class='"
            + this.triggerCss
            + "'></span></div>" + clearHtml
            + "</div></div>"
            + "<div class='ux-button ux-button-select ux-fieldgroup-item search' style='margin-right: 20px;'>查询</div>";
        this.dom.append(html);
        this.dom.field = $(".ux-field-text", this.dom).width(this.width);
        this.dom.triggerbtn = $("." + this.triggerBoxCss, this.dom);
    },
    addEvents: function () {
        var g = this;
        this.dom.field.bind("click", function () {
            if (!g.editable) {
                g.dom.triggerbtn.addClass(g.triggerClickCss);
                g.showList();
            }
        });
        this.dom.triggerbtn.bind("click", function () {
            g.dom.triggerbtn.addClass(g.triggerClickCss);
            g.showList();
        });
        $("." + this.clearBoxCss, this.dom).bind("click", function () {
            g.setValue("");
            g.afterClear && g.afterClear.call(g);
            return false;
        });
        $(".ux-unitfield-unit", g.dom).bind("click", function () {
            g.dom.triggerbtn.addClass(g.triggerClickCss);
            g.showList();
        });
        /**
         * 点击查询
         */
        $(".search", this.dom).bind("click", function () {
            g.onSearch.call(g, g.getValue());
        });
        $(document).bind("click", function (evt) {
            if (evt.button == 2) {
                return;
            }
            var el = evt.target;
            if (el) {
                if ($(el).parents("#" + g.id).length != 0) {
                    return;
                }
                if ($(el).parents("div[euiid='" + g.id + "']").length != 0) {
                    return;
                }
            }
            g.hideList();
        }).bind("scroll", function () {
            g.hideList();
        });
    },
    initList: function () {
        var g = this;
        var list = $("<div class='ux-list'><div id='list_"
            + this.id
            + "'></div><div class='ux-msgbox-optbox' style='margin-bottom: 10px;'></div></div>");
        list.attr("euiid", g.id).addClass(g.listCss);
        g.list = list;
        $("body").append(list);
        if (this.listForm) {
            EUI.applyIf(this.listForm, {
                renderTo: "list_" + this.id,
                height: 200,
                width: 200
            });
            this.form = EUI.FormPanel(this.listForm);
        }
        this.initButtons();
        this.setListPos();
    },

    initButtons: function () {
        var g = this;
        var optbox = $(".ux-msgbox-optbox", this.list);
        var id = EUI.getId("Button");
        optbox.append("<div id='" + id + "'></div>");
        this.resetBtn = EUI.Button({
            title: "重置",
            renderTo: id,
            handler: function () {
                g.form.reset();
            }
        });
        id = EUI.getId("Button");
        optbox.append("<div id='" + id + "'></div>");
        this.okBtn = EUI.Button({
            title: "确定",
            renderTo: id,
            selected: true,
            handler: function () {
                if (g.onConfirm) {
                    var data = g.getValue();
                    g.onConfirm.call(g, data);
                }
            }
        });

    },
    showList: function () {
        if (!this.list) {
            this.initList();
        } else {
            this.setListPos();
        }

    },
    setListPos: function () {
        var g = this;
        var iptpos = g.dom.field.offset();
        var ipth = g.dom.field.outerHeight();
        var top = iptpos.top + ipth;
        var listh = g.list.height();
        if ($(window).height() <= (listh + top)) {
            var tmp = iptpos.top - listh - 4;
            if (tmp > 0) {
                top = tmp;
            }
        }
        g.list.css({
            "left": iptpos.left - 1,
            "top": top,
            "z-index": ++EUI.zindex
        }).slideDown("fast");
    },
    hideList: function () {
        var g = this;
        g.dom.triggerbtn && g.dom.triggerbtn.removeClass(g.triggerClickCss);
        g.list && g.list.slideUp("fast");
    },
    setValue: function (value) {
        this.dom.field.val(value);
    },
    getValue: function () {
        if (!this.form) {
            return null;
        }
        return this.form.getFormValue();
    },
    setWidth: function (width) {
        this.combo.setWidth(width);
    },
    setUnit: function (unit) {
        $(".ux-unitfield-unit", this.dom).html(unit);
    },
    remove: function () {
        this.resetBtn.remove();
        this.okBtn.remove();
        this.group.remove();
        this.listForm.remove();
        EUI.form.ComboSearch.superclass.remove.call(this);
    }
});﻿EUI.SearchBox = function (options) {
    delete options.afterClear;
    return new EUI.form.SearchBox(options);
};
EUI.form.SearchBox = EUI.extend(EUI.form.TriggerField, {
    editable: true,
    onSearch: null,
    width: 260,
    triggerCss: "ux-search-trigger",
    initComponent: function () {
        EUI.form.SearchBox.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'SearchBox';
    },

    afterClear: function () {
        this.doSearch();
    },
    setValue: function (value) {
        EUI.form.SearchBox.superclass.setValue.call(this, value);
    },
    doSearch: function () {
        var g = this;
        var v = g.getValue();
        g.onSearch && g.onSearch.call(g, v);
    },
    onClick: function () {
    },
    addEvents: function () {
        var g = this;
        if (!g.readonly && g.onSearch instanceof Function
            && !g.dom.triggerbtn.hasClass(g.triggerDisableCss)) {
            g.dom.triggerbtn.bind("click", function () {
                g.doSearch();
            });
            g.dom.field.bind("keyup", function (e) {
                if (e.keyCode == 13) {
                    g.doSearch();
                }
            });
        }
        EUI.form.SearchBox.superclass.addEvents.call(this);
    }
});﻿EUI.DateField = function () {
    return new EUI.form.DateField(arguments[0]);
};

EUI.form.DateField = EUI.extend(EUI.form.TriggerField, {
    triggerCss: "ux-date-trigger",
    triggerClickCss: "",
    listWidth: 215,
    showTime: false,
    value: null,
    minDate: null,
    maxDate: null,
    msg: null,
    thursdayFlag: true,//是否以1月4日所在的那个星期为当年的第一个星期
    initComponent: function () {
        EUI.form.DateField.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'DateField';
    },

    showList: function () {
        var g = this;
        if (!g.loading && g.list) {
            g.setListPos();
        } else {
            g.initList();
        }
        g.calendar.bulidContent();
    },

    initList: function () {
        var g = this;
        var list = $("<div id='calender_" + this.id + "'></div>");
        list.attr("euiid", g.id).addClass(g.listCss);
        g.list = list;
        $("body").append(list);
        if(g.format=="Y-m-d") g.format = "yyyy-MM-dd";
        var calendar = EUI.Calendar({
            renderTo: "calender_" + this.id,
            showTime: g.showTime,
            showDate: this.getValue(),
            format: g.format||"yyyy-MM-dd",
            mondayFirst: g.mondayFirst,
            showWeek: g.showWeek,
            weekStart: g.mondayFirst ? 1 : 0,
            thursdayFlag: g.thursdayFlag,
            callback: function (value) {
                if (g.beforSelect) {
                    var before = {};
                    before.oldValue = g.getValue();
                    before.nowValue = value;
                    var tmp = g.beforSelect(before);
                    if (tmp == false) {
                        return;
                    }
                }
                var valiFlag = g.validaterDate(value);
                if (valiFlag) {
                    g.setValue(value);
                    g.sysValidater();
                    if (g.afterSelect) {
                        g.afterSelect(value);
                    }
                    g.list.hide();
                }
            }
        });
        calendar.parentCmp = this.id;
        var list = calendar.dom;
        $("body").append(list);
        this.list = list;
        this.calendar = calendar;
        g.dom.triggerbtn.addClass(g.triggerClickCss);
        g.setListPos();
        g.loading = false;
    },
    validaterDate: function (value) {
        var g = this;
        if (!g.minDate && !g.maxDate) {
            return true;
        }
        var flag = g.checkDate(value);
        return flag;
    },
    sysValidater: function () {
        var g = this;
        var value = g.getValue();
        if (!g.allowBlank
            && (value == null || value === "" || g.displayText == value || value.length == 0)) {
            var text = g.title ? g.title : "此项";
            g.invalidText = String.format(g.blankText, text);
            g.afterValid(false);
            return false;
        }
        g.afterValid(true);
        g.afterValidate && g.afterValidate.call(this, value);
        return true;
    },
    afterValid: function () {
        var g = this, flag = arguments[0];
        if (!flag) {
            if (!g.dom.field.hasClass(g.invalidCss)) {
                g.dom.field.addClass(g.invalidCss);
                g.dom.fieldwrap.removeClass(g.focusCss);
            }
            g.showTip();
        } else {
            g.dom.field.removeClass(g.invalidCss);
            g.dom.fieldwrap.removeClass(g.focusCss);
            if (g.tooltip) {
                g.tooltip.remove();
                g.tooltip = null;
            }
        }
        if (this.canClear) {
            if (this.getValue()) {
                this.clearBtn.css("visibility", "visible");
            } else {
                this.clearBtn.css("visibility", "hidden");
            }
        }
    },
    checkDate: function (value) {
        var g = this;
        if (value) {
            dateStr = value.substr(0, 4) + value.substr(5, 2)
                + value.substr(8, 2);
            if (g.minDate != null) {
                if (g.minDate - dateStr > 0) {
                    EUI.ProcessStatus({
                        success: false,
                        msg: String.format(g.minDateText, g.minDate)
                    });
                    return false;
                }
            }
            if (g.maxDate != null) {
                if (g.maxDate - dateStr < 0) {
                    EUI.ProcessStatus({
                        success: false,
                        msg: String.format(g.maxDateText, g.maxDate)
                    });
                    return false;
                }
            }
        }
        return true;
    },
    setWidth: function () {
        var width = parseInt(arguments[0]);
        if (width) {
            if (typeof arguments[0] == "string"
                && arguments[0].indexOf("%") > -1) {
                width /= 100;
                width *= this.dom.parent().width();
                if (this.dom.label) {
                    if (!this.labelWidth) {
                        if (width * 7 / 23 < 40) {
                            this.setLabelWidth(40);
                            width -= 40;
                        }
                        if (width * 7 / 23 > 70) {
                            this.setLabelWidth(70);
                            width -= 70;
                        } else {
                            this.setLabelWidth(width * 7 / 23);
                            width -= (width * 7 / 23);
                        }
                    } else {
                        this.setLabelWidth(this.labelWidth);
                        width -= this.labelWidth;
                    }
                }
            }
            width -= this._getOtherWidth();
            this.dom.field.width(width);
            this.width = arguments[0];
        }
    },
    setListPos: function () {
        var g = this;
        var iptpos = g.dom.field.offset();
        var ipth = g.dom.field.outerHeight();
        var top = iptpos.top + ipth;
        var listh = g.list.height();
        width = g.listWidth;
        if ($(window).height() <= (listh + top)) {
            var tmp = iptpos.top - listh - 4;
            if (tmp > 0) {
                top = tmp;
            }
        }
        g.list.css({
            "left": iptpos.left - 1,
            "top": top,
            "width": width,
            "z-index": ++EUI.zindex
        }).slideDown("fast");
    },
    remove: function () {
        EUI.form.DateField.superclass.remove.call(this);
        EUI.remove("calender_" + this.id);
    }
});﻿EUI.CheckBox = function () {
    return new EUI.form.CheckBox(arguments[0]);
};

EUI.form.CheckBox = EUI.extend(EUI.form.Field, {
    inputType: 'checkbox',
    fieldCss: "ux-field-checkbox",
    fieldWrapCss: "ux-checkbox",
    onChecked: null,
    checked: false,
    readonlyCss: "ux-checkbox-readonly",
    normalCss: "ecmp-eui-moreselect",
    selectCss: "ecmp-eui-checkbox-select",
    initComponent: function () {
        EUI.form.CheckBox.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'CheckBox';
    },
    initField: function () {
        var g = this;
        EUI.form.CheckBox.superclass.initField.call(this);
        g.dom.css("margin-top", "3px");
        g.dom.fieldwrap.addClass(g.fieldWrapCss);
        var fieldicon = $('<span class="ux-icon ' + this.normalCss + '"></span>');
        g.dom.field.hide();
        g.dom.fieldicon = fieldicon;
        g.dom.fieldwrap.append(fieldicon);
        if (g.checked) {
            g.setValue(true);
        }
        if (g.readonly) {
            g.setReadOnly(g.readonly);
        }
    },
    initLabel: function () {
        EUI.form.CheckBox.superclass.initLabel.call(this);
        this.dom.label.css({
            "padding-top": "1px"
        });
        this.dom.label.html() && this.dom.label.attr("title",this.dom.label.html());
    },
    addEvents: function () {
        var g = this;
        g.dom.fieldicon.bind("click", function () {
            if (!g.disabled) {
                if (g.checked) {
                    g.dom.field.attr("checked", false);
                    $(this).removeClass("checked");
                    $(this).removeClass(g.selectCss);
                    g.checked = false;
                } else {
                    g.checked = true;
                    g.dom.field.attr("checked", true);
                    $(this).addClass("checked");
                    $(this).addClass(g.selectCss);
                }
                if (g.onChecked
                    && g.onChecked instanceof Function) {
                    g.onChecked.call(g, g.getValue());
                }
            }
        });
        g.dom.label.bind("click", function () {
            g.dom.fieldicon.click();
        });
    },
    addCss: function () {
    },
    getValue: function () {
        return this.checked;
    },
    getSubmitValue: function () {
        var data = {};
        if (this.submitName && this.name)
            data[this.name] = this.getValue();
        if (this.checked)
            EUI.applyIf(data, this.submitValue);
        return data;
    },
    setValue: function (v) {
        var g = this;
        if (v != undefined) {
            v = v.toString().toLowerCase();
            if (v == "true") {
                g.dom.field.attr("checked", true);
                g.dom.fieldicon.addClass("checked").addClass(g.selectCss);
                g.checked = true;
                if (g.disabled) {
                    g.dom.fieldwrap.addClass(g.fieldWrapCss
                        + "-checked");
                }
            } else {
                g.checked = false;
                g.dom.field.attr("checked", false);
                g.dom.fieldicon.removeClass("checked").removeClass(g.selectCss);
                if (g.disabled) {
                    g.dom.fieldwrap.removeClass(g.fieldWrapCss
                        + "-checked");
                }
            }
        }
    },
    sysValidater: function () {
        return true;
    },
    setReadOnly: function () {
        var args = arguments;
        if (args.length != 0) {
            var arg = args[0] == "true" || args[0] == true
                ? true
                : false;
            if (arg) {
                this.dom.fieldicon.addClass("disabled");
                this.disabled = true;
                this.checked
                && this.dom.fieldwrap
                    .addClass(this.fieldWrapCss
                        + "-checked");
            } else {
                this.disabled = false;
                this.dom.fieldicon.removeClass("disabled");
                this.dom.fieldwrap.hasClass(this.fieldWrapCss
                    + "-checked")
                && this.dom.fieldwrap
                    .removeClass(this.fieldWrapCss
                        + "-checked");
            }
        }
    },
    reset: function () {
        var g = this;
        g.dom.field.attr("checked", false);
        g.dom.fieldicon.removeClass("checked").removeClass(g.selectCss);
        g.dom.fieldwrap.removeClass(g.fieldWrapCss + "-checked");
        g.checked = false;
    }
});﻿EUI.RadioBox = function () {
    return new EUI.form.RadioBox(arguments[0]);
};

EUI.form.RadioBox = EUI.extend(EUI.form.CheckBox, {
    inputType: 'radio',
    labelFirst: false,
    fieldCss: "ux-field-radiobox",
    fieldWrapCss: "ux-radiobox",
    readonlyCss: "ux-checkbox-readonly",
    normalCss: "ecmp-eui-radio",
    selectCss: "ecmp-eui-radioselect",

    initComponent: function () {
        EUI.form.RadioBox.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'RadioBox';
    },
    addEvents: function () {
        var g = this;
        g.dom.fieldicon.bind("click", function () {
            if (!g.disabled) {
                if (!g.checked) {
                    g.dom.field.attr("checked", true);
                    $(this).addClass("checked");
                    $(this).addClass(g.selectCss);
                    g.checked = true;
                    if (g.onChecked && g.onChecked instanceof Function) {
                        g.onChecked.call(g, g.getValue());
                    }
                }
            }
        });
        g.dom.label.bind("click", function () {
            g.dom.fieldicon.click();
        });
    }
});﻿EUI.CheckBoxGroup = function() {
	return new EUI.form.CheckBoxGroup(arguments[0]);
};

EUI.form.CheckBoxGroup = EUI.extend(EUI.form.TextField, {
			onChecked : null,
			itemAlign : 'h',
			isFormField : true,
			defaultStyle : null,
			itemspace : 20,
			onlyOneChecked : false,
			wrapCls : 'ux-checkbox-wrap',
			itemCls : 'ux-checkbox-item',
			invalidCls : 'ux-checkbox-invalid',
			initComponent : function() {
				EUI.form.CheckBoxGroup.superclass.initComponent.call(this);
			},

			getType : function() {
				return 'CheckBoxGroup';
			},
			render : function() {
				var g = this;
				g.dom.addClass("ux-field");
				g.initLabel();
				g.addEvents();
			},
			setCmpType : function(cfg) {
				return EUI.CheckBox(cfg);
			},
			addItems : function() {
				var g = this, items = this.options.items;
				if (items && g.dom) {
					var pleft = g.title ? g.dom.label.width() : 2;
					g.dom.fieldwrap = $("<div></div>").addClass(g.wrapCls).css(
							"padding-left", pleft);
					g.dom.append(g.dom.fieldwrap);
					for (var i = 0; i < items.length; i++) {
						if (g.onChecked) {
							items[i].onChecked = g.onChecked;
						}
						if (g.readonly) {
							items[i].readonly = g.readonly;
						}
						items[i].labelFirst = false;
						items[i].isFormField = false;
						EUI.applyIf(items[i], this.defaultConfig);
						var cmp = g.setCmpType(items[i]);
						if (g.itemAlign == "h") {
							cmp.dom.addClass(g.itemCls);
						}else{
							cmp.dom.css("float","none");
						}
						cmp.dom.css("margin-right", this.itemspace);
						g.dom.fieldwrap.append(cmp.dom);
						this.items.push(cmp.id);
					}
					g.dom.fieldwrap.append("<div class='ux-clear'></div>");
					g.onlyOneChecked && g.initGroupEvent();
				}
			},
			initGroupEvent : function() {
				var g = this;
				g.dom.fieldwrap.children("div.ux-field").each(function() {
							var rbox = EUI.getCmp($(this).attr("id"));
							rbox.dom.fieldicon.bind("click", function() {
										if (!rbox.disabled) {
											for (var m = 0; m < g.items.length; m++) {
												var item = EUI
														.getCmp(g.items[m]);
												if (rbox.id != item.id) {
													item.reset();
												}
											}
										}
									});
						});
			},
			loadData : function() {
				this.reset();
				EUI.form.CheckBoxGroup.superclass.loadData.call(this,
						arguments[0]);
			},
			setReadOnly : function() {
				var g = this, args = arguments;
				if (args.length != 0) {
					var arg = args[0] == "true" || args[0] == true
							? true
							: false;
					for (var i = 0; i < g.items.length; i++) {
						var item = EUI.getCmp(g.items[i]);
						item.setReadOnly(arg);
					}
				}
			},
			setSubmitValue : function() {
			},
			getValue : function() {
				if (!this.name)
					throw new Error(String.format(EUI.error.noName, this.type));
				var data = {}, arr = [];
				for (var i = 0; i < this.items.length; i++) {
					var item = EUI.getCmp(this.items[i]);
					if (item.checked) {
						arr.push(item.name);
					}
				}
				data[this.name] = arr;
				return data;
			},
			setValue : function(values) {
				this.reset();
				for (var k = 0; k < values.length; k++) {
					var value = values[k];
					for (var i = 0; i < this.items.length; i++) {
						var item = EUI.getCmp(this.items[i]);
						if (item.name == value) {
							item.setValue(true);
						}
					}
				}
			},
			getSubmitValue : function() {
				return this.getValue();
			},
			sysValidater : function() {
				var g = this;
				if (!g.allowBlank) {
					for (var i = 0; i < g.items.length; i++) {
						if (EUI.getCmp(g.items[i]).checked) {
							g.dom.fieldwrap.removeClass(g.invalidCls);
							return true;
						}
					}
					g.dom.fieldwrap.addClass(g.invalidCls);
					g.invalidText = g.validateText
							? g.validateText
							: g.blankText;
					return false;
				}
				return true;
			},
			reset : function() {
				var g = this;
				for (var i = 0; i < g.items.length; i++) {
					EUI.getCmp(g.items[i]).reset();
				}
			},
			addEvents : function() {
			},
			onResize : function() {

			}
		});﻿EUI.RadioBoxGroup = function() {
	return new EUI.form.RadioBoxGroup(arguments[0]);
};

EUI.form.RadioBoxGroup = EUI.extend(EUI.form.CheckBoxGroup, {
			onChecked : null,
			itemAlign : 'h',
			defaultStyle : null,
			onlyOneChecked : true,
			wrapCls : 'ux-radiobox-wrap',
			itemCls : 'ux-radiobox-item',
			invalidCls : 'ux-radiobox-invalid',
			initComponent : function() {
				EUI.form.RadioBoxGroup.superclass.initComponent.call(this);
			},

			getType : function() {
				return 'RadioBoxGroup';
			},
			setCmpType : function(cfg) {
				return EUI.RadioBox(cfg);
			},
			getValue : function() {
				for (var i = 0; i < this.items.length; i++) {
					var item = EUI.getCmp(this.items[i]);
					var value = item.getValue();
					if (value) {
						var result = {};
						result[this.name] = item.name;
						return result;
					}
				}
			},
			setValue : function(value) {
				for (var i = 0; i < this.items.length; i++) {
					var item = EUI.getCmp(this.items[i]);
					if (item.name == value) {
						item.setValue(true);
					} else {
						item.setValue(false);
					}
				}
			},
			loadData : function(data) {
				this.setValue(data[this.name]);
			}
		});﻿EUI.MonthField = function () {
    return new EUI.form.MonthField(arguments[0]);
};
EUI.form.MonthField = EUI.extend(EUI.form.TriggerField, {
    triggerCss: "ux-date-trigger",
    triggerClickCss: "",
    data: null,
    listWidth: 318,
    value: "",
    format: "yyyy-MM",
    monthUnit: null,

    initComponent: function () {
        if (this.value) {
            var date = new Date(this.value);
            this.year = date.getFullYear();
            this.month = date.getMonth()+1;
        }
        if(this.monthUnit == null){
            this.monthUnit = this.monthText;
        }
        EUI.form.MonthField.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'MonthField';
    },
    afterRender: function () {
        var g = this;
        if (this.value) {
            this.setValue(this.value);
        }
        EUI.form.MonthField.superclass.afterRender.call(this);
    },
    showList: function () {
        var g = this;
        if (g.list) {
            g.setListPos();
        } else {
            g.initList();
        }
    },
    initList: function () {
        var g = this;
        var list = $("<div class='ux-mf-list'><div class='ux-mf-top'>"
            + this.initYear() + this.initMonth() + "</div>"
            + this.initBottom() + "</div>");
        list.attr("euiid", g.id).addClass(g.listCss);
        g.list = list;
        $("body").append(list);
        g.setListPos();
        $("span[index='" + this.month + "']", this.list).addClass("selected");
        this.initListEvents();
    },
    initYear: function () {
        if (!this.getData()) {
            return;
        }

        var html = "<div class='ux-mf-yearbox'>";
        var data = this.getData();
        for (var i = data[0]; i <= data[1]; i++) {
            if (i != this.year) {
                html += "<div index='" + i + "'>" + i + "</div>";
            } else {
                html += "<div class='selected' index='" + i + "'>" + i
                    + "</div>";
            }
        }
        return html + "</div>";
    },
    initMonth: function () {
        return "<div class='ux-mf-monthbox'>"
            + "<div><span index='1'>1" + this.monthUnit + "</span><span index='2'>2" + this.monthUnit + "</span><span index='3'>3" + this.monthUnit + "</span></div>"
            + "<div><span index='4'>4" + this.monthUnit + "</span><span index='5'>5" + this.monthUnit + "</span><span index='6'>6" + this.monthUnit + "</span></div>"
            + "<div><span index='7'>7" + this.monthUnit + "</span><span index='8'>8" + this.monthUnit + "</span><span index='9'>9" + this.monthUnit + "</span></div>"
            + "<div><span index='10'>10" + this.monthUnit + "</span><span index='11'>11" + this.monthUnit + "</span><span index='12'>12" + this.monthUnit + "</span></div></div>";
    },
    initBottom: function () {
        return "<div class='ux-mf-bottom'>"
            + "<div class='ux-button opt-cancel'>" + this.cancelText + "</div>"
            + "<div class='ux-button ux-button-select opt-ok'>" + this.okText + "</div></div>";
    },
    initListEvents: function () {
        var g = this;
        EUI.form.MonthField.superclass.addEvents.call(this);
        $(".opt-ok", this.list).bind("click", function () {
            if (g.year && g.month) {
                if(parseInt(g.month)<10){
                    g.month="0"+g.month;
                }
                var date = new Date(g.year + "-" + g.month);
                g.setValue(date.format(g.format));
                g.hideList();
            }
            g.afterSelect && g.afterSelect.call(g, g.year, g.month);
            return false;
        });
        $(".opt-cancel", this.list).bind("click", function () {
            g.hideList();
            return false;
        });
        $("span", this.list).bind("click", function () {
            if ($(this).hasClass("selected")) {
                return false;
            }
            g.month = $(this).attr("index");
            $("span.selected", g.list).removeClass("selected");
            $(this).addClass("selected");
            return false;
        });
        $("div", ".ux-mf-yearbox").bind("click", function () {
            if ($(this).hasClass("selected")) {
                return false;
            }
            g.year = $(this).attr("index");
            $("div.selected", g.list).removeClass("selected");
            $(this).addClass("selected");
            return false;
        });
    },
    getValue: function () {
        return this.value;
    },
    setValue: function () {
        var g = this,args=arguments[0];
        g.year=new Number(args.split("-")[0]);
        g.month = new Number(args.split("-")[1]);
        var yearField=g.getData();
        if(g.year&&g.month){
            if(g.year>=yearField[0]&&g.year<=yearField[1]&&g.month>=1&&g.month<=12){
                g.year=g.year+"";
                g.month=g.month+"";
                EUI.form.MonthField.superclass.setValue.call(this,args);
                $("div.ux-mf-yearbox",g.list).find("div.selected").removeClass("selected");
                $("div.ux-mf-monthbox",g.list).find("span.selected").removeClass("selected");
                $("div.ux-mf-yearbox",g.list).find("div[index='" + g.year + "']").addClass("selected");
                $("div.ux-mf-monthbox",g.list).find("span[index='" + g.month + "']").addClass("selected");
            }
        }
    }
});﻿EUI.NumberField = function() {
	return new EUI.form.NumberField(arguments[0]);
};

EUI.form.NumberField = EUI.extend(EUI.form.TextField, {
			maxValue : Number.MAX_VALUE,
			minValue : Number.NEGATIVE_INFINITY,
			precision : 0,
			allowNegative : true,
			allowChar : "0123456789",
			fullPrecision : true,

			initComponent : function() {
				EUI.form.NumberField.superclass.initComponent.call(this);
				if (!this.allowNegative) {
					this.minValue = this.minValue > 0 ? this.minValue : 0;
				} else {
					this.allowChar += "-";
				}
				if (this.precision > 0) {
					this.allowChar += ".";
				}
			},
			getType : function() {
				return 'NumberField';
			},
			render : function() {
				EUI.form.NumberField.superclass.render.call(this);
				this.setValue(this.value);
			},
			initField : function() {
				EUI.form.NumberField.superclass.initField.call(this);
				this.dom.field.css({
							"ime-mode" : "disabled"
						});
			},
			addEvents : function() {
				var g = this;
				this.dom.field.bind("blur", function(e) {
							var value = g.getValue();
							if (!value) {
								// value = 0;
								// g.setValue(value.toFixed(this.precision));
								return;
							}
							if (g.precision >= 0) {
								if (isNaN(value)) {
									value = g.getValue();
								}
								g.setValue(value);
							} else {
								throw new Error(g.negPrecision);
							}
						});
				EUI.form.NumberField.superclass.addEvents.call(this);
			},

			sysValidater : function() {
				var g = this;
				var parent = EUI.form.NumberField.superclass.sysValidater
						.call(this);
				if (!parent) {
					return false;
				} else {
					var value = EUI.form.NumberField.superclass.getValue
							.call(this);
					if (value) {
						if (!$.isNumeric(value)) {
                            var text = g.title ? g.title : "此项";
							g.invalidText = String.format(g.notNumberText, text);
							g.afterValid(false);
							return false;
						}
					}
					if (!this.checkValue()) {
						g.afterValid(false);
						return false;
					}
				}
				return true;
			},
			checkValue : function() {
				var g = this;
				var value = g.getValue();
				if (!value) {
					value = 0;
				}
				var text = g.title ? g.title : "此项";
				if (value < g.minValue) {
					g.invalidText = String.format(g.minValueText, text,
							g.minValue);
					return false;
				}
				if (value > g.maxValue) {
					g.invalidText = String.format(g.maxValueText, text,
							g.maxValue);
					return false;
				}
				return true;
			},
			getValue : function() {
				var value = EUI.form.NumberField.superclass.getValue.call(this);
				if (value)
					return parseFloat(value);
				else {
					return "";
				}
			},
			setValue : function(value) {
				if (value || value === 0) {
					var str = value + "";
					var len = str.indexOf(".");
					var precisonLen = 0;
					if (len != -1) {
						precisonLen = str.length - len - 1;
					}
					if (this.fullPrecision || precisonLen > this.precision) {
						value = parseFloat(value).toFixed(this.precision);
					} else {
						value = parseFloat(value);
					}
					EUI.form.NumberField.superclass.setValue.call(this, value);
				}
			}
		});﻿EUI.TextArea = function () {
    return new EUI.form.TextArea(arguments[0]);
};

EUI.form.TextArea = EUI.extend(EUI.form.TextField, {
    width: 160,
    height: 60,
    autoHeight: false,
    initComponent: function () {
        EUI.form.TextArea.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'TextArea';
    },

    initField: function () {
        var g = this;
        var textarea = $("<textarea></textarea>");
        textarea.addClass("ux-field-textarea");
        g.dom.field = textarea;
        var div = $("<div class='ux-field-element'></div>");
        div.append(g.dom.field);
        g.dom.fieldwrap = div;
        g.dom.append(div).append("<div class='ux-clear'> </div>");
        g.setWidth(g.width);
        g.setHeight(g.height);
        g.initDisplayText();
    },
    afterValid: function (valid) {
        EUI.form.TextArea.superclass.afterValid.call(this, valid);
        if (this.autoHeight) {
            var h = this.dom.field[0].scrollHeight - parseFloat(this.dom.field.css("borderTopWidth"))
                - parseFloat(this.dom.field.css("borderBottomWidth"))
                - parseFloat(this.dom.field.css("paddingTop"))
                - parseFloat(this.dom.field.css("paddingBottom"));
            if (h > this.height) {
                this.dom.field.height(h);
            }
        }
    }
});﻿EUI.IconField = function() {
	return new EUI.form.IconField(arguments[0]);
};

EUI.form.IconField = EUI.extend(EUI.form.TextField, {
			iconCss : null,
			onClick : null,
			baseTrigger : "ux-iconfield-basetrigger",
			baseClear : "ux-iconfield-baseclear",
			canClear : false,
			clearCss : "ux-iconfield-clearbtn",
			clearIcon : "ux-iconfield-icon",
			placeholder : null,
			afterClear : null,

			initComponent : function() {
				EUI.form.IconField.superclass.initComponent.call(this);
			},
			getType : function() {
				return 'IconField';
			},
			initField : function() {
				EUI.form.IconField.superclass.initField.call(this);
				if (this.placeholder) {
					this.dom.field.attr("placeholder", this.placeholder);
				}
				if (!this.editable) {
					this.dom.field.attr("readonly", true);
					this.dom.field.addClass("ux-hand");
				}
				this.initIcon();
				if (this.readonly) {
					this.setReadOnly(true);
				}
			},
			initIcon : function() {
				var g = this;
				var triggerbtn = $("<span class='" + this.baseTrigger + " "
						+ this.iconCss + "'></span>");
				var clearbtn = $("<span class='" + this.baseClear + "'></span>");
				if (g.canClear) {
					g.dom.field.after(clearbtn);
					g.clearBtn = clearbtn;
				}
				g.dom.field.after(triggerbtn);
				if (g.readonly) {
					triggerbtn.hide();
					clearbtn.hide();
				}
			},
			addEvents : function() {
				var g = this;
				if (this.onClick) {
					if(this.readonly){
						return;
					}
					g.dom.field.bind("click", function() {
								g.onClick && g.onClick.call(g);
							});
					$(".ux-iconfield-clearbtn").live("click", function() {
								g.dom.field.val("");
								$(this).removeClass("ux-iconfield-icon");
								$(this).removeClass("ux-iconfield-clearbtn");
								g.afterClear && g.afterClear.call(g);
							});
				}
			},
			setWidth : function() {
				var width = parseInt(arguments[0]);
				if (width) {
					if (typeof arguments[0] == "string"
							&& arguments[0].indexOf("%") > -1) {
						width /= 100;
						width *= this.dom.parent().width();
						if (this.dom.label) {
							if (!this.labelWidth) {
								if (width * 7 / 23 < 40) {
									this.setLabelWidth(40);
									width -= 40;
								}
								if (width * 7 / 23 > 70) {
									this.setLabelWidth(70);
									width -= 70;
								} else {
									this.setLabelWidth(width * 7 / 23);
									width -= (width * 7 / 23);
								}
							} else {
								this.setLabelWidth(this.labelWidth);
								width -= this.labelWidth;
							}
						}
						width -= 10;
					}
					width -= 22;
					this.dom.field.width(width);
					this.width = arguments[0];
				}
			}
		});/**
 * *************************************************************************************************
 * <br>
 * 实现功能：
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 版本          变更时间             变更人                     变更原因
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 1.0.00      2017/7/12 15:45      陈飞(fly)                    新建
 * <br>
 * *************************************************************************************************<br>
 */
EUI.Label = function (options) {
    return new EUI.other.Label(options);
};
EUI.other.Label = EUI.extend(EUI.UIComponent, {
    width: null,
    height: null,
    content: "",
    customCss: "",
    domCss: "ux-label",
    onClick: null,

    initComponent: function () {
        EUI.other.Label.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'Label';
    },

    render: function () {
        this.dom.addClass(this.domCss);
        if (this.customCss) {
            this.dom.addClass(this.customCss);
        }
        if (this.width) {
            this.dom.css("width", this.width);
        }
        if (this.height) {
            this.dom.css("height", this.height);
        }
        this.dom.append(this.content);
        this.addEvents();
    },
    setContent: function (content) {
        this.dom.html(content);
        this.content = content;
    },
    getContent: function () {
        return this.content;
    },
    addEvents: function () {
        var g = this;
        this.dom.bind("click", function () {
            g.onClick && g.onClick.call(g, g.getContent());
        });
    }
});/**
 * *************************************************************************************************
 * <br>
 * 实现功能：
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 版本          变更时间             变更人                     变更原因
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 1.0.00      2017/7/17 15:51      陈飞(fly)                    新建
 * <br>
 * *************************************************************************************************<br>
 */
EUI.UploadFile = function (options) {
    return new EUI.file.UploadFile(options);
};
EUI.file.UploadFile = EUI.extend(EUI.UIComponent, {

    maxFileSize: 100,//文件大小限制，默认100M
    baseUrl: "",
    refBaseUrl: "",
    listUrl: "getEntityDocumentInfos",
    listRefUrl:"getDocReferenceInfoByOrderNo",
    previewUrl: "preview",
    entityId: null,
    files: null,
    justLook: false,
    padding: 10,
    includeRef:false,//默认不包含引用
    paramName:"",//引用时，查询附件方法的参数名,
    updateNumber:null,//更新附件数量方法

    initComponent: function () {
        EUI.file.UploadFile.superclass.initComponent.call(this);
        this.uploadedFiles = {};
        this.files = {};
    },
    getType: function () {
        return 'UploadFile';
    },
    render: function () {
        this.dom.css({padding: this.padding});
        !this.justLook && this._initHtml();
        this.addEvents();
        if (this.entityId) {
            this.loadFiles();
        }
    },
    _initHtml: function () {
        this.addbtn = $('<div class="ux-list-item ux-list-add"><div class="ecmp-common-add"></div></div>');
        this.dom.append(this.addbtn);
    },
    addEvents: function () {
        var g = this;
        this.addbtn && this.addbtn.click(function () {
            EUI.ChooseFile({
                baseUrl: g.baseUrl,
                refBaseUrl: g.refBaseUrl?g.refBaseUrl:g.baseUrl,
                includeRef:g.includeRef,
                paramName:g.paramName?g.paramName:"orderNo",
                listRefUrl:g.listRefUrl,
                // afterClose: function (files,refFiles) {
                //     g.addFileToList(files);
                //     //显示ref的doc，排除重复
                //     g.showFiles(refFiles);
                // },
                afterConfirmAll:function (files,refFiles) {
                    g.addFileToList(files);
                    //显示ref的doc，排除重复
                    g.showFiles(refFiles);
                    g.updateNumber && g.updateNumber.call(g);
                }
            });
        });

        //删除
        $(".ux-list-delete", this.dom).die("click").live("click", function () {
            var parent = $(this).parent();
            var fileId = parent.attr("id");
            parent.remove();
            delete g.files[fileId];
            g.updateNumber && g.updateNumber.call(g);
        });

        //查看
        $(".ux-list-preview", this.dom).die("click").live("click", function () {
            var parent = $(this).parent();
            var fileId = parent.attr("id");
            if (window.top.homeView) {
                window.top.homeView.addTab({
                    xtype: "ViewFile",
                    iframe: false,
                    id: "view_" + g.id,
                    title: "附件预览",
                    baseUrl: g.baseUrl,
                    files: g.getFiles(),
                    showFileId: fileId
                });
            }
            else{
                EUI.ViewFile({
                    renderTo: "view_file",
                    title: "附件预览",
                    baseUrl: g.baseUrl,
                    files: g.getFiles(),
                    showFileId: fileId
                });
            }
        });
    },
    loadFiles: function () {
        var g = this;
        EUI.Store({
            url: this.baseUrl + this.listUrl,
            params: {
                entityId: this.entityId
            },
            success: function (status) {
                g.showFiles(status.data || []);
            }, failure: function (status) {
                EUI.ProcessStatus(status);
            }
        });
    },
    showFiles: function (files) {
        var fileDom;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if($("#"+file.id,this.dom).length>0){
                continue;
            }
            var tmps = file.fileName.split(".");
            var type = tmps.length > 0 ? tmps[tmps.length - 1] : "";
            var icon = this.getTypeIcon(file.fileName, type);
            var url=this.baseUrl + this.previewUrl + "?docId=" + file.id+"&isThumbnail=true";
            var imageHtml=icon?"":'<div class="ux-fileview-imgbox" style="height: 45px;display: block;"><img class="img-item" id="'+file.id+'" style="display: inline-block;"></div>';
            fileDom = '<div class="ux-list-item" id="' + file.id + '">' +
                '    <div class="ux-file-type ' + icon + '" style="width: 100%">' +imageHtml+
                '    </div>' +
                '    <div style="color: #4a4a4a;overflow-wrap: break-word;">' + file.fileName + '</div>' +
                (this.justLook ? "" : '    <span class="ux-list-delete">&times</span>') +
                '    <span class="ux-list-preview">查看</span>' +
                '</div>';
            var fd=$(fileDom);
            this.dom.append(fd);
            !icon && EUI.util.getFileBlob(fd.find("img.img-item"),url);
            this.files[file.id] = file;
        }
    },
    addFileToList: function (files) {
        var fileDom;
        for (var key in files) {
            var file = files[key].file;
            var uploadedFileId = files[key].sysId;
            if (this.files[uploadedFileId]) {
                continue;
            }
            var icon = this.getTypeIcon(file.name, file.type);
            var url=this.baseUrl + this.previewUrl + "?docId=" + uploadedFileId+"&isThumbnail=true";
            var imageHtml=icon?"":'<div class="ux-fileview-imgbox" style="height: 45px;display: block;"><img class="img-item" id="'+uploadedFileId+'" style="display: inline-block;"></div>';
            fileDom = '<div class="ux-list-item" id="' + uploadedFileId + '">' +
                '    <div class="ux-file-type ' + icon + '" style="width: 100%">' +imageHtml+
                '    </div>' +
                '    <div style="color: #4a4a4a;overflow-wrap: break-word;">' + file.name + '</div>' +
                '    <span class="ux-list-delete">&times</span>' +
                '    <span class="ux-list-preview">查看</span>' +
                '</div>';
            this.files[uploadedFileId] = {
                id: uploadedFileId,
                fileName: file.name
            };
            this.dom.append($(fileDom));
            !icon && EUI.util.getFileBlob($(".img-item",$(fileDom)),url);
        }
    },
    getTypeIcon: function (name, type) {
        if (type.indexOf("image") != -1) {
            return "";
        }
        var tmp = name.split(".");
        var suffix = tmp.length > 0 ? tmp[tmp.length - 1] : "";
        var iconCss;
        switch (suffix.toLowerCase()) {
            case "pdf":
                iconCss = "ecmp-info-pdf";
                break;
            case "doc":
            case "docx":
                iconCss = "ecmp-info-word";
                break;
            case "xls":
            case "xlsx":
            case "csv":
                iconCss = "ecmp-info-excel";
                break;
            case "ppt":
            case "pptx":
                iconCss = "ecmp-info-ppt";
                break;
            case "zip":
            case "rar":
            case "7z":
                iconCss = "ecmp-info-compress";
                break;
            case "txt":
                iconCss = "ecmp-info-text";
                break;
            case "jpg":
            case "jpeg":
            case "png":
            case "bmp":
            case "gif":
                iconCss = "";
                break;
            default:
                iconCss = "ecmp-info-otherformat";
        }
        return iconCss;
    },
    getFiles: function () {
        var files = [];
        for (var fid in this.files) {
            files.push(this.files[fid]);
        }
        return files;
    },
    getFileIds: function () {
        var fileIds = [];
        for (var fid in this.files) {
            fileIds.push(fid);
        }
        return fileIds;
    },
    remove: function () {
        this.dom.remove();
        delete EUI.managers[this.id];
    }
});/**
 * *************************************************************************************************
 * <br>
 * 实现功能：
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 版本          变更时间             变更人                     变更原因
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 1.0.00      2017/7/17 15:51      陈飞(fly)                    新建
 * <br>
 * *************************************************************************************************<br>
 */
EUI.ChooseFile = function (options) {
    return new EUI.file.ChooseFile(options);
};
EUI.file.ChooseFile = EUI.extend(EUI.UIComponent, {

    maxFileSize: 100,//文件大小限制，默认100M
    baseUrl: "",
    refBaseUrl: "",
    listRefUrl:"getDocReferenceInfoByOrderNo",
    uploadUrl: "upload",
    previewUrl: "preview",
    isOrigin: true,
    uploadedFiles: null,
    uploadComplete: null,
    afterClose: null,
    title:"添加附件",//弹窗title
    includeRef:false,//默认不包含引用
    selectRefFiles:null,
    paramName:"orderNo",

    initComponent: function () {
        EUI.file.ChooseFile.superclass.initComponent.call(this);
        this.uploadedFiles = {};
        this.selectRefFiles=[];
    },
    getType: function () {
        return 'ChooseFile';
    },
    initDom: function () {

    },
    render: function () {
        var g = this;
        g.win = EUI.Window({
            title:g.title ,
            width: 480,
            height: 400,
            html: this._initHtml(),
            buttons: [{
                title: "上一步",
                hidden:true,
                handler: function () {
                    g._showHtml();
                }
            },{
                title: "确定",
                selected:true,
                hidden:true,
                handler: function () {
                    g.getRefFiles();
                    g.afterConfirmAll && g.afterConfirmAll.call(this, g.uploadedFiles,g.selectRefFiles);
                    g.win.close();
                }
            }],
            // afterClose: function () {
            //     g.afterClose && g.afterClose.call(this, g.uploadedFiles,g.selectRefFiles);
            // }
        });
        this.dom = this.win.dom.content;
        this.initPlupload();
        this.addEvents();
    },
    _initHtml: function () {
        var g=this;
        if(g.includeRef){
            return '<div class="ux-file-content">' +
                '    <div class="ux-file-btn" style="margin-top: 95px;" type="file">上传新文件</div>' +
                '    <div class="ux-file-hint">将文件拖拽至此区域</div>' +
                '    <div class="ux-file-space"></div>' +
                '    <div class="ux-file-btn" style="margin-top: 45px;" type="quote">从其他单据引用</div>' +
                // '    <input type="file" multiple="multiple" style="display: none">' +
                '    </div><div class="ux-choose-btn"></div>';
        }else {
            return   '    <div class="ux-file-content">' +
                '    <div class="ux-file-btn" style="margin-top: 160px;" type="file">上传新文件</div>' +
                '    <div class="ux-file-hint">将文件拖拽至此区域</div>' +
                '    </div><div class="ux-choose-btn"></div>';
        }
    },
    _changeHtml: function () {
        $(".ux-file-content", this.dom).hide();
        if ($("#refercontent", this.dom).length > 0) {
            $("#refercontent", this.dom).hide();
        }
        if($(".ux-file-box", this.dom).length > 0){
            $(".ux-file-box", this.dom).show();
        }else {
            var html = '<div class="ux-file-box">' +
                '    <div class="ux-file-head">' +
                '        <div class="ux-file-btn" type="file">上传新文件</div>' +
                '        <span class="ux-file-tip" style="margin-left: 10px;">或拖拽文件到下框</span>' +
                '    </div>' +
                '    <div class="ux-file-list">' +
                '        </div>' +
                '    </div>' +
                '</div>';
            this.dom.append(html);
        }
        if(!this.includeRef){
            $($(".ux-window-optbox",this.win.dom).children()[1]).show();
        }else {
            $(".ux-window-optbox",this.win.dom).children().show();
        }
    },
    initPlupload: function () {
        this.uploader = new plupload.Uploader({
            browse_button: $(".ux-choose-btn", this.dom)[0],
            drop_element: this.dom[0],
            url: this.baseUrl + this.uploadUrl,
            max_retries: 3,//最大重试次数
            flash_swf_url: 'js/Moxie.swf',
            silverlight_xap_url: 'js/Moxie.xap',
            filters: {
                max_file_size: this.maxFileSize + 'mb', //文件大小限制
                prevent_duplicates: true //不允许选取重复文件
            }
        });
        this.uploader.init();
    },
    addEvents: function () {
        var g = this;
        $(".ux-file-btn", this.dom).die("click").live("click", function () {
            var $btn=$(this);
            if($btn.attr("type")=="file"){
                $(".ux-choose-btn", this.dom).click();
            }else if($btn.attr("type")=="quote"){
                //引用附件
                g._initRefHtml();
            }
        });

        this.uploader.bind('FilesAdded', function (uploader, files) {
            if (g.isOrigin) {
                g._changeHtml();
                g.isOrigin = false;
            }
            g.showFiles(files);
            g.uploader.start();
            return false;
        });
        this.uploader.bind('UploadProgress', function (uploader, file) {
            var fileDom = $("#" + file.id);
            var percent = file.percent == 100 ? 99 : file.percent;
            $(".ux-file-progress", fileDom).width(percent + "%");
            $(".ux-file-percent", fileDom).text(percent + "%");
        });
        this.uploader.bind("Error", function (uploader, errObject) {
            var code = errObject.code;
            //文件大小超过限制
            if (code == -600) {
                g.isFailure=true;
                if($(".ux-file-box", this.dom).is(':visible')){
                    EUI.ProcessStatus({
                        success: false,
                        msg: "文件：" + errObject.file.name + "，超过" + g.maxFileSize + "M大小限制"
                    });
                    return;
                }else{
                    $(".ux-file-box", this.dom).hide();
                    g.isOrigin = true;
                    EUI.ProcessStatus({
                        success: false,
                        msg: "文件：" + errObject.file.name + "，超过" + g.maxFileSize + "M大小限制"
                    });
                }
            }
            if (code == -602) {
                g.isFailure=true;
                if($(".ux-file-box", this.dom).is(':visible')){
                    EUI.ProcessStatus({
                        success: true,
                        msg: "文件：" + errObject.file.name + "，已经在队列中"
                    });
                    return;
                }else{
                    $(".ux-file-box", this.dom).hide();
                    g.isOrigin = true;
                    EUI.ProcessStatus({
                        success: true,
                        msg: "文件：" + errObject.file.name + "，已经在队列中"
                    });
                }
            }
            if (g.isOrigin) {
                g._changeHtml();
                g.isOrigin = false;
            }
            if(g.isFailure){
                g.isFailure=false;
                return;
            }
            g.showFiles([errObject.file]);
            var fileDom = $("#" + errObject.file.id);
            $(".ux-file-statusbox", fileDom).hide();
            var msgbox = $(".ux-file-msgbox", fileDom).show();
            $("span:first", msgbox).text(errObject.message);
        });
        this.uploader.bind("FileUploaded", function (uploader, file, responseObject) {
            var fileDom = $("#" + file.id);
            $(".ux-file-progress", fileDom).width("100%");
            $(".ux-file-percent", fileDom).text("100%");
            $(".ux-file-status", fileDom).text("完成");
            var result = responseObject.response;
            try {
                result = JSON.parse(responseObject.response);
            } catch (e) {
            }
            g.uploadedFiles[file.id] = {sysId: result[0], file: file};
        });

        //重传
        $(".ux-file-retry", this.dom).die("click").live("click", function () {
            $(this).parent().prev().show();
            $(this).parent().hide();
            g.uploader.start();
        })

        //删除
        $(".ux-file-delete", this.dom).die("click").live("click", function () {
            var fileDom = $(this).parents(".ux-file-item");
            var fileId = fileDom.attr("id");
            var file = g.uploader.getFile(fileId);
            //清除已上传列表对应id
            delete g.uploadedFiles[fileId];
            g.uploader.removeFile(file);
            fileDom.remove();
        });

    },
    _initRefHtml: function () {
        var g=this;
        if ($(".ux-file-content", this.dom).length > 0) {
            $(".ux-file-content", this.dom).hide();
            if ($("#refercontent", this.dom).length > 0) {
                $("#refercontent", this.dom).show();
            } else {
                var html = '<div id="refercontent">' +
                    '<div class="ux-ref-lg">' +
                    '<span class="ux-ref-content">单据搜索</span>' +
                    '</div>' +
                    '<span class="ux-search-bg ux-search-ipt-wr">' +
                    '<input id="refsearch" name="wd" class="ux-search-ipt" value="" maxlength="255">' +
                    '</span>' +
                    '<span class="ux-search-btn-wr">' +
                    '<input type="submit" value="搜索" class="ux-search-bg ux-search-btn">' +
                    '</span>' +
                    '<div class="ux-request-note-wr" style="display: none">单据说明：'+'<span class="ux-request-note"></span>' +
                    '</div>'+
                    '</div>';
                this.dom.append(html);
                this.addSearchEvent();
            }
            g.win.setTitle("引用附件");
            $(".ux-window-optbox",this.win.dom).children().show();
        }
    },
    addSearchEvent:function () {
        var g=this;
        $("#refsearch","#refercontent", this.dom).bind("focus",function () {
            $(this).select();
            var $item=$(this).parent(".ux-search-bg");
            if($item.length>0){
                $item.addClass("focus");
            }
        });
        $("#refsearch","#refercontent", this.dom).bind("blur",function () {
            var $item=$(this).parent(".ux-search-bg");
            if($item.length>0){
                $item.removeClass("focus");
            }
        });
        $("#refsearch","#refercontent", this.dom).bind("keypress",function (e) {
            var ev= window.event||e;
            if (ev.keyCode == 13) {
                $("input.ux-search-btn","#refercontent", this.dom).click();
            }
        });

        $("input.ux-search-btn","#refercontent", this.dom).bind("click",function () {
            //搜索对应单号的附件
            var searchText=$("input#refsearch","#refercontent", this.dom).val();
            if(searchText){
                g.queryFiles(searchText);
            }else{
                $(".ux-request-note","#refercontent",g.dom).html("");
                $(".ux-request-note-wr","#refercontent",g.dom).hide();
                $(".ux-list-refitem","#refercontent", this.dom).remove();
            }
        });
    },
    _showHtml:function () {
        var g=this;
        //需要修改，判断是上传还是引用的上一步
        $(".ux-window-optbox",this.win.dom).children().hide();
        this.win.setTitle(g.title);
        if ($("#refercontent", this.dom).length > 0 && $("#refercontent", this.dom).is(':visible')) {
            $("#refercontent", this.dom).hide();
        }
        if($(".ux-file-box", this.dom).length > 0 && $(".ux-file-box", this.dom).is(':visible')){
            $(".ux-file-box", this.dom).hide();
            g.isOrigin = true;
        }
        $(".ux-file-content", this.dom).show();
    },
    queryFiles: function (searchText) {
        var g = this, postData = {};
        postData[g.paramName] = searchText.toUpperCase();
        // EUI.Store({
        //     url: g.refBaseUrl + g.listRefUrl,
        //     params: postData,
        //     success: function (data) {
        //         var refInfo = data || {orderNote: "", documentInfos: []};
        var refInfo={"orderNote":"【R497】dwefw","documentInfos":[{"id":"5b91d16e59135b00013e31cb","appModule":"BRM_ACT_WEB","fileName":"数据库表字段命名规范数据库表字段命名规范数据库表字段命名规范.png","size":9977,"uploadedTime":"2018-09-07 09:16:30","tenantCode":"10044","uploadUserId":"CA8C4582-CAAE-11E7-AA54-0242C0A84202","uploadUserAccount":"11006529","uploadUserName":"吴云斌","documentType":1,"documentTypeEnum":"Image","documentTypeEnumRemark":"图片","fileSize":"9K"}]};
        var docs = refInfo.documentInfos ? refInfo.documentInfos : [];
        g.showRefFiles(docs);
        //         $(".ux-request-note-wr", "#refercontent", g.dom).show();
        //         $(".ux-request-note", "#refercontent", g.dom).html(refInfo.orderNote);
        //     }, failure: function (status) {
        //         EUI.ProcessStatus({
        //             success: false,
        //             msg: "获取失败"
        //         });
        //     }
        // });
    },
    showRefFiles:function (refFiles) {
        var fileDom,css="";
        $(".ux-list-refitem","#refercontent", this.dom).remove();
        for(var i = 0; i < refFiles.length; i++){
            var refFile = refFiles[i];
            var type = this.getTypeIcon(refFile.fileName, refFile.documentTypeEnum);
            if((i+1)%3==0){
                css="margin-right:0px"
            }else{
                css="";
            }
            var url=this.baseUrl + this.previewUrl + "?docId=" + refFile.id+"&isThumbnail=true";
            var imageHtml=type?"":'<div class="ux-fileview-imgbox" style="height: 45px;display: block;"><img class="img-item" id="'+refFile.id+'" style="display: inline-block;"></div>';
            fileDom= '<div class="ux-list-refitem" id="' + refFile.id + '" style="'+ css +'">' +
                '<div class="ux-file-type '+ type + '" style="width: 100%">' +imageHtml+
                '</div>' +
                '<div class="ux-reffile-name" title="'+refFile.fileName+'">'+ refFile.fileName +'</div>' +
                '<span class="ux-list-refpreview">查看</span>' +
                '<div class="ux-list-multiselect"></div>' +
                '</div>';
            var fd=$(fileDom);
            $("#refercontent", this.dom).append(fd);
            !type && EUI.util.getFileBlob(fd.find("img.img-item"),url);
            $("#"+refFile.id,this.dom).data(refFile);
        }
        this.addRefItemEvent(refFiles);
    },
    getRefFiles: function () {
        var selectedRefDoms=$(".ux-list-refitem.select",this.dom);
        for(var i=0;i<selectedRefDoms.length;i++){
            this.selectRefFiles.push($(selectedRefDoms[i]).data());
        }
        return this.selectRefFiles;
    },
    addRefItemEvent:function(refFiles) {
        var g = this;
        $(".ux-list-refpreview", ".ux-list-refitem",this.dom).off("click").on("click", function (event) {
            //查看
                event.stopPropagation();
                var parent = $(this).parent();
                var fileId = parent.attr("id");
                if (window.top.homeView) {
                    window.top.homeView.addTab({
                        xtype: "ViewFile",
                        iframe: false,
                        id: "refView_" + g.id,
                        title: "附件预览",
                        baseUrl: g.refBaseUrl,
                        // listUrl: g.listRefUrl,
                        files: refFiles,
                        showFileId: fileId
                    });
                }
                else{
                    EUI.ViewFile({
                        renderTo: "view_refFile",
                        title: "附件预览",
                        baseUrl: g.refBaseUrl,
                        // listUrl: g.listRefUrl,
                        files: refFiles,
                        showFileId: fileId
                    });
                }
        })
        $(".ux-list-refitem",this.dom).off("click").on("click", function (e) {
            var $item = $(this);
            if ($item.hasClass("select")) {
                $item.removeClass("select");
                $item.children(".ux-list-multiselect").removeClass("select");
            } else {
                $item.addClass("select");
                $item.children(".ux-list-multiselect").addClass("select");
            }
        })
    },
    showFiles: function (files) {
        var html = "";
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if ($("#" + file.id).length != 0) {
                continue;
            }
            if (!file.origSize) {
                EUI.ProcessStatus({success: false, msg: file.name + ",为空文件，不能上传"});
                continue;
            }
            var type = this.getTypeIcon(file.name, file.type,true);
            html += '<div class="ux-file-item" id="' + file.id + '">' +
                '            <span class="ux-file-type ' + type + '"></span>' +
                '            <div class="ux-file-info">' +
                '                <div><span class="ux-file-name">' + file.name +
                '                   </span><span class="ux-file-size ux-file-tip">(' + this.getSizeText(file.origSize) + ')</span>' +
                '                </div>' +
                '                <div class="ux-file-statusbox">' +
                '                    <div class="progress-box">' +
                '                        <div class="ux-file-progress" style="width: 0%;"></div>' +
                '                    </div>' +
                '                    <span class="ux-file-percent">0%</span>' +
                '                    <span class="ux-file-status ux-file-tip">上传中</span>' +
                '                </div>' +
                '                <div class="ux-file-msgbox">' +
                '                    <span style="color: red;">上传失败</span>' +
                '                    <span class="ux-file-retry">重试</span>' +
                '                </div>' +
                '            </div>' +
                '            <div class="ux-file-flag">' +
                '                <span class="ux-file-complete ecmp-info-finish"></span>' +
                '                <span class="ux-file-delete ecmp-info-error"></span>' +
                '            </div>' +
                '        </div>';
        }
        $(".ux-file-list", this.dom).append(html);
    },
    getSizeText: function (size) {
        //小于1K
        if (size < 1024) {
            return size + "B";
        }
        //小于1M
        else if (size < 1048576) {
            return (size / 1024).toFixed(1) + "K";
        }
        //小于1G
        else {
            return (size / 1048576).toFixed(1) + "M";
        }
    },
    getTypeIcon: function (name, type,fromUpload) {
        if (type.indexOf("image") != -1) {
            if(fromUpload){
                return "ecmp-info-img"
            }else{
                return "";
            }
        }
        var tmp = name.split(".");
        var suffix = tmp.length > 0 ? tmp[tmp.length - 1] : "";
        var iconCss;
        switch (suffix.toLowerCase()) {
            case "pdf":
                iconCss = "ecmp-info-pdf";
                break;
            case "doc":
            case "docx":
                iconCss = "ecmp-info-word";
                break;
            case "xls":
            case "xlsx":
            case "csv":
                iconCss = "ecmp-info-excel";
                break;
            case "ppt":
            case "pptx":
                iconCss = "ecmp-info-ppt";
                break;
            case "zip":
            case "rar":
            case "7z":
                iconCss = "ecmp-info-compress";
                break;
            case "txt":
                iconCss = "ecmp-info-text";
                break;
            case "jpg":
            case "jpeg":
            case "png":
            case "bmp":
            case "gif":
                if(fromUpload){
                    iconCss = "ecmp-info-img"
                }else {
                    iconCss = "";
                }
                break;
            default:
                iconCss = "ecmp-info-otherformat";
        }
        return iconCss;
    },
    remove: function () {
        this.win.remove();
    }
});/**
 * *************************************************************************************************
 * <br>
 * 实现功能：
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 版本          变更时间             变更人                     变更原因
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 1.0.00      2017/7/17 15:51      陈飞(fly)                    新建
 * <br>
 * *************************************************************************************************<br>
 */
EUI.ViewFile = function (options) {
    return new EUI.file.ViewFile(options);
};
EUI.file.ViewFile = EUI.extend(EUI.UIComponent, {
    renderTo: null,
    files: null,
    baseUrl: "",
    listUrl: "getEntityDocumentInfos",
    downLoadUrl: "download",
    previewUrl: "preview",
    entityId: null,
    index: 0,
    showFileId: null,

    initComponent: function () {
        EUI.file.ViewFile.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'ViewFile';
    },
    initDom: function () {
    },
    render: function () {
        this.container = EUI.Container({
            renderTo: this.renderTo,
            isOverFlow: false,
            html: this._initHtml()
        });
        this.dom = this.container.content;
        this.titleDom = $(".ux-fileview-name", this.dom);
        this.imgbox = $(".ux-fileview-imgbox", this.dom);
        this.fileDom = $(".ux-fileview-filebox", this.dom);
        this.downloadIframe = $(".ux-download-iframe", this.dom);
        this.onlineViewDom = $(".ux-online-box", this.dom);
        var height = this.dom.height() - 43;
        this.imgbox.height(height);
        if (!this.files) {
            this.getFiles();
        } else {
            this.showFiles()
        }
        this.addEvents();
    },
    _initHtml: function () {
        return '<div style="height: 100%; padding: 0; margin: 0;position: relative;"><div class="ux-fileview-navbar">' +
            '    <div class="ux-fileview-name">' +
            '    </div>' +
            '    <div class="ux-fileview-right">' +
            '        <span class="icon disable ecmp-common-fullscreen"></span>' +
            '        <span class="icon disable ecmp-common-rotate"></span>' +
            '        <span class="icon disable ecmp-common-back" style="font-size: 28px;"></span>' +
            '        <span class="icon disable ecmp-common-forward"></span>' +
            '        <span class="spaceline"></span>' +
            '        <span class="icon ecmp-common-download"></span>' +
            '    </div>' +
            '</div>' +
            '<div class="ux-fileview-filebox" style="width:100%;position: absolute;top: 44px;left: 0px;bottom: 0px;display: block;"></div>' +
            '<div class="ux-fileview-imgbox"></div>' +
            '<iframe class="ux-download-iframe" style="display: none;"></iframe>' +
            '<div class="ux-online-box"></div></div>';
    },
    getFiles: function () {
        var g = this;
        EUI.Store({
            url: this.baseUrl + this.listUrl,
            params: {
                entityId: this.entityId
            },
            success: function (status) {
                g.files = status.data;
                g.showFiles();
            }, failure: function (status) {
                EUI.ProcessStatus(status);
            }
        });
    },
    showFiles: function () {
        if (this.files.length == 0) {
            return;
        }
        for (var i = 0; i < this.files.length; i++) {
            var file = this.files[i];
            if (this.showFileId == file.id) {
                this.index = i;
                this.titleDom.html(file.fileName);
            }
            var tmps = file.fileName.split(".");
            var type = tmps.length > 0 ? tmps[tmps.length - 1] : "";
            var url = this.baseUrl + this.previewUrl + "?docId=" + file.id;
            switch (type.toLowerCase()) {
                case "jpg":
                case "jpeg":
                case "png":
                case "bmp":
                case "gif":
                    var img;
                    if (i == this.index) {
                        $(".ecmp-common-fullscreen", this.dom).removeClass("disable");
                        $(".ecmp-common-rotate", this.dom).removeClass("disable");
                    }
                    img = $("<img />").attr("id",file.id);
                    this.imgbox.append(img);
                    EUI.util.getFileBlob(img,url,this.showFileId != file.id);
                    break;
                case "pdf":
                case "docx":
                case "doc":
                case "txt":
                case "xls":
                case "xlsx":
                    var file;
                    if (i == this.index) {
                        $(".ecmp-common-fullscreen", this.dom).removeClass("disable");
                        $(".ecmp-common-rotate", this.dom).removeClass("disable");
                    }
                    var fileUrl =_basePath+"/edm-service/preview/"+ file.id+"?rand="+Date.now();
                    file = $('<iframe id="'+ file.id + '" frameborder="0" src="'+ fileUrl + '" style="display: none;margin: 0; padding: 0; width: 100%; height:100%; border-style: none;" scrolling="no"></iframe>');
                    this.fileDom.append(file);
                    break;
                // case "js":
                //     this.onlineViewDom.append('<embed id="' + file.id + '" src="' + url + '" style="width: 100%;border: none;display: none;"></embed>')
                //     break;
                default:
                    var other;
                    if (i == this.index) {
                        $(".ecmp-common-fullscreen", this.dom).removeClass("disable");
                        $(".ecmp-common-rotate", this.dom).removeClass("disable");
                    }
                    other = $("<span id='" + file.id + "' class=''" + this.getTypeIcon(type) + "'>");
                    this.fileDom.append(other);
                    break;
            }
        }
        if (this.files.length > 1) {
            $(".ecmp-common-forward", this.dom).removeClass("disable");
        }
        if (this.index > 0) {
            $(".ecmp-common-back", this.dom).removeClass("disable");
        }
        if (!this.showFileId) {
            this.showFileId = this.files[0].id;
        }
        this.showFile();
        this.addImageEvent();
    },
    addImageEvent: function () {
        var g = this;
        $("img", this.imgbox).mousewheel(function (event, delta) {
            var dir = delta > 0 ? 'Up' : 'Down';
            var height = g.imgbox.height();
            if (dir == 'Up') {
                g.imgbox.height(height * 1.1);
            } else {
                g.imgbox.height(height / 1.1);
            }
            return false;
        });
        var ix, iy, x, y, imgDom;
        $("img", this.imgbox).bind({
            mousedown: function (event) {
                $(this).css({cursor: "move", position: 'absolute'}).attr("dragging", "1");
                var e = event || window.event;
                x = e.pageX;
                y = e.pageY;
                ix = $(this).position().left;
                iy = $(this).position().top;
                imgDom = $(this);
                return false;
            }
        });
        $(document).bind({
            mousemove: function (event) {
                if (!imgDom) {
                    return;
                }
                var dragging = imgDom.attr("dragging");
                if (dragging == "1") {
                    var e = event || window.event;
                    var moveX = ix + e.pageX - x;
                    var moveY = iy + e.pageY - y;
                    imgDom.css({
                        "left": moveX,
                        "top": moveY
                    });
                }
                return false;
            },
            mouseup: function (e) {
                imgDom && imgDom.css("cursor", "auto").attr("dragging", "0");
                return false;
            }
        });
    },
    showFile: function () {
        var file = this.files[this.index];
        this.titleDom.html(file.fileName);
        var tmps = file.fileName.split(".");
        var type = tmps.length > 0 ? tmps[tmps.length - 1] : "";
        switch (type.toLowerCase()) {
            case "jpg":
            case "jpeg":
            case "png":
            case "bmp":
            case "gif":
                $("#" + file.id, this.dom).show().parent().css("display", "block");
                $(".ecmp-common-fullscreen", this.dom).removeClass("disable");
                $(".ecmp-common-rotate", this.dom).removeClass("disable");
                break;
            // case "pdf":
            //     $("#" + file.id, this.dom).show().parent().css("visibility","visible");
            //     $(".ecmp-common-fullscreen", this.dom).addClass("disable");
            //     $(".ecmp-common-rotate", this.dom).addClass("disable");
            //     break;
            default:
                $("#" + file.id, this.dom).show().parent().css("display", "block");
                // $("#" + file.id, this.dom).attr("class", this.getTypeIcon(type));
                $(".ecmp-common-fullscreen", this.dom).addClass("disable");
                $(".ecmp-common-rotate", this.dom).addClass("disable");
                break;
        }
        this.showFileId = file.id;
    }
    ,
    getTypeIcon: function (type) {
        var iconCss;
        switch (type.toLowerCase()) {
            case "pdf":
                iconCss = "ecmp-info-pdf";
                break;
            case "doc":
            case "docx":
                iconCss = "ecmp-info-word";
                break;
            case "xls":
            case "xlsx":
                iconCss = "ecmp-info-excel";
                break;
            case "ppt":
            case "pptx":
                iconCss = "ecmp-info-ppt";
                break;
            case "zip":
            case "rar":
                iconCss = "ecmp-info-compress";
                break;
            case "txt":
                iconCss = "ecmp-info-text";
                break;
            default:
                iconCss = "ecmp-info-otherformat";
        }
        return iconCss;
    }
    ,
    addEvents: function () {
        var g = this;
        $(".ecmp-common-fullscreen", this.dom).bind("click", function () {
            var height = g.dom.height() - 43;
            g.imgbox.height(height);
        });
        $(".ecmp-common-rotate", this.dom).bind("click", function () {
            var transform = $("#" + g.showFileId, g.dom).attr("rotate");
            var rotate = 0;
            if (transform) {
                rotate = parseInt(transform);
            }
            rotate += 90;
            $("#" + g.showFileId, g.dom).css("transform", "rotate(" + rotate + "deg)").attr("rotate", rotate);
        });
        $(".ecmp-common-back", this.dom).bind("click", function () {
            if (g.index == 0) {
                return;
            }
            g.index--;
            if (g.index == 0) {
                $(this).addClass("disable");
            } else {
                $(this).removeClass("disable");
            }
            $(".ecmp-common-forward", this.dom).removeClass("disable");
            $("#" + g.showFileId, g.dom).hide().parent().css("display", "none");
            g.showFile();
        });
        $(".ecmp-common-forward", this.dom).bind("click", function () {
            if (g.index == g.files.length - 1) {
                return;
            }
            g.index++;
            if (g.index == g.files.length - 1) {
                $(this).addClass("disable");
            } else {
                $(this).removeClass("disable");
            }
            $(".ecmp-common-back", this.dom).removeClass("disable");
            $("#" + g.showFileId, g.dom).hide().parent().css("display", "none");
            g.showFile();
        });
        $(".ecmp-common-download", this.dom).bind("click", function () {
            g.download();
        });
        $(".ecmp-common-more", this.dom).bind("click", function () {
            window.open()
        });
    }
    ,
    download: function () {
        var file = this.files[this.index];
        EUI.util.downloadFile(this.baseUrl + this.downLoadUrl + "?docId=" + file.id);
        // this.downloadIframe.attr("src", this.baseUrl + this.downLoadUrl + "?docId=" + file.id);
    },
    onResize: function () {
        this.container.onResize();
        var height = this.dom.height() - 43;
        // this.iframe.height(height);
        this.imgbox.height(height);
    }
    ,
    remove: function () {
        this.container.remove();
    }
})
;/**
 * 流程启动组件
 */
EUI.FlowStart = function (options) {
    return new EUI.flow.FlowStart(options);
};
EUI.flow.FlowStart = EUI.extend(EUI.CustomUI, {
    data: null,
    businessId: null,
    businessModelCode: null,
    typeId: null,
    flowDefKey: null,
    url: null,
    flowWebUrl: '/flow-web',
    instancyStatusq: false,
    afterSubmit: null,
    afterCancel: null,
    instancyStatus: null,
    ifPoolTask: false,
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
                if (!result.data.flowTypeList && !result.data.nodeInfoList) {
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
                } else if (result.data.flowTypeList.length < 1) {
                    var status = {
                        msg: "未找到符合条件的流程定义",
                        success: false,
                        showTime: 4
                    };
                    EUI.ProcessStatus(status);
                    return;
                }
                if (result.data.flowTypeList) {
                    var flowTypeList = result.data.flowTypeList;
                    //启动流程选人----固化流程处理
                    g.data = result.data;
                    g.showWind();
                    if(!g.data.solidifyFlow){
                        g.showChooseUser();
                    }else{
                        //固化流程选人
                        g.showAllNodeChooseUser();
                    }
                    g.addEvents();
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

        if (!this.data.flowTypeList[0].flowDefKey) {
            title = "此流程未定义";
        } else {
            var defaultTitleName = this.data.flowTypeList[0].flowDefName;
            var defaultTitleCode = this.data.flowTypeList[0].flowDefKey;
            title = "[" + defaultTitleCode + "]-" + defaultTitleName;
        }
        var item = [];
        if (this.data.flowTypeList.length == 1) {
            item = [this.initWindTbar(g.data), this.initWindContainer(400)]
        } else {
            item = [this.initWindTbar(g.data), this.initWindContainer(360)]
        }
        //固化流程处理
        g.win = EUI.Window({
            title: title,
            width: 700,
            height: 400,
            id: "flowStartWind",
            isOverFlow: false,
            padding: 0,
            items: item,
            showClose: false,
            buttons: [{
                title: "配置执行人",
                selected: true,
                id: "configUserBtn",
                hidden: !g.data.solidifyFlow,
                handler: function () {
                    g.configAllNodeUser(g.data.flowDefinationId);
                }
            },{
                title: "提交",
                selected: true,
                id: "submitBtn",
                hidden: g.data.solidifyFlow,
                handler: function () {
                    g.submit();
                }
            },{
                title: "取消",
                handler: function () {
                    g.winRemove();
                    g.afterCancel && g.afterCancel.call(g);
                }
            }]
        });
    },
    winRemove: function(){
        var configBtn = EUI.getCmp("configUserBtn");
        var submitBtn = EUI.getCmp("submitBtn");
        configBtn&&configBtn.remove();
        submitBtn&&submitBtn.remove();
        this.win.remove();
    },
    addEvents: function () {
        var g = this;
        //执行人选择
        $(".flow-user-item").die().live("click", function () {
            var type = $(this).attr("type").toLowerCase();
            if (type === "common" || type === "approve" || type === "servicetask" || type === "receivetask") {
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
            var currentChooseDivIndex = $(this).parent().attr("index");
            var currentChooseTaskType = $(this).parent().children().eq(0).attr("flowtasktype");
            g.showChooseExecutorWind(currentChooseDivIndex, currentChooseTaskType);
            return false;
        });
        //删除选择的执行人
        $(".ecmp-flow-delete").die().live("click", function () {
            $(this).parent().remove();
        });
    },
    showChooseFlowTypeAndExecutorWind: function (flowTypeList) {
        var g = this;
        EUI.Window({
            title: "选择流程类型",
            width: 600,
            layout: "border",
            padding: 0,
            items: [this.initWindTbar(flowTypeList), this.initWindContainer()]
        });
    },
    initWindTbar: function (data) {
        var g = this;
        g.typeId = data.flowTypeList[0].id;
        g.flowDefKey = data.flowTypeList[0].flowDefKey;
        var flowTypeList = data.flowTypeList;
        return {
            xtype: "ToolBar",
            region: "north",
            height: 40,
            padding: 8,
            isOverFlow: false,
            border: false,
            items: [{
                xtype: "ComboBox",
                field: ["id"],
                width: 250,
                labelWidth: 100,
                name: "name",
                id: "flowTypeId",
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
                            if (!result.data.nodeInfoList) {
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
                                var titleName = result.data.flowTypeList[0].flowDefName;
                                var titleCode = result.data.flowTypeList[0].flowDefKey;
                                EUI.getCmp("flowStartWind").setTitle("[" + titleCode + "]-" + titleName);
                                g.flowDefKey = titleCode;
                                $("#attachment-remark").val("");
                                //启动流程选人----固化流程处理
                                if(!g.data.solidifyFlow){
                                    //配置执行人和提交流程按钮控制
                                    EUI.getCmp("configUserBtn").hide();
                                    EUI.getCmp("submitBtn").show();
                                    $(".flowstart-node-box").remove();
                                    $(".chooseExecutor").html("");
                                    g.showChooseUser();
                                }else{
                                    //配置执行人和提交流程按钮控制
                                    EUI.getCmp("configUserBtn").show();
                                    EUI.getCmp("submitBtn").hide();
                                    g.showAllNodeChooseUser();
                                }
                            }
                        }, failure: function (result) {
                            myMask.hide();
                        }
                    });
                }
            }, {
                xtype: "RadioBoxGroup",
                title: "紧急状态",
                labelWidth: 100,
                name: "instancyStatus",
                id: "instancyStatus",
                hidden: true,
                defaultConfig: {
                    labelWidth: 100
                },
                items: [{
                    title: "普通",
                    name: "general",
                    onChecked: function (value) {
                        g.instancyStatus = "general";
                    }
                }, {
                    title: "紧急",
                    name: "instancy",
                    onChecked: function (value) {
                        g.instancyStatus = "instancy";
                    }
                }]
            }]
        };
    },
    initWindContainer: function (height) {
        var g = this;
        return {
            xtype: "Container",
            region: "center",
            id: "containerId",
            height: height,
            border: true,
            html: '<div class="chooseExecutor"></div>'+
                '<div style="margin: 4px;">' +
                    '<div class="flowstart-excutor-title" style="border: 1px solid #eee;">附加说明</div>' +
                    '<textarea id="attachment-remark" class="ux-field-textarea" rows="3" style="width: 99%;border: 1px solid #ddd; border-top: none;"  placeholder="请填写附加说明"/>' +
                '</div>'

        };
    },
    //跳转到固化流程页面，并关闭前一个页面
    configAllNodeUser: function(flowDefinationId){
            var g = this;
            var url = this.flowWebUrl;
            //附加说明
            var remark = $("#attachment-remark").val()||null;
            localStorage.setItem("remark",remark);
            //待跳转页签信息
            var tab = {
                title: "配置执行人",
                url:  url+ "/design/configUser?id=" + flowDefinationId+"&ifPoolTask="+g.ifPoolTask,
                id: flowDefinationId+"_configUser"
            };
            this.winRemove();
            if (window.top.homeView) {
                //获取当前页签信息
                var frame = window.self.frameElement;
                var $iframe = $(window.frameElement);
                var title = $iframe.parents(".ux-tab-content")
                    .prev(".ux-tab-header")
                    .find("li[tabid='"+$iframe[0].id+"']")
                    .attr("title");
                if(title === '' || !title){
                    title = window.parent.document.getElementsByClassName(
                        "ant-tabs-tab-active"
                    )[0].innerText;
                }
                var id = frame.id;
                var url = frame.src;
                var originStartTab = {
                    title: title,
                    url: url,
                    id: id
                };
                localStorage.setItem("originStartTab",JSON.stringify(originStartTab));
                window.top.flowStart = this;


                if(window.top.homeView && (typeof window.top.homeView.addTab) === 'function'){
                    window.top.homeView.addTab(tab);
                    window.top.homeView.getTabPanel().close(id);
                }else {
                    var item = { id:id };
                    var closeData = { tabAction: 'close', item:item };
                    window.parent.postMessage(closeData, '*');
                    var openItem = {
                        id:tab.id,
                        name:tab.title,
                        featureUrl:tab.url
                    }
                    var openData = { tabAction: 'open',item:openItem};
                    window.parent.postMessage(openData, '*');
                }
            }else{
                window.flowStart = this;
                window.open(tab.url);
            }
    },
    //固化流程选人界面
    showAllNodeChooseUser: function(){
        var node = this.data.nodeInfoList[0];
        if(node&&node.type.toLowerCase() === "pooltask"){
            this.ifPoolTask = true;
        }
        $(".flowstart-node-box").remove();
        var styleStr = "display: flex;justify-content: center; color: #ed2727; font-size: 18px;";
        $(".chooseExecutor").html("").append("<div id='solidifyFlowTip' style='"+styleStr+"'>温馨提示：请点击[配置执行]人按钮,为固化流程各节点配置执行人</div>")
    },
    showChooseUser: function () {
        var g = this;
        g.instancyStatusq =false;
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
        if(data.allowChooseInstancy){
            EUI.getCmp("instancyStatus").show();
        }else{
            EUI.getCmp("instancyStatus").hide();
        }

        for (var i = 0; i < data.length; i++) {
            var node = data[i];
            var nodeType = "普通任务";
            var iconCss = "choose-radio";
            var flowTaskType = "";
            g.ifPoolTask = false;
            if (node.flowTaskType) {
                flowTaskType = node.flowTaskType.toLowerCase();
            }
            if (node.uiType === "radiobox") {
                iconCss = "choose-radio";
            } else if (node.uiType === "checkbox") {
                iconCss = "choose-checkbox";
            }

            if (node.type && node.type.toLowerCase() === "pooltask") {
                nodeType = this.poolTaskText;
                var nodeHtml = '<div class="flowstart-node-box" index="' + i + '">' +
                    '<div class="flowstart-excutor-title" title="' + node.name + '-[' + nodeType + ']">' + node.name + '-[' + nodeType +
                    ']</div><div class="flow-excutor-content">';
                nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '">' +
                    // '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">' + this.poolTaskStartDecText + '</div>' +
                    '</div>';
                nodeHtml += "</div></div>";
                $(".chooseExecutor").after(nodeHtml);
                g.ifPoolTask = true;
                return;
            }

            if (flowTaskType === "singlesign") {
                nodeType = this.singleSignTaskText;
            } else if (flowTaskType === "approve") {
                nodeType = this.approveTaskText;
            } else if (flowTaskType === "countersign") {
                nodeType = this.counterSignTaskText;
            } else if (flowTaskType === "paralleltask") {
                nodeType = this.ParallelTaskText;
            } else if (flowTaskType === "serialtask") {
                nodeType = this.SerialTaskText;
            } else if (flowTaskType === "servicetask") {
                nodeType = this.serviceTaskText;
            } else if (flowTaskType === "receivetask") {
                nodeType = this.receiveTaskText;
            }
            if (node.uiUserType === "AnyOne") {
                var html = g.showAnyContainer(data[i], i, nodeType);
                $(".chooseExecutor").append(html);
                continue;
            }
            var nodeHtml = '<div class="flowstart-node-box" index="' + i + '">' +
                '<div class="flowstart-excutor-title" title="' + node.name + '-[' + nodeType + ']">' + node.name + '-[' + nodeType +
                ']<div class="urgentchoose-icon urgentchoose-radio" style="top: 4px;position: relative;"></div><span class="urgentchoose-span">'+ "紧急" +'</span></div><div class="flow-excutor-content">';
            if (iconCss == "choose-radio") {
                var itemdom = $(g.showUserItem(node, nodeHtml, iconCss, nodeType));
                $(".chooseExecutor").after(itemdom);
                if (node.executorSet && node.executorSet.length == 1) {
                    $(".flow-user-item:first", itemdom).addClass("select");
                }
            }
            else if (iconCss == "choose-checkbox") {
                var itemdom = $(g.showUserItem(node, nodeHtml, iconCss, nodeType));
                $(".chooseExecutor").after(itemdom);
                $(".flow-user-item", itemdom).addClass("select");
                // $(".urgentchoose-radio", itemdom).addClass("select");
            }
            if(!node.allowChooseInstancy || node.allowChooseInstancy == false){
                $(".urgentchoose-radio").css("display", "none");
                $(".urgentchoose-span").css("display", "none");
            }
            $(".urgentchoose-icon").die().live("click", function () {
                if(g.instancyStatusq == false) {
                    g.instancyStatusq = true;
                    $(this).removeClass("urgentchoose-radio");
                    $(this).addClass("select-urgentchoose-radio");
                    $(".urgentchoose-span").css("color","red");
                }else {
                    g.instancyStatusq = false;
                    $(this).removeClass("select-urgentchoose-radio");
                    $(this).addClass("urgentchoose-radio");
                    $(".urgentchoose-span").css("color","black");
                }

            });
        }
    },
    showAnyContainer: function (data, i, nodeTypeText) {
        var g = this;
        var html = "";
        var node = data;
        var iconCss = ".ecmp-flow-delete";
        var nodeHtml = '<div class="flowstart-node-box" index="' + i + '">' +
            '<div class="flowstart-excutor-title" flowTaskType="' + node.flowTaskType + '">' + node.name + '-[' + nodeTypeText +
            ']</div><div class="flowstart-excutor-content2">';
        nodeHtml += "</div>" +
            '<div class="flowstartchoose-btn">选择</div>' +
            "</div>";
        return html += nodeHtml;
    }
    ,
    showUserItem: function (node, nodeHtml, iconCss, nodeType) {
        var html = "";
        if (!(node.type && node.type.toLowerCase() === "pooltask") && (!node.executorSet || node.executorSet.length < 1)) {
            var status = {
                msg: "执行人未找到",
                success: false,
                showTime: 4
            };
            EUI.ProcessStatus(status);
            return;
        }
        for (var j = 0; j < node.executorSet.length; j++) {
            var item = node.executorSet[j];
            if (!item.positionId) {
                nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">姓名：' + item.name +
                    '，组织机构：' + item.organizationName + '，编号：' + item.code + '</div>' +
                    '</div>';
            } else {
                nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">姓名：' + item.name + '，岗位：' + item.positionName +
                    '，组织机构：' + item.organizationName + '，编号：' + item.code + '</div>' +
                    '</div>';
            }
        }
        nodeHtml += "</div></div>";
        return html += nodeHtml;
    }
    ,
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
                callActivityPath: data.callActivityPath,
                instancyStatus: this.instancyStatusq
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
        var g = this;
        if (g.ifPoolTask) {
            return true;
        }
        var nodeDoms = $(".flowstart-node-box");
        if (nodeDoms.length == 0) {
            return false;
        }
        for (var i = 0; i < nodeDoms.length; i++) {
            var nodeDom = $(nodeDoms[i]);
            var index = nodeDom.attr("index");
            var data = this.data.nodeInfoList[index];
            var itemDoms = $(".select", nodeDom);
            if (itemDoms.length == 0) {
                EUI.ProcessStatus({
                    success: false,
                    msg: "请选择[" + data.name + "]的执行人"
                });
                return false;
            }
        }
        if (this.data.nodeInfoList.allowChooseInstancy && g.instancyStatus != "general" && g.instancyStatus != "instancy") {
            EUI.ProcessStatus({
                success: false,
                msg: "请选择紧急状态！"
            });
            return false;
        }
        return true;
    }
    ,
    submit: function () {
        var g = this;
        if (!g.checkUserValid()) {
            return;
        }
        //附加说明
        var remark = $("#attachment-remark").val()||null;
        var mask = EUI.LoadMask({
            msg: "正在启动，请稍候..."
        });
        EUI.Store({
            url: g.url,
            params: {
                businessKey: g.businessId,
                businessModelCode: g.businessModelCode,
                typeId: g.typeId,
                flowDefKey: g.flowDefKey,
                opinion: remark,//附加说明
                taskList: g.ifPoolTask ? "anonymous" : JSON.stringify(this.getSelectedUser()),
                anonymousNodeId: g.ifPoolTask ? this.getAnonymousNodeId() : ""
            },
            success: function (status) {
                mask.hide();
                var status = {
                    msg: "启动成功",
                    success: true
                };
                EUI.ProcessStatus(status);
                g.winRemove();
                g.afterSubmit && g.afterSubmit.call(g);
            },
            failure: function (response) {
                mask.hide();
                EUI.ProcessStatus(response);
            }
        });
    }
    ,
    getAnonymousNodeId: function () {
        var nodeDoms = $(".flowstart-node-box");
        var nodeDom = $(nodeDoms[0]);
        var index = nodeDom.attr("index");
        var data = this.data.nodeInfoList[index];
        return data.id;
    }
    ,
    showChooseExecutorWind: function (currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var isChooseOneTitle;
        var saveBtnIsHidden;
        if (currentChooseTaskType == "common" || currentChooseTaskType == "approve") {
            isChooseOneTitle = "选择任意执行人【可双击选择】";
            saveBtnIsHidden = true;
        } else {
            isChooseOneTitle = "选择任意执行人";
            saveBtnIsHidden = false;
        }
        g.chooseAnyOneWind = EUI.Window({
            title: isChooseOneTitle,
            width: 720,
            layout: "border",
            height: 380,
            padding: 5,
            itemspace: 0,
            items: [this.initChooseUserWindLeft(), this.InitChooseUserGrid(currentChooseDivIndex, currentChooseTaskType)],
            buttons: [{
                title: "确定",
                selected: true,
                hidden: false,
                handler: function () {
                    var selectRow = EUI.getCmp("chooseUserGridPanel").getSelectRow();
                    if (typeof(selectRow) == "undefined") {
                        return;
                    }
                    if (saveBtnIsHidden) {
                        var rowData = selectRow;
                        var html = '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + rowData.id + '">' +
                            '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
                            '<div class="excutor-item-title">姓名：' + rowData["userName"] +
                            '，组织机构：' + rowData["organization.name"] + '，编号：' + rowData.code + '</div>' +
                            '</div>';
                        $("div[index=" + currentChooseDivIndex + "]").children().eq(1).html(html);
                    } else {
                        g.addChooseUsersInContainer(selectRow, currentChooseDivIndex, currentChooseTaskType);
                    }
                    g.chooseAnyOneWind.close();
                }
            },{
                title: "取消",
                handler: function () {
                    g.chooseAnyOneWind.remove();
                }
            }]
        });
    }
    ,
    initChooseUserWindLeft: function (mask) {
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
    }
    ,
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
    }
    ,
    initChooseUserWindTree: function () {
        var g = this;
        var mask = EUI.LoadMask({msg: "正在加载，请稍候"});
        return {
            xtype: "TreePanel",
            region: "center",
            id: "chooseAnyUserTree",
            url: g.flowWebUrl + "/flowDefination/listAllOrgs",
            border: true,
            searchField: ["name"],
            showField: "name",
            style: {
                "background": "#fff"
            },
            onSelect: function (node) {
                g.selectedOrgId = node.id;
                var chooseUserGridPanel = EUI.getCmp("chooseUserGridPanel").setGridParams({
                    url: g.flowWebUrl + "/customExecutor/listAllUser",
                    loadonce: true,
                    datatype: "json",
                    postData: {
                        organizationId: g.selectedOrgId
                    }
                }, true);
                EUI.getCmp("chooseUserGridPanel").data = null;
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
    }
    ,
    InitChooseUserGrid: function (currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var isShowMultiselect;
        if (currentChooseTaskType == "common" || currentChooseTaskType == "approve") {
            isShowMultiselect = false;
        } else {
            isShowMultiselect = true;
        }
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
                        var html = "";
                        var rowData = EUI.getCmp("chooseUserGridPanel").grid.jqGrid('getRowData', rowid);
                        html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + rowData.id + '">' +
                            '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
                            '<div class="excutor-item-title">姓名：' + rowData["userName"] +
                            '，组织机构：' + rowData["organization.name"] + '，编号：' + rowData.code + '</div>' +
                            '</div>';
                        $("div[index=" + currentChooseDivIndex + "]").children().eq(1).html(html);
                        g.chooseAnyOneWind.close();
                    }
                }
            }]
        }
    }
    ,
    addChooseUsersInContainer: function (selectRow, currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var html = "";
        var selectedUser = [];
        $("div[index=" + currentChooseDivIndex + "]").children().eq(1).children().each(function (index, domEle) {
            selectedUser.push(domEle.id)
        });
        for (var j = 0; j < selectRow.length; j++) {
            var item = selectRow[j];
            if (!g.itemIdIsInArray(item.id, selectedUser)) {
                html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
                    '<div class="excutor-item-title">姓名：' + item["userName"] +
                    '，组织机构：' + item["organization.name"] + '，编号：' + item.code + '</div>' +
                    '</div>';
            }
        }
        $("div[index=" + currentChooseDivIndex + "]").children().eq(1).append(html);
    }
    ,
    itemIdIsInArray: function (id, array) {
        for (var i = 0; i < array.length; i++) {
            if (id == array[i]) {
                return true;
            }
        }
        return false;
    }
})
;/**
 * *************************************************************************************************
 * <br>
 * 实现功能：
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 版本          变更时间             变更人                     变更原因
 * <br>
 * ------------------------------------------------------------------------------------------------
 * <br>
 * 1.0.00      2017/5/24 13:55      陈飞(fly)                    新建
 * <br>
 * *************************************************************************************************<br>
 */
EUI.FlowApprove = function (options) {
    options.instanceId = EUI.util.getUrlParam("instanceId");
    options.busId = EUI.util.getUrlParam("id");
    options.taskId = EUI.util.getUrlParam("taskId");
    options.trustState = EUI.util.getUrlParam("trustState");
    $("body").css({
        "min-width": "1260px",
        "overflow": "auto"
    });
    $("html").css({
        "overflow": "auto"
    });
    return new EUI.flow.FlowApprove(options);
};
EUI.flow.FlowApprove = EUI.extend(EUI.CustomUI, {
    trustState:null,
    renderTo: null,
    busId: null,
    extraBusId: null,
    taskId: null,
    desionType: 0,//0表示单选、1多选，2不需要选择
    instanceId: null,
    iframeHeight: 600,
    iframeTitle: null,
    pageUrl: null,
    baseUrl: null,
    manualSelected: false,//是否是人工选择的网关类型
    goNext: null,
    iframe: null,
    fromToDo:"1",//fromToDo=="1"：来自待办         fromToDo=="2"：来自抢单
    flowWebUrl: "/flow-web",
    counterApprove: "",//会签审批
    toChooseUserData: null,
    loadOverTime:null,
    unNeedSelectExecutor: true,
    solidifyFlow: false, //是否固化流程
    initComponent: function () {
        this.initUrl();
        EUI.TabPanel({
            renderTo: this.renderTo,
            isOverFlow: false,
            autoScroll: false,
            showTabMenu: false,
            items: [
                {
                    title: "流程处理页面",
                    iframe: false,
                    closable: false,
                    isOverFlow: true,
                    html: this.initHtml()
                },
                {
                    title: "流程历史",
                    id: "historyPage",
                    iframe: false,
                    closable: false,
                    isOverFlow: true,
                    items: [{
                        xtype: "FlowHistoryTab",
                        isOverFlow: false,
                        businessId: this.busId,
                        instanceId: this.instanceId
                    }]
                }
            ]
        });
        /*EUI.Container({
            renderTo: this.renderTo,
            html: this.initHtml()
        });*/
        this.getHeadData();
        this.getNodeInfo();
        this.addEvents();
        this.iframe = $(".flow-iframe")[0].contentWindow;
        if(!this.loadOverTime){
            this.loadOverTime = new Date().getTime();
        }
    },
    initUrl: function () {
        if (this.pageUrl.indexOf("?") == -1) {
            if(this.extraBusId){
                this.pageUrl += "?id=" + this.extraBusId;
            }else {
                this.pageUrl += "?id=" + this.busId;
            }

        } else {
            if(this.extraBusId){
                this.pageUrl += "&id=" + this.extraBusId;
            }else{
                this.pageUrl += "&id=" + this.busId;
            }

        }
        this.pageUrl = EUI.addTokenToUrl(this.pageUrl);
    },
    initHtml: function () {
        var firstHtml = '<div class="flow-approve">' +
                this.initTopHtml() +
                this.initOperateHtml() +
                this.initRemarkHtml()+
                this.initFrameHtml() +
            '</div>';
        return firstHtml + this.initChooseUserHtml();
    },
    //附加说明
    initRemarkHtml: function(){
        var style = "display: flex;align-items: center;border-top: 1px solid #ddd; padding: 10px;";
        return '<div style="'+style+'">' +
                 '<span style="font-size: 18px;font-weight: bold;min-width: 100px">工作说明：</span>' +
                 '<div id="attachment-remark" style="word-break: break-word;flex:1; min-height:10px"></div>' +
               '</div>'
    },
    initTopHtml: function () {
        return '<div class="flow-info">' +
            '        <div class="flow-info-item">' +
            '            <div style="width: calc(100% - 20px);">' +
            '               <div class="flow-ordernum" title="'+this.businessUnitText+'">' + this.businessUnitText + '</div>' +
            '                <div class="flow-version"></div>' +
            '            </div>' +
            '            <div style="padding: 0 0 10px 20px;">' +
            '                <div class="flow-info-creater">' + this.docMarkerText + '</div>' +
            '                <div class="flow-info-createtime"></div>' +
            '            </div>' +
            '        </div>' +
            '        <div class="flow-info-item" style="border-left:1px solid #dddddd ;">' +
            '            <div>' +
            '                <div class="flow-info-text">' + this.preExecutorText + '</div>' +
            '                <div class="flow-info-excutor"></div>' +
            '            </div>' +
            '            <div style="padding-top: 0px;">' +
            '                <div class="flow-info-text">' + this.preApprovalOpinionsText + '</div>' +
            '                <div class="flow-info-remark opinion"></div>' +
            '            </div>' +
            '        </div>' +
            '    </div>';
    },
    initOperateHtml: function () {
        var addHtml="";
        if(this.trustState==2){
            addHtml='            <span class=\"flow-btn flow-next-trust\">' + this.nextStepText + '</span>';
        }else{
            addHtml='            <span class=\"flow-btn flow-next\">' + this.nextStepText + '</span>';
        }
        return '<div style="height: 170px;">' +
            '        <div class="flow-decision">' +
            '            <div class="flow-nodetitle">' + this.decisionText + '</div>' +
            '            <div class="flow-decision-box">' +
            '        </div></div>' +
            '        <div class="flow-info-item" style="border-left:1px solid #dddddd;">' +
            '            <div class="flow-deal-opinion"><div class="flow-nodetitle">' + this.handlingSuggestionText + '</div><div id="flow-deal-checkbox"></div></div>' +
            '            <textarea class="flow-remark"></textarea>' +
            addHtml+
            '        </div>' +
            '    </div>';
    },
    //处理意见中的选项框
    initDealCheckBox: function () {
        var g = this;
        g.counterApprove = true;
        var agree = "同意", disagree = "不同意";
        this.approveBoxGroup = EUI.RadioBoxGroup({
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
            afterRender: function () {
                $(".flow-remark").val(agree);
            }
        })
    },
    initFrameHtml: function () {
        var html = '<div>' +
            '        <div class="flow-order-titlebox">' +
            '            <div style="display: inline-block;font-size: 18px;font-weight: bold;">' +
            (this.iframeTitle || this.formDetailText ) +
            '            </div>' +
            '            <div class="close">' + this.collectText + '</div>' +
            '        </div>';
        html += '<iframe class="flow-iframe" src="' + this.pageUrl + '" style="height:' + this.iframeHeight + 'px"></iframe>';
        return html += "</div>";
    },
    initChooseUserHtml: function () {
        return '<div class="flow-chooseuser">' +
            '     <div class="chooseuser-title">' + this.chooseNextExecutorText + '</div>' +
            '     <div class="flow-operate">' +
            '        <div class="flow-btn pre-step">' + this.previousStepText + '</div>' +
            '        <div class="flow-btn submit">' + this.submitText + '</div>' +
            '     </div>' +
            '   </div>';
    },
    addEvents: function () {
        var g = this;
        $(".flow-next").bind("click", function () {
            g.goToNext();
        });
        $(".flow-next-trust").bind("click", function () {
            g.goToNextTrust();
        });
        $(".pre-step").bind("click", function () {
            $(".flow-approve").show();
            $(".flow-chooseuser").hide();
        });

        $(".flow-order-titlebox .close").toggle(function () {
            $(".flow-iframe").hide();
            $(this).text(g.spreadText).addClass("expand");
        }, function () {
            $(".flow-iframe").show();
            $(this).text(g.collectText).addClass("close");
        });
        //决策选择
        $(".flow-decision-item").live("click", function () {
            if (g.desionType == 2) {
                return;
            }
            $(".flow-decision-item").removeClass("select");
            $(this).addClass("select");
            var type = $(this).attr("type");
            if (type.toLowerCase().indexOf("endevent") != -1) {
                g.isEnd = true;
                $(".flow-next").text(g.finishText);
            } else {
                if(g.solidifyFlow){
                    $(".flow-next").text(g.finishText);
                }else{
                    $(".flow-next").text(g.nextStepText);
                }
                g.isEnd = false;
            }
        });
        //执行人选择
        $(".flow-user-item").die().live("click", function () {
            var type = $(this).attr("type").toLowerCase();
            if (type === "common" || type === "approve" || type === "servicetask") {
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
        $(".ecmp-flow-delete").die().live("click", function () {
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
            url: this.baseUrl + "/getApprovalHeaderInfo",
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
        this.solidifyFlow = data.solidifyFlow||false;
        if(this.solidifyFlow){
            $(".flow-next").text(this.finishText);
            $(".flow-next-trust").text(this.finishText);
        }
        //附加说明
        var remark = data.workAndAdditionRemark||"";
        $("#attachment-remark").text(remark);
        $(".flow-ordernum").text(this.businessUnitText + data.businessCode);
        $(".flow-info-creater").text(this.docMarkerText + data.createUser);
        $(".flow-info-excutor").text(data.prUser);
        $(".flow-info-remark").text(data.prOpinion).attr("title",data.prOpinion);
        if(data.currentNodeDefaultOpinion){
            $(".flow-remark").val(data.currentNodeDefaultOpinion);
        }

    },
    getNodeInfo: function () {
        var g = this;
        var mask = EUI.LoadMask({
            msg: this.queryMaskMessageText
        });
        EUI.Store({
            url: this.baseUrl + "/nextNodesInfo",
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
        var html = "",versionCodeText ="";;
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var taskMsg = item.name;
            if(!versionCodeText && item.flowDefVersionCode && item.flowDefVersionCode!=null && item.flowDefVersionCode!="null"){
                versionCodeText = "【流程实例版本："+item.flowDefVersionCode+"】";
            }
            if (item.currentTaskType === "CounterSign") {
                taskMsg += "-【会签任务】";
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="excutor-item-title" ><div class="flow-countersign" title="' + taskMsg + '">' + taskMsg + '</div></div></div>';
                g.initDealCheckBox(); //初始化同意、不同意单选框
                this.desionType = 2;
            } else if (item.currentTaskType === "ParallelTask" && !item.counterSignLastTask) {
                taskMsg += "-【并行任务】";
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="excutor-item-title"><div class="flow-countersign" title="' + taskMsg + '">' + taskMsg + '</div></div></div>';
                this.desionType = 2;
            } else if (item.currentTaskType === "SerialTask" && !item.counterSignLastTask) {
                taskMsg += "-【串行任务】";
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="excutor-item-title"><div class="flow-countersign" title="' + taskMsg + '">' + taskMsg + '</div></div></div>';
                this.desionType = 2;
            } else if (item.currentTaskType === "Approve") {
                taskMsg += "-【审批任务】";
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="excutor-item-title" ><div class="flow-countersign" title="' + taskMsg + '">' + taskMsg + '</div></div></div>';
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
                var lineCodeHtml = "";
                if (item.preLineCode && item.preLineCode !== "null") {
                    lineCodeHtml = '<div class="gateway-code">' + item.preLineCode + '</div>';
                }
                html += '<div class="flow-decision-item" id="' + item.id + '" type="' + item.type.toLowerCase() + '">' +
                    '<div class="choose-icon ' + iconCss + '"></div>' +
                    '<div class="excutor-item-title">' + lineNameHtml + lineCodeHtml +'<div class="approve-arrows-right"></div><div class="flow-decision-text" title="' + item.name + '">' + item.name + '</div></div></div>';

            }
        }

        if (data[0].currentTaskType === "CounterSign" || data[0].currentTaskType === "ParallelTask" || data[0].currentTaskType === "SerialTask") {
            if (!g.solidifyFlow&&data[0].counterSignLastTask) {
                $(".flow-next").text(this.nextStepText);
            } else {
                $(".flow-next").text(this.finishText);
            }
        }
        if (data[0].length === 1 && ( data[0].type.toLowerCase().indexOf("endevent") !== -1 || data[0].flowTaskType.toLowerCase()=="pooltask")){
            $(".flow-next").text(this.finishText);
            g.isEnd = true;
        }

        $(".flow-version").text(versionCodeText);
        $(".flow-decision-box").append(html);
    },
    getDesionIds: function () {
        var includeNodeIds = "";
        var doms;
        if (this.desionType != 2) {
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
                EUI.ProcessStatus({success: false, msg: this.chooseNextExecuteNodeText});
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
                    msg: this.chooseNextExecuteNodeText
                });
                return false;
            }
            if (!flag) {
                return false;
            }
            return true;
        }
        return false;
    },
    setOpinion: function (opinion) {
        $(".flow-remark").val(opinion.trim());
    },
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
    goToNextTrust: function (){
        var g = this;
        if (!this.checkIsValid()) {
            return;
        }
        var mask = EUI.LoadMask({
            msg: this.nowSaveMsgText
        });
        EUI.Store({
            url: _basePath + this.flowWebUrl + "/flowTask/taskTrustToReturn",
            params: {
                taskId: this.taskId,
                opinion: $(".flow-remark").val()
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
    },
    goToNext: function () {
        if (!this.checkIsValid()) {
            return;
        }
        //执行子窗口方法
        if (this.goNext) {
            var approveResult = -1;
            if (this.approveBoxGroup) {
                var result = this.approveBoxGroup.getValue().approved;
                approveResult = result == "true" ? 1 : 0;
            }
            var lineCode = '';//选择路线的代码
            if (this.desionType === 0) {
                var doms = $(".select", ".flow-decision-box");
                if (doms.length !== 1) {
                    EUI.ProcessStatus({success: false, msg: this.chooseNextExecuteNodeText});
                    return false;
                }
                var clickId = doms.attr("id");
                var codeDom = $(".gateway-code", "#" + clickId);
                if(codeDom){
                    var codeText = codeDom.text();
                    lineCode = codeText;
                }
            }
            this.goNext.call(this, {
                approveResult: approveResult,
                lineCode:lineCode,
                opinion: $(".flow-remark").val().trim()
            });
        } else {
            this.doGoToNext();
        }
    }
    ,
    doGoToNext: function () {
        var g = this;
        if (g.isEnd) {
            var endEventId = $(".select", ".flow-decision-box").attr("id");
            g.submit(endEventId);
            return;
        }
        var mask = EUI.LoadMask({
            msg: this.nowSaveMsgText
        });
        EUI.Store({
            url: _basePath + this.flowWebUrl + "/flowClient/getSelectedNodesInfo",
            params: {
                taskId: this.taskId,
                includeNodeIdsStr: this.getDesionIds(),
                approved: this.counterApprove,
                solidifyFlow: this.solidifyFlow
            },
            success: function (status) {
                mask.hide();
                if (g.isEnd) {
                    g.close();
                    return;
                }
                if (status.data == "EndEvent") {
                    var msgbox = EUI.MessageBox({
                        title: g.operationHintText,
                        msg: g.stopFlowMsgText,
                        buttons: [{
                            title: g.okText,
                            selected: true,
                            handler: function () {
                                g.submit(true);
                                msgbox.remove();
                            }
                        },{
                            title: g.cancelText,
                            handler: function () {
                                msgbox.remove();
                            }
                        }]
                    });
                    return;
                }
                if (status.data == "CounterSignNotEnd") {
                    g.submit();
                    return;
                }
                g.toChooseUserData = status.data;
                //固化流程不用显示选人页面
                if(g.solidifyFlow){
                    g.submit();
                }else{
                    g.showChooseUser();
                }
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
        for (var i = 0; i < data.length; i++) {
            var node = data[i];
            var nodeType = this.generalTaskText;
            var iconCss = "choose-radio";
            var flowTaskType = "";
            if (node.flowTaskType) {
                flowTaskType = node.flowTaskType.toLowerCase();
            }
            if (node.uiType === "radiobox") {
                iconCss = "choose-radio";
            } else if (node.uiType === "checkbox") {
                iconCss = "choose-checkbox";
            }
            if (flowTaskType === "singlesign") {
                nodeType = this.singleSignTaskText;
            } else if (flowTaskType === "countersign") {
                nodeType = this.counterSignTaskText;
            } else if (flowTaskType === "approve") {
                nodeType = this.approveTaskText;
            } else if (flowTaskType === "paralleltask") {
                nodeType = this.ParallelTaskText;
            } else if (flowTaskType === "serialtask") {
                nodeType = this.SerialTaskText;
            } else if (flowTaskType === "servicetask") {
                nodeType = this.serviceTaskText;
            } else if (flowTaskType === "receivetask") {
                nodeType = this.receiveTaskText;
            }
            if (node.uiUserType === "AnyOne") {
                var html = g.showAnyContainer(data[i], i, nodeType);
                $(".flow-operate").before(html);
                continue;
            }
            var nodeHtml = '<div class="flow-node-box" index="' + i + '">' +
                '<div class="flow-excutor-title">' + node.name + '-[' + nodeType +
                ']<div class="urgentchoose-icon urgentchoose-radio" style="top: 4px;position: relative;"></div><span class="urgentchoose-span">'+ "紧急" +'</span></div><div class="flow-excutor-content">';
            if (iconCss == "choose-radio") {
                var itemdom = $(g.showUserItem(node, nodeHtml, iconCss, nodeType));
                $(".flow-operate").before(itemdom);
                if (!this.unNeedSelectExecutor && node.executorSet&&node.executorSet.length == 1) {
                    $(".flow-user-item:first", itemdom).addClass("select");
                }
            }
            else if (iconCss == "choose-checkbox") {
                var itemdom = $(g.showUserItem(node, nodeHtml, iconCss, nodeType));
                $(".flow-operate").before(itemdom);
                $(".flow-user-item", itemdom).addClass("select");
            }
            $(".urgentchoose-icon").die().live("click", function () {
                if(g.instancyStatusq == false) {
                    g.instancyStatusq = true;
                    $(this).removeClass("urgentchoose-radio");
                    $(this).addClass("select-urgentchoose-radio");
                    $(".urgentchoose-span").css("color","red");
                }else {
                    g.instancyStatusq = false;
                    $(this).removeClass("select-urgentchoose-radio");
                    $(this).addClass("urgentchoose-radio");
                    $(".urgentchoose-span").css("color","black");
                }
            });

        }
    }
    ,
    showAnyContainer: function (data, i, nodeTypeText) {
        this.unNeedSelectExecutor = false;
        var g = this;
        var html = "";
        var node = data;
        var iconCss = ".ecmp-flow-delete";
        var nodeHtml = '<div class="flow-node-box" index="' + i + '">' +
            '<div class="flow-excutor-title" flowTaskType="' + node.flowTaskType + '">' + node.name + '-[' + nodeTypeText + ']</div>' +
            '<div class="flow-excutor-content2-box">' +
            '<div class="flow-excutor-content2"></div>' +
            '<div class="choose-btn"><span class="btn-icon ecmp-common-add"></span><span class="btn-icon choose-btn-text">' + g.chooseText + '</span></div>' +
            '</div>' +
            '</div>';
        return html += nodeHtml;
    }
    ,
    showUserItem: function (node, nodeHtml, iconCss, nodeType) {
        var html = "";
        if(!(node.flowTaskType=="poolTask") && (!node.executorSet || node.executorSet.length<1)){
            var status = {
                msg: "执行人未找到",
                success: false,
                showTime: 4
            };
            EUI.ProcessStatus(status);
            return;
        }
        if(node.flowTaskType=="poolTask" && !node.executorSet){
            this.unNeedSelectExecutor = true;
            var unNeedExecutor = node.name+"是工作池节点，不需要选择执行人";
            nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '">' +
                '<div class="excutor-item-title">' + unNeedExecutor + '</div>' +
                '</div>';
        }else{
            this.unNeedSelectExecutor = false;
            for (var j = 0; j < node.executorSet.length; j++) {
                var item = node.executorSet[j];
                if (!item.positionId) {
                    nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '" id="' + item.id + '">' +
                        '<div class="choose-icon ' + iconCss + '" title="删除"></div>' +
                        '<div class="excutor-item-title">' +
                        String.format(this.showUserInfo2Text, item.name, item.organizationName, item.code) +
                        '</div>' +
                        '</div>';
                } else {
                    nodeHtml += '<div class="flow-user-item" type="' + node.flowTaskType + '" id="' + item.id + '">' +
                        '<div class="choose-icon ' + iconCss + '" title="删除"></div>' +
                        '<div class="excutor-item-title">' +
                        String.format(this.showUserInfoText, item.name, item.positionName, item.organizationName, item.code) +
                        '</div>' +
                        '</div>';
                }
            }
        }


        nodeHtml += "</div></div>";
        return html += nodeHtml;
    }
    ,
    getSelectedUser: function () {
        var users = [];
        //固化流程处理
        if(this.toChooseUserData&&this.toChooseUserData.length>0){
            if(this.solidifyFlow){
                for(var d=0;d<this.toChooseUserData.length;d++){
                    var item = this.toChooseUserData[d];
                    users.push({
                        nodeId: item.id,
                        userVarName: item.userVarName,
                        flowTaskType: item.flowTaskType,
                        callActivityPath: item.callActivityPath,
                        solidifyFlow: true
                        // instancyStatus: null,
                        // userIds: null
                    });
                }
            }else{
                var nodeDoms = $(".flow-node-box");
                for (var i = 0; i < nodeDoms.length; i++) {
                    var nodeDom = $(nodeDoms[i]);
                    var index = nodeDom.attr("index");
                    var data = this.toChooseUserData[index];
                    var node = {
                        nodeId: data.id,
                        userVarName: data.userVarName,
                        flowTaskType: data.flowTaskType,
                        callActivityPath: data.callActivityPath,
                        instancyStatus: this.instancyStatusq

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
            }
        }
        return users;
    }
    ,
    checkUserValid: function () {
        if(this.unNeedSelectExecutor){
            return true;
        }
        var nodeDoms = $(".flow-node-box");
        for (var i = 0; i < nodeDoms.length; i++) {
            var nodeDom = $(nodeDoms[i]);
            var index = nodeDom.attr("index");
            var data = this.toChooseUserData[index];
            var itemDoms = $(".select", nodeDom);
            if (itemDoms.length == 0) {
                EUI.ProcessStatus({
                    success: false,
                    //  msg: this.chooseMsgText + data.name + this.executorMsgText
                    msg: String.format(this.chooseExecutorMsgText, data.name)
                });
                return false;
            }
        }
        return true;
    }
    ,
    submit: function (endEventId) {
        var g = this;
        var loadOverTime = g.loadOverTime;
        if (!this.isEnd && !this.checkUserValid()) {
            return;
        }
        if (!this.checkOpinion()) {
            return;
        }
        var mask = EUI.LoadMask({
            msg: this.nowSaveMsgText
        });
        EUI.Store({
            url: this.baseUrl + "/completeTask",
            params: {
                taskId: this.taskId,
                businessId: this.busId,
                opinion: $(".flow-remark").val(),
                endEventId: endEventId,
                approved: this.counterApprove,
                taskList: this.isEnd ? "" : JSON.stringify(this.getSelectedUser()),
                loadOverTime:loadOverTime,
                manualSelected: g.manualSelected//是否是人工网关选择
            },
            success: function (status) {
                mask.hide();
                if(g.fromToDo=="2"){
                    parent.mainView && parent.mainView.afterSubmit && parent.mainView.afterSubmit.call(parent.mainView);
                    return;
                }
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
            if((typeof parent.homeView.closeNowTab)==='function'){
                parent.homeView.closeNowTab()
            }else{
                var item = { id:window.self.frameElement.id};
                var closeData = { tabAction: 'close', item:item };
                window.parent.postMessage(closeData, '*');
            }
        } else {
            window.close();
        }
    }
    ,
    showOmitContent: function () {
        $(".gateway-name").live("mouseover", function () {
            var text = $(this).text();
            $(this).attr("title", text);
        })
    }
    ,
    showChooseExecutorWind: function (currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var isChooseOneTitle;
        var saveBtnIsHidden;
        if (currentChooseTaskType === "common" || currentChooseTaskType === "approve" || currentChooseTaskType === "servicetask") {
            isChooseOneTitle = g.chooseArbitraryExecutorMsgText;
            saveBtnIsHidden = true;
        } else {
            isChooseOneTitle = g.chooseArbitraryExecutorText;
            saveBtnIsHidden = false;
        }
        g.chooseAnyOneWind = EUI.Window({
            title: isChooseOneTitle,
            width: 720,
            layout: "border",
            height: 380,
            padding: 5,
            itemspace: 0,
            items: [this.initChooseUserWindTree(), this.InitChooseUserGrid(currentChooseDivIndex, currentChooseTaskType)],
            buttons: [{
                title: g.okText,
                selected: true,
                hidden: false,
                handler: function () {
                    var selectRow = EUI.getCmp("chooseUserGridPanel_approve").getSelectRow();
                    if (!selectRow || selectRow.length === 0) {
                        return;
                    }
                    if(saveBtnIsHidden){
                        var rowData = selectRow;
                        var html = '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + rowData.id + '">' +
                            '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
                            '<div class="excutor-item-title">' +
                            String.format(g.showUserInfo2Text, rowData["userName"], rowData["organization.name"], rowData.code) +
                            '</div>' +
                            '</div>';
                        $(".flow-excutor-content2", "div[index=" + currentChooseDivIndex + "]").html(html);
                    }else{
                        g.addChooseUsersInContainer(selectRow, currentChooseDivIndex, currentChooseTaskType);
                    }
                    g.chooseAnyOneWind.close();
                }
            },{
                title: g.cancelText,
                handler: function () {
                    g.chooseAnyOneWind.remove();
                }
            }]
        });
    }
    ,
    initChooseUserWindTopBar: function () {
        var g = this;
        return ['->', {
            xtype: "SearchBox",
            width: 200,
            displayText: g.searchDisplayText,
            onSearch: function (v) {
                EUI.getCmp("chooseAnyUserTree").search(v);
                g.selectedOrgId = null;
            },
            afterClear: function () {
                EUI.getCmp("chooseAnyUserTree").reset();
                g.selectedOrgId = null;
            }
        }]
    },
    initChooseUserWindTree: function () {
        var g = this;
        var mask = EUI.LoadMask({msg: "正在加载，请稍候"});
        return {
            xtype: "TreePanel",
            width: 250,
            tbar: this.initChooseUserWindTopBar(),
            region: "west",
            id: "chooseAnyUserTree",
            url: g.flowWebUrl + "/flowDefination/listAllOrgs",
            border: true,
            searchField: ["name"],
            showField: "name",
            style: {
                "background": "#fff"
            },
            onSelect: function (node) {
                g.selectedOrgId = node.id;
                EUI.getCmp("chooseUserGridPanel_approve").setGridParams({
                    url: g.flowWebUrl + "/customExecutor/listAllUser",
                    loadonce: true,
                    datatype: "json",
                    postData: {
                        organizationId: g.selectedOrgId
                    }
                }, true);
                EUI.getCmp("chooseUserGridPanel_approve").data = null;
            },
            afterItemRender: function (nodeData) {
                if (nodeData.frozen) {
                    var nodeDom = $("#" + nodeData.id);
                    if (nodeDom.length === 0) {
                        return;
                    }
                    var itemCmp = $(nodeDom[0].children[0]);
                    itemCmp.addClass("ux-tree-freeze");
                    itemCmp.find(".ux-tree-title").text(itemCmp.find(".ux-tree-title").text() + g.freezeText);
                }
            },
            afterShowTree: function (data) {
                this.setSelect(data[0].id);
                mask.hide();
            }
        };
    }
    ,
    initUserGridTbar: function () {
        var g = this;
        return ['->', {
            xtype: "SearchBox",
            displayText: g.searchDisplayText,
            onSearch: function (value) {
                EUI.getCmp("chooseUserGridPanel_approve").localSearch(value);
            }
        }];
    },
    InitChooseUserGrid: function (currentChooseDivIndex, currentChooseTaskType) {
        var g = this;
        var isShowMultiselect;
        if (currentChooseTaskType === "common" || currentChooseTaskType === "approve") {
            isShowMultiselect = false;
        } else {
            isShowMultiselect = true;
        }
        return {
            xtype: "GridPanel",
            tbar: this.initUserGridTbar(),
            region: "center",
            id: "chooseUserGridPanel_approve",
            searchConfig: {
                searchCols: ["userName", "code"]
            },
            style: {"border-radius": "3px"},
            gridCfg: {
                loadonce: true,
                datatype: "local",
                multiselect: isShowMultiselect,
                colModel: [{
                    label: g.userIDText,
                    name: "id",
                    index: "id",
                    hidden: true
                }, {
                    label: g.userNameText,
                    name: "userName",
                    index: "userName",
                    width: 150,
                    align: "center"
                }, {
                    label: g.userNumberText,
                    name: "code",
                    index: "code",
                    width: 200
                }, {
                    label: g.organization2Text,
                    name: "organization.name",
                    index: "organization.name",
                    width: 150,
                    align: "center",
                    hidden: true
                }],
                ondblClickRow: function (rowid) {
                    var $content2 = $(".flow-excutor-content2", "div[index=" + currentChooseDivIndex + "]");
                    var html = "";
                    if (isShowMultiselect) {
                        html = $content2.html();
                    }
                    var rowData = EUI.getCmp("chooseUserGridPanel_approve").grid.jqGrid('getRowData', rowid);
                    var selectedUser = [];
                    $content2.children().each(function (index, domEle) {
                        selectedUser.push(domEle.id)
                    });
                    if (!g.itemIdIsInArray(rowData.id, selectedUser)) {
                        html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + rowData.id + '">' +
                            '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
                            '<div class="excutor-item-title">' +
                            String.format(g.showUserInfo2Text, rowData["userName"], rowData["organization.name"], rowData.code) +
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
        var $content2 = $(".flow-excutor-content2", "div[index=" + currentChooseDivIndex + "]");
        var selectedUser = [];
        $content2.children().each(function (index, domEle) {
            selectedUser.push(domEle.id)
        });
        for (var j = 0; j < selectRow.length; j++) {
            var item = selectRow[j];
            if (!g.itemIdIsInArray(item.id, selectedUser)) {
                html += '<div class="flow-anyOneUser-item select" type="' + currentChooseTaskType + '" id="' + item.id + '">' +
                    '<div class="choose-icon ecmp-flow-delete" title="删除"></div>' +
                    '<div class="excutor-item-title">' +
                    //  g.nameText + item["user.userName"] +g.organizationText + item["organization.name"] + g.number2Text + item.code +
                    String.format(this.showUserInfo2Text, item["userName"], item["organization.name"], item.code) +
                    '</div>' +
                    '</div>';
            }
        }
        $content2.append(html);
    }
    ,
    itemIdIsInArray: function (id, array) {
        for (var i = 0; i < array.length; i++) {
            if (id == array[i]) {
                return true;
            }
        }
        return false;
    }
})
;/**
 * 流程历史组件
 */
EUI.FlowHistory = function (options) {
    return new EUI.flow.FlowHistory(options);
};
EUI.flow.FlowHistory = EUI.extend(EUI.CustomUI, {
    instanceId: null,
    businessId: null,
    defaultData: null,
    instanceData: null,
    flowWebUrl: "/flow-web",
    basePath: null,
    designInstanceId: null,
    designFlowDefinationId: null,
    versionCode: null,
    isManuallyEnd: false,
    initComponent: function () {
        var g = this;
        if(_basePath){
            this.basePath = _basePath;
        }
        g.getData();
    },
    getData: function () {
        var g = this;
        var myMask = EUI.LoadMask({
            msg: g.queryMaskMessageText
        });
        EUI.Store({
            url: this.basePath + this.flowWebUrl + "/flowHistoryInfo/getFlowHistoryInfo",
            params: {
                businessId: g.businessId
            },
            success: function (result) {
                var flag = true;
                g.initData(result.data);
                g.showWind();
                g.flowDefVersionId = g.defaultData.data.flowInstance.flowDefVersion.id;
                g.showFlowHistoryTopData(g.defaultData.data.flowInstance);
                g.showFlowHistoryData(g.defaultData.data.flowHistoryList);
                g.showFlowStatusData(g.defaultData.data.flowTaskList);
                myMask.hide();
            }, failure: function (result) {
                myMask.hide();
                EUI.ProcessStatus(result);
            }
        });
    },
    initData: function (data) {
        var instanceData = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i].flowInstance;
            var instanceItem = {
                id: item.id,
                name: item.flowName + "," + item.creatorName + "," + item.createdDate + this.startText,
                instanceId: item.id,
                data: data[i]
            };
            instanceData.push(instanceItem);
            if (this.instanceId == item.id) {
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
            title: g.flowInfoText,
            width: 620,
            height: 523,
            padding: 0,
            xtype: "Container",
            layout: "border",
            border: false,
            items: [this.initTop(), this.initCenter()]
        });
        EUI.getCmp("flowInstanceId").loadData(this.defaultData);
        g.topEvent();
    },
    initTop: function () {
        var g = this;
        return {
            xtype: "ToolBar",
            region: "north",
            height: 50,
            padding: 8,
            isOverFlow: false,
            border: false,
            items: [{
                xtype: "ComboBox",
                title: "<span style='font-weight: bold'>" + g.launchHistoryText + "</span>",
                width: 365,
                field: ["id"],
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
                    g.flowDefVersionId = data.data.data.flowInstance.flowDefVersion.id;
                    g.designFlowDefinationId = data.data.data.flowInstance.flowDefVersion.flowDefination.id;
                    g.versionCode = data.data.data.flowInstance.flowDefVersion.versionCode;
                    $(".statuscenter-info").html("").removeClass("text-center");
                    $(".flow-historyprogress").html("");
                    $(".flow-end").css("display", "none");
                    g.showFlowHistoryData(data.data.data.flowHistoryList);
                    g.showFlowStatusData(data.data.data.flowTaskList);
                }
            }, {
                xtype: "Button",
                title: g.showFlowDiagramText,
                iconCss: "ecmp-common-view",
                handler: function () {
                    $(".toptop-right").addClass("flowselect");
                    g.showDesgin()
                }
            }]
        };
    },
    initCenter: function () {
        var g = this;
        return {
            xtype: "Container",
            region: "center",
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
            this.processStatusText +
            '					</div>' +
            '				</div>' +
            '				<div class="flow-line"></div>' +
            '				<div class="top-center navbar">' +
            '					<div class="flow-tabicon flow-historyimg  ecmp-flow-handlehistory"></div>' +
            '					<div class="flow-historyfield text">' +
            this.flowProcessHistoryText +
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
            '							<div class="flow-endfield">' + this.flowEndText + '</div>' +
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
            '							<div class="flow-startfield">' + g.flowLaunchText + '</div>' +
            '							<div class="flow-startright">' +
            '								<div class="flow-startuser">' + data.creatorName + '</div>' +
            '								<div class="flow-startline"></div>' +
            '								<div class="flow-starttime">' + data.startDate + '</div>' +
            '							</div>';
        $(".flow-start").html(html);
    },
    //拼接流程历史数据的html
    showFlowHistoryData: function (data) {
        var g = this;
        var html = "";
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            html += '<div class="flow-historyinfoone">' +
                '							<div class="flow-historydot ecmp-flow-nodedot"></div>' +
                '							<div class="flow-historyinfotop">' +
                '								<div class="flow-historystatus">' + item.flowTaskName + '</div>' +
                '								<div class="flow-historyright">' + g.processorText + item.executorName + ' (' + item.actEndTime + ')</div>' +
                '							</div>' +
                '							<div class="flow-usetime">' + g.timeCunsumingText + g.changeLongToString(item.actDurationInMillis) + '</div>' +
                '							<div class="flowhistory-remark">' + g.handleAbstractText + (item.depict || g.noneText) + '</div>' +
                '							 <div class="clear"></div> ' +
                '						</div>';
        }
        $(".flow-historyprogress").append(html);
        if (typeof(data[0]) == "undefined") {
            return;
        } else {
            if (data[0].flowInstance.ended == true) {
                if (data[0].flowInstance.manuallyEnd == true) {
                    g.isManuallyEnd = true;
                    $(".flow-end").css("display", "block");
                    $(".flow-endright").html(data[0].flowInstance.endDate);
                } else {
                    $(".flow-end").css("display", "block");
                    $(".flow-endright").html(data[0].flowInstance.endDate);
                }
            }
        }
    },
    //拼接流程状态数据的html
    showFlowStatusData: function (data) {
        var g = this;
        var html = "";
        if (!data || data.length == 0) {
            if (g.isManuallyEnd) {
                html = "流程已被发起人终止";
            } else {
                html = g.flowFinishedText;
            }
            $(".statuscenter-info").addClass("text-center")
        } else {
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                html += '<div class="flow-progress">' +
                    '						<div class="flow-progresstitle">' + item.taskName + '</div>' +
                    '						<div class="flow-progressinfo">' +
                    '							<div class="flow-progressinfoleft">' + g.waitProcessorText + item.executorName + '</div>' +
                    '							<div class="flow-progressline"></div>' +
                    '							<div class="flow-progressinforight">' + g.taskArrivalTimeText + item.lastEditedDate + '</div>' +
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
        if (day > 0) {
            strVar += day + this.dayText;
        }
        if (hour > 0) {
            strVar += hour + this.hourText;
        }
        if (minute > 0) {
            strVar += minute + this.minuteText;
        }
        if (second > 0) {
            strVar += second + this.secondText;
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
            title: g.flowDiagramText,
            url: this.basePath + this.flowWebUrl + "/design/showLook?id=" + this.flowDefVersionId + "&instanceId=" + this.designInstanceId,
            id: this.designInstanceId
        };
        g.addTab(tab);
    },
    addTab: function (tab) {
        window.open(tab.url);
    }
});/**
 * 流程历史组件
 */
EUI.FlowHistoryTab = function (options) {
    return new EUI.flow.FlowHistoryTab(options);
};
EUI.flow.FlowHistoryTab = EUI.extend(EUI.CustomUI, {
    instanceId: null,
    businessId: null,
    defaultData: null,
    instanceData: null,
    flowWebUrl: "/flow-web",
    basePath: null,
    designInstanceId: null,
    designFlowDefinationId: null,
    versionCode: null,
    isManuallyEnd: false,
    initComponent: function () {
        var g = this;
        if(_basePath){
            this.basePath = _basePath;
        }
        g.getData();
    },
    getData: function () {
        var g = this;
        var myMask = EUI.LoadMask({
            msg: g.queryMaskMessageText
        });
        EUI.Store({
            url: this.basePath + this.flowWebUrl + "/flowHistoryInfo/getFlowHistoryInfo",
            params: {
                businessId: g.businessId
            },
            success: function (result) {
                var flag = true;
                g.initData(result.data);
                g.showWind();
                g.flowDefVersionId = g.defaultData.data.flowInstance.flowDefVersion.id;
                g.showFlowHistoryTopData(g.defaultData.data.flowInstance);
                g.showFlowHistoryData(g.defaultData.data.flowHistoryList);
                g.showFlowStatusData(g.defaultData.data.flowTaskList);
                myMask.hide();
            }, failure: function (result) {
                myMask.hide();
                EUI.ProcessStatus(result);
            }
        });
    },
    initData: function (data) {
        var instanceData = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i].flowInstance;
            var instanceItem = {
                id: item.id,
                name: item.flowName + "," + item.creatorName + "," + item.createdDate + this.startText,
                instanceId: item.id,
                data: data[i]
            };
            instanceData.push(instanceItem);
            if (this.instanceId == item.id) {
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
        EUI.Container({
           // title: g.flowInfoText,
            renderTo: this.renderTo,
            width: 900,
            height: 600,
            padding: 0,
            layout: "border",
            border: false,
            items: [this.initTop(), this.initCenter()]
        });
        EUI.getCmp("flowInstanceId1").loadData(this.defaultData);
        g.topEvent();
    },
    initTop: function () {
        var g = this;
        return {
            xtype: "ToolBar",
            region: "north",
            width: 900,
            height: 50,
            padding: 8,
            isOverFlow: false,
            border: false,
            items: [{
                xtype: "ComboBox",
                title: "<span style='font-weight: bold'>" + g.launchHistoryText + "</span>",
                width: 365,
                field: ["id"],
                labelWidth: 80,
                name: "name",
                id: "flowInstanceId1",
                reader: {
                    name: "name",
                    field: ["id"]
                },
                data: this.instanceData,
                afterSelect: function (data) {
                    g.designInstanceId = data.data.id;
                    g.flowDefVersionId = data.data.data.flowInstance.flowDefVersion.id;
                    g.designFlowDefinationId = data.data.data.flowInstance.flowDefVersion.flowDefination.id;
                    g.versionCode = data.data.data.flowInstance.flowDefVersion.versionCode;
                    $(".statuscenter-info").html("").removeClass("text-center");
                    $(".flow-historyprogress").html("");
                    $(".flow-end").css("display", "none");
                    g.showFlowHistoryData(data.data.data.flowHistoryList);
                    g.showFlowStatusData(data.data.data.flowTaskList);
                }
            }, {
                xtype: "Button",
                title: g.showFlowDiagramText,
                iconCss: "ecmp-common-view",
                handler: function () {
                    $(".toptop-right").addClass("flowselect");
                    g.showDesgin()
                }
            }]
        };
    },
    initCenter: function () {
        var g = this;
        return {
            xtype: "Container",
            width: 900,
            region: "center",
            border: true,
            isOverFlow: false,
            html: g.getTopHtml() + g.getCenterHtml()
        }
    },
    getTopHtml: function () {
        return '<div class="top" style="display: flex;width: 100%;min-width: 900px;">' +
            '				<div class="top-left navbar flowselect" style="width: 50%;">' +
            '					<div class="flow-tabicon flow-historyimg  ecmp-flow-handlehistory"></div>' +
            '					<div class="flow-historyfield text">' +
            this.flowProcessHistoryText +
            '					</div>' +
            '				</div>' +
            '				<div class="flow-line"></div>' +
            '				<div class="top-center navbar" style="width: 50%; margin-top: 2px;">' +
            '					<div class="flow-tabicon flow-statusimg ecmp-flow-handlestatus"></div>' +
            '					<div class="flow-stutsfield text">' +
            this.processStatusText +
            '					</div>' +
            '				</div>' +
            '			</div>';
    },
    getCenterHtml: function () {
        var g = this;
        return g.getFlowHistoryHtml()+g.getFlowStatusHtml();
    },
    getFlowStatusHtml: function () {
        return '<div class="flow-statuscenter" style="display: none;height: 435px">' +
            '					<div class="statuscenter-info ">' +
            '					</div>' +
            '				</div>';
    },
    getFlowHistoryHtml: function () {
        return '<div class="flow-hsitorycenter" style="display: block; height: 435px">' +
            '					<div class="historycenter-info" style="height: auto">' +
            '						<div class="flow-start">' +
            '						</div>' +
            '						<div class="flow-historyprogress">' +
            '						</div>' +
            '                       <div class="flow-end" style="display: none;">' +
            '							<div class="flow-endImg ecmp-flow-end"></div>' +
            '							<div class="flow-endfield">' + this.flowEndText + '</div>' +
            '							<div class="flow-endright">' +
            '							</div>' +
            '						</div>'+
        '					</div>' +
        '				</div>';
    },

    //拼接流程历史头部数据的html
    showFlowHistoryTopData: function (data) {
        var g = this;
        var html = "";
        html = '<div class="flow-startimg ecmp-flow-flag"></div>' +
            '							<div class="flow-startfield">' + g.flowLaunchText + '</div>' +
            '							<div class="flow-startright">' +
            '								<div class="flow-startuser">' + data.creatorName + '</div>' +
            '								<div class="flow-startline"></div>' +
            '								<div class="flow-starttime">' + data.startDate + '</div>' +
            '							</div>';
        $(".flow-start").html(html);
    },
    //拼接流程历史数据的html
    showFlowHistoryData: function (data) {
        var g = this;
        var html = "";
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            html += '<div class="flow-historyinfoone">' +
                '							<div class="flow-historydot ecmp-flow-nodedot"></div>' +
                '							<div class="flow-historyinfotop">' +
                '								<div class="flow-historystatus">' + item.flowTaskName + '</div>' +
                '								<div class="flow-historyright">' + g.processorText + item.executorName + ' (' + item.actEndTime + ')</div>' +
                '							</div>' +
                '							<div class="flow-usetime">' + g.timeCunsumingText + g.changeLongToString(item.actDurationInMillis) + '</div>' +
                '							<div class="flowhistory-remark">' + g.handleAbstractText + (item.depict || g.noneText) + '</div>' +
                '							 <div class="clear"></div> ' +
                '						</div>';
        }
        $(".flow-historyprogress").append(html);
        if (typeof(data[0]) == "undefined") {
            return;
        } else {
            if (data[0].flowInstance.ended == true) {
                if (data[0].flowInstance.manuallyEnd == true) {
                    g.isManuallyEnd = true;
                    $(".flow-end").css("display", "block");
                    $(".flow-endright").html(data[0].flowInstance.endDate);
                } else {
                    $(".flow-end").css("display", "block");
                    $(".flow-endright").html(data[0].flowInstance.endDate);
                }
            }
        }
    },
    //拼接流程状态数据的html
    showFlowStatusData: function (data) {
        var g = this;
        var html = "";
        if (!data || data.length == 0) {
            if (g.isManuallyEnd) {
                html = "流程已被发起人终止";
            } else {
                html = g.flowFinishedText;
            }
            $(".statuscenter-info").addClass("text-center")
        } else {
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                html += '<div class="flow-progress">' +
                    '						<div class="flow-progresstitle">' + item.taskName + '</div>' +
                    '						<div class="flow-progressinfo">' +
                    '							<div class="flow-progressinfoleft">' + g.waitProcessorText + item.executorName + '</div>' +
                    '							<div class="flow-progressline"></div>' +
                    '							<div class="flow-progressinforight">' + g.taskArrivalTimeText + item.lastEditedDate + '</div>' +
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
        if (day > 0) {
            strVar += day + this.dayText;
        }
        if (hour > 0) {
            strVar += hour + this.hourText;
        }
        if (minute > 0) {
            strVar += minute + this.minuteText;
        }
        if (second > 0) {
            strVar += second + this.secondText;
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
            $(".flow-statuscenter").css("display", "none");
            $(".flow-hsitorycenter").css("display", "block");
        });
        $(".top-center").click(function () {
            $(".flow-statuscenter").css("display", "block");
            $(".flow-hsitorycenter").css("display", "none");
        });
    },
    showDesgin: function () {
        var g = this;
        var tab = {
            title: g.flowDiagramText,
            url: this.basePath + this.flowWebUrl + "/design/showLook?id=" + this.flowDefVersionId + "&instanceId=" + this.designInstanceId,
            id: this.designInstanceId
        };
        g.addTab(tab);
    },
    addTab: function (tab) {
        window.open(tab.url);
    }
});
