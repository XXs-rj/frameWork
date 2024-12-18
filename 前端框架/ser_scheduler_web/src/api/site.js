import request from '@/utils/request'

export function selSites(params) {
    return request({
        url: `/api/v1/control/site/info/selSites`,
        method: 'post',
        data: params
        // params
    })
}
export function addSite(params) {
    return request({
        url: `/api/v1/control/site/info/save`,
        method: 'post',
        data: params
    })
}

export function editSite(params) {
    return request({
        url: `/api/v1/control/site/info/update?id=${params.id}`,
        method: 'post',
        data: params
    })
}
