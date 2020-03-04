import { request as httpUtils, constants, } from "@/utils";
import {findAllByAuth} from "../FlowType/FlowTypeService";

const { baseUrl } = constants;
export async function getAllList(params = {}) {
    return httpUtils.get(baseUrl + "/appModule/findAll", params);
}

export async function findAllAppModuleByAuth(params = {}) {
    return httpUtils.get(baseUrl + "/appModule/findAllByAuth", params);
}
export async function save(params = {}) {
    return httpUtils.postJson(baseUrl + "/appModule/save",JSON.stringify(params));
}

/**
 * 删除
 * param id
 * return 操作结果
 */
export async function deleteCorp(param=''){
    return httpUtils.delete(baseUrl+"/appModule/delete",param);
}

