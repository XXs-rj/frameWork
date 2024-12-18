
import { API_URL_PREFIX } from '../constant/index'
import { toQuerystring } from '../utils/tools'
import Vue from 'vue'
const apiFactory = require('./request/v2/lib/api_factory')
// 集群状态
export function fetchClusterAppStatus (clusterID) {
  return Vue.axios.get(`${API_URL_PREFIX}/overview/clusters/${clusterID}/appstatus`)
}
export function fetchClusterInfo (clusterID, query) {
  return getOverview(clusterID, query)
  // return Vue.axios.get(`${API_URL_PREFIX}/overview/clusterinfo/clusters/${clusterID}?${toQuerystring(query)}`)
}
// 容器概览数据
export async function getOverview (cluster, query) {
  const api = apiFactory.getApi()
  const k8sapi = apiFactory.getK8sApi()
  const queryObj = { cluster }
  let infoMapping = {}
  await Promise.all([
    api.overview.getBy(['space-operations'], queryObj),
    api.overview.getBy(['clusters', cluster, 'system-info']),
    api.overview.getBy(['clusters', cluster, 'appstatus']),
    k8sapi.getBy([cluster, 'dbservices']),
    api.overview.getBy(['clusters', cluster, 'space-consumption']),
    k8sapi.getBy([cluster, 'summary', 'static'])]
  ).then((res) => {
    infoMapping = { operations: res[0], sysinfo: res[1], appstatus: res[2], dbservices: res[3], spaceconsumption: res[4], clusterStaticSummary: res[5] }
  })
  const { sysinfo = {} } = infoMapping
  if (sysinfo.logging && sysinfo.logging.status === 'warning') {
    // yellow status
    sysinfo.logging.status = 'normal'
  }
  const storage = {}
  // Check node summary separately
  let nodesummary = {}
  try {
    // Set timeout to 20 seconds
    const summaryResult = await api.overview.getBy(['clusters', cluster, 'nodesummary'], query)
    nodesummary = summaryResult || {}
  } catch (error) {
    window.console.warn('Failed to get node summary information: ' + JSON.stringify(error))
  }
  return { ...infoMapping, storage, nodesummary }
}
// 存储与快照
export function fetchStorageAndSnapshot (clusterID) {
  const api = apiFactory.getApi()
  return api.overview.getBy(['clusters', clusterID, 'volumestats'])
  // return Vue.axios.get(`${API_URL_PREFIX}/overview/clusters/${clusterID}/volumestats`)
}
// 数据库&缓存 数据获取
/**
 *
 * @param {*} clusterID
 * @param {*} types 数据库类型
 * @returns
 */
export async function fetchDbCacheList (clusterID, types) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/dbservices?type=${types}`
  const middles = ['mysql', 'redis', 'rabbitmq', 'mongodbreplica', 'kafka', 'rocketmq', 'xxljob']
  if (middles.includes(types)) {
    // endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/daas/${types}`
    const api = apiFactory.getK8sApi()
    const result = await api.getBy([clusterID, 'daas', types])
    const databases = result.items || []
    // remote some data
    databases.forEach(function (db) {
      if (db.objectMeta) {
        delete db.objectMeta.labels
      }
      delete db.typeMeta
    })
    return {
      cluster: clusterID,
      databaseList: databases
    }
  } else {
    // zookeeper 和 es集群请求集群列表
    const api = apiFactory.getK8sApi()
    const result = await api.getBy([clusterID, 'dbservices'], { category: types })
    const databases = result.items || []
    // remote some data
    databases.forEach(function (db) {
      if (db.objectMeta) {
        delete db.objectMeta.labels
      }
      delete db.typeMeta
    })
    return {
      cluster: clusterID,
      databaseList: databases
    }
  }
}
export function getEnvQuota (clusterID) {
  const api = apiFactory.getK8sApi()
  return api.getBy([clusterID, 'resourcequota'])
}
export function getEnvQuotaInuse (clusterID) {
  const api = apiFactory.getK8sApi()
  return api.getBy([clusterID, 'resourcequota', 'inuse'])
}
export function getAppStatusCount (clusterId) {
  const api = apiFactory.getApi()
  return api.overview.getBy(['clusters', clusterId, 'appstatus'])
}
export function getGpuInfo (target, clusterID, type) {
  console.log('1111')
  const api = apiFactory.getLabelsApi()
  return api.getBy([type], { clusterID, target })
}
