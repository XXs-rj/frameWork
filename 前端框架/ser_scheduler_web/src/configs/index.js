
'use strict'
const constants = require('./constants')
const globalConstants = require('../constant')
// const registryTemplate = require('./3rd_account/registry_template.json')
// TODO
// const env = process.env
const env = {}

// const logger = require('../utils/logger').getLogger('configs/index')
const { apiConfig } = require('./fe_api_config')

const isProd = env.NODE_ENV === 'production'
// window.console.log(process)
const parseIntWithDefault = (str, defaultValue) => {
  let number = parseInt(str)
  if (isNaN(number)) {
    number = defaultValue
  }
  return number
}

const config = {
  node_env: env.NODE_ENV || constants.NODE_ENV_DEV, // production / dev
  running_mode: env.RUNNING_MODE || constants.ENTERPRISE_MODE, // enterprise / standard
  protocol: env.DASHBOARD_PROTOCOL || 'http',
  hostname: env.DASHBOARD_HOST || '0.0.0.0',
  port: env.DASHBOARD_PORT || 8003,
  url: env.USERPORTAL_URL || 'http://localhost:8003', // USERPORTAL_URL env is only useful in production environments
  intl_cookie_name: globalConstants.INTL_COOKIE_NAME,
  showMoreLoginMethods: env.SHOW_MORE_LOGIN_METHODS || 'flase',
  hisenseWasEnabled: env.HISENSE_WAS_ENABLED || 'flase',
  hisenseSSOEnabled: env.HISENSE_SSO_ENABLED || 'flase',
  session_key: 'tce',
  session_secret: ['tenxcloud_dashboard', 'se cret_dream008'],
  accountType: env.ACCOUNT_TYPE || '',
  txApi: apiConfig.txApi,
  federation_api: {
    protocol: env.FEDERATION_API_PROTOCOL || 'http',
    host: env.FEDERATION_API_HOST,
    version: env.FEDERATION_API_PREFIX || 'v3'
  },
  vm_api: {
    protocol: env.TENX_VM_API_PROTOCOL,
    host: env.TENX_VM_API_HOST
  },
  mesh_api: { // For internal call only for now
    protocol: env.SERVICEMESH_API_PROTOCOL || env.TENX_API_PROTOCOL || 'http',
    host: isProd
      ? env.SERVICEMESH_INTERNAL_API_HOST || '127.0.0.1:65532' // for internal API calls, we can use internal host
      : env.SERVICEMESH_INTERNAL_API_HOST || '192.168.2.4:18080',
    version: env.SERVICEMESH_API_PREFIX || 'v3'
  },
  vm_term_api: {
    protocol: env.VM_TERM_API_PROTOCOL || 'http',
    host: env.VM_TERM_API_HOST || '192.168.2.4:18080',
    version: env.VM_TERM_API_PREFIX || 'v3'
  },
  htkg_api: {
    enabled: env.HTKG_ENABLED || 'false',
    protocol: env.HTKG_API_PROTOCOL || 'http',
    host: env.HTKG_API_HOST || '10.14.34.134:7001',
    prefix: env.HTKG_API_PREFIX || '/api/v1',
    api_key_id: env.HTKG_API_KEY_ID || '0ee5d7173e800000',
    api_key_secret: env.HTKG_API_KEY_SECRET || 'bceba0eaa3d86bd2f43f977e38063371fe5a730460a539618c27be4150f286c0'
  },

  // sendcloud 邮箱配置
  sendcloud: {
    apiUser: env.SENDCLOUD_API_USER,
    apiKey: env.SENDCLOUD_API_KEY,
    from: env.SENDCLOUD_FROM,
    fromname: env.SENDCLOUD_FROM_NAME,
    apiUserBatch: env.SENDCLOUD_API_USER_BATCH
  },
  session_store: env.USERPORTAL_REDIS_SESSION_STORE || 'true',
  redis: {
    host: env.REDIS_HOST || '192.168.1.3',
    port: env.REDIS_PORT || 8193,
    password: env.REDIS_PWD || 'tenxcloud',
    sessionPrefix: 'session:',
    session_store_prefix: 'tenx:',
    session_not_logged_in_key: 'not-logged-in'
  },
  tenxSysSign: {
    key: 'SYSTEM_CALL_SIGNATURE',
    value: env.SYSTEM_CALL_SIGNATURE || '8e059c94-f760-4f85-8910-f94c27cf0ff5'
  },
  storageConfig: {
    name: '',
    agent: {
      user: env.STORAGE_AGENT_USER || 'system',
      password: env.STORAGE_AGENT_PASSWORD || '31e120b3-512a-4e3b-910c-85c747fb1ec2'
    },
    pool: env.STORAGE_POOL || 'tenx-pool',
    user: env.STORAGE_USER || 'admin',
    keyring: env.STORAGE_KEYRING || '/etc/ceph/ceph.client.admin.keyring',
    fsType: env.STORAGE_FSTYPE || ''
  },
  registryConfig: {
    user: env.REGISTRY_USER || 'admin',
    password: env.REGISTRY_PASSWORD || 'e3442e6a-779b-4c34-911f-855b42ea80af'
  },
  registryTemplate: env.REGISTRY_TEMPLATE,
  rightCloudEnv: env.RIGHT_CLOUD_ENV,
  storage: {
    // 单位：MB
    cephMaxSize: parseIntWithDefault(env.STORAGE_CEPH_MAX_SIZE, 1024000)
  },
  tcpPort: {},
  loginFailedTimes: {},
  disableLoginEnabled: env.DISABLE_LOGIN_ENABLED || 'false',
  loginPolicy: {
    /**
     * 可选值
     * true: 开启基于用户的单点登陆
     * IP: 开启基于 IP 的单点登陆
     * false: 关闭单点登陆
     */
    singleSignOn: env.SINGLE_SIGN_ON || 'false',
    // 最大登录数限制（开启后默认最多 99999 个用户同时在线）
    maxSessionsEnabled: env.MAX_SESSIONS_ENABLED || 'false',
    maxSessionsNumber: parseIntWithDefault(env.MAX_SESSIONS_NUMBER, 99999),
    // 单位时间内最大登录数限制（开启后默认 1 分钟内，允许 99999 个帐号在线）
    unitTimeMaxSessionsEnabled: env.UNIT_TIME_MAX_SESSIONS_ENABLED || 'false',
    unitTimeMmaxSessionsTime: parseIntWithDefault(env.UNIT_TIME_MAX_SESSIONS_TIME, 1), // 单位：分钟
    unitTimeMmaxSessionsNumber: parseIntWithDefault(env.UNIT_TIME_MAX_SESSIONS_NUMBER, 99999)
  },
  hisenseIaasLink: env.HISENSE_IAAS_LINK || 'http://vcloud.hisense.com/up/ExternalLinks.html',
  // 以下域名允许将 user-portal 作为 iframe 嵌入，设置为 * 时，允许所有域名，多个域名以英文逗号隔开
  // ps: 当涉及到其他平台跳转到 paas（例如第三方认证跳转回 paas）且 paas 需要以 iframe 形式嵌入到其他平台上时，
  //     需要将跳转回 paas 时的 其他平台 domain 设置到 FRAME_ALLOW_FROM_DOMAINS 中
  frameAllowFromDomains: (env.FRAME_ALLOW_FROM_DOMAINS || '').split(',').filter(domain => domain.trim())
}
// port range for create service
const tcpBeginPortDefault = 10000
const tcpEndPortDefault = 65535
const { SYSTEM_TCP_BEGIN_PORT, SYSTEM_TCP_END_PORT } = env
const tcpBeginPort = parseIntWithDefault(SYSTEM_TCP_BEGIN_PORT, tcpBeginPortDefault)
const tcpEndPort = parseIntWithDefault(SYSTEM_TCP_END_PORT, tcpEndPortDefault)
// logger.info(`SYSTEM_TCP_BEGIN_PORT: ${tcpBeginPort}, SYSTEM_TCP_END_PORT: ${tcpEndPort}, `)
if (tcpBeginPort >= tcpEndPort) {
  // logger.error(new Error('SYSTEM_TCP_END_PORT must bigger than SYSTEM_TCP_BEGIN_PORT'))
  config.tcpPort = {
    begin: tcpBeginPortDefault,
    end: tcpEndPortDefault
  }
} else {
  config.tcpPort = {
    begin: tcpBeginPort,
    end: tcpEndPort
  }
}
// failed times limit for login
const loginFailedTimesForCapthaDefault = 5
const loginFailedTimesForDisabledLoginDefault = 15
const diabledLoginMinutesDefault = 15
const {
  LOGIN_FAILED_TIMES_FOR_CAPTHA,
  LOGIN_FAILED_TIMES_FOR_DISABLED_LOGIN,
  DIABLED_LOGIN_MINUTES
} = env

