
'use strict'
const Request = require('./index')

exports.getApi = function (loginUser, timeout) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api
}

exports.getK8sApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.clusters
}

exports.getMeshApi = function (loginUser) {
  const apiConfig = {
    version: 'v3'
  }
  const api = new Request(apiConfig)
  return api
}

/*
API factory to handle thirdparty docker registry integration
*/
exports.getManagedRegistryApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.registries
}

/*
API factory to handle application templates
*/
exports.getTemplateApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.templates
}

/*
API factory to handle DevOps service
*/
exports.getDevOpsApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.devops
}

/**
 * API factory to handle AIOps service
 */
exports.getAIOpsApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.ai
}

exports.getRegistryApi = function (registryConfig) {
  const api = new Request(registryConfig)
  return api.registries
}

exports.getSpi = function (loginUser, specifyConfig) {
  const spiConfig = {
    api_prefix: 'spi'
  }
  const spi = new Request(spiConfig)
  return spi
}

exports.getImageScanApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.images
}

exports.getLabelsApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.labels
}

exports.getOemInfoApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.oem
}

exports.getPermissionApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.permission
}

exports.getRoleApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.role
}

/*
API factory to handle VM wrap service
*/
exports.getVMWrapApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api
}
exports.getQuotaApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.resourcequota
}
exports.getFederationApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.federation
}
exports.getSystemAlertApi = function (loginUser) {
  const apiConfig = {

    version: 'v3'
  }
  const api = new Request(apiConfig)
  return api.systemAlert
}

exports.getTenantApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.tenants
}

exports.getOcpApi = function (loginUser) {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.ocp
}
exports.getTxSysSignSpi = function (loginUser) {
  const spiConfig = {
    api_prefix: 'spi'
  }
  const spi = new Request(spiConfig)
  return spi
}

exports.getStoragePoolsApi = function () {
  const apiConfig = {

  }
  const api = new Request(apiConfig)
  return api.storagePools
}
