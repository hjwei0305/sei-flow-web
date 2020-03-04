import { request as httpUtils, constants, commonUtils } from "@/utils";
const { baseUrl } = constants;
const {convertSearchFilter} = commonUtils;

export async function listAllOrgs(params={}){
  return httpUtils.post(baseUrl+"/flowDefination/listAllOrgs",params);
}

export async function listBusinessModel2(params={}){
  Object.assign(params,{S_createdDate:"DESC",quickSearchProperties:["name","businessCode"],});
  return httpUtils.postJson(baseUrl+"/defaultBusinessModel/findByPage",convertSearchFilter(params));
}

export async function deleteBusinessModel2(id=""){
  return httpUtils.delete(baseUrl+"/defaultBusinessModel/delete",id);
}

export async function saveBusinessModel(params = {}) {
  return httpUtils.postJson(baseUrl + "/defaultBusinessModel/save",JSON.stringify(params));
}

export async function findById(id){
  return httpUtils.get(baseUrl+"/defaultBusinessModel/findOne",{id:id});
}



