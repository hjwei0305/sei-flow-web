
import httpUtils from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig";

export async function getWorkPage(params = {}) {
    return httpUtils.postJson(baseUrl + "/workPageUrl/findByPage", params);
}

export async function save(params = {}) {
    return httpUtils.postJson(baseUrl + "/workPageUrl/save",JSON.stringify(params));
}

/**
 * 删除
 * param id
 * return 操作结果
 */
export async function deleteCorp(param=''){
    return httpUtils.delete(baseUrl+"/workPageUrl/deleteById",param);
}

