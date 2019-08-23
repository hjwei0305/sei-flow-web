import httpUtils  from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig"
import {convertSearchFilter} from "../../../commons/utils/CommonUtils";

export async function listAllOrgs(params={}){
  return httpUtils.post(baseUrl+"/flowDefination/listAllOrgs",params);
}

export async function listBusinessModel2(params={}){
  Object.assign(params,{S_createdDate:"DESC",quickSearchProperties:["name","businessCode"],});
  return httpUtils.postJson(baseUrl+"/defaultBusinessModel2/findByPage",convertSearchFilter(params));
}

export async function deleteBusinessModel2(id=""){
  return httpUtils.delete(baseUrl+"/defaultBusinessModel2/delete",id);
}

export async function saveBusinessModel(params = {}) {
  return httpUtils.postJson(baseUrl + "/defaultBusinessModel2/save",JSON.stringify(params));
}

export async function findById(id){
  return httpUtils.get(baseUrl+"/defaultBusinessModel2/findOne",{id:id});
}



