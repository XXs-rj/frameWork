import { DEFAULT_TIME_FORMAT } from '@/constant/global'
import isEmpty from 'lodash/isEmpty'
import moment from 'moment'
import { RESOURCES_DIY } from '@/constant/index'

export function toQuerystring (obj, sep, eq, isSort) {
  sep = sep || '&'
  eq = eq || '='
  if (!obj) {
    return ''
  }
  function stringifyPrimitive (v) {
    switch (typeof v) {
      case 'string':
        return v
      case 'boolean':
        return v ? 'true' : 'false'
      case 'number':
        return isFinite(v) ? v : ''
      default:
        return ''
    }
  }
  for (const k in obj) {
    if (obj[k] === null || obj[k] === '' || obj[k] === undefined) {
      delete obj[k]
    }
  }
  let objKeysArray = Object.keys(obj)
  if (isSort) {
    objKeysArray = objKeysArray.sort()
  }
  const queryString = objKeysArray.map(function (k) {
    const ks = stringifyPrimitive(k) + eq
    if (Array.isArray(obj[k])) {
      return obj[k].map(function (v) {
        return ks + stringifyPrimitive(v)
      }).join(sep)
    } else {
      return ks + stringifyPrimitive(obj[k])
    }
  }).join(sep)
  if (!queryString) {
    return ''
  }
  return queryString
}
/**
 * encode image fullname
 * `carrot/node/edge` -> `carrot/node%2Fedge`
 *
 * @export
 * @param {string} fullname
 * @return {string} encoded fullname
 */
export function encodeImageFullname (fullname) {
  const [project, ...imageName] = fullname.split('/')
  if (!imageName || imageName.length <= 1) {
    return fullname
  }
  return `${project}/${encodeURIComponent(imageName.join('/'))}`
}
/**
 * Generate random string with specified length, default is 6, max is 64
 */
export function genRandomString (mytoken, len) {
  const DEFAULT_TOKEN = '0123456789qwertyuioplkjhgfdsazxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZ@#$' // %&
  const DEFAULT_LEN = 6
  const MAX_LEN = 64
  if (!mytoken) {
    mytoken = DEFAULT_TOKEN
    len = DEFAULT_LEN
  } else if (!len) {
    if (typeof mytoken === 'number') {
      len = mytoken
      mytoken = DEFAULT_TOKEN
    } else {
      len = DEFAULT_LEN
    }
  }
  len = len > MAX_LEN ? MAX_LEN : len
  let randomStr = ''
  for (let i = 0; i < len; i++) {
    randomStr += mytoken.charAt(Math.ceil(Math.random() * 100000000) % mytoken.length)
  }
  return randomStr
}
export function getResourceByMemory (memory, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU) {
  if (memory !== RESOURCES_DIY) {
    memory = parseInt(memory)
  }
  let cpuShow = 1 // unit: C
  let cpu = 0.1 // unit: C
  let memoryShow = 0.5 // unit: G
  let limitCpu = 0.1 // unit: C
  let limitMemory = 0.5 // unit: G
  let config = '2x'
  switch (memory) {
    case 256:
      memoryShow = 256 / 1024
      cpuShow = 1
      cpu = 0.1
      limitCpu = 1
      limitMemory = memory
      config = '1x'
      break
    case 512:
      memoryShow = 512 / 1024
      cpuShow = 1
      cpu = 0.2
      limitCpu = 1
      limitMemory = memory
      config = '2x'
      break
    case 1024:
      memoryShow = 1024 / 1024
      cpuShow = 1
      cpu = 0.4
      limitCpu = 1
      limitMemory = memory
      config = '4x'
      break
    case 2048:
      memoryShow = 2048 / 1024
      cpuShow = 1
      cpu = 0.8
      limitCpu = 1
      limitMemory = memory
      config = '8x'
      break
    case 4096:
      memoryShow = 4096 / 1024
      cpuShow = 1
      cpu = 1
      limitCpu = 1
      limitMemory = memory
      config = '16x'
      break
    case 8192:
      memoryShow = 8192 / 1024
      cpuShow = 2
      cpu = 2
      limitCpu = 2
      limitMemory = memory
      config = '32x'
      break
    case RESOURCES_DIY:
      memoryShow = Math.ceil(DIYMaxMemory / 1024 * 100) / 100
      memory = Math.ceil(DIYMemory)
      cpuShow = DIYMaxCPU
      cpu = DIYCPU
      limitCpu = DIYMaxCPU
      limitMemory = Math.ceil(DIYMaxMemory)
      config = RESOURCES_DIY
      break
    default:
      break
  }
  return { cpu, memory, cpuShow, memoryShow, limitCpu, limitMemory, config }
}
/**
 * 获取应用包文件类型
 *
 * @param {string} type
 */
