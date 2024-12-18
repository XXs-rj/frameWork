import Vue from 'vue'

export default {
  // 通过条件获取租户列表
  // getTenantList (params) {
  //   return Vue.axios.post('/ser-ipaas-common/api/tenants/selby', params)
  // },
  getTenantList (size = -1) {
    return Vue.axios.get(`/v2/tenants?size=${size}`)
  }
  // 按照租户查询项目列表
  // getProjectList (tenantId) {
  //   return Vue.axios.get(`/ser-ipaas-common/api/tenants/${tenantId}/projects`)
  // }
}
