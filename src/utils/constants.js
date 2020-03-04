import { base } from '../../public/app.config.json';
const { MOCK, NODE_ENV, } = process.env;

const getServerPath = function () {
  if (NODE_ENV !== 'production') {
    if (MOCK === 'true') {
      return '/mocker.api';
    } else {
      return '/service.api'
    }
  }
  return `${BASE_DOMAIN}${GATEWAY}`
}

const BASE_DOMAIN = '/';

const GATEWAY = 'api-gateway';

const APP_BASE = base;

const LOCAL_PATH = NODE_ENV !== 'production' ? '..' : `../${APP_BASE}`;

const SERVER_PATH = getServerPath();

const CONST_GLOBAL = {
  SESSION: '_s',
  TOKEN_KEY: 'x-sid',
  AUTH: 'AUTH',
  POLICY: 'POLICY',
  CURRENT_LOCALE: 'sei_locale',
  CURRENT_USER: 'CURRENT_USER',
  FEATURE_KEY: 'FEATURE_KEY',
};

const AUTH_POLICY = {
  USER: 'NormalUser',
  TENANT_ADMIN: 'TenantAdmin',
  ADMIN: 'GlobalAdmin',
};


/** 升级的常量放到这里 */

export const baseUrl = "/flow-service";
export const authApiUrl = "/sei-auth";
// export const host = REACT_APP_HOST || '';
// export const gatewayHost = host+"/api-gateway";

// export const basicAuthor = "/auth-service";
// export const uploadUrl = "";
export const flowDefUrl= "/sei-flow-web/design";
export const flowDefUrlNew="/sei-flow-web";

export const defaultPageSize = 15;
export const rowGutter = 20;
export const defaultPageSizeOptions = ['15', '50', '100'];


/** 升级的常量放到这里 */

export {
  APP_BASE,
  LOCAL_PATH,
  SERVER_PATH,
  AUTH_POLICY,
  CONST_GLOBAL,
};


