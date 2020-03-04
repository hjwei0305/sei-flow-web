import { request, constants, } from "@/utils";
import {findAllByAuth} from "../FlowType/FlowTypeService";
console.log(constants);
const { baseUrl } = constants;
export async function getAllList(params = {}) {
    return request.get(baseUrl + "/appModule/findAll", params);
}

export async function findAllAppModuleByAuth(params = {}) {
    return request.get(baseUrl + "/appModule/findAllByAuth", params);
}
export async function save(params = {}) {
    return request.postJson(baseUrl + "/appModule/save",JSON.stringify(params));
}

/**
 * 删除
 * param id
 * return 操作结果
 */
export async function deleteCorp(param=''){
    return request.delete(baseUrl+"/appModule/delete",param);
}

