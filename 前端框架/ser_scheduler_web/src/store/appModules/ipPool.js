import { fetchIPPoolList, fetchMacvlanIPPool, fetchMacvlanIPAssignment } from '@/api/app'
const state = {
  macvlanPools: undefined,
  ipAssignmentList: undefined,
  IPPoolList: []
}
const mutations = {
  SET_IPPOOL_LIST: (state, IPPoolList) => {
    state.IPPoolList = IPPoolList
  },
  SET_MACVLAN_IPPOOLS: (state, macvlanPools) => {
    state.macvlanPools = macvlanPools
  },
  SET_IP_ASSIGNMENT: (state, ipAssignmentList) => {
    state.ipAssignmentList = ipAssignmentList
  }

}
const getters = {
  getIPPoolList: state => {
    return state.IPPoolList
  },
  getMacvlanPools: state => {
    return state.macvlanPools
  },
  getIpAssignmentList: state => {
    return state.ipAssignmentList
  }

}
const actions = {
  async getIPAssignment ({ commit }, { cluster, query, callback }) {
    await fetchMacvlanIPAssignment(cluster, query).then((res) => {
      commit('SET_IP_ASSIGNMENT', res)
      if (callback) {
        callback(res)
      }
    })
  },
  getMacvlanIPPool ({ commit }, { cluster, callback }) {
    fetchMacvlanIPPool(cluster).then((res) => {
      commit('SET_MACVLAN_IPPOOLS', res)
      if (callback) {
        callback(res)
      }
    })
  },
  getIPPoolList ({ commit }, { cluster, query, callback }) {
    return new Promise((resolve, reject) => {
      fetchIPPoolList(cluster, query).then((res) => {
        commit('SET_IPPOOL_LIST', res.data.data)
        if (callback) {
          callback(res.data.data)
        }
        resolve(res.data.data)
      })
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
