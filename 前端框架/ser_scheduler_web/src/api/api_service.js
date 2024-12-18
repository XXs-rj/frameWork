
import { toQuerystring } from '@/utils/tools'
const apiFactory = require('./request/v2/lib/api_factory')
const portHelper = require('@/utils/port_helper')

// 服务-滚动发布
export function rollingUpdateService (cluster, serviceName, targets) {
  if (!targets) {
    const err = new Error('targets are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  if (targets.onlyRollingUpdate) {
    return api.updateBy([cluster, 'upgrade', 'services', serviceName, 'rollingupdate'], null, targets)
  } else {
    return api.updateBy([cluster, 'upgrade', 'services', serviceName, 'grayrelease'], null, targets)
  }
}
export function rollbackUpdateService (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'upgrade', 'services', serviceName, 'rollbackupdate'])
}
// 服务-伸缩
export function manualScaleService (cluster, serviceName, body) {
  if (!body || !body.num) {
    const err = new Error('Num is required.')
    err.status = 400
    throw err
  }
  const num = parseInt(body.num)
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', serviceName, 'manualscale'], null, { number: num }, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
// 服务-详情
export async function loadServiceDetail (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'services', serviceName, 'version-contro'], null, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  const lbgroupSettings = await api.getBy([cluster, 'proxies'])
  const service = (result[serviceName]) || {}
  // 查看yaml的时候需要用到原始的service数据
  service.originService = Object.assign({}, service.service)
  const deploymentInfo = {}
  portHelper.addPortV2(deploymentInfo, service.service, lbgroupSettings)
  Object.assign(service.service, deploymentInfo)
  service.deployments = (service.deployments || []).map(it => {
    it.images = []
    if (it.spec) {
      it.spec.template.spec.containers.map((container) => {
        it.images.push(container.image)
      })
    }
    return it
  })
  Object.assign(service, deploymentInfo)

  return {
    cluster,
    serviceName,
    data: service
  }
}
// Deployment-详情
export async function loadDeploymentDetail (cluster, deploymentName) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'deployments', deploymentName], null, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  const lbgroupSettings = await api.getBy([cluster, 'proxies'])
  const deploymentInfo = (result[deploymentName] && result[deploymentName].deployment) || {}
  const volume = (result[deploymentName] && result[deploymentName].volume) || {}
  deploymentInfo.images = []
  if (deploymentInfo.spec) {
    deploymentInfo.spec.template.spec.containers.map((container) => {
      deploymentInfo.images.push(container.image)
    })
  }
  portHelper.addPort(deploymentInfo, result[deploymentName].service, lbgroupSettings)
  deploymentInfo.volume = volume
  return {
    cluster,
    deploymentName,
    data: deploymentInfo
  }
}
export async function loadServiceContainerList (cluster, serviceName, query, bpmQuery) {
  const { projectName, userName } = query || {}
  if (query) {
    delete query.projectName
    delete query.userName
  }
  let headers
  if (projectName) {
    headers = {
      teamspace: projectName || 'default'
    }
  }
  if (userName) {
    headers = Object.assign({}, headers, {
      onbehalfuser: userName
    })
  }
  if (projectName) {
    Object.assign(headers, { project: projectName, teamspace: projectName })
  }
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'instances', 'services', serviceName, 'instances'], query, { headers })
  const instances = result.instances || []
  instances.map((pod) => {
    pod.images = []
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  })
  return {
    cluster,
    serviceName,
    data: instances,
    total: result.total,
    count: result.count
  }
}
export function loadK8sService (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'services', serviceName, 'k8s-service'])
}
// 更新服务配置
export function updateServiceConfigGroup (cluster, type, name, body) {
  const api = apiFactory.getK8sApi()
  return api.patch(`${cluster}/native/${type}/${name}`, body, {
    headers: {
      'Content-Type': 'application/strategic-merge-patch+json'
    }
  })
}
// 更改地址池
export function UpdateServiceAnnotation (cluster, service, body, query) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', service, 'annotation'], query || null, body, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function getServiceLBList (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'loadbalances', 'services', serviceName, 'controller'])
}

