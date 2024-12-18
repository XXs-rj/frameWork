import request from '@/utils/request'

export function selPackage(params) {
    return request({
        url: `/api/v1/control/package/info/selPackage`,
        method: 'post',
        data: params
        // params
    })
}
export function addPackage(params) {
    return request({
        url: `/api/v1/control/package/info/save`,
        method: 'post',
        data: params
    })
}

export function editPackage(params) {
    return request({
        url: `/api/v1/control/package/info/update?id=${params.id}`,
        method: 'post',
        data: params
    })
}
