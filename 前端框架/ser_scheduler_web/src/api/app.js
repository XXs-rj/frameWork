import { API_URL_PREFIX } from '../constant/index'
import { encodeImageFullname } from '@/utils/tools'
import { getAppStatusV2 } from '@/utils/status_identify'
import { toQuerystring } from '../utils/tools'
import Vue from 'vue'
import yaml from 'js-yaml'
// 凤巢环境请求
function request2 (options) {
  const store = Vue.prototype.$store
  const current = store.getters['entities/getCurrent']
  const teamspace = current && current.space && current.space.namespace
  // const teamspace = 'schedule-dev'
  if (teamspace) {
    options.headers = !options.headers ? { teamspace } : { teamspace, ...options.headers }
  }
  return Vue.axios.request(options)
}

const constants = require('@/constant/global')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const apiFactory = require('./request/v2/lib/api_factory')
const portHelper = require('@/utils/port_helper')

export function loadAppList (cluster, query = {}, pathname = '') {
  const newQuery = Object.assign({}, query)
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps`
  if (pathname === 'APP_LIST_REQUEST') {
    endpoint += '/ai'
  }
  if (query) {
    delete query.customizeOpts
    delete query.headers
    if (query.name) query.name = encodeURIComponent(query.name)
    endpoint += `?${toQuerystring(query)}`
  }
  let headers
  if (newQuery.headers) {
    headers = newQuery.headers
  }
  return getApps(cluster, query, { headers, url: pathname })
}
async function getApps (cluster, query = {}, request) {
  const { project } = request.headers || { project: null }
  const headers = {}
  if (project) {
    Object.assign(headers, { project, teamspace: project })
  }
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  const name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 0 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const queryObj = { from, size }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  if (query.sortOrder) {
    queryObj.sort_order = query.sortOrder
  }
  if (query.sortBy) {
    queryObj.sort_by = query.sortBy
  }
  const api = apiFactory.getK8sApi()
  let result
  if (request.url.indexOf('/ai') > -1) {
    result = await api.getBy([cluster, 'apps', 'ai'], queryObj, { headers })
  } else {
    result = await api.getBy([cluster, 'apps'], queryObj, { headers })
  }
  const lbgroupSettings = await api.getBy([cluster, 'proxies'])
  const apps = result.data.data && result.data.data.apps
  apps && apps.map((app) => {
    if (!app.services) {
      app.services = []
    }
    app.appStatus = 0
    app.serviceCount = app.services.length
    app.instanceCount = 0
    app.services.map((service) => {
      const deploymentInfo = {}
      portHelper.addPortV2(deploymentInfo, service.service, lbgroupSettings)
      Object.assign(service.service, deploymentInfo)
    })
    if (app.serviceCount < 1 || app.instanceCount < 1) {
      app.appStatus = 1
    }
  })
  return {
    cluster,
    data: apps || [],
    total: (result.data.data && result.data.data.total) || 0,
    count: (result.data.data && result.data.data.count) || 0
  }
}
export function fetchAppsList (query) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return getStorelist(query)
}
export async function getStorelist (query) {
  const api = apiFactory.getApi()
  let result
  try {
    result = await api.appstore.getBy(['apps'], query)
    return result
  } catch {
    return result
  }
}

export async function checkAppName (cluster, appName) {
  const spi = apiFactory.getSpi()
  const response = await spi.clusters.getBy([cluster, 'apps', appName, 'existence'])
  return response
}
export async function checkServiceName (cluster, service) {
  const spi = apiFactory.getSpi()
  const response = await spi.clusters.getBy([cluster, 'services', service, 'existence'])
  return response
}
// 公有/私有镜像
export async function fetchAllProject (registry, query) {
  // const endpoint = `${API_URL_PREFIX}/registries/${registry}/repositories`
  const api = apiFactory.getApi()
  const data = await api.registries.getBy([registry, 'repositories'], query)
  return data.data
}
// 支持多harbor，可以在 query 中指定 harbor 这个 key 来指定 harbor 地址
function changeHarborConfigByQuery (query, _config) {
  const method = 'changeHarborConfigByQuery'
  const config = _.cloneDeep(_config) || {}
  const harborUrl = query && query.harbor
  if (harborUrl) {
    if (!/^https?:\/\//.test(harborUrl)) {
      window.console.warn(method, 'Illegal harbor url:', harborUrl)
    } else {
      config.url = harborUrl
    }
  }
  return config
}
// 其他镜像选项
export function LoadOtherImage () {
  // return Vue.axios.get(`${API_URL_PREFIX}/docker-registry`)
  return getPrivateRegistries()
}
// List custom docker registries
async function getPrivateRegistries () {
  const api = apiFactory.getManagedRegistryApi()
  // Get the list of private docker registry
  const result = await api.get()
  if (result.data.data) {
    result.data.data.forEach(function (row) {
      delete row.encrypted_password
    })
  }

  return {
    data: result
  }
}
// 其他镜像类型对应镜像列表
export function getOtherImageList (id) {
  return Vue.axios.get(`${API_URL_PREFIX}/docker-registry/${id}/images`)
}
// OCP镜像列表
export function fetchOCPImageList (namespace, query) {
  const endpoint = `${API_URL_PREFIX}/openshift/namespaces/${namespace}/imagestreams?${toQuerystring(query)}`
  return Vue.axios.get(endpoint)
}
// 检查是否为dubbo服务
export async function fetchPluginStatus (query, teamspace) {
  const projectApi = apiFactory.getApi()
  const response = await projectApi.projects.getBy(['plugins', 'enabled'], query, { headers: { teamspace } })
  return response
  // return Vue.axios.get(`${API_URL_PREFIX}/projects/plugins/enabled`, { data: query, headers: { teamspace } })
}
// 获取应用下的服务
export async function loadServiceList (clusterId, appName, query = {}) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterId}/apps/${appName}/services`
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  const name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const queryObj = { from, size }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  if (query.all) {
    delete queryObj.from
    delete queryObj.size
  }
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterId, 'services', appName, 'svcs'], queryObj)
  const result1 = result.data.data
  const lbgroupSettings = await api.getBy([clusterId, 'proxies'])
  const lbgroupSettings1 = lbgroupSettings.data.data
  const services = result1[appName].services

  const deployments = []
  services.map((service) => {
    // service.deployment.images = []
    // service.deployment.spec.template.spec.containers.map((container) => {
    //   service.deployment.images.push(container.image)
    // })
    // const annotations = service.deployment.spec.template.metadata.annotations
    // if (annotations && annotations.appPkgName && annotations.appPkgTag) {
    //   service.deployment.wrapper = {
    //     appPkgName: annotations.appPkgName,
    //     appPkgTag: annotations.appPkgTag
    //   }
    // }
    const deploymentInfo = {}
    portHelper.addPortV2(deploymentInfo, service.service, lbgroupSettings1)
    Object.assign(service.service, deploymentInfo)
    // service.deployment.volumeTypeList = service.volumeTypeList
    // deployments.push(service.deployment)
  })

  const body = {
    cluster: clusterId,
    appName,
    data: services,
    total: result1.total,
    count: result1.count,
    availableReplicas: result1[appName].currentReplicas
  }
  return body
}
export async function loadAppDetailV2 (clusterId, appName) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterId, 'services', appName, 'svcs'])
  const result1 = result.data.data
  const lbgroupSettings = await api.getBy([clusterId, 'proxies'])
  const lbgroupSettings1 = lbgroupSettings.data.data
  const app = result1[appName]
  const services = app.services

  const deployments = []
  services.map((service) => {
    const deploymentInfo = {}
    portHelper.addPortV2(deploymentInfo, service.service, lbgroupSettings1)
    Object.assign(service.service, deploymentInfo)
  })
  app.status = getAppStatusV2(app)
  const body = {
    cluster: clusterId,
    appName,
    data: app
  }
  return body
}
export function fetchOCPDetail (namespace, imageName, query) {
  const endpoint = `${API_URL_PREFIX}/openshift/namespaces/${namespace}/imagestreams/${imageName}?${toQuerystring(query)}`
  return Vue.axios.get(endpoint)
}
export function fetchOCPTag (namespace, imageWithTag, query) {
  const endpoint = `${API_URL_PREFIX}/openshift/namespaces/${namespace}/imagestreamtags/${imageWithTag}?${toQuerystring(query)}`
  return getImagestreamtagDetail(namespace, imageWithTag, query)
}
async function getImagestreamtagDetail (namespace, imageWithTag, query) {
  const api = apiFactory.getOcpApi()
  const { clusterID: clusterid } = query
  const headers = { clusterid }
  const result = await api.getBy(['namespaces', namespace, 'imagestreamtags', imageWithTag], undefined, { headers })
  return result
}

