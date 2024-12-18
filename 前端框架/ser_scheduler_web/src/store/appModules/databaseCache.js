import cloneDeep from 'lodash/cloneDeep'
import { fetchDbCacheList } from '@/api/api_overview'

const state = {
  databaseAllList: {
    mysql: {
      isFetching: false,
      database: 'mysql',
      databaseList: []
    }
  }
}
const mutations = {
  SET_DATABASE_ALL_LIST: (state, db) => {
    state.databaseAllList = { ...state.databaseAllList, db }
  }

}
const getters = {
  getDatabaseAllList: state => {
    return state.databaseAllList
  }

}
const actions = {
  loadDbCacheList ({ commit }, { cluster, types, callback }) {
    fetchDbCacheList(cluster, types).then((res) => {
      const bak = cloneDeep(res.databaseList || [])
      const result = {
        [types]: {
          isFetching: false,
          database: types,
          bak,
          databaseList: res.databaseList || []
        }
      }
      if (callback) {
        callback(res)
      }
      commit('SET_DATABASE_ALL_LIST', result)
    }).catch(() => {
      callback()
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
