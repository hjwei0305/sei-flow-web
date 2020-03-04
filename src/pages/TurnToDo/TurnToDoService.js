import { request as httpUtils, constants, } from "@/utils";
const { baseUrl } = constants;

export async function getAllTaskByTenant(params = {}) {
  Object.assign(params,{sortOrders:[{property:'createdDate',direction:'DESC'}],quickSearchProperties:["flowName","taskName","flowInstance.businessCode","executorName","executorAccount","depict"],});
  return httpUtils.postJson(baseUrl + "/flowTask/findAllByTenant?appModuleId="+params.appModuleId+"&businessModelId="+params.businessModelId+"&flowTypeId="+params.flowTypeId, params);
}


//转办
export async function taskTurnToDo(taskId,userId) {
  return httpUtils.post(baseUrl+"/flowTask/taskTurnToDo",{taskId:taskId,userId:userId});
}

//获取全部组织机构
export async function listAllOrgs() {
  return httpUtils.postJson(baseUrl+"/flowDefination/listAllOrgs");
}

//获取组织机构下员工
export async function listAllUserByOrgId(orgId) {
  return httpUtils.get(baseUrl+"/flowDefination/listAllUser",{organizationId:orgId});
}


