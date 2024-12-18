import { fetchClusterInfo } from '@/api/api_overview'
const state = {
  clusterInfo: {
    isFetching: false
  }
}
const mutations = {
  SET_CLUSTERINFO: (state, clusterInfo) => {
    state.clusterInfo = clusterInfo
  }

}
const getters = {
  getClusterInfo: state => {
    return state.clusterInfo
  }

}
const actions = {
  loadClusterInfo ({ commit }, { clusterID, query }) {
    commit('SET_CLUSTERINFO', { ...state.clusterInfo, isFetching: true })
    fetchClusterInfo(clusterID, query).then((res) => {
      const result = Object.assign(res, { isFetching: false })
      commit('SET_CLUSTERINFO', result)
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
