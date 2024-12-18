
'use strict'

const _ = require('lodash')
const url = require('url')
// const logger = require('../utils/logger').getLogger('configs/fe_api_config')
const constants = require('../constant')
// TODO
// const env = process.env
const env = {}
const txApi = {
  external_protocol: env.TENX_API_EXTERNAL_PROTOCOL || 'http',
  external_host: env.TENX_API_EXTERNAL_HOST || '127.0.0.1:8000',
  protocol: env.TENX_API_PROTOCOL || 'http',
  host: env.TENX_API_HOST || '127.0.0.1:8000'
}

exports.apiConfig = {
  txApi
}

const devopsConfig = {
  protocol: env.DEVOPS_PROTOCOL || txApi.protocol || 'http',
  host: env.DEVOPS_HOST || txApi.host || '127.0.0.1:8000',
  external_protocol: env.DEVOPS_EXTERNAL_PROTOCOL || txApi.external_protocol || 'http',
  external_host: env.DEVOPS_EXTERNAL_HOST || txApi.external_host || '127.0.0.1:8000',
  statusPath: '/stagebuild/status',
  logPath: '/stagebuild/log'
}
exports.devops = devopsConfig

const { RIGHT_CLOUD_ENV } = env
const IS_USE_BROWSER_HOST = env.IS_USE_BROWSER_HOST === 'true'
const TCE_PROTOCOL = env.TCE_PROTOCOL || 'http'
const USERPORTAL_URL = env.USERPORTAL_URL || 'http://localhost:8003'

if (IS_USE_BROWSER_HOST && !TCE_PROTOCOL) {
  window.console.warn('If IS_USE_BROWSER_HOST true, env TCE_PROTOCOL must be configed')
  window.console.warn('IS_USE_BROWSER_HOST is true, portal will use browser host as api host')
}

function _getBrowserHostname () {
  const method = '_getBrowserHostname'
  const { host } = this.headers
  // logger.info(method, host)
  // eslint-disable-next-line node/no-deprecated-api
  const { hostname } = url.parse(url.resolve('http://', `//${host}`))
  return hostname
}
const _covertProtocolAndHost = (hostname, api) => {
  if (!IS_USE_BROWSER_HOST) {
    return api
  }
  api.protocol = TCE_PROTOCOL
  // eslint-disable-next-line node/no-deprecated-api
  const { port } = url.parse(url.resolve('http://', `//${api.host}`))
  if (port) {
    api.host = `${hostname}:${port}`
  } else {
    api.host = hostname
  }
  return api
}
const _covertUrl = (hostname, _url) => {
  if (!_url || !IS_USE_BROWSER_HOST) {
    return _url
  }
  // eslint-disable-next-line node/no-deprecated-api
  const urlObj = url.parse(_url)
  delete urlObj.host
  urlObj.protocol = `${TCE_PROTOCOL}:`
  urlObj.hostname = hostname
  // covert obj to url and repalce '/'
  return url.format(urlObj).replace(/\/$/, '')
}

