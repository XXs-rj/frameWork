import request from '@/utils/request'

// 获取排行榜数据
export function getRank(param) {
  return request({
      url: `/api/v1/rank/list?num=${param}`,
      method: 'get'
  })
}

// 搜索框提示信息
export function getSearchInfo(param) {
  return request({
      url: `/api/v1/rank/searchInfo?info=${param}`,
      method: 'get'
  })
}

export function searchGoods(param) {
  return request({
      url: `/api/v1/rank/search`,
      method: 'post',
      data: param
  })
}