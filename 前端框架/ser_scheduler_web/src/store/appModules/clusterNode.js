import { fetchNetworkSolutions, fetchNodes } from '@/api/app'
const state = {
  networksolutions: {

  },
  clusterNodes: {}
}
const mutations = {
  SET_NETWORK_SOLUTIONS: (state, networksolutions) => {
    state.networksolutions = { ...state.networksolutions, ...networksolutions }
  },
  SET_CLUSTER_NODES: (state, clusterNodes) => {
    state.clusterNodes = { ...state.clusterNodes, ...clusterNodes }
  }
}
const getters = {
  getNetworksolutions: state => {
    return state.networksolutions
  },
  getClusterNodes: state => {
    return state.clusterNodes
  }

}
const actions = {
  getNetworkSolutions ({ commit }, { clusterID, callback }) {
    return new Promise((resolve, reject) => {
      fetchNetworkSolutions(clusterID).then((res) => {
        const result = {
          [clusterID]: res.data.data || {}
        }
        commit('SET_NETWORK_SOLUTIONS', result)
        if (callback) {
          callback(res)
        }
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  },
  getClusterNodes ({ commit }, { cluster, callback, tenantID }) {
    fetchNodes(cluster, tenantID).then((res) => {
      const result = {
        [cluster]: res
      }
      commit('SET_CLUSTER_NODES', result)
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
