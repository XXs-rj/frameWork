import request from '@/utils/request'
import Axios from 'axios'

export function getAllDispatch(param) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/pageAll`,
        method: 'post',
        data: param
    })
}

export function addDispatch(params) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/saveStrategy`,
        method: 'post',
        data: params
    })
}

export function getDispatch(strategyName, strategyCode) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/getStrategy?strategyName=${strategyName}&strategyCode=${strategyCode}`,
        method: 'get'
    })
}

export function updateStrategyById(params) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/updateStrategy`,
        method: 'put',
        data: params
    })
}

export function deleteDispatch(id, params) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/deleteStrategy/${id}`,
        method: 'delete',
        data: params
    })
}

export function getDispatchListByStatus(status) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/selectByType?bussinessFlow=${status}`,
        method: 'get'
    })
}