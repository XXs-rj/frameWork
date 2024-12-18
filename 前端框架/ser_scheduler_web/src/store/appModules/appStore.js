import { fetchAppsList } from '../../api/app'
const state = {
  imagePublishRecord: undefined // 镜像商店中的镜像
}

const mutations = {
  SETIMAGEPUBLISHRECORD: (state, imagePublishRecord) => {
    state.imagePublishRecord = imagePublishRecord
  }

}

const getters = {
  getImagePublishRecord: state => {
    return state.imagePublishRecord
  }

}

const actions = {
  // 公有/私有镜像列表
  fetchAppsList ({ commit }, query) {
    fetchAppsList(query).then((res) => {
      const data = res.data
      commit('SETIMAGEPUBLISHRECORD', data)
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