function getFeApiConfig () {
  const hostname = _getBrowserHostname.apply(this)
  // ~ paas api
  const paasApi = _covertProtocolAndHost(hostname, {
    protocol: txApi.external_protocol,
    host: txApi.external_host,
    prefix: '/api/v2',
    spiPrefix: '/spi/v2'
  })
  // ~ devops api
  const devopsApi = _covertProtocolAndHost(hostname, {
    protocol: devopsConfig.external_protocol || paasApi.protocol,
    host: devopsConfig.external_host || paasApi.host,
    prefix: '/api/v2',
    statusPath: devopsConfig.statusPath,
    logPath: devopsConfig.logPath
  })
  // ~ mesh api
  const meshApi = _covertProtocolAndHost(hostname, {
    protocol: env.SERVICEMESH_API_PROTOCOL || paasApi.protocol,
    host: env.SERVICEMESH_API_HOST || paasApi.host,
    prefix: '/api/v3'
  })
  // ~ monitor api
  const monitorApi = _covertProtocolAndHost(hostname, {
    protocol: env.MONITOR_EXTERNAL_PROTOCOL || 'http',
    host: env.MONITOR_EXTERNAL_HOST,
    prefix: '/api/v3/monitor-server'
  })
  // ~ platform alerts api 只用于全平台服务的告警
  const platformAlertsApi = _covertProtocolAndHost(hostname, {
    protocol: env.PLATFORM_ALERTS_EXTERNAL_PROTOCOL || monitorApi.protocol || 'http',
    host: env.PLATFORM_ALERTS_EXTERNAL_HOST || monitorApi.host,
    prefix: '/api/v3/monitor-server'
  })
  // ~ system alerts api
  // 系统服务告警/节点告警使用 systemAlertsApi, 默认使用 paasApi 的配置
  const systemAlertsApi = _covertProtocolAndHost(hostname, {
    protocol: paasApi.protocol, // [KK-2469]
    host: paasApi.host,
    prefix: '/api/v3'
  })
  // ~ ai api
  const aiApi = _covertProtocolAndHost(hostname, {
    protocol: env.AI_EXTERNAL_PROTOCOL || paasApi.protocol,
    host: env.AI_EXTERNAL_HOST || paasApi.host,
    prefix: '/api/v3'
  })
  // msa api
  const msaApi = _covertProtocolAndHost(hostname, {
    protocol: env.MSA_API_PROTOCOL || paasApi.protocol,
    host: env.MSA_API_HOST || '192.168.1.58:8081',
    prefix: '/api/v1'
  })
  return {
    // ~ portal url
    userPortalUrl: _covertUrl(hostname, USERPORTAL_URL),
    msaPortalUrl: _covertUrl(hostname, global.globalConfig.msaConfig.url),
    // ~ api config
    paasApi,
    paasApiUrl: `${paasApi.protocol}://${paasApi.host}${paasApi.prefix}`,
    paasSpiUrl: `${paasApi.protocol}://${paasApi.host}${paasApi.spiPrefix}`,
    devopsApi,
    devopsApiUrl: `${devopsApi.protocol}://${devopsApi.host}${devopsApi.prefix}`,
    meshApi: `${meshApi.protocol}://${meshApi.host}${meshApi.prefix}`,
    monitorApi,
    monitorApiUrl: `${monitorApi.protocol}://${monitorApi.host}${monitorApi.prefix}`,
    systemAlertsApi,
    systemAlertsApiUrl: `${systemAlertsApi.protocol}://${systemAlertsApi.host}${systemAlertsApi.prefix}`,
    platformAlertsApi,
    platformAlertsApiUrl: `${platformAlertsApi.protocol}://${platformAlertsApi.host}${platformAlertsApi.prefix}`,
    aiApi,
    aiApiUrl: `${aiApi.protocol}://${aiApi.host}${aiApi.prefix}`,
    msaApi,
    msaApiUrl: `${msaApi.protocol}://${msaApi.host}${msaApi.prefix}`
  }
}
exports.getFeApiConfig = getFeApiConfig

function covertGlobalConfigForFrontEnd () {
  const hostname = _getBrowserHostname.apply(this)
  const _globalConfig = _.cloneDeep(global.globalConfig)
  const { msaConfig } = _globalConfig
  const feConfig = {}
  // ~ tenx api server config
  feConfig.tenxApi = _covertProtocolAndHost(hostname, {
    protocol: txApi.external_protocol,
    host: txApi.external_host
  })
  // ~ devops config
  feConfig.cicdApi = _covertProtocolAndHost(hostname, {
    protocol: devopsConfig.external_protocol,
    host: devopsConfig.external_host
  })
  // ~ aiops config
  feConfig.aiopsConfig = _covertProtocolAndHost(hostname, _globalConfig.aiopsConfig)
  // ~ msa config
  feConfig.msaConfig = {
    url: _covertUrl(hostname, msaConfig.url)
  }

  // Add if email configured
  const emailConfig = _globalConfig.mail_server
  feConfig.emailConfiged = !!emailConfig.host
  // Add proxy type
  feConfig.proxy_type = constants.PROXY_TYPE
  // Add registry config
  feConfig.registryConfig = {
    server: _globalConfig.registryConfig.url
  }
  // Add oem info
  feConfig.oemInfo = _globalConfig.oemInfo
  // Add VM wrap info
  feConfig.vmWrapConfig = _globalConfig.vmWrapConfig
  // Add ftp config
  feConfig.ftpConfig = Object.assign({}, _globalConfig.ftpConfig, { password: undefined })
  // Add billing config
  feConfig.billingConfig = _globalConfig.billingConfig
  // Add loadbalance config
  feConfig.loadbalanceConfig = _globalConfig.loadbalanceConfig
  // Add chartRepoConfig
  feConfig.chartRepoConfig = _globalConfig.chartRepoConfig
  // Add vmTermConfig
  feConfig.vmTermConfig = _globalConfig.vmTermConfig
  // Add rightCloudEnv
  feConfig.rightCloudEnv = RIGHT_CLOUD_ENV
  // Add htkg config
  feConfig.htkgEnabled = env.HTKG_ENABLED || 'false'
  // Add upload file config
  feConfig.maxUploadFileSize = _globalConfig.maxUploadFileSize || ''

  return feConfig
}
exports.covertGlobalConfigForFrontEnd = covertGlobalConfigForFrontEnd