export function getWrapFileType (type) {
  switch (type) {
    case 'java':
      return 'jar'
    case 'tomcat':
      return 'war'
    default:
      return 'jar'
  }
}
export function getCookie (cName) {
  if (document.cookie.length === 0) {
    return null
  }
  let cStart = document.cookie.indexOf(cName + '=')
  if (cStart === -1) {
    return null
  }
  cStart = cStart + cName.length + 1
  let cEnd = document.cookie.indexOf(';', cStart)
  if (cEnd === -1) {
    cEnd = document.cookie.length
  }
  return unescape(document.cookie.substring(cStart, cEnd))
}

/**
 * Set cookie
 * options
 * - path: ;path=path (e.g., '/', '/mydir')
 * - domain: ;domain=domain (e.g., 'example.com' or 'subdomain.example.com')
 * - max-age: ;max-age=max-age-in-seconds (e.g., 60*60*24*365 or 31536000 for a year)
 * - expires: ;expires=date-in-GMTString-format
 */
export function setCookie (cName, value, options = {}) {
  if (getCookie(cName) && getCookie(cName) === value) {
    return
  }
  const cookieArray = []
  cookieArray.push(`${encodeURIComponent(cName)}=${value}`)
  if (options.domain) {
    cookieArray.push(`; domain=${options.domain}`)
  }
  if (options['max-age']) {
    cookieArray.push(`; max-age=${options['max-age']}`)
  }
  if (options.expires) {
    cookieArray.push(`; domain=${options.expires.toGMTString()}`)
  }
  cookieArray.push(`; path=${options.path ? options.path : '/'}`)
  const cookie = cookieArray.join('')
  document.cookie = cookie
}
export function getDeepValue (target, propsList) {
  return propsList.reduce(function (result, prop) {
    return result && result[prop] !== undefined ? result[prop] : null
  }, target)
}
/*
  *判断是否有域名
  *bindingDomain --- '' , '[]' , '[""]' , null , undefind
*/

export function isDomain (bindingDomainStr) {
  let bindingDomain = ''
  // Whether cluster can support binding domain
  if (bindingDomainStr === 'true') {
    return true
  }
  try {
    bindingDomain = JSON.parse(bindingDomainStr)
  } catch (e) {
    return false
  }

  if (bindingDomain.length === 0 || bindingDomain[0] === '') {
    return false
  }
  return true
}
/**
 * 创建模板和应用时，访问方式为应用负载均衡，检查是否有监听器
 * @param fields
 * @returns {boolean}
 */
export function lbListenerIsEmpty (fields) {
  let lbNoPort = false
  for (const fieldKey in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, fieldKey)) {
      const obj = fields[fieldKey]
      if (Object.keys(obj).indexOf('loadBalance') > -1) {
        let noLBPorts = true
        Object.keys(obj).map(label => (
          label.indexOf('tcp-exportPort-') > -1 ||
          label.indexOf('udp-exportPort-') > -1 ||
          label.indexOf('port-') > -1
        ) && (noLBPorts = false))
        lbNoPort = noLBPorts
      }
    }
  }
  return lbNoPort
}
// be careful here
const SKIP_VALIDATE_FIELDS = [/^readiness/, /^liveness/]
export const isFieldsHasErrors = fields => {
  const fieldsArray = Object.values(fields)
  return fieldsArray.some(field => {
    const currentFieldValues = Object.values(field)
    return currentFieldValues.some(value => {
      const isSkip = SKIP_VALIDATE_FIELDS.some(filedReg => filedReg.test(value.name))
      return !isSkip && !isEmpty(value.errors)
    })
  })
}
export function isResourcePermissionError (err) {
  if (!err) {
    return false
  }
  const { status, data } = err
  return status === 403 && (data && data.details && data.details.kind === 'ResourcePermission')
}

