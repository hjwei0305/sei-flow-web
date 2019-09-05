import httpUtils  from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig"
import {convertSearchFilter} from "../../../commons/utils/CommonUtils";

export async function listAllOrgs(params={}){
    return httpUtils.post(baseUrl+"/flowDefination/listAllOrgs",params);
}

export async function listFlowDefination(params={}){
  // sortOrders:[{property:'lastEditedDate',direction:'DESC'}]
    Object.assign(params,{S_lastEditedDate:"DESC",quickSearchProperties:["name","defKey"],});
    return httpUtils.postJson(baseUrl+"/flowDefination/findByPage",convertSearchFilter(params));
}

export async function getFlowDefVersion(id=""){
    return httpUtils.get(baseUrl+"/flowDefination/resetPosition"+`/${id}`,{});
}

export async function listFlowDefinationHistory(params={}){
    Object.assign(params,{sortOrders:[{property:'versionCode',direction:'ASC'}],quickSearchProperties:["name","defKey"],});
    return httpUtils.postJson(baseUrl+"/flowDefVersion/findByPage",params);
}

export async function activateOrFreezeFlowDef(id="",status=""){
    return httpUtils.post(baseUrl+"/flowDefination/changeStatus"+`/${id}`+`/${status}`,{});
}
export async function activateOrFreezeFlowVer(id="",status=""){
  return httpUtils.post(baseUrl+"/flowDefVersion/changeStatus"+`/${id}`+`/${status}`,{});
}
export async function deleteFlowDefination(id=""){
    return httpUtils.delete(baseUrl+"/flowDefination/deleteById",id);
}
