let timeOut = null
const _state = {
  lockTime: 1000 * 30 * 60,
  isShowLock: false,
  isLock: false
}
const getters = {
  lockTime: state => state.lockTime,
  isShowLock: state => state.isShowLock,
  isLock: state => state.isLock
}
const mutations = {
  SET_ISLOCK: (state, isLock) => {
    state.isLock = isLock
  },
  SET_LOCKTIME: (state, lockTime) => {
    state.lockTime = lockTime
  },
  SET_ISSHOWLOCK: (state, isShowLock) => {
    state.isShowLock = isShowLock
  }
}

const actions = {
  setLockTime ({ commit }, lockTime) {
    commit('SET_LOCKTIME', lockTime * 1000 * 60)
  },
  setIsShowLock ({ commit }, isShowLock) {
    commit('SET_ISSHOWLOCK', isShowLock)
  },
  setIsLock ({ commit, state }, isLock) {
    commit('SET_ISLOCK', isLock)
    if (!isLock) {
      clearTimeout(timeOut)
      timeOut = setTimeout(() => {
        commit('SET_ISLOCK', true)
      }, state.lockTime)
    }
  }
}

export default {
  namespaced: true,
  getters,
  state: _state,
  mutations,
  actions
}
