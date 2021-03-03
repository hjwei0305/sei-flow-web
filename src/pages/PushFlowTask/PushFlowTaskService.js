import {request as httpUtils, constants} from "@/utils";

const {baseUrl} = constants;

export async function getPushTaskControl(params = {}) {
  Object.assign(params, {
    sortOrders: [{property: 'pushStartDate', direction: 'DESC'}],
    quickSearchProperties: ["flowInstanceName", "flowTaskName", "businessCode", "executorNameList"],
  });
  return httpUtils.postJson(baseUrl + "/flowTaskPushControl/findByPage", params);
}

//重新推送
export async function pushAgainByControlId(controlId) {
  return httpUtils.get(baseUrl + "/flowTaskPushControl/pushAgainByControlId", {pushControlId: controlId});
}

//清理历史数据
export async function cleaningPushHistoryData(params = {}) {
  return httpUtils.postJson(baseUrl + "/flowTaskPushControl/cleaningPushHistoryData", params);
}




