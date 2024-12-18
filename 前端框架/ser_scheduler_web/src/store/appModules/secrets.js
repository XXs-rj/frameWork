
import { fetchGetSecrets } from '@/api/app'

const state = {
  list: {

  }
}
const mutations = {
  SET_LIST: (state, list) => {
    state.list = { ...state.list, ...list }
  }

}
const getters = {
  list: state => {
    return state.list
  }

}
const actions = {
  getSecrets ({ commit }, { clusterID, query }) {
    fetchGetSecrets(clusterID, query).then((res) => {
      commit('SET_LIST', { [clusterID]: { data: res || [] } })
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
