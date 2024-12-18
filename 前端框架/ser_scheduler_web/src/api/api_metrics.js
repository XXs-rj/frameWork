import {
  METRICS_CPU, METRICS_DEFAULT_SOURCE, METRICS_MEMORY, METRICS_NETWORK_RECEIVED,
  METRICSS_NETWORK_TRANSMITTED,
  METRICSS_DISK_READ,
  METRICSS_DISK_WRITE
} from '@/constant/index'
import moment from 'moment'
const apiFactory = require('./request/v2/lib/api_factory')
const xlsx = require('@/utils/xlsx')
export function loadServiceMetricsCPU (cluster, serviceName, query = {}) {
  query.type = METRICS_CPU
  if (!query.source) {
    query.source = METRICS_DEFAULT_SOURCE
  }
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'metric', 'services', serviceName, 'metrics'], query, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function loadServiceMetricsMemory (cluster, serviceName, query = {}) {
  query.type = METRICS_MEMORY
  if (!query.source) {
    query.source = METRICS_DEFAULT_SOURCE
  }
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'metric', 'services', serviceName, 'metrics'], query, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function loadServiceMetricsNetworkReceived (cluster, serviceName, query = {}) {
  query.type = METRICS_NETWORK_RECEIVED
  if (!query.source) {
    query.source = METRICS_DEFAULT_SOURCE
  }
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'metric', 'services', serviceName, 'metrics'], query, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function loadServiceMetricsNetworkTransmitted (cluster, serviceName, query = {}) {
  query.type = METRICSS_NETWORK_TRANSMITTED
  if (!query.source) {
    query.source = METRICS_DEFAULT_SOURCE
  }
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'metric', 'services', serviceName, 'metrics'], query, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function loadServiceMetricsDiskRead (cluster, serviceName, query = {}) {
  query.type = METRICSS_DISK_READ
  if (!query.source) {
    query.source = METRICS_DEFAULT_SOURCE
  }
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'metric', 'services', serviceName, 'metrics'], query, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export function loadServiceMetricsDiskWrite (cluster, serviceName, query = {}) {
  query.type = METRICSS_DISK_WRITE
  if (!query.source) {
    query.source = METRICS_DEFAULT_SOURCE
  }
  const api = apiFactory.getK8sApi()
  return api.getBy([cluster, 'metric', 'services', serviceName, 'metrics'], query, { headers: { responseTagrget: { errorTagrget: 'data' } } })
}
export async function loadServiceAllOfMetrics (cluster, serviceName, query = {}) {
  query.source = METRICS_DEFAULT_SOURCE
  const sourceTypeArray = [
    METRICS_CPU, METRICS_MEMORY, METRICSS_NETWORK_TRANSMITTED,
    METRICS_NETWORK_RECEIVED, METRICSS_DISK_READ, METRICSS_DISK_WRITE
  ]
  const promiseArray = sourceTypeArray.map(type => _getContainerMetricsByType(cluster, serviceName, query, type))
  const results = await Promise.all(promiseArray)
  if (query.action === 'export-excel') {
    const constainerMonitors = xlsx.formatConstainerMonitors(results)
    if (constainerMonitors.length === 0) {
      return {
        message: 'no monitor data yet.'
      }
    }
    const fileName = `${serviceName}-${moment().format('YYYY-MM-DD-HH.mm.ss.SSS')}`
    return xlsx.buildResourceMonitorXlsx(constainerMonitors)
  }

  return {
    cluster,
    serviceName,
    data: results
  }
}
function _getContainerMetricsByType (cluster, serviceName, query, type) {
  const api = apiFactory.getK8sApi()
  const newQuery = Object.assign({}, query, { type })
  let typeKey = ''
  switch (type) {
    case METRICS_CPU:
      typeKey = 'cpu'
      break
    case METRICS_MEMORY:
      typeKey = 'memory'
      break
    case METRICSS_NETWORK_TRANSMITTED:
      typeKey = 'networkTrans'
      break
    case METRICS_NETWORK_RECEIVED:
      typeKey = 'networkRec'
      break
    case METRICSS_DISK_READ:
      typeKey = 'diskReadIo'
      break
    case METRICSS_DISK_WRITE:
      typeKey = 'diskWriteIo'
      break
    default:
      break
  }
  return api.getBy([cluster, 'metric', 'services', serviceName, 'metrics'], newQuery).then(result => {
    return {
      [typeKey]: result
    }
  })
}
