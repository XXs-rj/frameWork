export default {
  namespaced: true,
  state: {
    catchArr: [] // 保存缓存的列表(要缓存的组件名称，注意 不是路由名称）
  },
  mutations: {
    // 对指定组件进行动态更改缓存（缓存）--组件调用该方法时，判断该组件是否存在于该缓存数组，无则添加
    ADDKEEPALIVE (state, component) {
      !state.catchArr.includes(component) && state.catchArr.push(component)
    },
    // 对指定组件进行动态更改缓存（不缓存）--组件调用该方法时，从缓存数组中删除对应的组件元素
    REMOVEKEEPALIVE (state, component) {
      const index = state.catchArr.indexOf(component)
      index > -1 && state.catchArr.splice(index, 1)
    }
  },
  getters: {
    catchArr: state => state.catchArr
  },
  actions: {
    addKeepAlive ({ commit }, viewName) {
      commit('ADDKEEPALIVE', viewName)
    },
    removeKeepAlive ({ commit }, viewName) {
      commit('REMOVEKEEPALIVE', viewName)
    }
  }
}
