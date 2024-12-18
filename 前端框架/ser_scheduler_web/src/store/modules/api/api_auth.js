import Vue from 'vue'

export default {
  getRole (params) {
    return Vue.axios.get('/ser-ipaas-common/api/auth/getRole', {
      params
    })
  },
  listFunsByRole (appCode, roleCode) {
    return Vue.axios.get(`/auth-external-microservice/v1/role/listFuns/${appCode}/${roleCode}`)
  }
}