export function isResourceQuotaError (err) {
  if (!err) {
    return false
  }
  const { statusCode, message } = err
  return statusCode === 412 && (message && message.details && message.details.kind === 'resourcequota')
}
/**
 * Format cpu
 *
 * @param {any} memory
 * @param {any} resources
 * @returns
 */
export function cpuFormat (memory, resources) {
  const cpuLimits = parseCpuToNumber(resources && resources.limits ? resources.limits.cpu : null)
  const cpuRequests = parseCpuToNumber(resources && resources.requests ? resources.requests.cpu : null)

  if (cpuLimits && cpuRequests && cpuLimits !== cpuRequests) {
    return `${cpuRequests}~${cpuLimits} CPU`
  }
  if (cpuLimits && cpuRequests && cpuLimits === cpuRequests) {
    return `${cpuRequests} CPU`
  }
  if (!memory) {
    return '-'
  }
  const newMemory = parseInt(memory.replace('Mi', '').replace('Gi'))
  switch (newMemory) {
    case 1:
      return '1 CPU（共享）'
    case 2:
      return '1 CPU（共享）'
    case 4:
      return '1 CPU'
    case 8:
      return '2 CPU'
    case 16:
      return '2 CPU'
    case 32:
      return '2 CPU'
    case 256:
      return '1 CPU（共享）'
    case 512:
      return '1 CPU（共享）'
  }
}

export function memoryFormat (resources) {
  let memoryLimits = resources && resources.limits ? resources.limits.memory : null
  let memoryRequests = resources && resources.requests ? resources.requests.memory : null
  if (!memoryLimits || !memoryRequests) {
    return '-'
  }
  memoryLimits = memoryLimits.replace('i', '')
  if (memoryLimits && memoryRequests) {
    memoryRequests = memoryRequests.replace('i', '')
    if (memoryLimits === memoryRequests) {
      return memoryLimits
    }
    return `${memoryRequests}~${memoryLimits}`
  }
  return memoryLimits
}
/**
 * Parse cpu with unit to number
 *
 * @export
 * @param {any} cpu
 * @returns
 */
export function parseCpuToNumber (cpu) {
  if (!cpu) {
    return
  }
  if (cpu.indexOf('m') < 0) {
    cpu *= 1000
  } else {
    cpu = parseInt(cpu)
  }
  return Math.ceil((cpu / 1000) * 10) / 10
}

/**
 * Calculate time from now
 * Option
 * - beginDate
 * Output
 * - three days ago, etc
 */
export function calcuDate (beginDate) {
  return moment(beginDate).fromNow()
}

/**
 * Format date
 * `YYYY-MM-DD HH:mm:ss`
 * @export
 * @param {any} timestamp
 * @returns
 */
export function formatDate (timestamp, format) {
  format = format || DEFAULT_TIME_FORMAT
  if (!timestamp || timestamp === '') {
    return moment(new Date()).format(format)
  } else {
    return moment(timestamp).format(format)
  }
}

export function utf8ToB64 (str) {
  return window.btoa(window.unescape(encodeURIComponent(str)))
}

export function b64ToUtf8 (str) {
  // For k8s only
  str = str.slice(1)
  try {
    str = decodeURIComponent(window.escape(window.atob(str)))
  } catch (error) {
    str = window.atob(str)
  }
  return str
}

/**
 * Merge state by front-end customization requirements
 *
 * @export
 * @param {Array} state
 * @param {Array} newState
 * @param {String} key
 * @param {Object} options
 * @returns {Array}
 */
export function mergeStateByOpts (state, newState, key, options) {
  if (!options || !key) {
    return newState
  }
  const { keepChecked } = options
  if (!keepChecked) {
    return newState
  }
  newState.map(nItem => {
    const nValue = getValue(nItem, key)
    state.map(item => {
      if (getValue(item, key) === nValue) {
        keepChecked && (nItem.checked = item.checked)
      }
    })
  })
  return newState
}

/**
 * return value by key
 *
 * @param {Object} obj
 * @param {String} key 'name.name2.name3'
 * @returns
 */
