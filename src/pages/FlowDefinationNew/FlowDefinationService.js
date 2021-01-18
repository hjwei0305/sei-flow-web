import {request as httpUtils, constants, commonUtils} from "@/utils";

const {convertSearchFilter} = commonUtils;
const {baseUrl} = constants;

export async function listAllOrgs(params = {}) {
  return httpUtils.post(baseUrl + "/flowDefination/listAllOrgByPower", params);
}

export async function listFlowDefination(params = {}) {
  Object.assign(params, {S_lastEditedDate: "DESC", quickSearchProperties: ["name", "defKey"],});
  return httpUtils.postJson(baseUrl + "/flowDefination/findByPage", convertSearchFilter(params));
}

export async function getFlowDefVersion(id = "") {
  return httpUtils.get(baseUrl + "/flowDefination/resetPosition" + `/${id}`, {});
}

export async function listFlowDefinationHistory(params = {}) {
  Object.assign(params, {
    sortOrders: [{property: 'createdDate', direction: 'DESC'}],
    quickSearchProperties: ["name", "defKey"],
  });
  return httpUtils.postJson(baseUrl + "/flowDefVersion/findByPage", params);
}

export async function activateOrFreezeFlowDef(id = "", status = "") {
  return httpUtils.post(baseUrl + "/flowDefination/changeStatus" + `/${id}` + `/${status}`, {});
}

export async function activateOrFreezeFlowVer(id = "", status = "") {
  return httpUtils.post(baseUrl + "/flowDefVersion/changeStatus" + `/${id}` + `/${status}`, {});
}

export async function deleteFlowDefination(id = "") {
  return httpUtils.delete(baseUrl + "/flowDefination/deleteById", id);
}
