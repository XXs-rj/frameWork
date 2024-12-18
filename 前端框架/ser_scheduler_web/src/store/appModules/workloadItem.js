const state = {
  yamlValue: '',
  editorWarn: []
}
const mutations = {
  SET_YAMLVALUE: (state, yamlValue) => {
    state.yamlValue = yamlValue
  },
  SET_EDITORWARN: (state, editorWarn) => {
    state.editorWarn = editorWarn
  }

}
const getters = {
  getYamlValue: state => {
    return state.yamlValue
  },
  getEditorWarn: state => {
    return state.editorWarn
  }
}
const actions = {
  updateYamlValue ({ commit }, yamlValue) {
    commit('SET_YAMLVALUE', yamlValue)
  },
  patchWarn ({ commit, state }, { type, message }) {
    if (type === 'add') {
      const { editorWarn = [] } = state
      const keyArray = editorWarn.map(([ikey]) => ikey) || []
      const [key] = message
      if (keyArray.includes(key)) {
        if (key === 'fetchError') {
          editorWarn.forEach(item => {
            (item[0] === 'fetchError') && (item[1] = message[1])
          })
          return { ...state, editorWarn }
        }
        return state
      }
      const newEditorWarn = [...editorWarn, message] || []
      commit('SET_EDITORWARN', newEditorWarn)
    }
    if (type === 'delete') {
      const { editorWarn = [] } = state
      const [key] = message
      if (key === 'all') {
        return { ...state, editorWarn: [] }
      }
      const newEditorWarn = editorWarn.filter(([ikey]) => {
        return ikey !== key
      }) || []
      commit('SET_EDITORWARN', newEditorWarn)
    }
  }

}
export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
