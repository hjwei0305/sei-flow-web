/**
 * 不同意原因service
 * @author 何灿坤
 */

import {request as httpUtils, constants} from "@/utils";

const {baseUrl} = constants;

//请求所有的流程类型
export async function findReasonOfDisagree(params = {}) {
  const commonReason = {
    id: "commonReason", code: "commonReason", name: "全局通用原因", depict: "流程默认的全局通用的不同意原因（创建后所有流程类型下生效）"
  };
  return httpUtils.get(baseUrl + "/flowType/getAll", params).then(resData => {
    resData.unshift(commonReason);
    return resData
  });
}

//通过流程类型ID获取不同意原因列表
export async function getDisagreeReasonByTypeId(params = {}) {
  return httpUtils.get(baseUrl + "/disagreeReason/getDisagreeReasonByTypeId", params);
}

//保存不同意原因
export async function saveDisagreeReason(params = {}) {
  return httpUtils.postJson(baseUrl + "/disagreeReason/save", params);
}

//修改不同意原因状态
export async function updateStatusById(params = {}) {
  return httpUtils.post(baseUrl + "/disagreeReason/updateStatusById", params);
}

