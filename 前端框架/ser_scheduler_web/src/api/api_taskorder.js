import request from '@/utils/request'

export function getAllTaskorder(param) {
    return request({
        url: `/api/v1/compute/dispatch/taskorder/selpage`,
        method: 'post',
        data: param
    })
}

export function getCountNum(taskorderTitle) {
    return request({
        url: `/api/v1/compute/dispatch/taskorder/countNum?taskorderTitle=${taskorderTitle}`,
        method: 'get'
    })
}

export function createTaskorder(param) {
    return request({
        url: `/api/v1/compute/dispatch/taskorder/createTaskorder`,
        method: 'post',
        data: param
    })
}

export function getTaskorderById(id) {
    return request({
        url: `/api/v1/compute/dispatch/taskorder/${id}`,
        method: 'get'
    })
}

export function updateTaskorder(param) {
    return request({
        url: `/api/v1/compute/dispatch/taskorder/update`,
        method: 'put',
        data: param
    })
}
