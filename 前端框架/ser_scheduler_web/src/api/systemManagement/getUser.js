// 获取用户列表
import request from '@/utils/request'
export function getUser(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/page?nickName=${data.nickName}&status=${data.status}&userType=${data.userType}&userLoginName=${data.userLoginName}&pageNum=${data.pageNum}&pageSize=${data.pageSize}`,
    data: data
  })
}

// 用户状态更改

export function editStatus(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/user/changeStatus',
    data: data
  })
}

// 新增用户接口
export function addUser(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/user/login/info/save',
    data: data
  })
}

// 删除用户
export function deleteUser(params) {
  return request({
    url: '/system/api/v1/core/user/delete',
    params: params
  })
}

// 获取详细用户信息

export function detailUser(params) {
  return request({
    url: '/system/api/v1/core/user/detail',
    params: params
  })
}

// 重置密码

export function resetPwd(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/user/resetPwd?type=reset',
    data: data
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/update?userId=${data.userId}`,
    data: data
  })
}
// 用户修改密码
export function changePassword(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/login/info/modify/password`,
    data: data
  })
}

// 用户分配角色
export function operateRole(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/operateRole`,
    data: data
  })
}
// 根据用户组id 获取用户
export function getGroupIdUser(params) {
  return request({
    url: '/system/api/v1/core/user/pageByGroupId',
    params: params
  })
}

// 重置密码
export function resetPassword(params) {
  return request({
    url: '/system/api/v1/core/user/login/info/reset/password',
    params: params
  })
}

// 接触锁定

export function unLock(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/login/info/unlock`,
    data: data
  })
}

// 启用or禁用
export function updateStatus(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/user/login/info/updateStatus`,
    data: data
  })
}
