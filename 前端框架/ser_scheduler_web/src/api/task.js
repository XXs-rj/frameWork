import request from '@/utils/request'

export function getTaskList(params) {
    return request({
        url: `/api/v1/control/task/info/selPage?pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
        method: 'post',
        data: params
        // params
    })
}

export function getTaskNum(params) {
    return request({
        url: `/api/v1/control/task/info/getTaskNum`,
        method: 'post',
        data: params
        // params
    })
}
