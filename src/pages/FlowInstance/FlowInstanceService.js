import {request as httpUtils, constants,} from "@/utils";

const {baseUrl} = constants;

export async function getFlowInstance(params = {}) {
  Object.assign(params, {
    sortOrders: [{property: 'lastEditedDate', direction: 'DESC'}],
    quickSearchProperties: ["flowName", "businessId", "businessCode", "businessModelRemark", "creatorName", "creatorAccount"],
  });
  return httpUtils.postJson(baseUrl + "/flowInstance/findByPage", params);
}

export async function findBusinessModelByAppModuleId(params = {}) {
  return httpUtils.post(baseUrl + "/businessModel/findByAppModuleId", params);
}

export async function findFlowTypeByBusinessModelId(params = {}) {
  return httpUtils.post(baseUrl + "/flowType/findByBusinessModelId", params);
}

//强制终止流程
export async function endForce(instanceId) {
  return httpUtils.postJson(baseUrl + `/flowInstance/endForce/${instanceId}`);
}

//待办补偿
export async function taskFailTheCompensation(instanceId) {
  return httpUtils.get(baseUrl + `/flowInstance/taskFailTheCompensation?instanceId=` + instanceId);
}


