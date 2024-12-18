
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import { TENX_MARK } from '../constant'

const CONTAINER_MAX_RESTART_COUNT = 5
/**
 * Get container status
 * return one of [Pending, Running, Terminating, Failed, Unknown, Abnormal]
 */
// podstatus
/* "ContainerCreating"
 * "CrashLoopBackOff"
 */
// 根据golang 代码结合以前的判断方法，以下是golang 地址
// https://github.com/kubernetes/kubernetes/blob/v1.14.0/pkg/printers/internalversion/printers.go#L588
export function getContainerPodStatus (pod) {
  let restarts = 0
  const totalContainers = get(pod, 'spec.containers', []).length
  let readyContainers = 0
  let reason = String(get(pod, 'status.phase', 'Pending'))
  if (get(pod, 'status.reason')) {
    reason = get(pod, 'status.reason')
  }
  let initializing = false
  if (Array.isArray(get(pod, 'status.initContainerStatuses'))) {
    const containerLen = get(pod, 'status.initContainerStatuses').length
    for (let i = 0; i < containerLen; i++) {
      const initContainer = get(pod, 'status.initContainerStatuses')[i]
      restarts += Number(initContainer.restartCount)
      switch (true) {
        case get(initContainer, 'state.terminated') && get(initContainer, 'state.terminated.exitCode') === 0:
          continue
        case get(initContainer, 'state.terminated'):
          if (get(initContainer, 'state.terminated.reason', '').length === 0) {
            if (get(initContainer, 'state.terminated.signal') !== 0) {
              reason = `Init:Signal:${get(initContainer, 'state.terminated.signal')}`
            } else {
              reason = `Init:ExitCode:${get(initContainer, 'state.terminated.exitCode')}`
            }
          } else {
            reason = 'Init:' + get(initContainer, 'State.Terminated.Reason')
          }
          initializing = true
          break
        case get(initContainer, 'state.waiting') && get(initContainer, 'state.waiting.reason', '').length > 0 &&
          get(initContainer, 'state.waiting.reason') !== 'PodInitializing':
          reason = 'Init:' + get(initContainer, 'state.waiting.reason')
          initializing = true
          break
        default:
          reason = `Init:${get(pod, 'spec.initContainers').length}`
          initializing = true
      }
      break
    }
  }
  if (!initializing) {
    restarts = 0
    let hasRunning = false
    if (Array.isArray(get(pod, 'status.containerStatuses'))) {
      const containerStatusesLen = get(pod, 'status.containerStatuses').length
      for (let i = containerStatusesLen - 1; i >= 0; i--) {
        const containerStatus = get(pod, 'status.containerStatuses')[i]
        restarts += Number(get(containerStatus, 'restartCount'))
        if (get(containerStatus, 'state.waiting.reason')) {
          reason = get(containerStatus, 'state.waiting.reason')
        } else if (get(containerStatus, 'state.terminated') &&
        get(containerStatus, 'state.terminated.reason')) {
          reason = get(containerStatus, 'state.terminated.reason')
        } else if (get(containerStatus, 'state.terminated') &&
        !get(containerStatus, 'state.terminated.reason')) {
          if (get(containerStatus, 'state.terminated.signal')) {
            reason = `Signal:${get(containerStatus, 'state.terminated.signal')}`
          } else {
            reason = `ExitCode:${get(containerStatus, 'state.terminated.exitCode')}`
          }
        } else if (get(containerStatus, 'ready') && get(containerStatus, 'state.running')) {
          hasRunning = true
          readyContainers++
        }
      }
      if (reason === 'Completed' && hasRunning) {
        reason = 'Running'
      }
    }
    if (get(pod, 'DeletionTimestamp') && get(pod, 'status.reason') === 'NodeLost') {
      reason = 'Unknown'
    } else if (get(pod, 'deletionTimestamp')) {
      reason = 'Terminating'
    }
  }
  if (get(pod, 'metadata.deletionTimestamp')) {
    reason = 'Terminating'
  }
  const status = cloneDeep(get(pod, 'status')) || {}
  status.phase = reason
  status.restartCount = restarts
  status.totalContainers = totalContainers || 0
  status.readyContainers = readyContainers || 0
  return status
}

export function getContainerStatus (status) {
  const _getReasonByState = (state, isLastState) => {
    let reason
    let hasRunning
    let className
    if (get(state, 'waiting.reason')) {
      reason = get(state, 'waiting.reason')
      className = 'Abnormal'
    } else if (get(state, 'terminated') && get(state, 'terminated.reason')) {
      reason = `Terminated (${get(state, 'terminated.reason')})`
      className = 'Failed'
    } else if (get(state, 'terminated') && !get(state, 'terminated.reason')) {
      if (get(state, 'terminated.signal')) {
        reason = `Signal:${get(state, 'terminated.signal')}`
      } else {
        reason = `ExitCode:${get(state, 'terminated.exitCode')}`
      }
      className = 'Failed'
    } else if (get(state, 'running')) {
      reason = 'Running'
    }
    return { phase: reason, className }
  }
  if (!status) {
    return {
      state: {},
      lastState: {}
    }
  }
  return {
    state: _getReasonByState(status.state),
    lastState: _getReasonByState(status.lastState, true)
  }
}