export async function getAutoScaleLogs (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'services', serviceName, 'autoscale', 'logs'], null)
  return {
    cluster,
    data: result
  }
}
export async function getScaleEvents (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'events', 'services', serviceName, 'hpa', 'events'], null)
  return {
    cluster,
    data: result
  }
}
// 更改服务配置
export function changeQuotaService (cluster, serviceName, body) {
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', serviceName, 'quota'], null, body)
}
// 修改服务环境变量
export function editServiceEnv (body) {
  const cluster = body.clusterId
  const serviceName = body.service
  const arr = body.arr
  if (!arr || !Array.isArray(arr)) {
    const err = new Error('Body are required.')
    err.status = 400
    throw err
  }
  const params = [{ env: [], container: serviceName }]
  params[0].env = arr
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', serviceName, 'env'], null, params)
}
export function checkAPPInClusMesh (clusterId, application, service) {
  const query = { application, service }
  const projectApi = apiFactory.getMeshApi()
  return projectApi.servicemesh.getBy(['clusters', clusterId, 'paas', 'pods'], query)
}
// 设置服务访问方式
export function setServiceProxyGroup (body) {
  const cluster = body.cluster
  const service = body.service
  const groupID = body.groupID
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', service, 'lbgroups', groupID])
}
// 设置服务服务访问方式-端口
export function updateServicePort (clusterId, service, portInfo) {
  const body = portInfo
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  return api.updateBy([clusterId, 'services', service, 'portinfo'], null, body, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function unbindIngressService (cluster, lbname, serviceName, agentType) {
  const api = apiFactory.getK8sApi()
  return api.deleteBy([cluster, 'loadbalances', lbname, 'services', serviceName, 'agentType', agentType])
}
// 修改服务高可用
export function changeServiceAvailability (cluster, serviceName, body) {
  if (!body) {
    const err = new Error('Body are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', serviceName, 'ha'], null, body)
}
// 绑定域名
export function bindServiceDomain (cluster, serviceName, domainInfo) {
  const reqData = domainInfo
  if (!reqData.port || !reqData.domain) {
    const err = new Error('port and domain is required')
    err.status = 400
    throw err
  }
  const spi = apiFactory.getSpi()
  return spi.clusters.createBy([cluster, 'services', serviceName, 'binddomain'], null, reqData, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
// 删除域名
export function deleteServiceDomain (cluster, serviceName, domainInfo) {
  const reqData = domainInfo
  if (!reqData.port || !reqData.domain) {
    const err = new Error('port and domain is required')
    err.status = 400
    throw err
  }
  const spi = apiFactory.getSpi()
  return spi.clusters.updateBy([cluster, 'services', serviceName, 'binddomain'], null, reqData)
}
export function loadCertificates (cluster, service) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'services', service, 'certificates'], { headers: { responseTagrget: { successTagrget: 'data' } } })
}
// 删除证书
export function deleteCertificates (cluster, service) {
  const api = apiFactory.getK8sApi()
  return api.deleteBy([cluster, 'services', service, 'certificates'])
}
export function toggleHTTPs (cluster, service, status) {
  const action = status
  if (action !== 'on' && action !== 'off') {
    const err = new Error('action invalid')
    err.status = 400
    throw err
  }
  const queryObj = {
    action: action
  }
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', service, 'tls'], queryObj)
}
export function updateCertificates (cluster, service, body) {
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }

  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, 'services', service, 'certificates'], null, body)
}
// 服务和版本控制器的接口都使用这个
/**
 *
 * @param {*} labels 删除的标签
 * @param {*} cluster
 * @param {*} name  服务/deployment名称
 * @param {*} type 类型 services/deployments
 * @returns
 */
