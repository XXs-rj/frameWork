export default {
  namespaced: true,
  state: {
    reqCount: 0
  },
  mutations: {
    SEND_REQ: state => state.reqCount += 1,
    RECEIVE_RES: state => state.reqCount -= 1
  },
  getters: {
    isLoading: state => state.reqCount > 0
  },
  actions: {
    sendRequest ({ commit }) {
      commit('SEND_REQ')
    },
    receiveResponse ({ commit }) {
      commit('RECEIVE_RES')
    }
  }
}
