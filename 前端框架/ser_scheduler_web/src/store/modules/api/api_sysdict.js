import Vue from 'vue'
export default {

  // 获取字典及字典数据
  getAllDictWithData: () => {
    return Vue.axios.get('/ser-ipaas-common/api/sysdict/getAllWithData')
  },

  // 获取字典及字典数据
  getTreeWithData: () => {
    return Vue.axios.get('/ser-ipaas-common/api/sysdict/getTreeWithData')
  },
  getDictList: () => {
    return Vue.axios.get('/ser-ipaas-common/api/sysdict/selby')
  }

}
