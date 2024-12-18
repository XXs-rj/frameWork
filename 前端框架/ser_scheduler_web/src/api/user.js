import request from '@/utils/request'

export function getLoginCode(params) {
  return request({
    url: '/api/v1/core/user/login/info/captcha',
    method: 'get',
    params: params
  })
}

export function login(data) {
  return request({
    url: '/api/v1/core/user/login/info/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