export function delteServiceTag (labels, cluster, type, name) {
  const api = apiFactory.getK8sApi()
  return api.deleteBy([cluster, type, name, 'labels', labels], null)
}
export function addServiceTag (body, cluster, type, name) {
  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, type, name, 'labels'], null, body)
}
export function updataServiceTag (body, cluster, type, name) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, type, name, 'labels'], null, body)
}
export function getIsMacvlanIpExisted (cluster, ip, ipPool) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'networking', 'macvlan', 'ipreservations', 'availability'], { ip, assignment: ipPool })
}
export function quickRestartServices (cluster, serviceList) {
  if (!serviceList) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  // quickrestart !!
  return api.updateBy([cluster, 'services', 'quickrestart'], null, { services: serviceList })
}
// 编辑服务容器目录
export function editServiceVolume (cluster, serviceName, body) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', serviceName, 'volume'], null, body)
}
export function updateHostConfig (cluster, service, body) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', service, 'host'], null, body, { headers: { responseTagrget: { successTagrget: 'data' } } })
}
// 版本回滚
export function rollBackService (cluster, serviceName, body) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'services', serviceName, 'rollouts'], null, body)
}
export function deleteRollout (cluster, serviceName, version) {
  const rollname = version
  const api = apiFactory.getK8sApi()
  return api.deleteBy([cluster, 'services', serviceName, 'rollouts', rollname], { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function getRollouts (cluster, serviceName, query) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'services', serviceName, 'rollouts'], query)
}
export async function loadConfigName (cluster, obj) {
  const fileName = obj.name
  const group = obj.group
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'configgroups', group, 'configs', fileName])
}
export function ToggleAPPMesh (cluster, service, body) {
  const projectApi = apiFactory.getMeshApi()
  return projectApi.servicemesh.updateBy(['clusters', cluster, 'paas', 'services',
    service, 'status'], null, body)
}
export function getServiceReference (clusterID, query) {
  const api = apiFactory.getK8sApi()
  return api.getBy([clusterID, 'networkpolicy', 'references'], query, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function loadServiceLogs (cluster, serviceName, body) {
  const reqData = body
  reqData.kind = 'service'
  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, 'logs', 'services', serviceName, 'logs'], null, reqData)
}
export function getLogLen (body, query) {
  const { namespace } = body
  let headers = null
  if (namespace && namespace === 'kube-system') {
    headers = {
      teamspace: 'kube-system'
    }
  }
  const api = apiFactory.getApi()
  const cluster = body.cluster
  const names = body.names
  return api.clusters.createBy([cluster, 'logs', 'instances', names, 'logs', 'stats'], query, body, headers ? { headers } : null)
}
export async function loadContainerDetailEvents (cluster, containerName) {
  // this function for user get the events of detail container
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'events', 'instances', containerName, 'events'])
  const events = result || {}
  return {
    cluster,
    containerName,
    data: events
  }
}
// 清除日志
export function cleanSystemLogs (body, query) {
  const api = apiFactory.getApi()
  return api.cleaner.createBy(['systemlog', 'clean'], query, body)
}
// 服务事件
export function getReplicasetDetailEvents (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'events', 'replicaset', serviceName, 'events'], null, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function loadContainersAllEvents (cluster, serviceName) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'events', 'services', serviceName, 'pods', 'events'])
}
// Deployments-重新部署
export async function restartDeployments (cluster, deployments) {
  if (!deployments) {
    const err = new Error('deployment names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'deployments', 'batch-restart'], null, { deployments })
  return {
    cluster,
    data: result
  }
}
// Deployments-启动
export async function startDeployments (cluster, deployments) {
  if (!deployments) {
    const err = new Error('deployment names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'deployments', 'batch-start'], null, { deployments })
  return {
    cluster,
    data: result
  }
}
// Deployments-停止
export async function stopDeployments (cluster, deployments) {
  if (!deployments) {
    const err = new Error('deployment names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'deployments', 'batch-stop'], null, { deployments })
  return {
    cluster,
    data: result
  }
}
export async function deleteDeployments (cluster, deployments) {
  if (!deployments) {
    const err = new Error('deployment names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.deleteBy([cluster, 'deployments', 'batch-delete'], null, { data: { deployments } })
  return {
    cluster,
    data: result
  }
}
// 检查代理端口是否存在
export async function checkPortExist (cluster, service, data) {
  const api = apiFactory.getK8sApi()
  const result = await api.createBy([cluster, 'services', service, 'ports/exist'], null, data)
  return result
}
// 修改服务端口
export async function updateServicePorts (cluster, service, ports) {
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'services', service, 'ports'], null, ports, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  return result
}
// 克隆版本
export function cloneDeploymentVersion (cluster, deploymentName, body) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'deployments', deploymentName, 'version'], null, body)
}
// Deployments-删除标签
export function deleteDeploymentLabels (cluster, deployment, labels) {
  if (!deployment) {
    const err = new Error('deployment names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  return api.deleteBy([cluster, 'deployments', deployment, 'labels', labels], null)
}

export function addDeploymentLabels (body, cluster, deployment) {
  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, 'deployments', deployment, 'labels'], null, body)
}
export function updataDeploymentLabels (body, cluster, deployment) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'deployments', deployment, 'labels'], null, body)
}
// 服务端口信息
// target_port时为可配置数据（还未配置） service_port为未配置映射服务端口
export function getAvailablePorts (cluster, service) {
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'services', service, 'ports'], null)
}
// 更新 deployment 容器端口
export function updateContainerPorts (cluster, deployment, body) {
  const api = apiFactory.getK8sApi()
  return api.updateBy([cluster, 'deployments', deployment, 'container-port'], null, body)
}
