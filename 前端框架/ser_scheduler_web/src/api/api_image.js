import request from '@/utils/request'

export function getImagesList (param) {
    return request({
        url: '/api/v1/compute/platform/image/repository/list',
        method: 'post',
        data: param
    })
}

export function pullOtherWarehouseImage (param) {
    return request({
        url: '/api/v1/compute/platform/application/info/create/app',
        method: 'post',
        data: param
    })
}

export function getImage (param) {
    return request({
        url: '/api/v1/compute/platform/image/repository/list',
        method: 'post',
        data: param
    })
}