import request from '@/utils/request'
import Axios from 'axios'

export function getAllAlgorithm() {
    return request({
        url: `/api/v1/compute/dispatch/algorithm/getAllAlgorithm`,
        method: 'get'
    })
}

export function getAlgorithm(algoName, createTime, updateTime) {
    return Axios.get(`/api/v1/compute/dispatch/algorithm/getAlgorithm?algoName=${algoName}&createTime=${createTime}&updateTime=${updateTime}`)
}

export function addAlgorithm(params) {
    return request({
        url: `/api/v1/compute/dispatch/algorithm/saveAlgorithm`,
        method: 'post',
        data: params
    })
}

export function deleteAlgorithm(params) {
    return request({
        url: `/api/v1/compute/dispatch/algorithm/deleteBy`,
        method: 'post',
        data: params
    })
}

export function updateAlgorithmById(id, params) {
    return request({
        url: `/api/v1/compute/dispatch/algorithm/updateAlgorithmById/${id}`,
        method: 'put',
        data: params
    })
}