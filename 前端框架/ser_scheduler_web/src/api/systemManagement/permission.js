import request from '@/utils/request'
// 获取权限列表

export function getPermission(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/permission/page?permissionName=${data.permissionName}&pageNum=${data.pageNum}&pageSize=${data.pageSize}`,
    data: data
  })
}
// 新增权限
export function addPermission(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/permission/save',
    data: data
  })
}

// 更新权限
export function updatePermission(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/permission/update?id=${data.id}`,
    data: data
  })
}

// 获取角色关联权限

export function getRolePermission(params) {
  return request({
    url: '/system/api/v1/core/permission/pageByRoleId',
    params: params
  })
}

// 分配菜单
export function operateMenu(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/permission/operateMenu`,
    data: data
  })
}

// 权限删除
export function deletePermission(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/permission/delete`,
    data: data
  })
}
// 权限分配资源
export function operateRequest(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/permission/alloc/res`,
    data: data
  })
}
// 获取资源
export function getRequest(params) {
  return request({
    method: 'get',
    url: `/system/api/v1/core/application/interface/listByMenuId`,
    params: params
  })
}
