import {
  DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
} from '../constant/index'
import getDeepValue from '../utils/getDeepValue'
import { getServiceStatus } from '../utils/status_identify'
import { mergeStateByOpts } from '../utils/tools'
import uniq from 'lodash/uniq'

const apiFactory = require('./request/v2/lib/api_factory')
const portHelper = require('../utils/port_helper')

// 获取安全组列表
export async function getSecurityGroupList (clusterID) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'networkpolicy'])
  return result
}

// 删除安全组
export async function deleteSecurityGroup (clusterID, name) {
  const api = apiFactory.getK8sApi()
  const result = await api.deleteBy([clusterID, 'networkpolicy', name], null)
  return result
}

// 更新安全组
export async function updateSecurityGroup (clusterID, body) {
  const api = apiFactory.getK8sApi()
  const result = await api.updateBy([clusterID, 'networkpolicy'], null, body, {
    headers: {
      responseTagrget: 'data'
    }
  })
  return result
}

// 获取隔离状态
export async function getNetworkIsolationStatus (clusterID) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'networkpolicy', 'default-deny'])
  return result
}

// 关闭隔离状态
export async function deleteNetworkIsolation (clusterID) {
  const api = apiFactory.getK8sApi()
  const result = await api.deleteBy([clusterID, 'networkpolicy', 'default-deny'])
  return result
}

// 开启隔离状态
export async function postNetworkIsolation (clusterID, body) {
  const api = apiFactory.getK8sApi()
  const result = await api.createBy([clusterID, 'networkpolicy', 'default-deny'], null, body)
  return result
}

// 获取所有服务列表
export async function getAllServices (clusterID, { pageIndex, pageSize, name, label, customizeOpts, headers }) {
  const { project } = headers || { project: null }
  const formatHeaders = {}
  if (project) {
    Object.assign(formatHeaders, { project, teamspace: project })
  }
  if (isNaN(pageIndex)) {
    pageIndex = DEFAULT_PAGE
  }
  if (isNaN(pageSize)) {
    pageSize = DEFAULT_PAGE_SIZE
  }
  const queryObj = {
    from: (pageIndex - 1) * pageSize,
    size: pageSize
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  if (label) {
    queryObj.filter = `label ${label}`
  }
  const api = apiFactory.getK8sApi()
  let response = await api.getBy([clusterID, 'services'], queryObj, { formatHeaders })

  const lbgroupSettings = await api.getBy([clusterID, 'proxies'])
  if (!response) { // 存疑 到底有没有data字段
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

// 获取安全组详情
export async function getSecurityGroupDetail (clusterID, name) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'networkpolicy', name])
  return result
}
// 获取集群网络出口下拉列表
export async function getProxy (clusterID) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'proxies'])
  return result
}

// 获取应用负载均衡列表
export async function getLBList (clusterID, query = {}) {
  const result = {}
  const api = apiFactory.getK8sApi()
  let data = await api.getBy([clusterID, 'loadbalances'])
  result.data = data
  result.total = data.length || 0
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

// 创建安全组
export async function createSecurityGroup (clusterID, body) {
  const api = apiFactory.getK8sApi()
  const result = await api.createBy([clusterID, 'networkpolicy'], null, body, {
    headers: {
      responseTagrget: 'data'
    }
  })
  return result
}

export async function getClusterNetworkMode (clusterID) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'network'])
  return result
}
