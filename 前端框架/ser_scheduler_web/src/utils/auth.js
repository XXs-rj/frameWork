import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken() {
  // return Cookies.get(TokenKey)
  return localStorage.getItem(TokenKey)
}

export function setToken (token) {
  localStorage.setItem(TokenKey,token)
  return Cookies.set(TokenKey, token)
}

export function removeToken () {
  localStorage.removeItem(TokenKey)
  return Cookies.remove(TokenKey)
}
