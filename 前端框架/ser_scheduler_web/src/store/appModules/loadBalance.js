import { fetchTcpUdpIngress, fetchLBList } from '@/api/app'
const state = {
  TcpUdpIngress: {},
  loadBalanceList: []
}
const mutations = {
  SET_TCP_UDP_INGRESS: (state, TcpUdpIngress) => {
    state.TcpUdpIngress = { ...state.TcpUdpIngress, ...TcpUdpIngress }
  },
  SET_LOAD_BALANCE_LIST: (state, loadBalanceList) => {
    state.loadBalanceList = loadBalanceList
  }

}
const getters = {
  getTcpUdpIngress: state => {
    return state.TcpUdpIngress
  },
  getloadBalanceList: state => {
    return state.loadBalanceList
  }
}
const actions = {
  async getTcpUdpIngress ({ commit }, { cluster, lbname, type }) {
    await fetchTcpUdpIngress(cluster, lbname, type).then((res) => {
      commit('SET_TCP_UDP_INGRESS', {
        [type]: {
          isFetching: false,
          data: res.data
        }
      })
    })
  },
  async getLBList ({ commit }, { cluster, query, callback }) {
    try {
      const res = await fetchLBList(cluster, query)
      const result = {
        data: res.data,
        total: res.total
      }
      commit('SET_LOAD_BALANCE_LIST', res.data)
    } catch {
      commit('SET_LOAD_BALANCE_LIST', [])
    }
    callback && callback()
  }

}
export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
