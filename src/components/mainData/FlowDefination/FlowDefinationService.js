/**
 * 企业用户service
 * @author 李艳
 */
import httpUtils  from "../../../commons/utils/FeatchUtils";
import {baseUrl} from "../../../configs/DefaultConfig"

/**
 * 保存或者更新一个分配关系
 *
 * param entity 实体对象
 * return 操作结果
 */
export async function listAllOrgs(params={}){
    return httpUtils.get(baseUrl+"/flowDefination/listAllOrgs",params);
}

export async function listFlowDefination(params={}){
    return httpUtils.get(baseUrl+"/flowDefination/findByPage",params);
}
