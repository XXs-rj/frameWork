import {
  DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, INSTANCE_AUTO_SCALE_MAX_CPU, INSTANCE_AUTO_SCALE_MAX_MEMORY
} from '../constant/index'
import getDeepValue from '../utils/getDeepValue'
import { getServiceStatus } from '../utils/status_identify'
import { mergeStateByOpts } from '../utils/tools'
import uniq from 'lodash/uniq'
import Vue from 'vue'

const apiFactory = require('./request/v2/lib/api_factory')
const portHelper = require('../utils/port_helper')

// 获取自动伸缩策略列表
export async function getAutoScaleList (clusterID, query) {
  const cluster = clusterID
  const filter = query.serviceName || ''
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'services', 'autoscale'])
  const tempList = result
  const autoScaleList = {}
  let totalCount = 0
  for (const key in tempList) {
    if ((filter === '' || key.match(filter) != null || tempList[key].metadata.labels.strategyName.match(filter) != null)) {
      totalCount++
      autoScaleList[key] = tempList[key]
    }
  }
  const finialScaleList = {}
  const keys = Object.keys(autoScaleList)
  keys.forEach((key, index) => {
    if (index >= from && index < from + size) {
      finialScaleList[key] = autoScaleList[key]
    }
  })
  return {
    cluster,
    data: finialScaleList || {},
    totalCount
  }
}

// 删除自动伸缩策略
export async function deleteAutoScale (clusterID, serviceName) {
  const cluster = clusterID
  const api = apiFactory.getK8sApi()
  const result = await api.deleteBy([cluster, 'services', serviceName, 'autoscale'])
  return {
    cluster,
    serviceName,
    data: result || {}
  }
}

// 更新自动伸缩策略状态
export async function updateAutoScaleStatus (clusterID, body) {
  const cluster = clusterID
  const { type, services } = body
  if (!body || (type !== 0 && type !== 1) || !services) {
    const err = new Error('type and services are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([cluster, 'services', 'autoscale', 'status'], null, body)
  return {
    cluster,
    data: result
  }
}

// 获取所有服务列表
export async function getAllServices (clusterID, { pageIndex, pageSize, name, label, customizeOpts, headers }) {
  const cluster = clusterID
  let pIndex = parseInt(pageIndex)
  let pSize = parseInt(pageSize)
  const { project } = headers || { project: null }
  const header = {}
  if (project) {
    Object.assign(header, { project, teamspace: project })
  }
  if (isNaN(pIndex)) {
    pIndex = DEFAULT_PAGE
  }
  if (isNaN(pSize)) {
    pSize = DEFAULT_PAGE_SIZE
  }
  const queryObj = {
    from: (pIndex - 1) * pSize,
    size: pSize
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  if (label) {
    queryObj.filter = `label ${label}`
  }
  const api = apiFactory.getK8sApi()
  let response = await api.getBy([cluster, 'services'], queryObj, { header })
  const lbgroupSettings = await api.getBy([cluster, 'proxies'])
  if (!response) {
    response = {
      services: []
    }
  }
  response && response.services.map((item) => {
    portHelper.addPort(item.deployment, item.service, lbgroupSettings.data)
    const annotations = item.deployment.spec.template.metadata.annotations
    if (annotations && annotations.appPkgName && annotations.appPkgTag) {
      item.deployment.wrapper = {
        appPkgName: annotations.appPkgName,
        appPkgTag: annotations.appPkgTag
      }
    }
  })
  let services = response.services.map(service => {
    service.deployment.cluster = service.cluster
    service.deployment.volumeTypeList = uniq(service.volumeTypeList) // 存储类型
    service.deployment.status = getServiceStatus(service.deployment)
    service.deployment.chartName = getDeepValue(service, ['service', 'metadata', 'labels', 'system/chartName']) || ''
    return service.deployment
  })
  services = mergeStateByOpts({}, services, 'metadata.name', customizeOpts)
  return {
    count: response.count,
    services,
    total: response.total
  }
}

export async function getAllServices2 (cluster) {
  const api = apiFactory.getK8sApi()
  const response = await api.getBy([cluster, 'services', 'native-workloads'])
  return response
}

// 获取告警通知组列表
export async function getNotifyGroups (query, clusterID) {
  const cluster = clusterID
  const tempQuery = {
    name: ''
  }
  if (query) {
    tempQuery.name = this.query.name
    tempQuery.id = this.query.id
  }
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'alerts/groups'], tempQuery)
  return result
}

// 校验自动伸缩策略名称
export async function checkAutoScaleName (clusterID, body) {
  const cluster = clusterID
  const api = apiFactory.getK8sApi()
  const result = await api.createBy([cluster, 'services', 'autoscale', 'check-exists'], null, body, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  return result
}

// 修改/创建/克隆自动伸缩策略
export async function updateAutoScale (clusterID, serviceName, body) {
  const cluster = clusterID
  if (!body || !body.min || !body.max || (!body.cpu && !body.memory && !body.qps)) {
    const err = new Error('min, max, cpu/memory/qps are required.')
    err.status = 400
    throw err
  }
  const min = parseInt(body.min)
  const max = parseInt(body.max)
  const cpu = parseInt(body.cpu)
  const memory = parseInt(body.memory)
  const qps = parseInt(body.qps)
  const stabilizationWindowSeconds = parseInt(body.stabilizationWindowSeconds)
  const scaleStrategyName = body.scaleStrategyName
  const alertStrategy = body.alertStrategy
  const alertGroup = body.alertGroup
  const type = body.type
  const operationType = body.operationType
  const svcName = body?.svc_name || ''
  if (min >= max) {
    const err = new Error('最大值必须大于最小值.')
    err.status = 400
    throw err
  }

  if (cpu && (isNaN(cpu) || cpu < 1 || cpu > INSTANCE_AUTO_SCALE_MAX_CPU)) {
    const err = new Error(`cpu在1%-${INSTANCE_AUTO_SCALE_MAX_CPU}%之间.`)
    err.status = 400
    throw err
  }
  if (memory && (isNaN(memory) || memory < 1)) {
    const err = new Error('内存应大于1.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  let result
  if (operationType === 'create') {
    const payload = { min, max, cpu, memory, qps, scale_strategy_name: scaleStrategyName, alert_strategy: alertStrategy, alert_group: alertGroup, type, stabilizationWindowSeconds }
    if (svcName) {
      payload.svc_name = svcName
    }
    result = await api.createBy([cluster, 'services', serviceName, 'autoscale'], null, payload, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  } else {
    result = await api.updateBy([cluster, 'services', serviceName, 'autoscale', scaleStrategyName], null, { min, max, cpu, memory, qps, alert_strategy: alertStrategy, alert_group: alertGroup, type, stabilizationWindowSeconds }, { headers: { responseTagrget: { errorTagrget: 'data' } } })
  }
  return {
    cluster,
    serviceName,
    data: result
  }
}

// 获取告警通知组列表
export function getSysmsggroupList (cluster, namespace, params) {
  return Vue.axios.get(`/v2/clusters/${cluster}/alerts/groups`, { headers: { teamspace: namespace }, params })
}
export function createMsgGroup (param) {
  return Vue.axios.post('/ser-ipaas-prometheus/api/sysmsggroup', param)
}
export function verifyWebhook (namespace, webhook) {
  return Vue.axios.post('/v2/webhook/verify', webhook, { headers: { teamspace: namespace } })
}
// 验证邮件
export function testEmail (namespace, email) {
  return Vue.axios.get(`/v2/email/invitations/status/${email}`, { headers: { teamspace: namespace } })
}
