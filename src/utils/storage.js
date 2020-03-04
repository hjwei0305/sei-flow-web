/*
* @Author: zp
* @Date:   2020-02-19 13:43:34
* @Last Modified by:   zp
* @Last Modified time: 2020-02-19 13:46:52
*/

export const mergeKey = (key, prefix) => {
  return `${prefix || 'seid'}_${key}`;
};

const getCacheHelper = (storageType) => ({
  /** base64加密存储 */
  set(key, data) {
    const kvStr = JSON.stringify(data);
    const kv = window.btoa(window.encodeURIComponent(kvStr));
    window[storageType].setItem(key, kv);
  },
  setWithPrefix(key, data, prefix) {
    const kvStr = JSON.stringify(data);
    const kv = window.btoa(window.encodeURIComponent(kvStr));
    window[storageType].setItem(mergeKey(key, prefix), kv);
  },
  /** 解密取出 */
  get(key) {
    const kv = window[storageType].getItem(key);
    if (kv) {
      try {
        return JSON.parse(window.decodeURIComponent(window.atob(kv)));
      } catch (e) {
        return JSON.parse(kv);
      }
    }
    return null;
  },
  getWithPrefix(key, prefix) {
    const kv = window[storageType].getItem(mergeKey(key, prefix));
    if (kv) {
      try {
        return JSON.parse(window.decodeURIComponent(window.atob(kv)));
      } catch (e) {
        return JSON.parse(kv);
      }
    }
    return null;
  },
  /** 非加密存储 */
  setNative(key, data) {
    const kvStr = JSON.stringify(data);
    window[storageType].setItem(key, kvStr);
  },
  setNativeWithPrefix(key, data, prefix) {
    const kvStr = JSON.stringify(data);
    window[storageType].setItem(mergeKey(key, prefix), kvStr);
  },
  /** 取值 */
  getNative(key) {
    const kv = window[storageType].getItem(key);
    if (kv) {
      try {
        return JSON.parse(kv);
      } catch (e) {
        return kv;
      }
    }
    return null;
  },
  getNativeWithPrefix(key, prefix) {
    const kv = window[storageType].getItem(mergeKey(key, prefix));
    if (kv) {
      try {
        return JSON.parse(kv);
      } catch (e) {
        return kv;
      }
    }
    return null;
  },
  clear(key) {
    if (key) {
      if (Array.isArray(key)) {
        key.forEach(k => {
          window[storageType].removeItem(k);
        });
      } else {
        window[storageType].removeItem(key);
      }
    } else {
      window[storageType].clear();
    }
  },
  clearWithPrefix(key, prefix) {
    if (key) {
      if (Array.isArray(key)) {
        key.forEach(k => {
          const keyTmp = mergeKey(k, prefix);
          window[storageType].removeItem(keyTmp);
        });
      } else {
        const keyTmp = mergeKey(key, prefix);
        window[storageType].removeItem(keyTmp);
      }
    } else {
      window[storageType].clear();
    }
  },
});

export default {
  localStorage: getCacheHelper('localStorage'),
  sessionStorage: getCacheHelper('sessionStorage'),
};
