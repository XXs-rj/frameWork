import request from '@/utils/request'
// 获取菜单列表

export function getMenu(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/menu/list',
    data: data
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/menu/save',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/menu/update?menuId=${data.menuId}`,
    data: data
  })
}

// 根据权限获取菜单
export function permissionMenu(params) {
  return request({
    url: `/system/api/v1/core/menu/listByPermissionId`,
    params: params
  })
}

// 菜单删除
export function deleteMenu(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/menu/delete`,
    data: data
  })
}

// 获取接口
export function apiList(data) {
  return request({
    method: 'post',
    url: `/system/api/v1/core/menu/selectRelatedInterfaces?pageNum=${data.pageNum}&pageSize=${data.pageSize}`,
    data: data
  })
}
// 菜单关联
export function apiAdd(data) {
  return request({
    method: 'post',
    url: `/system/api/v1/core/menu/add/interface`,
    data: data
  })
}
export function syncApi(params) {
  return request({
    method: 'get',
    url: `/system/api/v1/core/application/interface/synAllInterface`,
    params: params
  })
}
