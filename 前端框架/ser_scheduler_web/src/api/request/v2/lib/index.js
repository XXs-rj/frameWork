
'use strict'
// import Vue from 'vue'
const axios = require('axios'); // 直接导入 axios
const Vue = require('vue')

const DEFAULT_API_PRIFIX = 'api'
const DEFAULT_VERSION = 'v2'
const store = require('../../../../store/index')

// protocol, host, version, auth, timeout
module.exports = function (config) {
  const request = (options, callback) => {
    return new Promise((resolve, reject) => {
      const prefix = (config.api_prefix || DEFAULT_API_PRIFIX) + '/' + (config.version || DEFAULT_VERSION)
      const url = prefix + options.url
      options.url = url
      
      // const store = Vue.prototype.$store
      const current = store.default.getters['entities/getCurrent']
      const teamspace = current && current.space && current.space.namespace
      // const teamspace = 'test-test'
      if (teamspace) {
        options.headers = !options.headers ? { teamspace } : { ...options.headers, teamspace }
      }
      options.baseURL = options.baseURL || ''
      // Vue.axios.request(options).then((res) => {
      axios.request(options).then((res) => {
        if (callback) {
          callback(res)
        }
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
  // ~~~~~ PUBLIC

  const Collections = require('./collections')
  const collections = new Collections(request)

  // ~ cluster
  this.clusters = collections.create('clusters')

  // ~ volumes
  this.volumes = collections.create('volumes')

  // service
  // this.service = collections.create('service')

  // ~ managed docker registries
  this.registries = collections.create('registries')

  // ~ app templates
  this.templates = collections.create('templates')

  // ~ audits
  this.audits = collections.create('audits')

  // ~ users
  this.users = collections.create('users')

  // ~ teams
  this.teams = collections.create('teams')

  // ~ devops
  this.devops = collections.create('devops')

  // ~ license
  this.license = collections.create('license')

  // ~ licenses
  this.licenses = collections.create('licenses')

  // ~ admin
  this.admin = collections.create('admin')

  // ~ overview
  this.overview = collections.create('overview')

  // ~ watch
  this.watch = collections.create('watch')

  // ~ integration
  this.integrations = collections.create('integrations')

  // ~ consumptions
  this.consumptions = collections.create('consumptions')

  // ~ docker registries - spi for internal usage
  this.txregistries = collections.create('tenx-registries')

  // ~ docker registries - api
  this.txhubs = collections.create('tenx-hubs')

  // ~ vsersions
  this.versions = collections.create('versions')

  // ~ config
  this.configs = collections.create('configs')

  // ~ openstack
  this.openstack = collections.create('openstack')

  //  ~images
  this.images = collections.create('images')

  // TODO: remove this
  // ~ alerts
  this.alerts = collections.create('alerts')
  // ~ email
  this.email = collections.create('email')
  // ~ dingDing
  this.ding = collections.create('ding')
  // wechat
  this.wechat = collections.create('wechat')
  // webhook
  this.webhook = collections.create('webhook')
  // ~ labels
  this.labels = collections.create('labels')

  // ~ oem
  this.oem = collections.create('oem')

  // ~ project
  this.projects = collections.create('projects')

  // ~ autoscaler
  this.autoscaler = collections.create('autoscaler')

  // ~ scheduler
  this.scheduler = collections.create('scheduler')

  // service-mesh
  this.servicemesh = collections.create('servicemesh')

  /// /////////////////////////////////////////////////////////////////////////////////
  /// ////////////  Standard mode (Public Clould Only) ////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  // ~ certificates
  this.certificates = collections.create('certificates')

  // ~ payments
  this.payments = collections.create('payments')

  // ~ user-preference
  this['user-preference'] = collections.create('user-preference')

  // ~ user-directory
  this['user-directory'] = collections.create('user-directory')

  // ~permission
  this.permission = collections.create('permission')

  // ~role
  this.role = collections.create('role')

  // ~ pkg
  this.pkg = collections.create('pkg')

  // ~ services
  this.services = collections.create('services')

  // ~ vminfos
  this.vminfos = collections.create('vminfos')

  // ~ vmtomcat
  this.vmtomcats = collections.create('vmtomcats')

  // ~ vmjdk
  this.jdks = collections.create('jdks')

  // ~ vm tomcats
  this.tomcats = collections.create('tomcats')

  // ~ quota
  this.resourcequota = collections.create('resourcequota')

  // ~ clean
  this.cleaner = collections.create('cleaner')

  // ~ appstore
  this.appstore = collections.create('appstore')

  // ~ auth
  this.auth = collections.create('auth')

  // ~ ai
  this.ai = collections.create('ai')

  // ~ appcenters
  this.appcenters = collections.create('appcenters')

  // ~ workorders
  this.workorders = collections.create('workorders')

  // ~ federation
  this.federation = collections.create('federation')

  // ~ system/node alarm strategy
  this.systemAlert = collections.create('alert')

  // ~ tenants
  this.tenants = collections.create('tenants')

  // ~ ocp
  this.ocp = collections.create('ocp')

  // ~ orgs
  this.orgs = collections.create('orgs')

  // ~ storage-pools
  this.storagePools = collections.create('storage-pools')
}
