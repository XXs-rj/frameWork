import request from '@/utils/request'
// 获取部门列表

export function getDept(params) {
  return request({
    url: '/system/api/v1/core/dept/list',
    params: params
  })
}

export function selpage(params) {
  return request({
    url: '/system/api/v1/core/dept/selpage',
    params: params
  })
}

// 删除部门
export function deleteDept(params) {
  return request({
    url: '/system/api/v1/core/dept/delete',
    params: params
  })
}

// 新增部门

export function addDept(data) {
  return request({
    method: 'POST',
    url: '/system/api/v1/core/dept/save',
    data: data
  })
}
// 修改部门

export function updateDept(data) {
  return request({
    method: 'POST',
    url: `/system/api/v1/core/dept/update?deptId=${data.deptId}`,
    data: data
  })
}

// 获取部门详情
export function detailDept(params) {
  return request({
    url: '/system/api/v1/core/dept/detail',
    params: params
  })
}
