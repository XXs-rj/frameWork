import request from '@/utils/request'
// 获取用户组

export function getUserGroup(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/user/group/list',
    data: data
  })
}

// 新增用户组
export function addUserGroup(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/user/group/save',
    data: data
  })
}

// 编辑用户组
export function editUserGroup(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/group/update?id=${data.id}`,
    data: data
  })
}
// 分配用户
export function operateUser(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/group/operateUser`,
    data: data
  })
}

// 分配角色
export function operateRole(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/group/operateRole`,
    data: data
  })
}

// 删除用户组
export function deleteGroup(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/group/delete`,
    data: data
  })
}
