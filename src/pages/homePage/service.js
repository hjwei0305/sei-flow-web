/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/12
 */
import { request as httpUtils, constants, commonUtils, } from "@/utils";

const { baseUrl: flowAPI } = constants;
const { convertSearchFilter, } = commonUtils;

//待办汇总
export const listFlowTaskApp = () => {
  return httpUtils.postJson(flowAPI + "/flowTask/listFlowTaskHeader")
}
//流程历史汇总
export const listFlowHistoryApp = (params) => {
  const dataType = params.dataType ? params.dataType : "";
  return httpUtils.postJson(flowAPI + "/flowHistory/listFlowHistoryHeader?dataType=" + dataType);
}

//应用模块(我的单据)
export async function findAllAppModuleByAuth(params = {}) {
  return httpUtils.get(flowAPI + "/appModule/findAllByAuth", params);
}

//我的单据汇总
export const listMyBillsApp = (params) => {
  return httpUtils.postJson(flowAPI + "/flowInstance/listMyBillsHeader", JSON.stringify(params));
}

export const listFlowTaskWithAllCount = (params = {}) => {
  params["S_priority"] = params["S_priority"] || "DESC";
  params["S_createdDate"] = params["S_priority"] || "DESC";
  const quickSearchProperties = ["flowName", "taskName", "flowInstance.businessCode", "flowInstance.businessModelRemark", "flowInstance.creatorName", "flowInstance.creatorAccount"];
  const searchFilter = convertSearchFilter({quickSearchProperties, ...params});
  const modelId = params.modelId ? params.modelId : "";
  return httpUtils.postJson(flowAPI + "/flowTask/listFlowTaskWithAllCount?modelId=" + modelId, JSON.stringify(searchFilter))
}

export const listCompleteTask = (params = {}) => {
  params["S_createdDate"] = "DESC";
  const quickSearchProperties = ["flowName", "flowTaskName", "flowInstance.businessCode", "flowInstance.businessModelRemark", "flowInstance.creatorName", "flowInstance.creatorAccount"];
  const searchFilter = convertSearchFilter({quickSearchProperties, ...params});
  const modelId = params.modelId ? params.modelId : "";
  return httpUtils.postJson(flowAPI + "/flowHistory/listFlowHistory?businessModelId=" + modelId, JSON.stringify(searchFilter))
}

export const listMyBills = (params = {}) => {
  params["S_createdDate"] = "DESC";
  const quickSearchProperties = ["businessName", "businessModelRemark", "businessCode"];
  const searchFilter = convertSearchFilter({quickSearchProperties, ...params});
  const modelId = params.modelId ? params.modelId : "";
  const appModelCode = params.appModelCode ? params.appModelCode : "";
  return httpUtils.postJson(flowAPI + "/flowInstance/getMyBillsAndExecutorByModeId?modelId=" + modelId + "&appModelCode=" + appModelCode, JSON.stringify(searchFilter))
}


//转办
export async function taskTurnToDo(taskId, userId) {
  return httpUtils.post(`${flowAPI}/flowTask/taskTurnToDo`, {taskId: taskId, userId: userId})
}

//委托
export async function taskTrustToDo(taskId, userId) {
  return httpUtils.post(`${flowAPI}/flowTask/taskTrustToDo`, {taskId: taskId, userId: userId})
}

//驳回
export async function reject(id, opinion) {
  return httpUtils.postJson(`${flowAPI}/flowTask/reject/${id}/${opinion}`)
}

//终止流程
export async function endTask(instanceId) {
  return httpUtils.postJson(`${flowAPI}/flowInstance/end/${instanceId}`)
}

//获取全部组织机构
export async function listAllOrgs() {
  return httpUtils.postJson(`${flowAPI}/flowDefination/listAllOrgs`)
}

//获取组织机构下全部人员
export async function listAllUserByOrgId(orgId, searchValue, pageInfo) {
  return httpUtils.postJson(`${flowAPI}/flowDefination/listUserByOrg`, {
    organizationId: orgId,
    includeSubNode: true,
    quickSearchValue: searchValue,
    pageInfo: pageInfo
  })
}

//撤回
export async function rollBackTo(id, opinion) {
  return httpUtils.postJson(`${flowAPI}/flowTask/rollBackTo/${id}`, opinion)
}

//查询可批量操作流程模块
export async function findCommonTaskSumHeader() {
  return httpUtils.get(`${flowAPI}/flowTask/findCommonTaskSumHeader`, {batchApproval: true})
}

//分页查询可批量操作流程/flow-service
export async function findByPageCanBatchApprovalByBusinessModelId(businessModelId = '', quickValue, pageInfo) {
  const quickSearchProperties = ['flowName', 'taskName', 'flowInstance.businessCode', 'flowInstance.businessModelRemark', 'creatorName'];
  const searchFilter = convertSearchFilter({quickSearchProperties, quickValue: quickValue, pageInfo: pageInfo});
  return httpUtils.postJson(`${flowAPI}/flowTask/findByPageCanBatchApprovalByBusinessModelId?businessModelId=${businessModelId}`, searchFilter)
}

//批量获取下一步节点信息
export async function findNextNodesByVersionGroupWithUserSetCanBatch(taskIds) {
  return httpUtils.get(`${flowAPI}/flowTask/findNextNodesByVersionGroupWithUserSetCanBatch`, {taskIds: taskIds})
}

//批量提交 /flow-service/flowTask/completeTaskBatch
export async function completeTaskBatch(params = {}) {
  return httpUtils.postJson(`${flowAPI}/flowTask/completeTaskBatch`, params)
}

