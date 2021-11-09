import { request as httpUtils, constants, } from "@/utils";
const { baseUrl } = constants;

//查询该执行人所有的固化配置
export async function getSolidifyFlowInstanceByUserId(userId) {
  return httpUtils.get(baseUrl + "/flowInstance/getSolidifyFlowInstanceByUserId?userId=" + userId);
}

//替换执行人
export async function replaceSolidifyExecutorByVo(oldUserId, newUserId, businessIdList) {
  return httpUtils.postJson(baseUrl + "/flowSolidifyExecutor/replaceSolidifyExecutorByVo", {
    oldUserId: oldUserId,
    newUserId: newUserId,
    businessIdList: businessIdList
  });
}

//获取全部组织机构
export async function listAllOrgs() {
  return httpUtils.postJson(baseUrl + "/flowDefination/listAllOrgs");
}

//获取组织机构下员工
export async function listAllUserByOrgId(orgId, searchValue, pageInfo) {
  return httpUtils.postJson(baseUrl + "/flowDefination/listUserByOrg", {
    organizationId: orgId,
    includeSubNode: true,
    quickSearchValue: searchValue,
    pageInfo: pageInfo
  })
}


