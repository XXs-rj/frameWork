import request from '@/utils/request'
import Axios from 'axios'

export function getAllStrategyTemplate(param) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/template/pageAll`,
        method: 'post',
        data: param
    })
}

export function addStrategyTemplate(params) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/template/saveStrategyTemplate`,
        method: 'post',
        data: params
    })
}

export function updateStrategyTemplateById(id, params) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/template/updateStrategyTemplateById/${id}`,
        method: 'put',
        data: params
    })
}

export function getStrategyTemplate(templateName, templateCode) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/template/getStrategyTemplate?templateName=${templateName}&templateCode=${templateCode}`,
        method: 'get'
    })
}

export function deleteStrategyTemplate(id, params) {
    return request({
        url: `/api/v1/compute/dispatch/strategy/template/deleteStrategyTemplate/${id}`,
        method: 'delete',
        data: params
    })
}