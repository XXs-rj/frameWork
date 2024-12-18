
import { ATS_CUSTOM_PORTS } from '@/constant/global'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import { isDomain } from './tools'

export function parseServiceDomain (item, bindingDomainStr, bindingIPStr, k8sSer) {
  let bindingDomain = []
  let bindingIP = []
  try {
    bindingDomain = JSON.parse(bindingDomainStr)
  } catch (e) {
    bindingDomain = []
  }
  try {
    bindingIP = JSON.parse(bindingIPStr)
  } catch (e) {
    bindingIP = []
  }

  const domains = []

  if (!item || !item.metadata) {
    return domains
  }

  let portsForExternal = cloneDeep(item.portsForExternal)
  const portForInternal = cloneDeep(item.portForInternal)

  const lbgroup = item.lbgroup
  if (lbgroup) {
    const { type, id, address, domain } = lbgroup
    if (type === 'public' || type === 'private') {
      bindingIP = [address]
      bindingIPStr = JSON.stringify(bindingIP)
      bindingDomain = [domain]
      bindingDomainStr = JSON.stringify(bindingDomain)
    }
    if (type === 'none' || id === 'mismatch') {
      bindingDomain = []
      bindingDomainStr = JSON.stringify(bindingDomain)
      portsForExternal = null
    }
  }

  // parse external domain, item.portsForExternal is array like [{name:"abasd",port:12345,protocol:"TCP",targetPort:1234},...]
  const nameInfo = item.metadata.name
  const customPorts = get(k8sSer, ['metadata', 'annotations', ATS_CUSTOM_PORTS], '')
  if (portsForExternal) {
    portsForExternal.map((port) => {
      let finalPort = port.port ? ':' + port.port : ''
      if (item.lbgroup) {
        const { type } = item.lbgroup
        if (type === 'public' || type === 'private') {
          finalPort = port.proxyPort ? ':' + port.proxyPort : ''
        }
      }
      let portInfo = finalPort
      if (bindingIP && bindingDomain && port.protocol.toLowerCase() === 'http') {
        portInfo = ''
        // nameInfo = port.name
      }
      const externalPort = portInfo.replace(/^:/, '')
      if (bindingIP.length > 0 && !isDomain(bindingDomainStr)) {
        const ips = []
        bindingIP.forEach(ip => {
          if (ip.indexOf(',') > -1) {
            ip.split(',').forEach(_ip => {
              ips.push(_ip)
            })
          } else {
            ips.push(ip)
          }
        })
        ips.map(ip => {
          let domain = ip + portInfo
          domain = domain.replace(/^(http:\/\/.*):80$/, '$1')
          domain = domain.replace(/^(https:\/\/.*):443$/, '$1')
          domains.push({
            lbgroup,
            domain,
            isInternal: false,
            externalPort,
            customPorts,
            k8sSer,
            isCustom: customPorts.indexOf(externalPort) > -1,
            interPort: port.targetPort
          })
        })
      } else if (isDomain(bindingDomainStr)) {
        bindingDomain.map((bindingDomain) => {
          let domain = ''
          // 检查是bindingDomain是否是IP，（此正则并不精确但在此处够用了）
          if (/^(\d{1,3}\.){3}\d{1,3}$/.test(bindingDomain)) {
            // e.g. http://192.168.1.123:1234
            domain = bindingDomain + portInfo
          } else {
            // e.g. http://[域名]:8080
            domain = item.metadata.namespace + '-' + nameInfo + '-' + port.port + '.' + bindingDomain + portInfo
          }
          // if prefix is http://, remove suffix :80
          domain = domain.replace(/^(http:\/\/.*):80$/, '$1')
          // if prefix is https://, remove suffix :443
          domain = domain.replace(/^(https:\/\/.*):443$/, '$1')
          domains.push({
            lbgroup,
            domain,
            isInternal: false,
            externalPort,
            customPorts,
            k8sSer,
            isCustom: customPorts.indexOf(externalPort) > -1,
            interPort: port.targetPort
          })
        })
      }
    })
  }
  // parse interanl domain item.portForInternal is ["1234", "4567", "5234"]
  if (nameInfo && portForInternal) {
    portForInternal.map(port => {
      if (nameInfo.indexOf(',') > -1) {
        nameInfo.split(',').forEach(_nameInfo => {
          domains.push({
            lbgroup,
            domain: `${_nameInfo}:${port}`,
            isInternal: true,
            interPort: port
          })
        })
      } else {
        domains.push({
          lbgroup,
          domain: `${nameInfo}:${port}`,
          isInternal: true,
          interPort: port
        })
      }
    })
  }
  // parse lb domain k8sSer.proxy
  if (k8sSer && k8sSer.proxy) {
    k8sSer.proxy.map(port => {
      const ip = port.host ? port.host : port.loadbalanceIP.split(',')[0]
      const externalPort = port.externalPort
      const domain = port.path ? `${ip}:${externalPort}${port.path}` : `${ip}:${externalPort}`
      domains.push({
        domain,
        isLb: true,
        externalPort,
        interPort: port.internalPort,
        protocol: port.protocol
      })
    })
  }
  return domains
}

export function parseAppDomain (app, bindingDomainStr, bindingIPStr) {
  const domains = []
  app.services.map((item) => {
    // k8s_services or k8sServices(源码)
    // if (!app.k8s_services) {
    //   return
    // }
    const service = item.service

    // const k8sSer = app.k8s_services.filter(record => record.metadata.name === item.metadata.name)[0]
    domains.push({
      name: service.metadata.name,
      data: parseServiceDomain(service, bindingDomainStr, bindingIPStr, service)
    })
  })
  return domains
}
