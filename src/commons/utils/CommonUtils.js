import moment from 'moment';

/**
 * 列表本地搜索,返回数据源，数据源每个子项上加搜索结果的 tag
 * @param {源数据} data 
 * @param {搜索条件，对象，如；{key:'123'} } searchParam 
 * @param {自定义搜索字段，如未填会全字段搜索，排除 id和租户代码字段} keys 
 */
export async function searchListByKeyWithTag(data, searchParam, keys = []) {
    let list
    if (data.rows) {
        list = data.rows
    } else {
        list = data;
    }
    let excludeKey = [];
    if (keys.length === 0) {
        excludeKey = ['id', 'tenantCode']
    }
    for (let i = 0; i < list.length; i++) {
        let item = list[i]
        item.tag=false
        if (keys.length === 0) {
            keys = Object.keys(item)
        }
        for (let j = 0; j < keys.length; j++) {
            let key = keys[j]
            if (excludeKey.indexOf(key) !== -1) {
                continue;
            }
            let value ;
            if(key.includes('.')){
                let subKey = key.split('.')
                value=item;
                for (let i=0;i<subKey.length;i++) {
                    value=getSubValue(value,subKey[i])
                }
            }else{
                value = item[key]
            }
            if(isEmpty(searchParam.keyword)){
                item.tag=true
            }
            if (value && !isEmpty(searchParam.keyword)) {
                if (typeof value === 'string' && typeof searchParam.keyword === 'string'
                    && value.toLowerCase().includes(searchParam.keyword.toLowerCase())) {
                    item.tag=true;
                    break;
                }
                if (typeof value === 'string' && typeof searchParam.keyword=="object"
                    && value.toLowerCase().includes(searchParam.keyword.key.toLowerCase())) {
                    item.tag=true;
                    break;
                }
            }
        }
    }
    return list;
}

function getSubValue(item,nextKey) {
    return item?item[nextKey]:null
}

/**
 * 列表本地搜索,返回过滤结果
 * @param {源数据} data 
 * @param {搜索条件，对象，如；{key:'123'} } searchParam 
 * @param {自定义搜索字段，如未填会全字段搜索，排除 id和租户代码字段} keys 
 */
export async function searchListByKey(data, searchParam, keys = []) {
    let result = []
    let list
    let flag = true
    if (data.rows) {
        list = data.rows
    } else {
        list = data;
    }
    let excludeKey = [];
    if (keys.length === 0) {
        excludeKey = ['id', 'tenantCode']
    }
    for (let i = 0; i < list.length; i++) {
        let item = list[i]
        if (keys.length === 0) {
            keys = Object.keys(item)
        }
        for (let j = 0; j < keys.length; j++) {
            let key = keys[j]
            if (excludeKey.indexOf(key) !== -1) {
                continue;
            }
            let value = item[key];
            if (value && searchParam.keyword && !isEmpty(searchParam.keyword)) {
                flag = false
                if (typeof value === 'string' && typeof searchParam.keyword === 'string'
                    && value.toLowerCase().includes(searchParam.keyword.toLowerCase())) {
                    result.push(item)
                    break;
                }
                if (typeof value === 'string' && typeof searchParam.keyword=="object"
                    && value.toLowerCase().includes(searchParam.keyword.key.toLowerCase())) {
                    result.push(item)
                    break;
                }
            }
        }
    }
    return flag ? list : result;
}

export function isEmpty(val) {
    return val === undefined || val === null || val === '' || val === "" || (typeof val === 'string' && val.trim() === '')
}

export function checkRight(rightName) {
    if(!rightName){
        return true;
    }
    let rights = cache.get('Right');
    if (rights == null) {
        return false;
    }
    return rights.indexOf(rightName) !== -1;
}

export function getUserInfo() {
    return cache.get('Authorization');
}

export function getUserId() {
    let userInfo = cache.get('Authorization');
    if(userInfo){
        return userInfo.userId
    }else{
        return null;
    }
}


