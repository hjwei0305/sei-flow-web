import router from "umi/router";
import { stringify } from "qs";
import { message } from "antd";
import { userUtils, storage, constants } from '@/utils';
import { login, getAuthorizedFeatures, } from "@/services/api";

const {
  setCurrentAuth,
  setCurrentPolicy,
  setSessionId,
  setCurrentUser,
  getCurrentUser,
} = userUtils;

const { CONST_GLOBAL } = constants;

const locale = storage.sessionStorage.get(CONST_GLOBAL.CURRENT_LOCALE) || 'zh-CN';

export default {
  namespace: "global",
  state: {
    showTenant: false,
    globalLoading: false,
    userAuthLoaded: false,
    locationPathName: "/",
    locationQuery: {},
    locale: locale,
  },
  subscriptions: {
    setupHistory({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: "updateState",
          payload: {
            locationPathName: location.pathname,
            locationQuery: location.query
          }
        });
      });
    }
  },
  effects: {
    * redirectLogin({ payload }, { call, put, select }) {
      const global = yield select(_ => _.global);
      const { locationPathName, locationQuery } = global;
      let location = locationPathName;
      if (location.indexOf("/user/login") !== -1) {
        location = locationQuery.from || "/";
      }
      router.replace({
        pathname: "/user/login",
        search: stringify({
          from: location
        })
      });
    },
    * login({ payload }, { call, select }) {
      const { locationQuery } = yield select(_ => _.global);
      const res = yield call(login, payload);
      const { success, data} = res || {};
      const { loginStatus, authorityPolicy, sessionId, } = data || {};
      message.destroy();
      storage.sessionStorage.clear();
      if (success && loginStatus === 'success') {
        message.success("登录成功");
        setCurrentUser(data);
        setSessionId(sessionId);
        setCurrentPolicy(authorityPolicy);
        const { from } = locationQuery;
        if (from && from.indexOf("/user/login") === -1) {
          if (from === "/") {
            router.push("/dashboard");
          }
          else {
            router.push(from);
          }
        } else {
          router.push("/");
        }
      } else {
        message.error("登录失败");
      }

      return res;
    },
    * getUserFeatures(_, { call }) {
      const user = getCurrentUser();
      const result = yield call(getAuthorizedFeatures, user.userId);
      if (result && result.success) {
        setCurrentAuth(result.data);
      }
    },
    * changeLocale({ payload }, { put, select }) {
      const { locale } = payload;
      const { locationQuery } = yield select(_ => _.global);
      storage.sessionStorage.set(CONST_GLOBAL.CURRENT_LOCALE, locale);
      yield put({
        type: 'updateState',
        payload: {
          locale
        }
      });
      router.replace({
        pathname: "/user/login",
        search: stringify({
          from: locationQuery.from
        })
      });
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
