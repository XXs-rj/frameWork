import Vue from 'vue'
import axios from 'axios'
// const apiFactory = require('./request/v2/lib/api_factory')

// 删除告警设置
export function deleteSetting (cluster, id, name, targetType) {
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
export function getSettingListfromserviceorapp (query, cluster) {
  const api = apiFactory.getK8sApi()
  const queryBody = query
  return api.getBy([cluster, 'alerts/group-strategies'], queryBody)
}
export function strategyList (params) {
  return Vue.axios.post('/ser-ipaas-prometheus/api/notifystrategy/selpage', params)
}
// 删除单条告警
export function deleteStrategy (strategyId) {
  return Vue.axios.delete(`/ser-ipaas-prometheus/api/notifystrategy/${strategyId}`)
}
// 删除多条告警
export function batchDelete (ids) {
  return Vue.axios.post('/ser-ipaas-prometheus/api/notifystrategy/dels', ids)
}
export function ignore (id, time) {
  return Vue.axios.post(`/ser-ipaas-prometheus/api/notifystrategy/ignore/${id}/${time}`)
}
// 停(enable=0)/启(enable=1)用
export function batchUpdateEnable (ids, enable) {
  return Vue.axios.post(`/ser-ipaas-prometheus/api/notifystrategy/updates/${enable}`, ids)
}
// 清除告警记录
export function clearRecords (strategyId) {
  return Vue.axios.delete(`/ser-ipaas-prometheus/api/notifyhistory/removes/${strategyId}`)
}
// 获取多个应用/服务下的所有告警策略，通过appNames/targetName来区分应用/服务
export function getAllStrategy (data) {
  // axios.post('/ser-ipaas-prometheus/api/notifystrategy/selby', data).then(p => {
  //   return p
  // })
  return axios.post('/api/ser-ipaas-prometheus/api/notifystrategy/selby', data)
}
