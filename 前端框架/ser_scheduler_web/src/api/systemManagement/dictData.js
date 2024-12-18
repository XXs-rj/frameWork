import request from '@/utils/request'

// 根据字典类型查询字典数据信息
export function getDictData(params) {
  return request({
    url: '/inms/api/v1/system/dict/data/dataByType',
    params: params
  })
}

// 新增字典数据
export function addDictData(data) {
  return request({
    method: 'POST',
    url: '/inms/api/v1/system/dict/data/save',
    data: data
  })
}

// 修改字典数据
export function upDataDictData(data) {
  return request({
    method: 'POST',
    url: '/inms/api/v1/system/dict/data/update',
    data: data
  })
}
// 查询字典数据详细
export function detailDictData(params) {
  return request({
    url: '/inms/api/v1/system/dict/data/detail',
    params: params
  })
}

// 删除字典数据
export function deleteDictData(data) {
  return request({
    method: 'post',
    url: '/api/v1/system/dict/data/delete',
    data: data
  })
}
