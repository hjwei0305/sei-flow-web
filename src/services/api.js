import { request, constants, } from "@/utils";

const { authApiUrl, } = constants;

/** 登录*/
export async function login(data) {
  const url = `${authApiUrl}/auth/login`;
  return request.postJson(url, data);
}

/** 退出*/
export async function logout(params) {
  const url = `${authApiUrl}/auth/logout`;
  return request({
    url,
    method: "POST",
    headers: {
      needToken: false,
    },
    data: params,
  });
}

/** 获取当前用户有权限的功能项集合 */
export async function getAuthorizedFeatures(userId) {
  return request.get(`${authApiUrl}/auth/getAuthorizedFeatures?userId=${userId}`);
}

