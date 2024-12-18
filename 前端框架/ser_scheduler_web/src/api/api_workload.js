import {
  formatMonitorName,
  formatPodMonitor
} from '../utils/tools'
import {
  METRICS_CPU, METRICS_MEMORY, METRICS_NETWORK_RECEIVED, METRICS_COMPUTE, METRICS_COMPUTE_HUAWEI, METRICS_GPU, METRICS_GPU_HUAWEI,
  METRICSS_NETWORK_TRANSMITTED, METRICSS_DISK_READ, METRICSS_DISK_WRITE
} from '../constant/index'
import cloneDeep from 'lodash/cloneDeep'
import queryString from 'query-string'
import Vue from 'vue'
import axios from 'axios'
Vue.prototype.$axios = axios

const apiFactory = require('./request/v2/lib/api_factory')

const paasApiUrl = '/api/v2'
const project = () => {
  return {
    project: Vue.prototype.$store.getters['entities/getCurrent'].space.namespace
    // project: 'demo'
  }
}
// project: 'demo'
export function getNativeResourceList (cluster, type) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/native/${type}`, {
    headers: project()
  })
}

export function deleteNativeResourceList (cluster, type, name) {
  const headers = {
    responseTagrget: {
      successTagrget: 'all',
      errorTagrget: 'data'
    },
    ...project()
  }
  return Vue.prototype.$axios.delete(`${paasApiUrl}/clusters/${cluster}/native/${type}/${name}`, { headers })
}

export function updatePausedStatus (cluster, name, pause) {
  const body = {
    names: [name],
    pause
  }
  return Vue.prototype.$axios.put(`${paasApiUrl}/clusters/${cluster}/services/batch-pause`, body, { headers: project() })
}

export function getNativeDetail (cluster, type, name) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/native/${type}/${name}`, { headers: project() })
}

export function getPodsList (cluster, type, name) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/native/${type}/${name}/pods`, { headers: project() })
}

export function redistributionPod (cluster, body, force) {
  return Vue.prototype.$axios.post(`${paasApiUrl}/clusters/${cluster}/instances/batch-delete${force ? '?force=true' : ''}`, body, { headers: project() })
}

export async function getMonitor (cluster, name, query) {
  const tempType = query.type
  const res = await Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/metric/instances/${name}/metrics?${queryString.stringify(query)}`, { headers: project() })
  console.log('met:', res)
  const result = formatPodMonitor(cloneDeep(res.data))
  return {
    [tempType]: formatMonitorName(result.data)
  }
}

export async function getAllMonitor (cluster, name, query, showComputeCard = false) {
  let sourceTypeArray = [
    METRICS_CPU, METRICS_MEMORY, METRICS_NETWORK_RECEIVED,
    METRICSS_NETWORK_TRANSMITTED, METRICSS_DISK_READ, METRICSS_DISK_WRITE
  ]
  if (showComputeCard === 'nvidia') {
    sourceTypeArray = sourceTypeArray.concat([METRICS_COMPUTE, METRICS_GPU])
  } else if (showComputeCard === 'huawei') {
    sourceTypeArray = sourceTypeArray.concat([METRICS_COMPUTE_HUAWEI, METRICS_GPU_HUAWEI])
  }
  const promiseArray = sourceTypeArray.map(item => {
    const tempQuery = {
      type: item,
      ...query
    }
    return getMonitor(cluster, name, tempQuery)
  })
  return await Promise.all(promiseArray)
}

export function getNativeLogs (cluster, body, instances) {
  return Vue.prototype.$axios.post(`${paasApiUrl}/clusters/${cluster}/logs/instances/${instances}/logs`, body, { headers: project() })
}

export function getServiceEvent (cluster, name, query) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/events/services/${name}/pods/events?${queryString.stringify(query)}`, { headers: project() })
}

export function loadSample (cluster) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/native/samples`, { headers: project() })
}

export function loadStackDetail (id) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/templates/${id}`, { headers: project() })
}

export function loadStackList (query) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/templates?${queryString.stringify(query)}`, { headers: project() })
}

export function createStack (body) {
  const headers = {
    responseTagrget: 'all',
    ...project()
  }
  return Vue.prototype.$axios.post(`${paasApiUrl}/templates`, body, { headers })
}

export function createPSP (cluster, yaml) {
  return Vue.prototype.$axios.post(`${paasApiUrl}/clusters/${cluster}/podsecuritypolicy`, yaml,
    {
      headers: {
        ...project(),
        'content-type': 'application/text',
        responseTagrget: {
          errorTagrget: 'data'
        }
      }
    })
}

export function updatePSP (cluster, yaml) {
  return Vue.prototype.$axios.put(`${paasApiUrl}/clusters/${cluster}/podsecuritypolicy`, yaml,
    {
      headers: {
        ...project(),
        'content-type': 'application/text',
        responseTagrget: {
          errorTagrget: 'data'
        }
      }
    })
}

export function createNativeResource (cluster, yaml) {
  const headers = {
    responseTagrget: {
      successTagrget: 'all',
      errorTagrget: 'data'
    },
    'Content-Type': 'text/plain',
    ...project()
  }
  return Vue.prototype.$axios.post(`${paasApiUrl}/clusters/${cluster}/native`, yaml, { headers })
}

export function updateNativeResource (cluster, yaml) {
  const headers = {
    responseTagrget: {
      errorTagrget: 'data',
      successTagrget: 'all'
    },
    'Content-Type': 'text/plain',
    ...project()
  }
  return Vue.prototype.$axios.put(`${paasApiUrl}/clusters/${cluster}/native`, yaml, { headers })
}

export function cleanLogs (body) {
  const headers = {
    responseTagrget: {
      errorTagrget: 'data',
      successTagrget: 'all'
    },
    ...project()
  }
  return Vue.prototype.$axios.post(`${paasApiUrl}/cleaner/systemlog/clean`, body, { headers })
}

export function operationNativeResource (cluster, type, name, body) {
  const headers = {
    responseTagrget: {
      errorTagrget: 'data',
      successTagrget: 'all'
    },
    'Content-Type': 'application/strategic-merge-patch+json',
    ...project()
  }
  return Vue.prototype.$axios.patch(`${paasApiUrl}/clusters/${cluster}/native/${type}/${name}`, body, { headers })
}

export function getServiceAccountList (cluster) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/serviceAccount`, { headers: project() })
}

export function getSADetail (cluster, name) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/serviceAccount/${name}`, { headers: project() })
}

export function getPodYaml (cluster, name) {
  return Vue.prototype.$axios.get(`${paasApiUrl}/clusters/${cluster}/native/Pod/${name}`, { headers: project() })
}
export function downloadPodFile (cluster, instances, container, data) {
  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, 'files/instances', instances, 'containers', container, 'download'], null, data, { headers: { responseTagrget: 'all' }, responseType: 'blob' })
}
export function uploadPodFile (cluster, instances, container, data) {
  const api = apiFactory.getK8sApi()
  return api.createBy([cluster, 'files/instances', instances, 'containers', container, 'upload'], null, data, { })
}
