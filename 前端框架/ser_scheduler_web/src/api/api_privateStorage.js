// import {
//   DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
// } from '../constant/index'
// import getDeepValue from '../utils/getDeepValue'
// import { getServiceStatus } from '../utils/status_identify'
// import { mergeStateByOpts } from '../utils/tools'
// import uniq from 'lodash/uniq'
const config = require('../configs')
const constants = require('../configs/constants')
const standardFlag = config.running_mode === constants.STANDARD_MODE

const apiFactory = require('./request/v2/lib/api_factory')
// const portHelper = require('../utils/port_helper')

// 获取存储列表
export async function getVolumeListByPool (clusterID, query, header) {
  const { project } = header || { project: null }
  const headers = {}
  if (project) {
    Object.assign(header, { project, teamspace: project })
  }
  const volumeApi = apiFactory.getK8sApi()
  const response = await volumeApi.getBy([clusterID, 'volumes'], query)
  return response
}

// 校验存储名称是否已经存在
export async function getCheckVolumeNameExist (clusterID, volumeName) {
  const volumeApi = apiFactory.getK8sApi()
  const response = await volumeApi.getBy([clusterID, 'volumes', volumeName, 'check-exist'], null, {
    headers: {
      responseTagrget: 'data'
    }
  })
  return response
}

export async function getClusterStorageList (clusterID) {
  const api = apiFactory.getK8sApi()
  const result = await api.getBy([clusterID, 'storageclass'])
  return result
}

export async function createStorage (clusterID, body) {
  let reqData = body
  const volumeApi = apiFactory.getK8sApi()
  if (!standardFlag && !reqData?.template) {
    const statusRes = await volumeApi.getBy([clusterID, 'volumes', 'pool-status'])
    const poolStatus = statusRes.data
    poolStatus.used = parseInt(poolStatus.used)
    poolStatus.available = parseInt(poolStatus.available)
    const total = parseInt(poolStatus.total)
    poolStatus.allocated = parseInt(poolStatus.allocated)
    if (poolStatus.total.toLowerCase().indexOf('g') > 0) {
      poolStatus.total = total * 1024
    } else {
      poolStatus.total = total
    }
    poolStatus.unallocated = poolStatus.total - poolStatus.allocated
    const selectSize = reqData.driverConfig.size
    if (selectSize > poolStatus.unallocated) {
      poolStatus.select = selectSize
      return {
        statusCode: 403,
        message: 'The cluster storage resource is not enough',
        data: poolStatus
      }
    }
  }
  if (reqData?.template) {
    reqData = reqData.template
  }
  const response = await volumeApi.createBy([clusterID, 'volumes'], null, reqData, {
    headers: {
      responseTagrget: 'data',
      'Content-type': 'application/json'
    }
  })
  return response
}

export async function deleteStorage (clusterID, body) {
  if (!body) {
    return {
      message: 'error'
    }
  }
  const volumeApi = apiFactory.getK8sApi()
  const response = await volumeApi.batchDeleteBy([clusterID, 'volumes', 'batch-delete'], null, body)
  return response
}

export async function getVolumeDetail (clusterID, name, query) {
  const volumeApi = apiFactory.getK8sApi()
  const response = await volumeApi.getBy([clusterID, 'volumes', name, 'consumption'], query)
  return response
}

export async function getVolumeBindInfo (clusterID, volumeName, query) {
  const volumeApi = apiFactory.getK8sApi()
  const response = await volumeApi.getBy([clusterID, 'volumes', volumeName, 'bindinfo'], query)
  return response
}

export async function getEventList (clusterID, volumeName) {
  const api = apiFactory.getK8sApi()
  const response = await api.getBy([clusterID, 'events', 'volumes', volumeName, 'events'], null)
  return response
}

export async function getSnapshotList (clusterID) {
  // const { project } = this.request.headers || { project: null }
  // const headers = {}
  // if (project) {
  //   Object.assign(headers, { project, teamspace: project })
  // }
  const snapApi = apiFactory.getK8sApi()
  const response = await snapApi.getBy([clusterID, 'volumes', 'snapshots'], null)
  return response
}

// 扩容
export async function resizeVolume (clusterID, reqData) {
  if (!reqData.name || !reqData.size) {
    this.status = 400
    this.body = { message: 'error' }
  }
  const volumeApi = apiFactory.getK8sApi()
  const response = await volumeApi.updateBy([clusterID, 'volumes', reqData.name, 'expansion'], null, {
    size: reqData.size
  })
  return response
}

// 格式化
export async function formatVolume (clusterID, reqData) {
  // if (!reqData.type || !reqData.name) {
  //   this.status = 400
  //   this.body = { message: 'error' }
  // }
  const volumeApi = apiFactory.getK8sApi()
  const response = await volumeApi.updateBy([clusterID, 'volumes', reqData.name, 'format'], null, reqData)
  return response
}

// 创建快照
export async function createSnapshot (reqData) {
  const snapApi = apiFactory.getK8sApi()
  const response = await snapApi.createBy([reqData.clusterID, 'volumes', reqData.volumeName, 'snapshots'], null, reqData.body)
  return response
}

export async function snapshotClone (reqData) {
  const volumeName = reqData.volumeName
  const clusterID = reqData.clusterID
  const snapApi = apiFactory.getK8sApi()
  const response = await snapApi.createBy([clusterID, 'volumes', volumeName, 'snapshots', 'clone'], null, reqData.body)
  return response
}
