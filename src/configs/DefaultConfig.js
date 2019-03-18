const {
    REACT_APP_HOST,
    REACT_APP_CHECK_URL,
    REACT_APP_AUTHOR_URI,
    REACT_APP_API_URI,
    REACT_APP_BASIC_API,
} = process.env;

export const host = REACT_APP_HOST;
export const check_host = REACT_APP_CHECK_URL;
export const baseUrl = REACT_APP_API_URI;
export const basicAuthor = REACT_APP_AUTHOR_URI;
export const basicApi = REACT_APP_BASIC_API;
export const uploadUrl = "";
//登陆地址
export const _loginUrl = check_host+"/react-basic-web/login";

export const defaultAppCode = ["BASIC-WEB","REACT-FLOW-WEB"];

export const defaultPageSize = 15;
export const rowGutter = 20;
export const defaultPageSizeOptions = ['15', '50', '100'];




