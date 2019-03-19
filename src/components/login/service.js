/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/6
 */
import httpUtils from "../../commons/utils/FeatchUtils";
import {basicAuthor} from "../../configs/DefaultConfig";

//登陆
export const login = (params={}) => {
  params.appId = "1234";
  if(!Object.keys(params).includes("tenantCode")){
    params.tenantCode = "";
  }
  return httpUtils.post(basicAuthor+"/userAuth/login",params)
}
//退出
export const logout = (params={}) => {
  return httpUtils.post(basicAuthor+"/userAuth/logout",params)
}
