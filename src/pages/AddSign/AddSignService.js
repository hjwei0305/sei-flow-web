import { request as httpUtils, constants, } from "@/utils";
const { baseUrl } = constants;

//获取能加签的全部列表
export async function getAllAddSignList(params = {}) {
  return httpUtils.get(baseUrl + "/flowTask/getAllCanAddNodeInfoList", params);
}

//获取当前会签节点的原有执行人
export async function getAddSignExecutorList(params = {}) {
  return httpUtils.get(baseUrl + "/flowTask/getCounterSignExecutorList", params);
}

//设置加签执行人
export async function setAddSignExecutorList(params = {}) {
  return httpUtils.post(baseUrl + "/flowTask/counterSignAdd", params);
}

//获取全部组织机构
export async function listAllOrgs() {
  return httpUtils.postJson(baseUrl + "/flowDefination/listAllOrgs");
}

//获取组织机构下员工
export async function listAllUserByOrgId(orgId) {
  return httpUtils.get(baseUrl + "/flowDefination/listAllUser", {organizationId: orgId});
}
