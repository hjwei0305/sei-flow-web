import { request as httpUtils, constants, } from "@/utils";
const { baseUrl } = constants;

//获取能减签的全部列表
export async function getAllCanDelSignList(params = {}) {
  return httpUtils.get(baseUrl + "/flowTask/getAllCanDelNodeInfoList", params);
}

//获取当前会签节点的原有执行人
export async function getSubtractSignExecutorList(params = {}) {
  return httpUtils.get(baseUrl + "/flowTask/getCounterSignExecutorList", params);
}

//设置减签执行人
export async function setSubtractSignExecutorList(params = {}) {
  return httpUtils.post(baseUrl + "/flowTask/counterSignDel", params);
}

