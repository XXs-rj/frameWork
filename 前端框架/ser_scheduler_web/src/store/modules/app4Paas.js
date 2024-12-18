import { ProjectApi, TenantApi } from './api'

// import store from '@/framework/store'


const FULL_TENANT_VIEW = 'TENANT-GLOBAL'
function initEntities (current) {
  store.dispatch('entities/setCurrent', current)
  store.dispatch('entities/getCluster', current?.cluster?.clusterID)
}


function setTenantInfo (tenantId) {
  store.commit('app4Paas/SET_CURRENT_TENANTID', tenantId)
  const current = {
    tenant: { id: tenantId }
  }
  store.dispatch('entities/setCurrent', current)
}

function setEnvInfo (currentProject, initEnvId) {
  if (currentProject.environments && currentProject.environments.length > 0) {
    let envId
    let initEnv
    if (initEnvId) {
      initEnv = currentProject.environments.find(it => {
        return it.id === initEnvId
      })
      if (initEnv) {
        envId = initEnv.id
      }
    }
    envId = envId || currentProject.environments[0].id
    store.commit('app4Paas/SET_CURRENT_ENVID', envId)
    const currentEnv = initEnv || currentProject.environments[0]
    const current = {
      space: {
        projectID: currentEnv.refId,
        projectName: currentEnv.uuid,
        displayName: currentEnv.name,
        namespace: currentEnv.uuid
      },
      cluster: {
        clusterID: currentEnv.clusterId
      }
    }
    initEntities(current)
  } else {
    store.commit('app4Paas/SET_CURRENT_ENVID', '')
    const current = {
      space: {
      },
      cluster: {

      }
    }
    initEntities(current)
  }
}
function setCurrentSpaceSession (space) {
  const currentSpace = sessionStorage.getItem('APP4PASS_CURRENT_SPACE_SESSION')
  let seesion
  try {
    let current = JSON.parse(currentSpace)
    current = { ...current, ...space }
    seesion = JSON.stringify(current)
  } catch {
    seesion = JSON.stringify(space)
  }
  sessionStorage.setItem('APP4PASS_CURRENT_SPACE_SESSION', seesion)
}
export function getCurrentSpaceSession (prop) {
  const currentSpace = sessionStorage.getItem('APP4PASS_CURRENT_SPACE_SESSION')
  try {
    const current = JSON.parse(currentSpace)
    return current[prop]
  } catch {
    return null
  }
}
export function clearCurrentSpaceSession () {
  sessionStorage.removeItem('APP4PASS_CURRENT_SPACE_SESSION')
}
export default {
  namespaced: true,
  state: {
    // 根据租户的不同，跳转不同的首页
    indexUrl: '/tenant-mgt/overview',
    tenants: [],
    projects: [],
    currentTenantId: getCurrentSpaceSession('currentTenantId') || null,
    currentProjectId: null,
    currentEnvId: null,
    leftMenusShow: true,
    leftMenus: null,
    currentRole: null,
    indexMenuId: null,
    fullTenantView: FULL_TENANT_VIEW
  },
  mutations: {
    SET_INDEXURL (state, indexUrl) {
      state.indexUrl = indexUrl
    },
    SET_INDEX_MENU_ID (state, menuId) {
      state.indexMenuId = menuId
    },
    SET_TENANTS (state, tenants) {
      state.tenants = tenants
    },
    SET_PROJECTS (state, projects) {
      state.projects = projects
    },
    SET_CURRENT_TENANTID (state, currentTenantId) {
      state.currentTenantId = currentTenantId
      setCurrentSpaceSession({ currentTenantId })
    },
    SET_CURRENT_PROJECTID (state, currentProjectId) {
      state.currentProjectId = currentProjectId
      setCurrentSpaceSession({ currentProjectId })
    },
    SET_CURRENT_ENVID (state, currentEnvId) {
      state.currentEnvId = currentEnvId
      setCurrentSpaceSession({ currentEnvId })
    },
    SET_LEFT_MENU (state, menuItem) {
      state.leftMenus = menuItem
    },
    SET_LEFT_MENU_SHOW (state, isShow) {
      state.leftMenusShow = isShow
    },
    SET_CURRENT_ROLE (state, currentRole) {
      state.currentRole = currentRole
    }
  },
  actions: {
    loadTenants ({ commit }) {
      return TenantApi.getTenantList().then(result => {
        if (result.data.length > 0) {
          commit('SET_TENANTS', result.data)
        } else {
          throw new Error('NOTENANTERROR')
        }
      })
    },
    loadProjects ({ commit, state }, { tenantId, initProjectId }) {
      return ProjectApi.getAllProjects({
        tenantId: tenantId || state.currentTenantId
      }).then(result => {
        window.console.log(result, 'res1')
        if (result.length > 0) {
          // 将clusterName拼接到name中，展示集群名
          result.map(item => {
            if (item.environments.length) {
              item.environments.map(envItem => {
                envItem.name = envItem.name + ' (' + envItem.clusterName + ')'
              })
            }
          })
          commit('SET_PROJECTS', result)
          let currentProject
          if (initProjectId) {
            const initProject = result.find(projectItem => projectItem.id === initProjectId)
            if (initProject) {
              currentProject = initProject
            }
          }
          if (!currentProject) {
            const haveEnvProject = result.find(projectItem => projectItem.environments.length > 0)
            if (haveEnvProject) {
              currentProject = haveEnvProject
            } else {
              currentProject = result[0]
            }
          }

          const projectId = currentProject.id
          commit('SET_CURRENT_PROJECTID', projectId)
          return currentProject
          // return initMenus(projectId)
        } else {
          commit('SET_PROJECTS', result)
          commit('SET_CURRENT_PROJECTID', '')
          return {}
        }
      })
    },
    setCurrentProjectId ({ commit }, currentProjectId) {
      commit('SET_CURRENT_PROJECTID', currentProjectId)
      // // PaaS平台定制修改，按projectid获取角色列表并初始化菜单
      // initMenus()
    },
    setCurrentEnvId ({ commit }, currentEnvId) {
      commit('SET_CURRENT_ENVID', currentEnvId)
    },
    initLeftMenus ({ commit }) {
      const allMenus = store.getters['menu/getAllMenus']
      if (allMenus && allMenus.length > 0) {
        commit('SET_LEFT_MENU', allMenus[0])
      }
    },
    setLeftMenus ({ commit }, menuItem) {
      commit('SET_LEFT_MENU', menuItem)
    },
    getAndSetProjects ({ commit, state }, tenantId) {
      return ProjectApi.getAllProjects({
        tenantId: tenantId || state.currentTenantId
      }).then(result => {
        window.console.log(result, 'res2')
        commit('SET_PROJECTS', result)
      })
    },
    setLeftMenusShow ({ commit }, isShow) {
      commit('SET_LEFT_MENU_SHOW', isShow)
    },
    setCurrentRole ({ commit }, currentRole) {
      commit('SET_CURRENT_ROLE', currentRole)
    },
    setCurrentTenantId ({ commit }, currentTenantId) {
      commit('SET_CURRENT_TENANTID', currentTenantId)
    },
    clearTenantInfo ({ commit }) {
      clearCurrentSpaceSession()
      commit('SET_TENANTS', [])
      setTenantInfo('')
      store.commit('menu/SET_ALL_MENUS', [])
    },
    setIndexMenuId ({ commit }, id) {
      commit('SET_INDEX_MENU_ID', id)
    }
  },
  getters: {
    getLeftMenus: state => state.leftMenus,
    getLeftMenusShow: state => state.leftMenusShow,
    getProjects: state => state.projects,
    getTenants: state => state.tenants,
    getCurrentTenantId: state => state.currentTenantId,
    getCurrentProjectId: state => state.currentProjectId,
    getCurrentEnvId: state => state.currentEnvId,
    getDefaultEnv: state => {
      const defaultVal = []
      defaultVal.push(state.currentProjectId)
      if (state.currentEnvId) {
        defaultVal.push(state.currentEnvId)
      }
      return defaultVal
    },
    getCurrentProject: state => {
      let projectObj = {}
      if (state.projects && state.currentProjectId) {
        for (const project of state.projects) {
          if (project.id === state.currentProjectId) {
            projectObj = project
            break
          }
        }
      }
      return projectObj
    },
    getCurrentEnv: state => {
      let envObj = {}
      if (state.projects && state.currentProjectId && state.currentEnvId) {
        for (const project of state.projects) {
          if (project.id === state.currentProjectId) {
            for (const environment of project.environments) {
              if (environment.id === state.currentEnvId) {
                envObj = environment
                break
              }
            }
            break
          }
        }
      }
      return envObj
    },
    getCurrentTenant2: state => {
      return { tenantId: state.currentTenantId }
    },
    getCurrentProject2: state => {
      return { projectId: state.currentProjectId }
    },
    getCurrentEnv2: state => {
      return { envId: state.currentEnvId }
    },
    getCurrentProjectInfo: state => {
      return {
        projectId: state.currentProjectId,
        envId: state.currentEnvId
      }
    },
    getCurrentRole: state => state.currentRole,
    indexMenuId: state => state.indexMenuId,
    fullTenantView: state => state.fullTenantView
  }
}
