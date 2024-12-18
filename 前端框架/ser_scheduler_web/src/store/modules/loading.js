
const state = {
  loading: true
}

const mutations = {

  setLoading(state, load) {
    // 登录 = > 获取新扥路由 =>合并
    state.loading = load
  }
}

const actions = {
  async getLoading({ commit }, data) {
    commit('setLoading', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
