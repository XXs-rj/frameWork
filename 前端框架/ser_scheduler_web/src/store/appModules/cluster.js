import { fetchGetClusterStorageList, fetchProxy } from '@/api/app'
const state = {
  clusters: {},
  hostMetrics: {},
  hostInfo: {},
  kubeproxy: {},
  clusterStorage: {

  },
  proxy: { }
}
const mutations = {
  SET_CLUSTERSTORAGE: (state, clusterStorage) => {
    state.clusterStorage = { ...state.clusterStorage, ...clusterStorage }
  },
  SET_PROXY: (state, proxy) => {
    state.proxy = { ...state.proxy, ...proxy }
  }

}
const getters = {
  getClusterStorage: state => {
    return state.clusterStorage
  },
  getProxy: state => {
    return state.proxy
  }

}
const actions = {
  getClusterStorageList ({ commit }, { cluster, callback }) {
    fetchGetClusterStorageList(cluster).then((res) => {
      const storage = {
        [cluster]: {
          isFetching: false,
          cephList: res.cephList || [],
          nfsList: res.nfsList || [],
          glusterfsList: res.glusterfsList || [],
          iscsiList: res.iscsiList || []
        }
      }
      commit('SET_CLUSTERSTORAGE', storage)
      if (callback) {
        callback(res)
      }
    })
  },
  getProxy ({ commit }, { cluster, callback }) {
    fetchProxy(cluster).then((res) => {
      commit('SET_PROXY', res)
      if (callback) {
        callback(res)
      }
    }).catch(() => {
      callback()
    })
  }

}
export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