export function oldGetPodStatus (container) {
  const { metadata } = container
  const { deletionTimestamp } = metadata
  const status = container.status || { phase: 'Pending' }
  if (deletionTimestamp) {
    status.phase = 'Terminating'
  }
  const { conditions, containerStatuses } = status
  let restartCount = 0
  let phase = status.phase
  if (conditions) {
    conditions.every(condition => {
      if (condition.type !== 'Ready' && condition.status !== 'True') {
        phase = 'Pending'
        return false
      }
      return true
    })
  }
  if (containerStatuses) {
    containerStatuses.map(containerStatus => {
      // const { ready } = containerStatus
      const containerRestartCount = containerStatus.restartCount
      if (containerRestartCount > restartCount) {
        restartCount = containerRestartCount
        if (!containerStatus.state || !containerStatus.state.running) {
          // state 不存在或 state 不为 running
          phase = 'Abnormal'
        }
      }
    })
    if (restartCount >= CONTAINER_MAX_RESTART_COUNT) {
      status.phase = phase
      status.restartCount = restartCount
    }
  }
  return status
}

/**
 * Get service status
 * return one of [Pending, Running, Deploying, Stopped]
 */
export function getServiceStatus (_service) {
  const service = cloneDeep(_service)
  const { status, metadata } = service
  if (metadata && !metadata.annotations) {
    metadata.annotations = {}
  }
  const specReplicas = service.spec && service.spec.replicas
  let replicas = specReplicas
  if (replicas === undefined) {
    replicas = metadata && metadata.annotations['system/replicas']
  }
  let availableReplicas = 0
  if (!status) {
    return {
      phase: 'Stopped',
      availableReplicas: 0,
      replicas
    }
  }
  availableReplicas = status.availableReplicas || 0
  status.availableReplicas = availableReplicas
  let {
    phase,
    updatedReplicas,
    unavailableReplicas,
    observedGeneration,
    readyReplicas
  } = status
  const { strategy = {} } = service.spec || {}
  if (status.replicas > specReplicas && strategy.type === 'RollingUpdate') {
    const newCount = metadata.annotations['rollingupdate/newCount']
    if (newCount === undefined) {
      phase = 'ScrollRelease'
    } else {
      phase = 'RollingUpdate'
    }
    return {
      phase,
      availableReplicas,
      replicas
    }
  }
  status.replicas = replicas
  if (phase && phase !== 'Running') {
    return status
  }
  // For issue #CRYSTAL-2478
  // Add spec.replicas analyzing conditions
  if (specReplicas === 0 && availableReplicas > 0) {
    status.phase = 'Stopping'
    return status
  }
  if (observedGeneration >= metadata.generation && replicas === updatedReplicas && readyReplicas > 0) {
    status.availableReplicas = readyReplicas
    status.phase = 'Running'
    return status
  }
  /* if (unavailableReplicas > 0 && (!availableReplicas || availableReplicas < replicas)) {
    status.phase = 'Pending'
  } */
  if (specReplicas > 0 && availableReplicas < 1) {
    status.unavailableReplicas = specReplicas
    status.phase = 'Pending'
    return status
  }
  if (updatedReplicas && unavailableReplicas) {
    status.phase = 'Deploying'
    status.progress = { status: false }
    return status
  }
  if (availableReplicas < 1) {
    status.phase = 'Stopped'
    return status
  }
  status.phase = 'Running'
  return status
}

/**
 * Get service status by containers
 * return one of [Pending, Running, Deploying, Stopped]
 */
export function getServiceStatusByContainers (service, containers) {
  if (!containers || containers.length <= 0) {
    return getServiceStatus(service)
  }
  let availableReplicas = 0
  containers.map(container => {
    const { phase } = getContainerPodStatus(container)
    if (phase === 'Running') {
      availableReplicas++
    }
  })
  if (!service.status) {
    service.status = {}
  } else if (service.status.phase !== 'RollingUpdate') {
    delete service.status.phase
  }
  service.status.availableReplicas = availableReplicas
  return getServiceStatus(service)
}

/**
 * Get app status by services list
 * return one of [Running, Pending, Stopped, Unknown]
 */
