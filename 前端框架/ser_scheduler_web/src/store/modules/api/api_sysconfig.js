/*
 * @Author: liuling liuling02@inspur.com
 * @Date: 2023-12-25 11:34:12
 * @LastEditors: liuling liuling02@inspur.com
 * @LastEditTime: 2024-01-05 16:33:16
 * @FilePath: \console\packages\src-entry\src\framework\appPaas\api\api_sysconfig.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import axios from 'axios'
import Vue from 'vue'

export default {
  // 获取平台配置
  getPaasConfig: () => {
  //  禁止此接口请求头携带token，如果带了token会验证token,从而验证失败，使用单独axios
    const baseUrl = Vue.prototype.$config?.BASE_URL || ''
    return Vue.axios.get('/v2/sysconfig/paas')
  },
  checkConfig (projectId, envId, type) {
    return Vue.axios.get(`/ser-ipaas-common/api/sysconfig/checkConfig/${projectId}/${envId}?checkItem=${type}`)
  },
  getLicenseTime () {
    return Vue.axios.get('/v2/licenses/merged')
  },
  getPassId () {
    return Vue.axios.get('/v2/licenses/platform')
  },
  addLicenses (data) {
    return Vue.axios.post('/v2/licenses', data)
  }
}
