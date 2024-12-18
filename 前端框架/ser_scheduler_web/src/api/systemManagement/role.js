import request from '@/utils/request'
// 获取角色列表 // 分页

export function getRole(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/role/page?roleName=${data.roleName}&roleKey=${data.roleKey}&pageNum=${data.pageNum}&pageSize=${data.pageSize}`,
    data: data
  })
}
// 获取用户关联角色

export function getAllRole(params) {
  return request({
    url: '/system/api/v1/core/role/pageByUserId',
    params: params
  })
}

// 获取用户组关联角色

export function getGroupRole(params) {
  return request({
    url: '/system/api/v1/core/role/pageByGroupId',
    params: params
  })
}
// 新增角色
export function addRole(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/role/save',
    data: data
  })
}

// 修改保存
export function updateRole(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/role/update?roleId=${data.roleId}`,
    data: data
  })
}

// 角色分配权限
export function operatePermission(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/role/operatePermission`,
    data: data
  })
}

// 删除用jiaose
export function deleteRole(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/role/delete`,
    data: data
  })
}
