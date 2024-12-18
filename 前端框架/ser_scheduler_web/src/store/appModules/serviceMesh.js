
const state = {
  createAppMeshFlag: false
}

const mutations = {
  SET_CREATE_APP_MESH_FLAG: (state, createAppMeshFlag) => {
    state.createAppMeshFlag = createAppMeshFlag
  }

}

const getters = {
  getcreateAppMeshFlag: state => {
    return state.createAppMeshFlag
  }

}

const actions = {
  // 当创建应用的时候, 如果开启了服务网格, 创建应用处的访问方式应该不显示当前组件, 而是显示一段话
  toggleCreateAppMeshFlag ({ commit }, flag) {
    commit('SET_CREATE_APP_MESH_FLAG', flag)
  }

}

export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
