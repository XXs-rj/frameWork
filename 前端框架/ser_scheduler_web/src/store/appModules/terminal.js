
import cloneDeep from 'lodash/cloneDeep'

export const TERM_NAME_CONTAINER_DIVIDER = '-TERM_NAME_CONTAINER_DIVIDER-'
export const TERM_REMOVE_ALL_SERVICE_CONTAINER = 'TERM_REMOVE_ALL_SERVICE_CONTAINER'
const state = {
  list: {},
  active: {}
}
const mutations = {
  SET_LIST: (state, list) => {
    state.list = { ...state.list, ...list }
  }

}
const getters = {
  getTerminalList: state => {
    return state.list
  }

}
const actions = {
  async removeTerminal ({ commit, state }, { cluster, item: it, containerKey }) {
    const item = {
      ...it,
      containerKey,
      containerUniqKey: it.metadata.name + TERM_NAME_CONTAINER_DIVIDER + containerKey
    }
    const oldList = cloneDeep(state.list[cluster]) || []
    if (typeof (item) === 'string') {
      return commit('SET_LIST', {
        [cluster]: oldList.filter(oldItem => {
          const nameArray = oldItem.metadata.name.split('-')
          if (nameArray[0] !== item) {
            return oldItem
          }
        })
      })
    }
    commit('SET_LIST', {
      [cluster]: oldList.filter(oldItem => {
        if (item.containerKey === TERM_REMOVE_ALL_SERVICE_CONTAINER) {
          return oldItem.metadata.name !== item.metadata.name
        }
        return oldItem.containerUniqKey !== item.containerUniqKey
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
