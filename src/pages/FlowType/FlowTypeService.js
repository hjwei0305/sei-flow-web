
import { request as httpUtils, constants, } from "@/utils";
const { baseUrl } = constants;

export async function getFlowType(params = {}) {
    Object.assign(params,{sortOrders:[{property:'lastEditedDate',direction:'DESC'}],quickSearchProperties:["name","code","depict","businessModel.depict"],});
    return httpUtils.postJson(baseUrl + "/flowType/findByPage", params);
}

export async function save(params = {}) {
    return httpUtils.postJson(baseUrl + "/flowType/save",JSON.stringify(params));
}

/**
 * 删除
 * param id
 * return 操作结果
 */
export async function deleteCorp(param=''){
    return httpUtils.delete(baseUrl+"/flowType/deleteById",param);
}


export async function findAllByAuth(params = {}) {
    return httpUtils.get(baseUrl + "/businessModel/findAllByAuth", params);
}
