import { fetchFreeVolume } from '@/api/app'
const state = {
  avaliableVolume: {}
}

const mutations = {
  SET_AVALIABLEVOLUME: (state, avaliableVolume) => {
    state.avaliableVolume = avaliableVolume
  }

}

const getters = {
  getaValiableVolume: state => {
    return state.avaliableVolume
  }

}

const actions = {
  // 当创建应用的时候, 如果开启了服务网格, 创建应用处的访问方式应该不显示当前组件, 而是显示一段话
  fetchFreeVolume ({ commit }, { clusterID, query, callback }) {
    fetchFreeVolume(clusterID, query).then((res) => {
      commit('SET_AVALIABLEVOLUME', res)
      if (callback) {
        callback(res)
      }
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