const loginFailedTimesForCaptha = parseIntWithDefault(LOGIN_FAILED_TIMES_FOR_CAPTHA, loginFailedTimesForCapthaDefault)
const loginFailedTimesForDisabledLogin = parseIntWithDefault(LOGIN_FAILED_TIMES_FOR_DISABLED_LOGIN, loginFailedTimesForDisabledLoginDefault)
const diabledLoginMinutes = parseIntWithDefault(DIABLED_LOGIN_MINUTES, diabledLoginMinutesDefault)
// logger.info(`LOGIN_FAILED_TIMES_FOR_CAPTHA: ${loginFailedTimesForCaptha}, LOGIN_FAILED_TIMES_FOR_DISABLED_LOGIN: ${loginFailedTimesForDisabledLogin}, DIABLED_LOGIN_MINUTES: ${diabledLoginMinutes} (DISABLE_LOGIN_ENABLED: ${config.disableLoginEnabled})`)
if (loginFailedTimesForCaptha >= loginFailedTimesForDisabledLogin) {
  // logger.error(new Error('LOGIN_FAILED_TIMES_FOR_DISABLED_LOGIN must bigger than LOGIN_FAILED_TIMES_FOR_CAPTHA'))
  config.loginFailedTimes = {
    captcha: loginFailedTimesForCapthaDefault,
    disabled: loginFailedTimesForDisabledLoginDefault
  }
} else {
  config.loginFailedTimes = {
    captcha: loginFailedTimesForCaptha,
    disabled: loginFailedTimesForDisabledLogin
  }
}
if (diabledLoginMinutes <= 0) {
  // logger.error(new Error('DIABLED_LOGIN_MINUTES must bigger than 0'))
  config.loginFailedTimes.diabledLoginMinutes = diabledLoginMinutesDefault
} else {
  config.loginFailedTimes.diabledLoginMinutes = diabledLoginMinutes
}

const nodeEnv = config.node_env
if (nodeEnv === 'staging') {
  config.url = 'http://v2-api.tenxcloud.com'
} else if (nodeEnv === 'development') {
  config.url = `http://localhost:${config.port}`
}

module.exports = config
