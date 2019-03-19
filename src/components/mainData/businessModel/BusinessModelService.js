
import httpUtils from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig";
import {convertDataToFormData} from "../../../commons/utils/CommonUtils";

export async function getBusinessModel(params = {}) {
    Object.assign(params,{sortOrders:[{property:'createdDate',direction:'ASC'}],
        quickSearchProperties:["name","className","appModule.code","businessDetailServiceUrl","lookUrl"]});

    return httpUtils.postJson(baseUrl + "/businessModel/findByPage", params);
}
export async function save(params = {}) {
    return httpUtils.postJson(baseUrl + "/businessModel/save",JSON.stringify(params));
}
export async function deleteCorp(param=''){
    return httpUtils.delete(baseUrl+"/businessModel/deleteById",param);
}
//工作界面
export async function listAllNotSelectEdByAppModuleId(paramsPath='') {
    // return httpUtils.get(baseUrl + "/workPageUrl/findNotSelectEdByAppModuleId"+paramsPath,{});
    return httpUtils.get(baseUrl + "/workPageUrl/findNotSelectEdByAppModuleId"+paramsPath,{});
}
export async function listAllSelectEdByAppModuleId(params = {}) {
    return httpUtils.get(baseUrl + "/workPageUrl/findSelectEdByBusinessModelId", params);
}
export async function saveSetWorkPage(paramsPath='',params='') {
    return httpUtils.postJson(baseUrl + "/businessWorkPageUrl/saveBusinessWorkPageUrlByIds"+paramsPath,params);
}
//服务地址
export async function listServiceUrl(params = {}) {
    Object.assign(params,{sortOrders:[{property:'code',direction:'ASC'}],quickSearchProperties:["url","depict","name","code"]});
    return httpUtils.postJson(baseUrl + "/flowServiceUrl/findByPage", params);
}
export async function saveServiceUrl(params = {}) {
    return httpUtils.postJson(baseUrl + "/flowServiceUrl/save",JSON.stringify(params));
}
//执行人
export async function listExUser(params = {}) {
    Object.assign(params,{sortOrders:[{property:'lastEditedDate',direction:'DESC'}],quickSearchProperties:["name","code","url","param","depict"],});
    return httpUtils.postJson(baseUrl + "/flowExecutorConfig/findByFilters", params);
}
export async function saveExUser(params = {}) {
    return httpUtils.postJson(baseUrl + "/flowExecutorConfig/save",JSON.stringify(params));
}
export async function deleteExUser(param=''){
    return httpUtils.delete(baseUrl+"/flowExecutorConfig/deleteById",param);
}
//条件属性
export async function getPropertiesForConditionPojo(params = {}) {
    return httpUtils.post(baseUrl + "/businessModel/getPropertiesForConditionPojo",params);
}

