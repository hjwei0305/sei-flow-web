
import httpUtils from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig";

export async function getBusinessModel(params = {}) {
    return httpUtils.postJson(baseUrl + "/businessModel/findByPage", params);
}

export async function save(params = {}) {
    return httpUtils.postJson(baseUrl + "/businessModel/save",JSON.stringify(params));
}

/**
 * 删除
 * param id
 * return 操作结果
 */
export async function deleteCorp(param=''){
    return httpUtils.delete(baseUrl+"/businessModel/deleteById",param);
}