export function openNewTab(uri, title, closeCurrent = false, id = undefined) {
    let element = window.parent.document.getElementsByClassName('child_item')
    let currentId = null;
    if (element) {
        for (let i = 0; i < element.length; i++) {
            let e = element[i];
            if (e.textContent === title) {
                id = e.id
            }
        }
        if (closeCurrent) {
            let currentTab = window.parent.document.getElementsByClassName('ux-tab-actived')
            if (currentTab && currentTab.length > 0) {
                currentId = currentTab[0].getAttribute('tabId');
            }
        }
        if (window.top.homeView) {
            if (!id) {
                id = getUUID()
            }
            if(uri.indexOf('http://')===0){
                window.top.homeView.addTab({
                    title: title,
                    url: uri,
                    id: id
                });
            }else{
                window.top.homeView.addTab({
                    title: title,
                    url: "http://"+window.location.host+"/srm-web/" + uri,
                    id: id
                });
            }
        } else {
            window.open("http://"+window.location.host+"/srm-web/" + uri);
        }
        if (currentId) {
            window.top.homeView.getTabPanel().close(currentId);
        }
        return id;
    }
}

/**
 *  当前页面展示时回调，主要用于更新
 * @param {页签获取焦点时的回调方法} callBack 
 */
export function tabForceCallBack(callBack){
    let con = window.top.homeView;
    if(con){
        let currentId = con.currentTabId
        if(!window.top.homeView.tabListener[currentId]){
            currentId && con.addTabListener(currentId, function (id, win) {
                callBack()
            });
        }
    }
}

export const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  );


export  function getUUID() {
    return Math.random().toString(36).substr(2);;
}

export function convertDataToFormData(data) {
    let formData = new FormData();
    if (isEmpty(data)) {
        return formData;
    }
    //如果传进对象为数组  返回数组
    if (data instanceof Array) {
        return data;
    }
    Object.keys(data).forEach((item) => {
        if (data[item] instanceof Array) {
            for (let value of data[item].values()) {
                formData.append(item, value);
            }
        } else if (data[item] instanceof Object) {
            for (let key of Object.keys(data[item])) {
                formData.append(item + '.' + key, data[item][key]);
            }
        } else if(data[item]){
            formData.append(item, data[item]);
        }
    });
    return formData;
}

moment.prototype.toJSON = function () {
    return moment(this).format("YYYY-MM-DD HH:mm:ss")
}

// 数据存储
export const cache = {
    set (key, data) {
        localStorage.setItem(key, JSON.stringify(data))
    },
    get (key) {
        return JSON.parse(localStorage.getItem(key))
    },
    clear (key) {
        localStorage.removeItem(key)
    }
  }
//非负小数
export const checkNumber = (rule,value,callback)=>{
    let reg = /^\d+(\.\d+)?$/;
    if(!reg.test(value)||value===0){
        callback({message: "请输入大于0的数字"});
        return false;
    }
    callback();
}

export function isInclude (array, obj){
    if (array.size < 1 || array.length < 1) {
        return false;
    }
    let res = [];
    for (let e of array) {
        if (this.objectIsEqual(e, obj)){
            res.push(true)
        }
    }
    if (res.includes(true)) {
        return true
    } else {
        return false
    }
};

export function transToChiness(n) {
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
        return "数据非法";
    var unit = "千百拾亿千百拾万千百拾元角分", str = "";
        n += "00";
    var p = n.indexOf('.');
    if (p >= 0)
        n = n.substring(0, p) + n.substr(p+1, 2);
        unit = unit.substr(unit.length - n.length);
    for (var i=0; i < n.length; i++)
        str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
    return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
}

export function objectIsEqual (obj1, obj2){
    let map1 = this.objToStrMap(obj1);
    let map2 = this.objToStrMap(obj2);
    if (map1.length !== map2.length) {
        return false
    }
    let validateMap1Result = [];
    map1.forEach((value, key) =>{
        if ([...map2.keys()].includes(key)) {
            if (map2.get(key) === value) {
                validateMap1Result.push(true)
            } else {
                validateMap1Result.push(false)
            }
        } else {
            validateMap1Result.push(false)
        }
    });
    let validateMap2Result = [];
    map2.forEach((value, key) =>{
        if ([...map1.keys()].includes(key)) {
            if (map1.get(key) === value) {
                validateMap2Result.push(true)
            } else {
                validateMap2Result.push(false)
            }
        } else {
            validateMap2Result.push(false)
        }
    });
    if (validateMap1Result.includes(false)) {
        return false
    }
    if (validateMap2Result.includes(false)) {
        return false
    }
    return true
};
