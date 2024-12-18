import cloneDeep from 'lodash/cloneDeep'
import { ClusterApi } from './api'

export const SET_CURRENT = 'SET_CURRENT'

const state = {
  current: {
    unit: 'T',
    tenant: { id: 'TENANT-ujhG9FKrRMHo' }, // 租户信息
    team: {},
    // 项目信息
    space: {
      projectID: '',
      projectName: 'demo',
      displayName: 'POC',
      namespace: 'test-test',
      creatorID: 1,
      creationTime: '2021-12-14T18:03:42+08:00',
      updateTime: '2021-12-14T18:03:42+08:00',
      outlineRoles: [
        'manager'
      ]
    },
    // 集群信息
    cluster: {
      clusterID: 'CID-b336cb0ee99c',
      clusterName: 'k8s-853',
      storageClassType: { host: true, private: true, share: false },
      bindingDomains: '[]',
      bindingIPs: '',
      listNodes: 4
    },
    // 全局租户id
    FULL_TENANT_VIEW: 'TENANT-GLOBAL'

  }
}

const mutations = {
  SET_CURRENT: (state, current) => {
    const _current = state.current
    current = Object.assign({}, cloneDeep(_current), current)
    state.current = current
  }

}
const getters = {
  getCurrent: state => {
    return state.current
  }

}
const actions = {
  setCurrent ({ commit }, current) {
    commit('SET_CURRENT', current)
  },
  getCluster ({ commit, state }, clusterID) {
    const clusterId = clusterID || state.current?.cluster?.clusterID
    if (clusterId) {
      ClusterApi.getClusterInfo(clusterId).then((res) => {
        const cluster = res || { clusterID: clusterId }
        console.log('cluster:', res)
        commit('SET_CURRENT', { cluster })
        const defalutStorageCLassType = {
          private: false,
          share: false,
          host: false
        }
        ClusterApi.getStorageClassType(clusterId).then((res) => {
          const storageClassType = res || defalutStorageCLassType
          Object.assign(cluster, { storageClassType: storageClassType })
          commit('SET_CURRENT', { cluster })
        }).catch((res) => {
          Object.assign(cluster, { storageClassType: defalutStorageCLassType })
          commit('SET_CURRENT', { cluster })
        })
      })
    }
  },
  updateClusterID({ commit, state }, newClusterID) {
    const updatedCurrent = {
      ...state.current,
      cluster: {
        ...state.current.cluster,
        clusterID: newClusterID
      }
    };
    commit('SET_CURRENT', updatedCurrent);
  },
  updateTeamSpace ({ commit, state }, newTeamSpace) {
    const updatedCurrent = {
      ...state.current,
      space: {
        ...state.current.space,
        namespace: newTeamSpace
      }
    };
    commit('SET_CURRENT', updatedCurrent);
  }



}
export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