export async function fetchRepositoriesTags (registry, imageName) {
  const endpoint = `${API_URL_PREFIX}/registries/${registry}/repositories/${imageName}/tags`
  const api = apiFactory.getApi()
  const data = await api.registries.getBy([registry, 'repositories', imageName, 'tags'])
  return data
}
// 镜像配置信息
// harbor相关
export function fetchRepositoriesTagConfigInfo (harbor, registry, imageName, tag) {
  const api = apiFactory.getApi()
  return api.registries.getBy([registry, 'repositories', imageName, 'tags', tag, 'config'])
}
export function fetchOtherDetailTagConfig (obj) {
  const urlFullName = encodeImageFullname(obj.fullname)
  const endpoint = `v2/docker-registry/${obj.imageId}/images/${urlFullName}/tags/${obj.imageTag}`
  return Vue.axios.get(endpoint)
}
// 项目详情
export function fetchProjectDetail (harbor, registry, name) {
  const api = apiFactory.getApi()
  return api.registries.getBy([registry, 'projects', name])
}
// 项目列表
export async function fetchProjectList (registry, query) {
  const api = apiFactory.getApi()
  const data = await api.registries.getBy([registry, 'projects'], query)
  return data
  // let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects`
  // if (query) {
  //   endpoint += `?${toQuerystring(query)}`
  // }
  // return Vue.axios.get(endpoint)
}
// todo 没有对应接口
export function getOtherImageTag (obj) {
  const endpoint = `${API_URL_PREFIX}/docker-registry/${obj.id}/images/${encodeImageFullname(obj.imageName)}/tags`
  return Vue.axios.get(endpoint)
}
// apmlist
export function fetchApms (clusterID) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/apms`
  return getApms(clusterID)
}
async function getApms (clusterID) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'apms'])
  return result
}
// 查看某个项目在某个集群下是否开启了serviceMesh
// 获取项目 Istio 状态
export function fetchCheckProInClusMesh (project, clusterId) {
  const endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/paas/status`
  return getCheckProInClusMesh(project, clusterId)
}
// TODO 404
export async function getCheckProInClusMesh (project, clusterId) {
  const projectApi = apiFactory.getMeshApi()
  const response = await projectApi.servicemesh.getBy(['clusters', clusterId, 'paas', 'status'],
    null, { headers: { teamspace: project } })
  return response
}
// 查看某个集群是否安装istio
export function fetchCheckClusterIstio (query) {
  let endpoint = `${API_URL_PREFIX}/projects/istio/check`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return getCheckClusterIstio(query)
}
// 查看某个集群是否安装了istio
export async function getCheckClusterIstio (query) {
  const projectApi = apiFactory.getApi()
  const response = await projectApi.projects.getBy(['plugins', 'installed'], query)
  const { istio: { code = 404 } = {} } = response
  const newResponse = {
    data: {
      code
    }
  }
  return newResponse
}
// 获取空闲容器
export function fetchFreeVolume (cluster, query) {
  const endpoint = `${API_URL_PREFIX}/storage-pools/${cluster}/volumes/available?${toQuerystring(query)}`
  return getAvailableVolume(cluster, query)
}
async function getAvailableVolume (cluster, query) {
  const volumeApi = apiFactory.getK8sApi()
  const response = await volumeApi.getBy([cluster, 'volumes', 'available'], query)
  return response
}
export function loadNative (clusterID, type, teamspace) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/native/${type}`
  return getK8sNativeResource(clusterID, type, teamspace)
}
async function getK8sNativeResource (cluster, type, teamspace) {
  const headers = teamspace ? { teamspace } : {}
  const projectApi = apiFactory.getApi()
  const response = await projectApi.clusters.getBy([cluster, 'native', type], null, { headers })
  return response
}

export function fetchGetClusterStorageList (cluster) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/storageclass`
  return getClusterStorageList(cluster)
}
async function getClusterStorageList (cluster) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'storageclass'])
  return result
}
export function fetchImageTemplate (registry) {
  const endpoint = `${API_URL_PREFIX}/registries/${registry}/template`
  return getImageTemplate(registry)
}
async function getImageTemplate (registry) {

}
export function fetchNetworkSolutions (clusterID) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/network`
  return getClusterNetworkMode(clusterID)
}
async function getClusterNetworkMode (clusterID) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'network'])
  return result
}
// ip池
export function fetchIPPoolList (cluster, query) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/pools?${toQuerystring(query)}`
  return getIPPoolList(cluster, query)
}
async function getIPPoolList (cluster, query) {
  const api = apiFactory.getK8sApi(cluster, query)
  const result = await api.getBy([cluster, 'pools'], query, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  return result
}
export function fetchPodNetworkSegment (cluster) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/nodes/podcidr`
  return getPodNetworkSegment(cluster)
}
async function getPodNetworkSegment (cluster) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'nodes', 'podcidr'], null, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  return result
}
export function fetchMacvlanIPAssignment (cluster, query) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ipassignments?${toQuerystring(query)}`
  return getIPAssignment(cluster, query)
}
async function getIPAssignment (cluster, query) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'networking', 'macvlan', 'ipassignments'], query)
  return result
}
export function fetchMacvlanIPPool (cluster) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ippools`
  return getMacvlanIPPoolList(cluster)
}
async function getMacvlanIPPoolList (cluster) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'networking', 'macvlan', 'ippools'])
  return result
}
export function fetchNodes (cluster, tenantID) {
  const query = tenantID ? '?id=' + tenantID : ''
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/nodes` + query
  return getNodes(cluster, tenantID ? { id: tenantID } : undefined)
}
// For bind node when create service(lite only)
async function getNodes (cluster, query) {
  const spi = apiFactory.getSpi()
  const result = await spi.clusters.getBy([cluster, 'nodes'], query)
  return result
}
// 获取 ip 是否被占用
export function fetchIpPodStatus (cluster, ip) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/isPodIpExisted/${ip}`
  return getISIpPodExisted(cluster, ip)
}
async function getISIpPodExisted (cluster, ip) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'services', 'is-pod-ip-existed', ip])
  return result
}
export function fetchCalicoDetails (cluster, query) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/networking/calico/details?${toQuerystring(query)}`
  return getCalicoDetails(cluster, query)
}
async function getCalicoDetails (cluster, query) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'networking', 'calico', 'details'], query)
  return result
}
export function fetchGetIpAvailability (cluster, query) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ipreservations/availability`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return getIpAvailability(cluster, query)
}
async function getIpAvailability (cluster, query) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'networking', 'macvlan', 'ipreservations', 'availability'], query)
  return result
}
export function fetchMacvlanDetails (cluster, query) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/details?${toQuerystring(query)}`
  return getMacvlanDetails(cluster, query)
}
async function getMacvlanDetails (cluster, query) {
  const headers = {}
  const api = apiFactory.getK8sApi()
  if (query.project) {
    Object.assign(headers, { project: query.project })
    delete query.project
  }
  const result = await api.getBy([cluster, 'networking', 'macvlan', 'details'], query, { headers })
  return result
}
export function fetchProxy (cluster) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/proxies`
  return getProxy(cluster)
}

async function getProxy (cluster) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'proxies'])
  return {
    [cluster]: {
      data: result
    }
  }
}
// 校验监听器名字和主机
export function fetchIngressNameAndHost (cluster, lbname, query) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/ingresses/exist?${toQuerystring(query)}`
  return nameAndHostCheck(cluster, lbname, query)
}
async function nameAndHostCheck (cluster, lbname, query) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'loadbalances', lbname, 'ingresses', 'exist'], query)
  return result
}
export function fetchLBList (cluster, query) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/loadbalances`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return getLBList(cluster, query)
}
async function getLBList (cluster, query) {
  const api = apiFactory.getK8sApi()
  let data = await api.getBy([cluster, 'loadbalances'])
  const result = {}
  result.total = data.length || 0
  result.data = data
  if (data.length) {
    if (query.creationTime) {
      switch (query.creationTime) {
        case 'd':
          data.sort((a, b) =>
            new Date(b.metadata.creationTimestamp).getTime() - new Date(a.metadata.creationTimestamp).getTime())
          break
        case 'a':
          data.sort((a, b) =>
            new Date(a.metadata.creationTimestamp).getTime() - new Date(b.metadata.creationTimestamp).getTime())
          break
        default:
          break
      }
    }
    if (query.name) {
      data = data.filter(item => item.metadata.annotations.displayName.indexOf(query.name) > -1)
      result.total = data.length
    }
    if (query.page && query.size) {
      data = data.slice((query.page - 1) * query.size, query.page * query.size)
    }
    result.data = data
  }
  return result
}

export function fetchTcpUdpIngress (cluster, lbname, type) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/protocols/${type}`
  return getTcpUdpIngress(cluster, lbname, type)
}
async function getTcpUdpIngress (cluster, lbname, type) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'loadbalances', lbname, 'stream', 'protocols', type])
  return result
}
export function getfSecurityGroupDetail (cluster, name) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/networkpolicy/${name}`
  return getSecurityGroupDetail(cluster, name)
}
async function getSecurityGroupDetail (cluster, name) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'networkpolicy', name], null, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  return result
}

export function getClusterNodesLabel (tenantID, clusterID) {
  const endpoint = `${API_URL_PREFIX}/labels/${tenantID}/clusters/${clusterID}/labels`
  return getClusterLabels(tenantID, clusterID)
}
async function getClusterLabels (tenantID, clusterID) {
  const api = apiFactory.getLabelsApi()
  const result = await api.getBy([tenantID, 'clusters', clusterID, 'labels'], null)
  // TODO 判断
  // return result ? result.data : {}
  return result || {}
}

export function updateSecurityGroup (cluster, body) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/networkpolicy`
  return updataSecurityGroup(cluster, body)
}
async function updataSecurityGroup (cluster, body) {
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'networkpolicy'], null, body)
  return result
}
// 创建应用/服务
export function createApp (appConfig) {
  let postUrl = `${API_URL_PREFIX}/clusters/${appConfig.cluster}/apps`
  if (appConfig.ai) {
    postUrl += '/ai'
  }
  const body = {
    name: appConfig.appName,
    template: appConfig.template,
    appPkgID: appConfig.appPkgID,
    desc: appConfig.desc
  }
  return fetchCreateApp(appConfig.cluster, body, appConfig.ai)
}
async function fetchCreateApp (cluster, body, isAI) {
  const app = body
  if (!app || !app.name) {
    const err = new Error('App name is required.')
    err.status = 400
    throw err
  }
  if (!app || !app.template) {
    const err = new Error('App template is required.')
    err.status = 400
    throw err
  }
  // app.desc = yaml.dump(app.desc)
  let api = apiFactory.getK8sApi()
  if (!app.appPkgID || Object.keys(app.appPkgID).length === 0) {
    api = apiFactory.getK8sApi()
  } else {
    api = apiFactory.getApi().pkg
  }
  let result
  if (isAI) {
    result = await api.createBy([cluster, 'apps', 'ai'], null, app, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  } else {
    result = await api.createBy([cluster, 'apps'], null, app, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  }
  return result
}
export function addService (cluster, appName, body) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/services`
  return fetchAddService(cluster, appName, body)
}
async function fetchAddService (cluster, appName, body) {
  if (!body || !body.template) {
    const err = new Error('Service template is required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.createBy(
    [cluster, 'apps', appName, 'services'],
    null, body,
    { headers: { responseTagrget: { errorTagrget: 'data' } } }
  )
  return {
    cluster,
    appName,
    data: result.data
  }
}
// 创建应用监听器
export function createAppIngress (cluster, lbname, ingressName, displayName, agentType, body) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/ingress/${ingressName}/app/displayname/${displayName}/agentType/${agentType}`
  return fetchCreateAppIngress(cluster, lbname, ingressName, displayName, agentType, body)
}

async function fetchCreateAppIngress (cluster, lbname, ingressName, displayName, agentType, body) {
  const api = apiFactory.getK8sApi()
  const result = await api.createBy([cluster, 'loadbalances', lbname, 'ingress', ingressName, 'app', 'displayname', displayName, 'agentType', agentType], null, body)
  this.body = result
}
// 创建TCP\UDP监听器
export function createTcpUdpIngress (cluster, lbname, type, name, agentType, body) {
  const endpoint = `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/stream/type/${type}/displayname/${name}/agentType/${agentType}`
  return fetchCreateTcpUdpIngress(cluster, lbname, type, name, agentType, body)
}
async function fetchCreateTcpUdpIngress (cluster, lbname, type, name, agentType, body) {
  const api = apiFactory.getK8sApi()
  const result = await api.createBy([cluster, 'loadbalances', lbname, 'stream', 'type', type, 'displayname', name, 'agentType', agentType], null, body)
  return result
}
export function getServiceListServiceMeshStatus (clusterId, serviceList, query) {
  const newQuery = toQuerystring({
    name: serviceList,
    ...query
  })
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/paas/services`
  endpoint += `?${newQuery}`
  return checkServiceListServiceMeshStatus(clusterId, {
    name: serviceList,
    ...query
  })
}
// 获取服务列表istio状态
// todo 404
async function checkServiceListServiceMeshStatus (clusterId, query) {
  const projectApi = apiFactory.getMeshApi()
  const response = await projectApi.servicemesh.getBy(['clusters', clusterId, 'paas', 'services'], query,
    { headers: { responseTagrget: { errorTagrget: 'data' } } })
  return response
}
// 安全组
export function getSecurityGroupList (cluster) {
  return fetchSecurityGroupList(cluster)
}
async function fetchSecurityGroupList (cluster) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'networkpolicy'])
  return result
}

export function listPSP (clusterID) {
  return getPSPInner(clusterID)
}
async function getPSPInner (clusterID) {
  const projectApi = apiFactory.getApi()
  const response = await projectApi.clusters.getBy([clusterID, 'podsecuritypolicy'], null)
  return response
}
export function listProjectPSPDetail (cluster, project) {
  const oprtions = { headers: { teamspace: project } }
  return getPSPProjectDetailInner(cluster, oprtions)
}
async function getPSPProjectDetailInner (cluster, oprtions) {
  const projectApi = apiFactory.getApi()
  const response = await projectApi.clusters.getBy([cluster, 'podsecuritypolicy', 'project'], null, oprtions)
  return response
}
export async function listConfigGroups (cluster, header) {
  const { project } = header || { project: null }
  const headers = {}
  if (project) {
    Object.assign(headers, { project, teamspace: project })
  }
  const api = apiFactory.getK8sApi()
  const response = await api.getBy([cluster, 'configgroups'], null, { headers })
  const data = []
  response.forEach(function (configgroup) {
    const annotations = configgroup.native.metadata.annotations
    const labelsIsEmpty = annotations && annotations.configlabels !== '' && annotations.configlabels !== undefined ? annotations.configlabels.split(',') : []
    const item = {
      name: configgroup.native.metadata.name,
      configs: [],
      creationTimestamp: configgroup.native.metadata.creationTimestamp,
      annotations: annotations ? labelsIsEmpty : []
    }
    if (configgroup.extended && configgroup.extended && configgroup.extended.configs) {
      configgroup.extended.configs.forEach(function (c) {
        item.configs.push(c)
      })
    }
    item.size = item.configs.length
    data.push(item)
  })
  return {
    data: data,
    cluster
  }
}
export async function checkConfigNameExistence (clusterId, name) {
  const api = apiFactory.getK8sApi()
  const response = await api.getBy([clusterId, 'configgroups', name, 'verify'])
  return response
}

export async function fetchGetSecrets (clusterID, query = {}) {
  const { project } = query.headers || { project: null }
  const headers = {}
  if (project) {
    Object.assign(headers, { project, teamspace: project })
  }
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'secrets'], null, { headers })
  return result
}
export async function startApps (cluster, appList) {
  const apps = appList
  if (!apps) {
    const err = new Error('App names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'apps', 'batch-start'], null, { apps })
}

export async function getDeploymentOrAppCDRule (cluster, type, name) {
  if (!cluster || !name || !type) {
    const err = new Error('cluster, name, type is require')
    err.status = 400
    throw err
  }
  const appService = { isEmptyObject: true }
  if (type === 'app') {
    appService.isEmptyObject = false
    const appApi = apiFactory.getK8sApi()
    const result = await appApi.getBy([cluster, 'apps', name])
    const apps = result
    if (!apps) {
      const err = new Error('cant\'t find any app')
      err.status = 400
      throw err
    }
    const nameArr = name.split(',')
    name = []
    nameArr.forEach(key => {
      const app = apps[key]
      if (app.services && app.services.length > 0) {
        app.services.forEach(service => {
          name.push(service.metadata.name)
          appService[service.metadata.name] = key
        })
      }
    })
    if (name.length === 0) {
      this.status = 200
      this.body = {
        results: []
      }
      return
    }
  }
  const api = apiFactory.getDevOpsApi()
  let result = {
    results: []
  }
  try {
    result = await api.getBy(['cd-rules'], {
      cluster,
      name: name.join ? name.join(',') : name
    })
    const body = []
    if (!appService.isEmptyObject) {
      result.results.forEach(item => {
        const deploymentName = item.binding_deployment_name
        body.push({
          appname: appService[deploymentName],
          service: item
        })
      })
      return {
        results: body
      }
    }
  } catch (err) {
    if (err.statusCode === 403) {
      window.console.warn("Failed to get cd rules as it's not permitted")
    } else {
      throw err
    }
  }

  return result
}
export function getSettingListfromserviceorapp (query, cluster) {
  const api = apiFactory.getK8sApi()
  const queryBody = query
  return api.getBy([cluster, 'alerts/group-strategies'], queryBody)
}
/**
 * 停止应用
 * @param {*} cluster 集群
 * @param {*} appList 应用名称列表
 */
export async function stopApps (cluster, appList) {
  const apps = appList
  if (!apps) {
    const err = new Error('App names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'apps', 'batch-stop'], null, { apps })
  return {
    cluster,
    data: result
  }
}
export async function deleteApps (cluster, body) {
  const apps = body.apps
  if (!apps) {
    const err = new Error('App names is required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.batchDeleteBy([cluster, 'apps', 'batch-delete'], null, body)
  return {
    cluster,
    data: result
  }
}
export async function deleteSetting (cluster, id, name, targetType) {
  const strategyID = id.join(',')
  const strategyName = name ? name.join(',') : ''
  if (!strategyID) {
    const err = new Error('strategyID is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const response = await api.deleteBy([cluster, 'alerts/strategies'], {
    strategyIDs: strategyID,
    strategyName: strategyName
  })
  return response
}
// 应用-重新部署
export async function restartApps (cluster, appList) {
  const apps = appList
  if (!apps) {
    const err = new Error('App names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'apps', 'batch-restart'], null, { apps })
  return {
    cluster,
    data: result
  }
}
export async function loadAppDetail (cluster, appName) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'apps', appName])
  const lbgroupSettings = await api.getBy([cluster, 'proxies'])
  const app = result[appName]
  if (!app) {
    const err = new Error(`App '${appName}' not exits.`)
    err.status = 404
    throw err
  }
  if (!app.services) {
    app.services = []
  }
  app.appStatus = 0
  app.serviceCount = app.services.length
  app.instanceCount = 0
  app.services.map((deployment) => {
    app.instanceCount += deployment.spec.replicas
    portHelper.addPort(deployment, app.k8s_services, lbgroupSettings.data)
  })
  if (app.serviceCount < 1 || app.instanceCount < 1) {
    app.appStatus = 1
  }
  return {
    cluster,
    appName,
    data: app
  }
}
// 更新应用描述
export function updateAppDesc (app) {
  const cluster = app.cluster
  const name = app.name
  let data = { desc: app.desc }
  if (!data || !data.desc) {
    data = {
      desc: ''
    }
  }
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'apps', name, 'desc'], null, data)
}
// 所有服务
export async function loadAllServices (cluster, { pageIndex, pageSize, name, label, customizeOpts, headers }) {
  const { project } = headers || { project: null }
  const Cheaders = {}
  if (project) {
    Object.assign(Cheaders, { project, teamspace: project })
  }
  if (isNaN(pageIndex)) {
    pageIndex = DEFAULT_PAGE
  }
  if (isNaN(pageSize)) {
    pageSize = DEFAULT_PAGE_SIZE
  }
  const Cname = name && encodeURIComponent(name)
  const queryObj = {
    from: (pageIndex - 1) * pageSize,
    size: pageSize
  }
  if (Cname) {
    queryObj.filter = `name ${Cname}`
  }
  if (label) {
    queryObj.filter = `label ${label}`
  }
  const api = apiFactory.getK8sApi()
  let response = await api.getBy([cluster, 'services', 'svcs'], queryObj, { headers: Cheaders })
  const lbgroupSettings = await api.getBy([cluster, 'proxies'])
  if (!response) {
    response = {
      services: []
    }
  }
  response && response.services.map((item) => {
    const deploymentInfo = {}
    portHelper.addPortV2(deploymentInfo, item.service, lbgroupSettings)
    Object.assign(item.service, deploymentInfo)
    // portHelper.addPort(item.deployment, item.service, lbgroupSettings)
    // const annotations = item.deployment.spec.template.metadata.annotations
    // if (annotations && annotations.appPkgName && annotations.appPkgTag) {
    //   item.deployment.wrapper = {
    //     appPkgName: annotations.appPkgName,
    //     appPkgTag: annotations.appPkgTag
    //   }
    // }
  })
  return response
}
// 服务-重新部署
export async function restartServices (cluster, serviceList) {
  const services = serviceList
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'services', 'batch-restart'], null, { services })
  return {
    cluster,
    data: result
  }
}
// 服务-启动
export async function startServices (cluster, serviceList) {
  const services = serviceList
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'services', 'batch-start'], null, { services })
  return {
    cluster,
    data: result
  }
}
// 服务-停止
export async function stopServices (cluster, serviceList) {
  const services = serviceList
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'services', 'batch-stop'], null, { services })
  return {
    cluster,
    data: result
  }
}
export async function deleteServices (cluster, body) {
  const services = body.services
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.batchDeleteBy([cluster, 'services', 'batch-delete'], null, body)
  return {
    cluster,
    data: result
  }
}
export async function loadAutoScale (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'services', serviceName, 'autoscale'])
  const autoScale = result || {}
  return {
    cluster,
    serviceName,
    data: autoScale || {}
  }
}
// 应用-编排文件
export async function getAppOrchfile (cluster, appName) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'apps', 'detail', appName])
  const app = result[appName]
  if (!app) {
    const err = new Error(`App '${appName}' not exits.`)
    err.status = 404
    throw err
  }
  if (!app.services) {
    app.services = []
  }
  if (!app.k8s_services) {
    app.k8s_services = []
  }

  let data = ''
  app.services.map((service) => {
    if (data !== '') {
      data += '---\n'
    }
    // Add apiVersion and kind
    data += 'apiVersion: apps/v1\nkind: Deployment\n'
    data += yaml.dump(service)
  })
  app.k8s_services.map((k8sService) => {
    if (data !== '') {
      data += '---\n'
    }
    // Add apiVersion and kind
    data += 'apiVersion: v1\nkind: Service\n'
    // Remove customized fields
    delete k8sService.spec.clusterIP
    delete k8sService.proxy
    data += yaml.dump(k8sService)
  })
  return {
    cluster,
    appName,
    data
  }
}
// 应用-日志
export async function appLogs (cluster, appName) {
  const spi = apiFactory.getSpi()
  let response = await spi.clusters.getBy([cluster, 'apps', appName, 'oplog'])
  let response1 = response.data.data
  if (response1[appName]) {
    response1 = response1[appName]
  }
  return response1
}
// 告警列表
export function fetchGetAlertList (cluster, body, needFetching) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'alerts/strategies'], body)
}
// 告警-删除
export function deleteAlertSetting (cluster, id, name, targetType) {
  const strategyID = id && id.join(',')
  const strategyName = name && name.join(',')
  if (!strategyID) {
    const err = new Error('strategyID is require')
    err.status = 400
    throw err
  }

  const api = apiFactory.getK8sApi()
  return api.deleteBy([cluster, 'alerts/strategies'], {
    strategyIDs: strategyID,
    strategyName: strategyName
  })
}
// 告警-enable
export function batchEnable (cluster, body) {
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, 'alerts/strategies/batch-enable'], null, body)
}
export function batchDisable (cluster, body) {
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, 'alerts/strategies/batch-disable'], null, body)
}
// 告警-忽略
export function ignoreSetting (cluster, body) {
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 200
    throw err
  }
  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, 'alerts/strategies/batch-ingore'], null, body)
}
// 告警-删除
export function deleteRecords (cluster, query) {
  const api = apiFactory.getK8sApi()
  return api.deleteBy([cluster, 'alerts/records'], query)
}
// 应用下是否有日志告警
export function getAppLogsalert (cluster, apps) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'alerts/logsalert/apps', apps, 'isbindrule'])
}
export function deleteAppLogsalert (cluster, apps) {
  const api = apiFactory.getK8sApi()
  return api.deleteBy([cluster, 'alerts/logsalert/apps', 'unbindrule'], null, { data: { apps } })
}

// 可导入应用列表
export function getImportableApps (cluster) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'apps', 'releases'])
}
// 导入应用
export function importApp (cluster, releases) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'apps', 'releases', releases])
}
export function getImageConfigFromArc (registry, projectName, repositoryName, digest) {
  const api = apiFactory.getApi()
  return api.registries.getBy([registry, 'repositories', projectName, repositoryName, 'artifacts', digest])
}

export function getCollectorInfo (tenant, cluster, app) {
  const api = apiFactory.getTenantApi()
  return api.getBy([tenant, 'clusters', cluster, 'opentelemetry', 'collectors', 'apps', app])
}

export function getEnvConfigroups (cluster) {
  return Vue.axios.get(`/v2/clusters/${cluster}/configgroups`)
}
export function getClusterLabel (cluster, query) {
  return editingView(cluster, query)
}

async function editingView (cluster, query) {
  const api = apiFactory.getApi()
  const nodeName = query.nodeName
  const userDefinedLabels = await getUserDefinedLabelsForEditingView(cluster)
  let labelsOfNodes = null
  if (nodeName) {
    labelsOfNodes = await api.clusters.getBy([`${cluster}/nodes/${nodeName}/labels`], query)
    labelsOfNodes = labelsOfNodes ? [{ name: nodeName, labels: labelsOfNodes }] : []
  } else {
    labelsOfNodes = await api.clusters.getBy([`${cluster}/nodes/labels`], query) || {}
  }
  const result = new Map(userDefinedLabels)
  let nodes = {}
  labelsOfNodes.forEach(node => {
    nodes = Object.assign(nodes, {
      [node.name]: JSON.stringify(node.labels)
    })
    Object.getOwnPropertyNames(node.labels).forEach(key => {
      const value = node.labels[key]
      const dk = distinctKey(key, value)
      if (!result.has(dk)) {
        result.set(dk, aLabel(key, value))
      }
      result.get(dk).targets.add(node.name)
    })
  })
  return {
    nodes: nodes,
    summary: Array.from(result.values()).map(item => {
      if (item.targets) {
        item.targets = Array.from(item.targets)
      }
      return item
    })
  }
}
function getUserDefinedLabelsForEditingView (clusterID) {
  const api = apiFactory.getApi()
  return api.labels.getBy([], { target: 'node', clusterID: clusterID }).then(result => {
    const labels = result.data.data || {}
    const lookup = new Map(labels.map(label => [
      distinctKey(label.key, label.value),
      {
        id: label.id,
        key: label.key,
        value: label.value,
        createAt: label.createAt,
        clusterID: label.clusterID,
        isUserDefined: true,
        targets: new Set(),
        description: label.description
      }
    ]))
    return lookup
  })
}
function distinctKey (key, value) {
  return key + value
}
function aLabel (key, value) {
  return {
    key: key,
    value: value,
    isUserDefined: false,
    targets: new Set()
  }
}
export function getAuthNodeType (clusterID, tenantID) {
  const api = apiFactory.getTenantApi()
  return api.getBy([tenantID, clusterID, 'nodetype'])
}
export function updateServiceAffinity (cluster, name, body) {
  const api = apiFactory.getK8sApi()
  return api.patchBy([cluster, 'deployments', name, 'affinity'], null, JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/merge-patch+json'
    }
  })
}
// 获取GPU/NPU品牌型号
export function getGpuNpuClassify (cluster, target = 'node', type = 'all') {
  const api = apiFactory.getLabelsApi()
  console.log('npu', api.getBy([type], { clusterID: cluster, target }))
  return api.getBy([type], { clusterID: cluster, target })
}
// 是否支持双栈
export function getIpstackInfo (cluster) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'ipstack'])
}
