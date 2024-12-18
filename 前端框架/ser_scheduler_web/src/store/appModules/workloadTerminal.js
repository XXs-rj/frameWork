import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import union from 'lodash/union'

const state = {
  list: {}, //
  active: {}
}

const mutations = {
  SET_LIST: (state, list) => {
    state.list = { ...list }
  },
  SET_ACTIVE (state, active) {
    state.active = { ...active }
  }
}

const getters = {
  getTerminalList: state => {
    return state.list
  },
  getTerminalActive: state => {
    return state.active
  }
}
const TERM_NAME_CONTAINER_DIVIDER = '-TERM_NAME_CONTAINER_DIVIDER-'
const TERM_REMOVE_ALL_SERVICE_CONTAINER = 'TERM_REMOVE_ALL_SERVICE_CONTAINER'

const actions = {
  addTerminal ({ commit, state }, { cluster, item, containerKey }) {
    const newItem = {
      ...item,
      containerKey,
      containerUniqKey: item.metadata.name + TERM_NAME_CONTAINER_DIVIDER + containerKey
    }
    const oldList = cloneDeep(state.list[cluster]) || []
    let existFlag = false
    oldList.every(oldItem => {
      if (oldItem.containerUniqKey === newItem.containerUniqKey) {
        merge(oldItem, newItem)
        existFlag = true
        return false
      }
      return true
    })
    if (!existFlag) {
      commit('SET_LIST', Object.assign({}, state.list, {
        [cluster]: union([], oldList, [newItem])
      }))
    } else {
      commit('SET_LIST', Object.assign({}, state.list, {
        [cluster]: oldList
      }))
    }

    const _Obj = {}
    Object.keys(state.active).map(k => {
      _Obj[k] = null
    })
    _Obj[cluster] = newItem.containerUniqKey
    commit('SET_ACTIVE', _Obj)
  },
  updateTerminal ({ commit, state }, { cluster, item, containerKey }) {
    const actionItem = {
      ...item,
      containerKey,
      containerUniqKey: item.metadata.name + TERM_NAME_CONTAINER_DIVIDER + containerKey
    }
    const oldList = cloneDeep(state.list[cluster]) || []
    let existFlag = false
    oldList.every(oldItem => {
      if (oldItem.containerUniqKey === actionItem.containerUniqKey) {
        merge(oldItem, actionItem)
        existFlag = true
        return false
      }
      return true
    })
    if (!existFlag) {
      commit('SET_LIST', Object.assign({}, state.list, {
        [cluster]: union([], oldList, [actionItem])
      }))
    }
    commit('SET_LIST', Object.assign({}, state.list, {
      [cluster]: oldList
    }))
  },
  removeTerminal ({ commit, state }, { cluster, item, containerKey }) {
    const actionItem = {
      ...item,
      containerKey,
      containerUniqKey: item.metadata.name + TERM_NAME_CONTAINER_DIVIDER + containerKey
    }
    const oldList = cloneDeep(state.list[cluster]) || []
    if (typeof (actionItem) === 'string') {
      if (state.active && state.active[cluster]) {
        const activeArray = state.active[cluster].split('-')
        if (actionItem !== activeArray[0]) {
          commit('SET_ACTIVE', state.active)
        }
      }
      commit('SET_LIST', Object.assign({}, state.list, {
        [cluster]: oldList.filter(oldItem => {
          const nameArray = oldItem.metadata.name.split('-')
          if (nameArray[0] !== actionItem) {
            return oldItem
          }
        })
      }))
    } else {
      let termList = []
      Object.entries(state.list).map(([cluster, items]) => {
        termList = termList.concat(
          items.map(_item => ({ ..._item, cluster }))
        )
      })
      termList = termList.filter(term => term.cluster + term.containerUniqKey !== cluster + actionItem.containerUniqKey)
      if (termList.length) {
        commit('SET_ACTIVE', { [termList[0].cluster]: termList[0].containerUniqKey })
      } else {
        commit('SET_ACTIVE', {})
      }
      commit('SET_LIST', Object.assign({}, state.list, {
        [cluster]: oldList.filter(oldItem => {
          if (actionItem.containerKey === TERM_REMOVE_ALL_SERVICE_CONTAINER) {
            return oldItem.metadata.name !== actionItem.metadata.name
          }
          return oldItem.containerUniqKey !== actionItem.containerUniqKey
        })
      }))
    }
  },
  removeAllTerminal ({ commit, state }, { cluster }) {
    const obj = {}
    Object.keys(state.list).map(k => {
      obj[k] = []
    })
    commit('SET_LIST', obj)
    const _obj = {}
    Object.keys(state.active).map(k => {
      _obj[k] = null
    })
    commit('SET_ACTIVE', _obj)
  },
  changeActiveTerminal ({ commit, state }, { cluster, key }) {
    const objs = {}
    Object.keys(state.active).map(k => {
      objs[k] = null
    })
    objs[cluster] = key
    commit('SET_ACTIVE', objs)
  }
}
export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
