import {
  fetchOtherDetailTagConfig, getOtherImageTag, fetchImageTemplate, loadAppList,
  LoadOtherImage
} from '../../api/app'
import { getAppStatus, getAppStatusV2 } from '@/utils/status_identify'
import { mergeStateByOpts } from '@/utils/store_utils'
const state = {
  otherImageTag: {},
  otherTagConfig: {
    isFetching: false,
    configList: {},
    sizeInfo: ''
  },
  wrapTemplate: {

  },
  appItems: {}, 
  otherImages: {
    isFetching: false,
    bak: [],
    bakImageList: [],
    imageRow: {}
  }
}

const mutations = {
  SET_OTHER_TAG_CONFIG: (state, otherTagConfig) => {
    state.otherTagConfig = { ...state.otherTagConfig, ...otherTagConfig }
  },
  SET_OTHER_IMAGE_TAGS: (state, otherImageTag) => {
    state.otherImageTag = { ...state.otherImageTag, ...otherImageTag }
  },
  SET_WRAP_TEMPLATE_: (state, wrapTemplate) => {
    state.wrapTemplate = { ...state.wrapTemplate, ...wrapTemplate }
  },
  SET_APP_LIST: (state, appItems) => {
    state.appItems = { ...state.appItems, ...appItems }
  },
  UPDATE_APP_LIST: (state, appItems) => {
    state.appItems = { ...state.appItems, ...appItems }
  },
  SET_OTHER_IMAGES (state, otherImages) {
    state.otherImages = { ...state.otherImages, ...otherImages }
  }

}

const getters = {
  getOtherTagConfig: state => {
    return state.otherTagConfig
  },
  getOtherImageTag () {
    return state.otherImageTag
  },
  getWrapTemplate () {
    return state.wrapTemplate
  },
  getappItems () {
    return state.appItems
  },
  getOtherImages () {
    return state.otherImages
  }

}

const actions = {
  //
  loadOtherDetailTagConfig ({ commit }, { obj, callback }) {
    fetchOtherDetailTagConfig(obj).then((res) => {
      const otherTagConfig = {
        isFetching: false,
        tag: obj.imageTag || [],
        configList: res.result.configInfo || {},
        sizeInfo: res.result.sizeInfo
      }
      commit('SET_OTHER_TAG_CONFIG', otherTagConfig)
      if (callback) { callback(res) }
    })
  },
  getOtherImageTag ({ commit }, obj) {
    const LATEST = 'latest'
    const fullname = obj.imageName
    const registry = obj.registry
    getOtherImageTag(obj).then((res) => {
      const data = res.result.tags
      let full = res.result.full
      const latestTagIndex = data.indexOf(LATEST)
      if (latestTagIndex > 0) {
        data.splice(latestTagIndex, 1)
        data.unshift(LATEST)
        const temp = full.splice(latestTagIndex, 1)
        full = [].concat(temp, full)
      }
      const otherImageTag = Object.assign({}, state, {
        [fullname]: {
          isFetching: false,
          imageTag: data || [],
          tagWithOS: full
            ? full.map(item => {
              return {
                name: item.name,
                os: item.images && item.images[0] ? item.images[0].os : '',
                arch: item.images && item.images[0] ? item.images[0].architecture : ''
              }
            })
            : []
        }
      })
      commit('SET_OTHER_IMAGE_TAGS', otherImageTag)
    })
  },
  getImageTemplate ({ commit }, registry) {
    fetchImageTemplate(registry).then((res) => {
      commit('SET_WRAP_TEMPLATE_', res || {})
    })
  },
  async loadAppList ({ commit, state }, { cluster, query, pathname, callback }) {
    await loadAppList(cluster, query, pathname).then((res) => {
      let appList = res.data || []
      appList = appList.map(app => {
        app.status = getAppStatusV2(app)
        return app
      })
      appList = mergeStateByOpts((state.appItems[cluster] && state.appItems[cluster].appList) || [], appList, 'name', query.customizeOpts)
      commit('SET_APP_LIST', {
        [cluster]: {
          isFetching: false,
          cluster: res.cluster,
          appList,
          size: res.count,
          total: res.total
        }
      })
      if (callback && callback.success) {
        callback.success.func(res)
      }
    }).catch((error) => {
      if (callback && callback.failed) {
        callback.failed.func(error)
      }
    })
  },
  updateAppList ({ commit, state }, { cluster, appList }) {
    const apps = state.appItems[cluster]
    apps.appList = appList.map(app => {
      app.status = getAppStatusV2(app)
      return app
    })
    commit('SET_APP_LIST', {
      [cluster]: apps
    })
  },
  loadOtherImage ({ commit }, callback) {
    LoadOtherImage().then((res) => {
      commit('SET_OTHER_IMAGES', {
        isFetching: false,
        server: res.data.server,
        imageRow: res.data.data || []
      })
      callback && callback(res.data)
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
