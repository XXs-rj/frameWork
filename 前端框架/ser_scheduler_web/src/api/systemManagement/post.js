import request from '@/utils/request'
// 获取岗位列表

export function getPost(params) {
  return request({
    url: '/system/api/v1/core/post/selpage',
    params: params
  })
}
// 获取岗位 -非分页
export function listByCondition(params) {
  return request({
    url: '/system/api/v1/core/post/list',
    params: params
  })
}

// 新增岗位
export function addPost(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/post/save?deptId=${data.deptId}`,
    data: data
  })
}

// 删除岗位
export function deletePost(params) {
  return request({
    url: '/system/api/v1/core/post/delete',
    params: params
  })
}

// 岗位详情
export function detailPost(params) {
  return request({
    url: `/system/api/v1/core/post/detail`,
    params: params
  })
}

// 修改岗位
export function updatePost(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/post/update?postId=${data.postId}`,
    data: data
  })
}