export function getAppStatus (services, statusReady) {
  if (!services) {
    return
  }
  const appStatus = {
    replicas: services.length,
    availableReplicas: 0,
    unavailableReplicas: 0
  }
  let serviceTotalReplicas = 0
  services.map(service => {
    const serviceStatus = statusReady ? service.status : getServiceStatus(service)
    const { availableReplicas, unavailableReplicas, replicas } = serviceStatus || {}
    serviceTotalReplicas += replicas
    if (availableReplicas > 0) {
      appStatus.availableReplicas++
    }
    if (unavailableReplicas > 0) {
      appStatus.unavailableReplicas++
    }
  })
  const { availableReplicas, unavailableReplicas } = appStatus
  if (availableReplicas === 0 && unavailableReplicas > 0) {
    appStatus.phase = 'Pending'
  } else if (availableReplicas === 0) {
    appStatus.phase = 'Stopped'
  } else if (availableReplicas > 0) {
    appStatus.phase = 'Running'
    if (serviceTotalReplicas === 0) {
      appStatus.phase = 'Stopping'
    }
  } else {
    appStatus.phase = 'Unknown'
  }
  return appStatus
}

export function getPodStatus (podYaml) {
  const {
    status: { phase, startTime, containerStatuses, conditions } = {},
    metadata: { deletionTimestamp } = {}
  } = podYaml
  let restartCountTotal = 0
  if (containerStatuses !== undefined) {
    restartCountTotal = containerStatuses
      .map(({ restartCount }) => restartCount)
      .reduce((current, total) => current + total, 0)
  }
  if (restartCountTotal >= CONTAINER_MAX_RESTART_COUNT) {
    const flag = containerStatuses.every(({ state }) => state === undefined) ||
    containerStatuses.every(({ state: { running } = {} }) => running === undefined)
    if (flag) {
      return {
        phase: 'Abnormal',
        startTime,
        restartCountTotal
      }
    }
  }
  if (conditions !== undefined) {
    const flag = conditions.every(({ type }) => type !== 'Ready') &&
    conditions.every(({ status }) => status !== 'True')
    if (flag) {
      return {
        phase: 'Pending',
        startTime,
        restartCountTotal
      }
    }
  }
  if (deletionTimestamp !== undefined) {
    return {
      phase: 'Terminating', startTime, restartCountTotal
    }
  }
  if (phase !== undefined) {
    return {
      phase, startTime, restartCountTotal
    }
  }
  if (phase === undefined) {
    return {
      phase: 'Pending', startTime, restartCountTotal
    }
  }
}

export function getDeploymentStatus (_service) {
  const service = cloneDeep(_service)
  const { status, metadata } = service
  if (!metadata.annotations) {
    metadata.annotations = {}
  }
  const specReplicas = service.spec.replicas
  let replicas = specReplicas
  if (replicas === undefined) {
    replicas = metadata.annotations[`${TENX_MARK}/replicas`]
  }
  let availableReplicas = 0
  if (!status) {
    return {
      phase: 'Stopped',
      availableReplicas: 0,
      replicas
    }
  }
  availableReplicas = status.availableReplicas || 0
  status.availableReplicas = availableReplicas
  let {
    phase,
    updatedReplicas,
    unavailableReplicas,
    observedGeneration,
    readyReplicas
  } = status
  const { strategy = {} } = service.spec || {}
  if (specReplicas > 0 && status.replicas > specReplicas && strategy.type === 'RollingUpdate') {
    const newCount = metadata.annotations['rollingupdate/newCount']
    if (newCount === undefined) {
      phase = 'ScrollRelease'
    } else {
      phase = 'RollingUpdate'
    }
    return {
      phase,
      availableReplicas,
      replicas
    }
  }
  status.replicas = replicas
  if (phase && phase !== 'Running') {
    return status
  }
  // For issue #CRYSTAL-2478
  // Add spec.replicas analyzing conditions
  if (specReplicas === 0 && availableReplicas > 0) {
    status.phase = 'Stopping'
    return status
  }
  if (observedGeneration >= metadata.generation && replicas === updatedReplicas &&
    readyReplicas > 0) {
    status.availableReplicas = readyReplicas
    status.phase = 'Running'
    return status
  }
  /* if (unavailableReplicas > 0 && (!availableReplicas || availableReplicas < replicas)) {
    status.phase = 'Pending'
  } */
  if (specReplicas > 0 && availableReplicas < 1) {
    status.unavailableReplicas = specReplicas
    status.phase = 'Pending'
    return status
  }
  if (updatedReplicas && unavailableReplicas) {
    status.phase = 'Deploying'
    status.progress = { status: false }
    return status
  }
  if (availableReplicas < 1) {
    status.phase = 'Stopped'
    return status
  }
  status.phase = 'Running'
  return status
}

