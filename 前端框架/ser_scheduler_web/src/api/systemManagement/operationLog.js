import request from '@/utils/request'

// 获取字典类型列表
export function getOperationList(params) {
  return request({
    url: '/api/v1/system/log/operation/page',
    params: params
  })
}
// 获取登录日志
export function getLoginOper(params) {
  return request({
    url: '/system/api/v1/core/user/login/info/login/record',
    params: params
  })
}
