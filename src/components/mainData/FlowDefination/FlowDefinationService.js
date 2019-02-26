/**
 * 企业用户service
 * @author 李艳
 */
import httpUtils  from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig"

/**
 * 保存或者更新一个分配关系
 *
 * param entity 实体对象
 * return 操作结果
 */
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
export async function deleteFlowDefination(id=""){
    return httpUtils.delete(baseUrl+"/flowDefination/deleteById",id);
}
