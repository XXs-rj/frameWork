import request from '@/utils/request'

// 获取字典类型列表
export function getDict(params) {
  return request({
    url: '/inms/api/v1/system/dict/type/list',
    params: params
  })
}
// 新增字典类型
export function addDict(data) {
  return request({
    method: 'POST',
    url: '/inms/api/v1/system/dict/type/save',
    data: data
  })
}

// 删除字典
export function deleteDict(data) {
  return request({
    method: 'post',
    url: '/inms/api/v1/system/dict/type/delete',
    data: data
  })
}

// 修改字典
export function updateDict(data) {
  return request({
    method: 'POST',
    url: '/inms/api/v1/system/dict/type/update',
    data: data
  })
}

// 根据字典类型查询字典类型信息
export function detailDict(params) {
  return request({
    url: `/inms/api/v1/system/dict/type/detail`,
    params: params
  })
}

// 刷新字典缓存
export function refreshCache(params) {
  return request({
    url: '/inms/api/v1/system/dict/type/refreshCache',
    params: params
  })
}
