
import moment from 'moment';
import 'moment/locale/zh-cn'
import enUS from '../locales/en-US.js';
import zhCN from '../locales/zh-CN.js';
import { seiLocale } from 'sei-utils';
const localesInfo = {
  'en-US': enUS,
  'zh-CN': zhCN,
};

const { getLocales, seiIntl, getLocale } = seiLocale;

function initLocalLocals() {
  const locales = getLocales();
  const locale = getLocale();
  seiIntl.init({
    currentLocale: locales.locale,
    locales: {
      [locale]: localesInfo[locales.locale]
    }
  });
  console.log(locales.momentLocale, locales.locale);
  locales.momentLocale && moment.locale(locales.momentLocale);
  return {
    antdLocale: locales.antd,
    momentLocale: locales.momentLocale,
  };
}

const { antdLocale, momentLocale } = initLocalLocals();

const SHOW = 'SHOW';
const HIDE = 'HIDE';
const SETLANGUAGE= 'SETLANGUAGE';
const defaultState = {
  loadings:false,
  antdLocale,
  momentLocale,
}
export default function (state, action) {
  if (!state) {
    state = defaultState
  }
  switch (action.type) {
    case SHOW:
      return{
        ...state,
        loadings:true
      }
    case HIDE:{
      return{
        ...state,
        loadings:false
      }
    }
    case SETLANGUAGE: {
      return {
        ...state,
        ...action.payload,
      };
    }
    default:
      return state
  }
}

export const show =() => {
  let loadings = true
  return { type: 'SHOW', loadings }
}

export const hide =() => {
  let loadings = false
  return { type: 'HIDE', loadings }
}

export const setLanguage =() => {
  return { type: 'SETLANGUAGE', payload: initLocalLocals() }
}
