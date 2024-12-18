
import { listConfigGroups } from '@/api/app'

const state = {
  configGroupList: {

  }
}
const mutations = {
  SET_CONFIG_LIST: (state, list) => {
    state.configGroupList = { ...state.configGroupList, ...list }
  }

}
const getters = {
  configGroupList: state => {
    return state.configGroupList
  }

}
const actions = {
  loadConfigGroup ({ commit }, { cluster, headers }) {
    listConfigGroups(cluster, headers).then((res) => {
      commit('SET_CONFIG_LIST', { [cluster]: { configGroup: res.data || [] } })
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
