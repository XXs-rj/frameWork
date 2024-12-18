const state = {
  fields: {} //

}

const mutations = {
  // 创建一个fields
  QUICK_CREATE_APP_SET_FORM_FIELDS: (state, { key, fields }) => {
    const newFields = Object.assign({}, state.fields || {}, {
      [key]: fields
    })
    state.fields = newFields
  },
  // 根据key删除对应field
  QUICK_CREATE_APP_REMOVE_FORM_FIELDS: (state, key) => {
    const newFields = {}
    for (const fieldKey in (state.fields || {})) {
      if (Object.prototype.hasOwnProperty.call(state.fields, fieldKey) && fieldKey !== key) {
        newFields[fieldKey] = state.fields[fieldKey]
      }
    }
    state.fields = newFields
  },
  QUICK_CREATE_APP_REMOVE_OLD_FORM_FIELDS_BY_REG_EXP: (state, { key, reg }) => {
    const currentFields = state.fields[key] || {}
    const newFields = {}
    for (const fieldKey in currentFields) {
      if (Object.prototype.hasOwnProperty.call(currentFields, fieldKey) && !reg.test(fieldKey)) {
        newFields[fieldKey] = currentFields[fieldKey]
      }
    }
    state.fields = { [key]: newFields }
  },
  // 删除所有fields
  QUICK_CREATE_APP_REMOVE_ALL_FORM_FIELDS: (state) => {
    state.fields = {}
  }

}

const getters = {
  getFields: state => {
    return state.fields
  }

}

const actions = {
  setFormFields ({ commit }, { key, fields, callback }) {
    commit('QUICK_CREATE_APP_SET_FORM_FIELDS', { key, fields })
    if (callback) {
      callback()
    }
  },
  removeFormFields ({ commit }, key) {
    commit('QUICK_CREATE_APP_REMOVE_FORM_FIELDS', key)
  },
  removeAllFormFields ({ commit }) {
    commit('QUICK_CREATE_APP_REMOVE_ALL_FORM_FIELDS')
  },
  removeOldFormFieldsByRegExp ({ commit }, { key, reg }) {
    commit('QUICK_CREATE_APP_REMOVE_OLD_FORM_FIELDS_BY_REG_EXP', { key, reg })
  }

}

export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
