import {
  fetchAllProject,
  fetchRepositoriesTags,
  fetchRepositoriesTagConfigInfo,
  fetchProjectDetail,
  fetchProjectList
} from '../../api/app'
const state = {
  allProject: {}, //
  imageTags: {},
  imageTagConfig: {},
  projects: {},
  detail: {}
}

const mutations = {
  SETALLPROJECT: (state, allProject) => {
    state.allProject = { ...state.allProject, ...allProject }
  },
  SET_HARBOR_REPOSITORIES_TAGS (state, { registry, imageTags }) {
    const currRegistry = { ...(state.imageTags[registry] || {}), ...imageTags }
    state.imageTags = { ...state.imageTags, [registry]: currRegistry }
  },
  SET_HARBOR_REPOSITORIES_TAG_CONFIGINFO (state, imageTagConfig) {
    state.imageTagConfig = { ...state.imageTagConfig, ...imageTagConfig }
  },
  SET_PROJECT_DETAIL (state, detail) {
    state.detail = detail
  },
  SET_PROJECT_LIST (state, projects) {
    state.projects = { ...state.projects, ...projects }
  }
}

const getters = {
  getAllProject: state => {
    return state.allProject
  },
  getImageTags: state => {
    return state.imageTags
  },
  getImageTagConfig: state => {
    return state.imageTagConfig
  },
  getProjectDetail: state => {
    return state.detail
  },
  getprojects: state => {
    return state.projects
  }

}

const actions = {
  // 公有/私有镜像列表
  fetchAllProject ({ commit }, { registry, query, callback }) {
    fetchAllProject(registry, query).then((res) => {
      const defaultState = {
        [registry]: {
          isFetching: false,
          list: []
        }
      }
      const mergeState = {
        publicImages: [],
        privateImages: []
      }
      console.log('res', res.data.data)
      if (res.data.data) {
        const publicList = res.data.data.filter(item => {
          return item.project_public
        })
        const privateList = res.data.data.filter(item => {
          return !item.project_public
        })
        mergeState.publicImages = publicList
        mergeState.privateImages = privateList
      }
      const allPro = {
        [registry]: {
          isFetching: false,
          server: res.data.server && res.data.server.replace(/(http:\/\/|https:\/\/)/, ''),
          ...mergeState
        }
      }
      commit('SETALLPROJECT', allPro)
      callback && callback(res.data)
    }).catch(() => {
      callback && callback(new Error('请求失败'))
    })
  },
  loadRepositoriesTags ({ commit }, { registry, imageName, callback }) {
    fetchRepositoriesTags(registry, imageName).then((res) => {
      console.log('res1', res.data.data)
      const LATEST = 'latest'
      const data = res.data.data.data || []
      const version = res.data.data.version
      const latestTagIndex = data.indexOf(LATEST)
      if (latestTagIndex > 0) {
        data.splice(latestTagIndex, 1)
        data.unshift(LATEST)
      }
      if (version === 'v2') {
        const tagWithOS = []
        if (data.length && data[0].tags && data[0].tags.length) {
          data.map(tag => {
            let references = (tag.references || [])
            references = references.filter(it => {
              return it.platform?.architecture && it.platform.architecture !== 'unknown'
            })
            if (!references.length) {
              references = null
            }
            if (tag.tags && tag.tags[0].name) {
              tagWithOS.push({
                name: tag.tags[0]?.name,
                os: references ? references[0].platform?.os : tag.extra_attrs?.os,
                arch: references ? references[0].platform?.architecture : tag.extra_attrs?.architecture,
                currdigest: references ? references[0].child_digest : undefined,
                scanOverview: tag.scanOverview,
                references
              })
            }
          })
        }

        const imageTags = Object.assign({}, {
          [imageName]: {
            isFetching: false,
            server: res.data.data.server,
            tag: (data.length && data[0].tags && data[0].tags.length && data.map(tag => tag.tags && tag.tags[0]?.name).filter(it => it)) || [],
            tagWithOS: tagWithOS || []
          }
        })
        commit('SET_HARBOR_REPOSITORIES_TAGS', { registry, imageTags })
      } else if (version === 'v1') {
        const imageTags = Object.assign({}, {
          [imageName]: {
            isFetching: false,
            server: res.data.data.server,
            tag: (data.length && data[0].name && data.map(tag => tag.name)) || [],
            tagWithOS: (data.length && data[0].name && data.map(tag => {
              return {
                name: tag.name,
                os: tag.os,
                arch: tag.architecture,
                scanOverview: tag.scanOverview || {}
              }
            })) || []
          }
        })
        commit('SET_HARBOR_REPOSITORIES_TAGS', { registry, imageTags })
      }

      if (callback) {
        callback(res.data.data || { data: [] })
      }
    })
  },
  loadRepositoriesTagConfigInfo ({ commit }, { harbor, registry, imageName, tag, callback }) {
    fetchRepositoriesTagConfigInfo(harbor, registry, imageName, tag).then((res = {}) => {
      const imageTagConfig = {
        [registry]: {
          isFetching: false,
          server: res.data.data.server.replace(/(http:\/\/|https:\/\/)/, ''),
          [tag]: res.data.data.data,
          [imageName]: {
            server: res.data.data.server.replace(/(http:\/\/|https:\/\/)/, ''),
            [tag]: res.data.data.data
          }
        }
      }
      commit('SET_HARBOR_REPOSITORIES_TAG_CONFIGINFO', imageTagConfig)
      if (callback) { callback(res.data.data) }
    })
  },
  loadProjectList ({ commit }, { registry, query }) {
    fetchProjectList(registry, query).then((res) => {
      console.log('list', res)
      const ProjectList = {
        [registry]: {
          isFetching: false,
          server: res.data.server,
          list: res.data.data,
          total: res.data.total
        }
      }
      commit('SET_PROJECT_LIST', ProjectList)
    })
  },
  loadProjectDetail ({ commit }, { harbor, registry, id, callback }) {
    fetchProjectDetail(harbor, registry, id).then((res) => {
      console.log('detail', res.data.data.data)
      const detail = {
        isFetching: false,
        server: res.data.data.server,
        data: res.data.data.data
      }
      commit('SET_PROJECT_DETAIL', detail)
      if (callback) {
        callback(res.data.data)
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
