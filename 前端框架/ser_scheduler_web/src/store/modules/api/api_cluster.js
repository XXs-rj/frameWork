import Vue from 'vue'

export default {
  getClusterInfo (clusterId) {
    return Vue.axios.get(`/v2/clusters/${clusterId}`)
  },
  getStorageClassType (cluster) {
    return Vue.axios.get(`/v2/clusters/${cluster}/storageclass/type`)
  }
}
