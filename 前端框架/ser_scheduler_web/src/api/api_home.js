import request from '@/utils/request'

// 获取算力增加趋势数据
export function getComputeGroupTrend() {
  return request({
      url: `/api/v1/cloud/portalData/computeGroupTrend`,
      method: 'get'
  })
}

// 获取算力使用趋势数据
export function getComputeUseTrend() {
  return request({
      url: `/api/v1/cloud/portalData/computeUseTrend`,
      method: 'get'
  })
}

// 获取算力资源利用率数据
export function getComputeResourceRate() {
  return request({
      url: `/api/v1/cloud/portalData/computeResourceRate`,
      method: 'get'
  })
}

// 获取各中心GPU利用率排行数据
export function getComputeGPURateRanking() {
  return request({
      url: `/api/v1/cloud/portalData/computeGPURateRanking`,
      method: 'get'
  })
}

// 获取各中心算力排行榜
export function getComputeResourceRanking() {
  return request({
      url: `/api/v1/cloud/portalData/computeResourceRanking`,
      method: 'get'
  })
}

// 查询算力型号分布
export function getComputeResourceModeltypeRate() {
  return request({
      url: `/api/v1/cloud/portalData/computeResourceModeltypeRate`,
      method: 'get'
  })
}

// 查询算力概览
export function getComputePowerOverview() {
  return request({
      url: `/api/v1/cloud/portalData/computePowerOverview`,
      method: 'get'
  })
}

// 查询算力总览情况
export function getComputePowerOverviewScheduler() {
  return request({
      url: `/api/v1/cloud/portalData/computePowerOverviewScheduler`,
      method: 'get'
  })
}

// 查询资源信息总览
export function getComputePowerResourceInformation() {
  return request({
      url: `/api/v1/cloud/portalData/computePowerResourceInformation`,
      method: 'get'
  })
}
