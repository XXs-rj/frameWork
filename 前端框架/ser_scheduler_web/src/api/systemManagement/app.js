import request from '@/utils/request'

// 获取应用
export function getApp(params) {
  return request({
    url: '/system/api/v1/core/application/list',
    params: params
  })
}
// 新增应用
export function addApp(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/application/save',
    data: data
  })
}
// 编辑
export function editApp(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/application/update',
    data: data
  })
}
export function delApp(data) {
  return request({
    method: 'delete',
    url: `/system/api/v1/core/application/delete?id=${data.id}`,
    data: data
  })
}
// 删除
export function syncApp(params) {
  return request({
    method: 'get',
    url: params.interfaceSyncUrl
  })
}
// 同步
