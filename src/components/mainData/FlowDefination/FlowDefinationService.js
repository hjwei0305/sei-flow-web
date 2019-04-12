import httpUtils  from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig"

export async function listAllOrgs(params={}){
    return httpUtils.post(baseUrl+"/flowDefination/listAllOrgs",params);
}

export async function listFlowDefination(params={}){
    Object.assign(params,{sortOrders:[{property:'lastEditedDate',direction:'DESC'}],quickSearchProperties:["name","defKey"],});
    return httpUtils.postJson(baseUrl+"/flowDefination/findByPage",params);
}

export async function getFlowDefVersion(id=""){
    return httpUtils.get(baseUrl+"/flowDefination/getFlowDefVersion"+`/${id}`,{});
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
