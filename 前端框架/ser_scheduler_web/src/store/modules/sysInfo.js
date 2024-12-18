const state = {
  logo: '', // 系统Logo
  name: '', // 系统名称
  version: '', // 系统版本
  baseUrl: '' // 系统url
}

const mutations = {
  SYSTEM_SET_LOGO: (state, payload) => {
    state.logo = payload
  },
  SYSTEM_SET_NAME: (state, payload) => {
    state.name = payload
  },
  SYSTEM_SET_VERSION: (state, payload) => {
    state.version = payload
  },
  SYSTEM_SET_BASEURL: (state, payload) => {
    state.baseUrl = payload
  }
}

const getters = {
  getVersion: state => {
    return state.version
  },
  getName: state => {
    return state.name
  },
  getLogo: state => {
    return state.logo
  },
  getBaseUrl: state => {
    return state.baseUrl
  }
}

const actions = {
  setLogo ({ commit, state }, payload) {
    commit('SYSTEM_SET_LOGO', payload)
  },
  setName ({ commit, state }, payload) {
    commit('SYSTEM_SET_NAME', payload)
  },
  setVersion ({ commit, state }, payload) {
    commit('SYSTEM_SET_VERSION', payload)
  },
  setBaseUrl ({ commit, state }, payload) {
    commit('SYSTEM_SET_BASEURL', payload)
  }
}

export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
