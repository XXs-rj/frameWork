import request from '@/utils/request'

export function getTransferList(params) {
  return request({
    url: `/api/v1/control/transfer/info/selPage?pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
    method: 'post',
    data: params
    // params
  })
}

export function addTransferItem(params) {
    return request({
      url: `/api/v1/control/transfer/info/save`,
      method: 'post',
      data: params
      // params
    })
  }
  
  export function updateTransferItem(params) {
    return request({
      url: `/api/v1/control/transfer/info/update?id=${params.id}`,
      method: 'post',
      data: params
      // params
    })
  }
  
  export function deleteTransferItem(params) {
    return request({
      url: `/api/v1/control/transfer/info/del?id=${params.id}`,
      method: 'post',
      data: params
      // params
    })
  }