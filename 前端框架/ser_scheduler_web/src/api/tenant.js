import request from '@/utils/request'

export function getTenantList(params) {
  return request({
    url: `/api/v1/control/tenant/info/selPage?pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
    method: 'post',
    data: params
    // params
  })
}

export function addTenant(params) {
  return request({
    url: `/api/v1/control/tenant/info/save`,
    method: 'post',
    data: params
  })
}

export function editTenant(params) {
  return request({
    url: `/api/v1/control/tenant/info/update?id=${params.id}`,
    method: 'post',
    data: params
  })
}

export function resetPassword(params) {
  return request({
    url: `/api/v1/control/tenant/info/reset?id=${params.id}`,
    method: 'post',
    data: params
  })
}

export function getRelatedLineData(params) {
  return request({
    url: `/api/v1/control/tenant/info/getRelatedLineData?tenantId=${params.id}`,
    method: 'post',
    data: params
  })
}
