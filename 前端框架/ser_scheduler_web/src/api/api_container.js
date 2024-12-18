import {
  DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
} from '../constant/index'
import Vue from 'vue'
const apiFactory = require('./request/v2/lib/api_factory')

// 获取容器列表
export async function getContainerList (clusterID, params) {
  const cluster = clusterID
  const query = params || {}
  // const { project } = this.request.headers || { project: null }
  // const headers = {}
  // if (project) {
  //   Object.assign(headers, { project, teamspace: project })
  // }
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
  if (query.sortOrder) {
    queryObj.sort_by = 'create_time'
    queryObj.sort_order = query.sortOrder
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'instances'], queryObj)
  // 获取Pod的istio状态
  const projectApi = apiFactory.getMeshApi()
  // let res = {}
  // try {
  //   res = await projectApi.servicemesh.getBy(['clusters', cluster, 'paas', 'pods'])
  // } catch (e) {}
  // const { pods: istioPod } = res || {}
  const pods = result.instances || []
  pods.map((pod) => {
    // if (istioPod !== undefined) {
    //   const istioFlag = Object.entries(istioPod)
    //     .map(([key, value = {}]) => ({ name: key, value: value.istioOn }))
    //   const istioPodflagOne = (istioFlag.filter(({ name }) => name === pod.metadata.name) || [{}])
    //   const istioPodflag = istioPodflagOne[0] && istioPodflagOne[0].value
    //   pod.istioOn = istioPodflag
    // }
    pod.images = []
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  })
  return {
    cluster,
    data: pods,
    total: result.total,
    count: result.count
  }
}
// 导出镜像
export async function exportInstance (clusterID, name, params) {
  const cluster = clusterID
  const instance = name
  const image = params
  if (!image || !image.imagename) {
    const err = new Error('imagename is required.')
    err.status = 400
    throw err
  }

  const api = apiFactory.getK8sApi()
  const result = await api.createBy([cluster, 'instances', instance, 'export'], null, image)
  return {
    cluster,
    data: result.data,
    statusCode: result.statusCode
  }
}
// 删除/批量删除容器
export async function deleteContainers (clusterID, containerNames) {
  const cluster = clusterID
  const query = { force: true }
  const instances = containerNames
  if (!instances) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi()
  const result = await api.batchDeleteBy([cluster, 'instances', 'batch-delete'], query, { instances })
  return {
    cluster,
    data: result
  }
}
// 更新容器列表
export function updateContainerList (clusterID, name) {
  return updateContainerListApi(clusterID, name)
}
export async function updateContainerListApi (clusterID, containerNames) {
}
// 获取容器事件列表
export async function getContainerEventList (clusterID, containerNames) {
  const cluster = clusterID
  const containerName = containerNames
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'events', 'instances', containerName, 'events'])
  /* pod.events = []
  if (pod.data) {
    pod.data.map((eventDetail) => {
      pod.events.push(eventDetail)
    })
  } */
  return {
    cluster,
    containerName,
    data: filtEvents(result.events)
  }
}
export function filtEvents (events) {
  const targetEvents = []
  if (!events) {
    return targetEvents
  }
  events.map(event => {
    let { reason } = event
    reason = reason.toLowerCase()
    switch (reason) {
      case 'failedmount':
        event.message = '尝试挂载存储卷失败，重试中...'
        targetEvents.push(event)
        break
      case 'failedscheduling':
        if (event.message.indexOf('PersistentVolumeClaim is not bound') > -1) {
          event.reason = 'Scheduling'
          event.message = '存储服务调度中...'
          event.type = 'Normal'
        }
        targetEvents.push(event)
        break
      default:
        targetEvents.push(event)
    }
  })
  return targetEvents
}
// 获取容器详情
export async function getContainerDetail (clusterID, name) {
  const cluster = clusterID
  const containerName = name
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'instances', containerName, 'detail'])
  const pod = result || {}
  pod.images = []
  if (pod.spec) {
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  }
  return {
    cluster,
    containerName,
    data: pod
  }
}
// 获取容器进程列表
export async function getContainerProgress (clusterID, name, query) {
  const cluster = clusterID
  const instance = name
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([cluster, 'instances', instance, 'process'], query)
  return {
    cluster,
    data: result || []
  }
}
export function getLogToken () {
  return Vue.axios.get('/spi/v2/watch/token')
}
