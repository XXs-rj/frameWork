import request from '@/utils/request'

export function getAllWorkorder(param) {
    return request({
        url: `/api/v1/compute/dispatch/workorder/selpage`,
        method: 'post',
        data: param
    })
}

export function getWorkorderById(id) {
    return request({
        url: `/api/v1/compute/dispatch/workorder/${id}`,
        method: 'get'
    })
}

export function getCountNum(workorderTitle) {
    return request({
        url: `/api/v1/compute/dispatch/workorder/countNum?workorderTitle=${workorderTitle}`,
        method: 'get'
    })
}

export function createWorkorder(param) {
    return request({
        url: `/api/v1/compute/dispatch/workorder/createWorkorder`,
        method: 'post',
        data: param
    })
}

export function updateWorkorder(param) {
    return request({
        url: `/api/v1/compute/dispatch/workorder/update`,
        method: 'put',
        data: param
    })
}
