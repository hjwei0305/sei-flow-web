import httpUtils from "../../../commons/utils/FeatchUtils.js";
import { basicAuthor } from "../../../configs/DefaultConfig";

//登陆
export const checkAuth = (params={}) => {
  return httpUtils.postJson(basicAuthor+"/userAuth/checkAuth",params)
}

