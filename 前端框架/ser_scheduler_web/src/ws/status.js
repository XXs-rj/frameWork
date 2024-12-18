
/* {
  cluster: "cce1c71ea85a5638b22c15d86c1f61df",
  type: "app",
  name: ["nginx"]
} */
import { LABEL_APPNAME } from '@/constant'
import merge from 'lodash/merge'

const MAX_SEND_MSG_INTERVAL = 50

export function addWatch (type, cluster, ws, data = []) {
  switch (type) {
    case 'pod':
      return addPodWatch(cluster, ws, data)
    case 'deployment':
      return addDeploymentWatch(cluster, ws, data)
    case 'app':
      return addAppWatch(cluster, ws, data)
    default:
  }
}

export function addPodWatch (cluster, props, pods = []) {
  const name = []
  pods.map(pod => {
    if (name.indexOf(pod.metadata.labels.name) < 0) {
      name.push(pod.metadata.labels.name)
    }
  })
  if (name.length < 1) {
    if (props.serviceName) {
      name.push(props.serviceName)
    } else {
      return
    }
  }
  const config = {
    type: 'pod',
    cluster,
    name
  }
  _addWatch(props, config)
}

export function addDeploymentWatch (cluster, props, deployments = []) {
  const name = []
  deployments.map(deployment => {
    if (name.indexOf(deployment.metadata.name) < 0) {
      name.push(deployment.metadata.name)
    }
  })
  if (name.length < 1) {
    return
  }
  const config = {
    type: 'deployment',
    cluster,
    name
  }
  _addWatch(props, config)
}

export function addAppWatch (cluster, props, apps = []) {
  const name = []
  apps.map(app => {
    if (name.indexOf(app.name) < 0) {
      name.push(app.name)
    }
  })
  if (name.length < 1) {
    return
  }
  const config = {
    type: 'app',
    cluster,
    name
  }
  _addWatch(props, config)
}

export function handleOnMessage (props, response) {
  try {
    response = JSON.parse(response)
    const { type, data, watchType } = response
    const { cluster, appList, updateAppList } = props
    if (watchType === 'pod') {
      handleOnPodMessage(props, response)
    } else if (watchType === 'deployment') {
      handleOnDeploymentMessage(props, response)
    } else if (watchType === 'app') {
      // @Todo: Only deployment returned, but k8s service must be returned
      if (type === 'ADDED') {
        return
      }
      updateAppList({ cluster, appList: _changeAppListByWatch(appList, response) })
    }
  } catch (err) {
    window.console.error('handleOnMessage err:', err)
  }
}

export function handleOnDeploymentMessage (props, response) {
  const { type, data, watchType } = response
  // @Todo: Only deployment returned, but k8s service must be returned
  if (type === 'ADDED') {
    return
  }
  const cluster = props.cluster
  const appName = data.metadata.labels[LABEL_APPNAME]
  const { serviceItems, serviceList, updateAppServicesList, updateServicesList } = props
  // Update app service list
  const appServiceItems = serviceItems && serviceItems[cluster]
  if (appServiceItems && appServiceItems[appName]) {
    const { serviceList } = appServiceItems[appName]
    updateAppServicesList(cluster, appName, _changeListByWatch(serviceList, response))
  }
  // Update cluster service list
  if (serviceList) {
    updateServicesList(_changeListByWatch(serviceList, response))
  }
}

export function handleOnPodMessage (props, response) {
  const { reduxState, updateContainerList, updateServiceContainersList } = props
  const { entities, containers, services } = reduxState
  const cluster = entities.current.cluster.clusterID
  const serviceName = response.data.metadata.labels.name
  // Update containers list
  if (containers.containerItems &&
    containers.containerItems[cluster] &&
    containers.containerItems[cluster].containerList) {
    const containerList = containers.containerItems[cluster].containerList
    updateContainerList(cluster, _changeListByWatch(containerList, response))
  }
  // Update service container list
  const servicesObj = services.serviceContainers[cluster]
  if (servicesObj && servicesObj[serviceName]) {
    const { containerList } = servicesObj[serviceName]
    updateServiceContainersList(cluster, serviceName, _changeListByWatch(containerList, response))
  }
}

export function removeWatch (type, cluster, ws) {
  switch (type) {
    case 'pod':
      return removePodWatch(cluster, ws)
    case 'deployment':
      return removeDeploymentWatch(cluster, ws)
    case 'app':
      return removeAppWatch(cluster, ws)
    default:
  }
}

export function removePodWatch (cluster, ws) {
  const config = {
    type: 'pod',
    cluster,
    code: 'CLOSED'
  }
  ws && ws.send(JSON.stringify(config))
}

export function removeDeploymentWatch (cluster, ws) {
  const config = {
    type: 'deployment',
    cluster,
    code: 'CLOSED'
  }
  ws && ws.send(JSON.stringify(config))
}

export function removeAppWatch (cluster, ws) {
  const config = {
    type: 'app',
    cluster,
    code: 'CLOSED'
  }
  ws && ws.send(JSON.stringify(config))
}

function _addWatch (props, config) {
  let times = 0
  // Websocket may be not open, so try interval
  const sendMsgInterval = setInterval(() => {
    times++
    const { statusWatchWs } = props
    if (statusWatchWs) {
      statusWatchWs.send(JSON.stringify(config))
      clearInterval(sendMsgInterval)
    }
    if (times > MAX_SEND_MSG_INTERVAL) {
      clearInterval(sendMsgInterval)
    }
  }, 2000)
}

function _changeListByWatch (list, response) {
  const result = []
  let exist = false
  const { type, data } = response
  list.map(item => {
    if (item.metadata?.name === data.metadata?.name) {
      exist = true
      switch (type) {
        case 'ADDED':
        case 'MODIFIED':
          delete item.status
          delete item.checked
          result.push(merge({}, item, data))
          break
        case 'DELETED':
        // do noting here
          break
        case 'ERROR':
        // @TODO
      }
    } else {
      result.push(item)
    }
  })
  if (!exist) {
    result.unshift(data)
  }
  return result
}

function _changeAppListByWatch (apps, response) {
  const { name, type } = response
  const result = []
  const exist = false
  apps.map(app => {
    if (app.name === name) {
      app.services = _changeListByWatch(app.services, response)
      delete app.checked
    }
  })
  return apps
}
