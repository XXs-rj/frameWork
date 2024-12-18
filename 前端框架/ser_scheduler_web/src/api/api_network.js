import request from '@/utils/request'

//获取网元列表
export function getNetworkElementList(params) {
    return request({
        url: `/api/v1/compute/network/element/get/page`,
        method: 'post',
        data: params
    })
}

//获取链路列表
export function getNetworkLinkList(params) {
    return request({
        url: `/api/v1/compute/network/link/get/page`,
        method: 'post',
        data: params
    })
}

//获取性能列表
export function getNetworkPropertyList(params) {
    return request({
        url: `/api/v1/compute/network/property/get/page`,
        method: 'post',
        data: params
    })
}

//获取流量列表
export function getNetworkTrafficList(params) {
    return request({
        url: `/api/v1/compute/network/traffic/get/page`,
        method: 'post',
        data: params
    })
}



