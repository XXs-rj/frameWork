/**
 * Created by kksong on 16/12/24.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

// 手机号的校验的规则
// 1 开头 第二字为3-9 11位数字
export function validMobile(str) {
  return /^1[3-9]\d{9}$/.test(str) // 接收参数效验手机号
}

// 邮箱格式验证规则
export function validEmail(str) {
  return /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.]){1,2}[A-Za-z\d]{2,5}$/g.test(str)
}

export function validName(str) {
  return /^[^\u4e00-\u9fa5]{4,16}$/g.test(str)
}
export function validPassword(str) {
  return /^[^\u4e00-\u9fa5]{5,9}$/g.test(str)
}
export function dictName(str) {
  return /^[A-Z,a-z,_]{5,30}$/.test(str)
}
// 网关
export function gateway(str) {
  return /^http:\/\/.*/g.test(str)
}
