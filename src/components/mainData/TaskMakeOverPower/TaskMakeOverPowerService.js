import httpUtils from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig";

/**
 * 得到用户的转授权信息（如果是管理员看到全部）
 * @param params
 * @returns {Promise.<*>}
 */
export async function getAllList(params = {}) {
  return httpUtils.postJson(baseUrl + "/taskMakeOverPower/findAllByUser", params);
}

/**
 * 修改转授权状态
 * @param param
 * @returns {Promise.<*>}
 */
export async function updateStatusById(param = {}) {
  return httpUtils.postJson(baseUrl + "/taskMakeOverPower/updateOpenStatusById?id=" + param.id);
}

/**
 * 获取全部组织机构
 * @returns {Promise.<*>}
 */
export async function listAllOrgs() {
  return httpUtils.postJson(baseUrl + "/flowDefination/listAllOrgs");
}

/**
 * 获取组织机构下全部人员(包含下级)
 * @param orgId
 * @param searchValue
 * @param pageInfo
 * @returns {Promise.<*>}
 */
export async function listAllUserByOrgId(orgId, searchValue, pageInfo) {
  return httpUtils.postJson(baseUrl + `/flowDefination/listUserByOrg`, {
    organizationId: orgId,
    includeSubNode: true,
    quickSearchValue: searchValue,
    pageInfo: pageInfo
  });
}


export async function save(params = {}) {
  return httpUtils.postJson(baseUrl + "/taskMakeOverPower/setUserAndsave", JSON.stringify(params));
}



