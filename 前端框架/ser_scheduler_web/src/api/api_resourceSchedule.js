import request from '@/utils/request'

export function createSchedule(param) {
    return request({
        url: `/api/v1/compute/dispatch/resourceScheduling/createSchedule`,
        method: 'post',
        data: param
    })
}

export function getBussinessInfo(appName, id, clusterId) {
    return request({
        url: `/api/v1/compute/dispatch/resourceScheduling/getBussinessInfo?appName=${appName}&id=${id}&clusterId=${clusterId}`,
        method: 'get',
    })
}

export function postAppDelete(param) {
    return request({
        url: `/api/v1/compute/dispatch/resourceScheduling/app/delete`,
        method: 'post',
        data: param
    })
}

export function postDeploymentDelete(param) {
    return request({
        url: `/api/v1/compute/dispatch/resourceScheduling/deployment/delete`,
        method: 'post',
        data: param
    })
}