export function getValue (obj, key) {
  if (!obj) {
    return
  }
  const combinedKeys = key.split('.')
  let value = obj
  combinedKeys.every(cKey => {
    value = value[cKey]
    if (!value) {
      return false
    }
    return true
  })
  if (typeof (value) === 'object') {
    return JSON.stringify(value)
  }
  return value
}
/**
 * formet time
 * @time s
 * @export string
 */
export function calcuTime (time) {
  let sym = '分钟'
  time = time / 60
  if (time / 60 > 1) {
    sym = '小时'
    time = time / 60
  }
  return time + sym
}

/**
 * bizcharts 图例显示有问题，去掉服务名称后的数字（dsb-server-3375465363-1x4v5 => dsb-server-1x4v5）
 * @param {object} data 数据源
 * @return {object} 修改数据中的时间
 */
export function formatMonitorName (data) {
  if (isEmpty(data)) {
    return data
  }
  data.forEach(item => {
    const { containerName, metrics } = item
    let name = containerName.split('-')
    if (name.length >= 4) {
      name.splice(-2, 1)
    }
    name = name.join('-')
    metrics.forEach(metric => {
      metric.containerName = name
      metric.value = metric.floatValue
    })
  })
  return data
}

export function formatMonitorName2 (data) {
  if (isEmpty(data)) {
    return data
  }
  data.forEach(item => {
    const { metrics } = item
    const containerName = item.container_name
    let name = containerName.split('-')
    if (name.length >= 4) {
      name.splice(-2, 1)
    }
    name = name.join('-')
    metrics.forEach(metric => {
      metric.containerName = name
      metric.value = metric.floatValue
    })
  })
  return data
}

/**
 * 统一 pod 和 service 监控数据格式
 * @param {object} res 数据源
 * @return {object} result data
 */
export function formatPodMonitor (res) {
  const result = {
    data: []
  }
  for (const [key, value] of Object.entries(res)) {
    const metrics = value.metrics || []
    metrics.forEach(metric => {
      metric.value && (metric.value = Math.ceil(metric.value * 100) / 100)
      metric.floatValue && (metric.floatValue = Math.ceil(metric.floatValue * 100) / 100)
    })
    value.containerName = key
    value.metrics = metrics
    result.data.push(value)
  }
  return result
}

export function appNameCheck (name, itemName, existNameFlag) {
  // name for check, itemName for show, existNameFlag for show existed
  let errorMsg = ''
  // null check
  if (!name || name.length === 0) {
    errorMsg = '请输入' + itemName
    return errorMsg
  }
  // a-zA-Z start check
  const startCheck = /^[A-Za-z]{1}/
  if (!startCheck.test(name)) {
    errorMsg = '请以字母开头'
    return errorMsg
  }
  // a-zA-Z0-9_- body check
  const bodyCheck = /^[A-Za-z]{1}[A-Za-z0-9_-]*$/
  if (!bodyCheck.test(name)) {
    errorMsg = '由字母、数字、中划线-、下划线_组成'
    return errorMsg
  }
  // min length check
  if (name.length < 3) {
    errorMsg = '请输入3个以上字符'
    errorMsg = `${itemName}至少为3个字符`
    return errorMsg
  }
  // existName check
  if (existNameFlag) {
    errorMsg = itemName + '已经存在'
    return errorMsg
  }
  // max length check
  if (name.length > 63) {
    errorMsg = '不能超过63个字符'
    return errorMsg
  }
  // a-zA-Z0-9 end check
  const endCheck = /^[A-Za-z]{1}[A-Za-z0-9_\\-]{1,61}[A-Za-z0-9]$/
  if (!endCheck.test(name)) {
    errorMsg = '由字母或数字结尾'
    return errorMsg
  }
  return 'success'
}

export function isStorageUsed (volumes) {
  let used = false
  if (volumes) {
    for (const i in volumes) {
      if (volumes[i].rbd) {
        used = true
        break
      }
    }
  }
  return used
}
/**
 * 统计类型为服务时，监控面板的图例显示容易重叠，先去掉名称中的数字串
 * 保留 首 尾
 * @param name
 * @returns {*}
 */
export function serviceNameCutForMetric (name) {
  if (!name) return name
  name = name.split('-')
  if (name.length < 3) return name.join('-')
  name = [name[0], name[name.length - 1]]
  name = name.join('-')
  return name
}
