import {request as httpUtils, constants,} from "@/utils";
const {baseUrl} = constants;

/**
 * 通过用户查询常用联系组
 * @param params
 * @returns {Promise<*>}
 */
export async function getAllGroupByUser(params = {}) {
  return httpUtils.get(baseUrl + "/commonContactGroup/getAllGroupByUser");
}

/**
 * 保存常用联系组
 * @param params
 * @returns {Promise<Response<any>>}
 */
export async function saveCommonContactGroup(params = {}) {
  return httpUtils.postJson(baseUrl + "/commonContactGroup/save",JSON.stringify(params));
}

/**
 * 删除常用联系组
 * @param param
 * @returns {Promise<*>}
 */
export async function deleteCommonContactGroup(param=''){
  return httpUtils.delete(baseUrl+"/commonContactGroup/delete",param);
}

/**
 * 通过常用联系组请求常用联系人
 * @param params    commonContactGroupId 常用联系组ID
 * @returns {Promise<*>}
 */
export async function findCommonContactPeopleByGroupId(params={}){
    return httpUtils.get(baseUrl+"/commonContactPeople/findCommonContactPeopleByGroupId",params);
}


/**
 * 保存常用联系组人集合
 * @param params
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function saveCommonContactPeople(params = {}) {
  return httpUtils.postJson(baseUrl + "/commonContactPeople/saveList",JSON.stringify(params));
}

/**
 * 删除常用联系人
 * @param param
 * @returns {Promise<*>}
 */
export async function deleteCommonContactPeople(param=''){
  return httpUtils.delete(baseUrl+"/commonContactPeople/delete",param);
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