export function getStatefulSetStatus (_service) {
  const service = cloneDeep(_service)
  const { status, metadata } = service

  if (!metadata.annotations) {
    metadata.annotations = {}
  }
  const specReplicas = service.spec.replicas
  const replicas = specReplicas

  let currentReplicas = 0
  if (!status) {
    return {
      phase: 'Stopped',
      currentReplicas: 0,
      replicas
    }
  }
  currentReplicas = status.currentReplicas || 0
  status.currentReplicas = currentReplicas
  let {
    phase,
    updatedReplicas,
    observedGeneration,
    readyReplicas = 0
  } = status
  const { updateStrategy = {} } = service.spec || {}
  if (specReplicas > 0 && status.replicas > specReplicas && updateStrategy.type === 'RollingUpdate') {
    phase = 'RollingUpdate'
    return {
      phase,
      currentReplicas,
      replicas
    }
  }
  status.replicas = replicas
  if (phase && phase !== 'Running') {
    return status
  }
  // For issue #CRYSTAL-2478
  // Add spec.replicas analyzing conditions
  if (specReplicas === 0 && currentReplicas > 0) {
    status.phase = 'Stopping'
    return status
  }
  if (observedGeneration >= metadata.generation && replicas === updatedReplicas &&
    readyReplicas > 0) {
    status.currentReplicas = readyReplicas
    status.phase = 'Running'
    return status
  }
  /* if (uncurrentReplicas > 0 && (!currentReplicas || currentReplicas < replicas)) {
    status.phase = 'Pending'
  } */
  if ((specReplicas > 0 && currentReplicas < 1) ||
    (currentReplicas > 0 && readyReplicas === 0)) {
    status.uncurrentReplicas = specReplicas
    status.phase = 'Pending'
    return status
  }
  if (updatedReplicas && currentReplicas < specReplicas) {
    status.phase = 'Deploying'
    status.progress = { status: false }
    return status
  }
  if (currentReplicas < 1) {
    status.phase = 'Stopped'
    return status
  }
  status.phase = 'Running'
  return status
}

// 获取Job状态判断
export function getJobStatus (_service) {
  const service = cloneDeep(_service)
  const status = { phase: 'null' }
  const { status: { succeeded, active, failed, conditions = [] } = {} } = service
  const { spec: { completions } = {} } = service
  const FailureReason = (conditions[0] || {}).reason || '-'
  if ((active === 0 || active === undefined) && failed !== undefined && succeeded !== undefined) {
    status.phase = 'Pending'
  }
  if (succeeded !== undefined && completions !== undefined && (succeeded === completions)) {
    status.phase = 'Finish'
  }
  if (active !== undefined && active > 0) {
    status.phase = 'Doing'
  }
  if ((active === undefined || active === 0) && failed > 0 &&
  (succeeded === undefined || (succeeded < completions))) {
    status.phase = 'Failure'
  }
  if (succeeded !== undefined) {
    status.availableReplicas = succeeded
  }
  if (completions !== undefined) {
    status.replicas = completions
  }
  status.failureReason = FailureReason
  return status
}

// CronJob 的状态判断
export function getCronJobStatus (_service) {
  const service = cloneDeep(_service)
  const { spec: { suspend } } = service
  const status = { phase: 'null' }
  if (suspend !== undefined && suspend === false) {
    status.phase = 'Running'
  }
  if (suspend !== undefined && suspend === true) {
    status.phase = 'Stopped'
  }
  return status
}

export function getStatus (_service, type) {
  let func
  switch (type) {
    case 'StatefulSet':
      func = getStatefulSetStatus
      break
    case 'CronJob':
      func = getCronJobStatus
      break
    case 'Deployment':
      func = getDeploymentStatus
      break
    case 'Pod':
      func = getPodStatus
      break
    case 'Service':
      func = getServiceStatus
      break
    case 'Job':
      func = getJobStatus
      break
    default:
      func = getStatefulSetStatus
      break
  }
  return func(_service)
}
export function getServieDeploymentStatus (deployment) {
  if (typeof deployment.status === 'object') {
    return deployment.status
  }
  return {
    phase: upperFirstWord(deployment.status),
    replicas: deployment.replicas,
    availableReplicas: deployment.currentReplicas,
    unavailableReplicas: deployment.stopReplicas,
    readyReplicas: deployment.readyReplicas
  }
}
export function getServiceStatusV2 (service) {
  if (typeof service.status === 'object') {
    return service.status
  }
  return {
    phase: upperFirstWord(service.status),
    replicas: service.replicas,
    availableReplicas: service.currentReplicas,
    unavailableReplicas: service.stopReplicas
  }
}
export function getAppStatusV2 (app) {
  if (typeof app.status === 'object') {
    return app.status
  }
  return {
    phase: upperFirstWord(app.status),
    replicas: app.replicas,
    availableReplicas: app.currentReplicas,
    unavailableReplicas: app.stopReplicas
  }
}
export function upperFirstWord (phase) {
  return phase ? phase.slice(0, 1).toUpperCase() + phase.slice(1).toLowerCase() : phase
}
