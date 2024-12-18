/*
Validation for k8s resource, including service, deployment, ...
*/
import isUrl from './isUrl'
import { serviceConfigPrefix } from '@/constant/intl'
import Vue from 'vue'
const localeV = Vue.prototype.$tForJs
function $tForServiceConfig (field) {
  return localeV(serviceConfigPrefix + field)
}
// 将 $t 方法添加到 Vue 实例的原型上

export function validateK8sResource (name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 64) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  const regx = /^[a-z][-a-z0-9]{1,61}[a-z0-9]$/
  if (!regx.test(name)) {
    return false
  }
  return true
}
/*
 * Validation for service name
 * 长度最高限制为 60，超过 60 可能会导致端口号名称超过 63 位限制 (190221 改为 45)
 */
export function validateK8sResourceForServiceName (name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 45) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  const regx = /^[a-z][-a-z0-9]{1,58}[a-z0-9]$/
  if (!regx.test(name)) {
    return false
  }
  return true
}
export function validateServiceVersion (version) {
  const regex = /[\u4e00-\u9fa5\s]/
  if (regex.test(version)) {
    return localeV('utils.serveEmpty')
  }
  return true
}
/*
 * Validation for MiddleCenter name
 * 长度最高限制为 63  PVMV-610
 */
export function validateMiddleCenterAppName (name, length = 50) {
  if (!name) {
    return false
  }
  const regx = new RegExp(`^[a-z][-a-z0-9]{1,${length}}[a-z0-9]$`)
  if (!regx.test(name)) {
    return false
  }
  return true
}
/*
 * Validation for service config
 */
export function validateServiceConfig (name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 63) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  const regx = /^[-_.a-zA-Z0-9]{3,63}$/
  if (!regx.test(name)) {
    return false
  }
  return true
}

/*
 * Validation for config file of config group
 */
export function validateServiceConfigFile (name) {
  if (!name) {
    return false
  }
  if (name.length > 253) {
    return false
  }
  const str = '^\\.?[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?)*$'
  const regx = new RegExp(str)
  if (!regx.test(name)) {
    return false
  }
  return true
}
/*
Validation for app name
*/
export function validateAppName (name) {
  if (!name) {
    return new Error(localeV('utils.plsAppName'))
  }
  if (name.length < 3) {
    return new Error(localeV('utils.nameValidate'))
  }
  if (name.length > 63) {
    return new Error(localeV('utils.string63'))
  }
  const regx = /^[a-zA-Z0-9]+([-.~/][a-zA-Z0-9]+)*$/
  if (!regx.test(name)) {
    return new Error(localeV('utils.nameTip'))
  }
}

/**
 * this function for app, storage, compose file, tenxflow, repository,
 * docker file, image name, image store, users,
 * teamspeace, integration
 */
export function appNameCheck (name, itemName, existNameFlag) {
  // name for check, itemName for show, existNameFlag for show existed
  let errorMsg = ''
  // null check
  if (!name || name.length === 0) {
    errorMsg = $tForServiceConfig('pleaseEnter') + $tForServiceConfig(itemName)
    return errorMsg
  }
  // a-zA-Z start check
  const startCheck = /^[A-Za-z]{1}/
  if (!startCheck.test(name)) {
    errorMsg = $tForServiceConfig('appNameCheckStartMessage')
    return errorMsg
  }
  // a-zA-Z0-9_- body check
  const bodyCheck = /^[A-Za-z]{1}[A-Za-z0-9_-]*$/
  if (!bodyCheck.test(name)) {
    errorMsg = $tForServiceConfig('appNameCheckComposeMessage')
    return errorMsg
  }
  // min length check
  if (name.length < 3) {
    errorMsg = localeV('utils.nameValidate')
    errorMsg = `${itemName}${$tForServiceConfig('appNameMinLength')}`
    return errorMsg
  }
  // existName check
  if (existNameFlag) {
    errorMsg = itemName + $tForServiceConfig('alreadyExists')
    return errorMsg
  }
  // max length check
  if (name.length > 63) {
    errorMsg = $tForServiceConfig('appNameMaxLength')
    return errorMsg
  }
  // a-zA-Z0-9 end check
  const endCheck = /^[A-Za-z]{1}[A-Za-z0-9_-]{1,61}[A-Za-z0-9]$/
  if (!endCheck.test(name)) {
    errorMsg = $tForServiceConfig('appNameCheckEndMessage')
    return errorMsg
  }
  return 'success'
}

export function teamNameValidation (name) {
  if (name && name.length < 2) {
    return localeV('utils.nameLength2')
  }
  return 'success'
}

export function volNameCheck (name, itemName) {
  if (name && name.length > 32) {
    return localeV('utils.nameLength32')
  }
  return appNameCheck(name, itemName)
}
/*
 * this function for service, service config, database cluster
 */
export function serviceNameCheck (name, itemName, existNameFlag) {
  // name for check, itemName for show, existNameFlag for show existed
  let errorMsg = ''
  // null check
  if (!name || name.length === 0) {
    errorMsg = localeV('utils.pleaseIpt') + itemName
    return errorMsg
  }
  // a-zA-Z start check
  const startCheck = /^[a-z]{1}/
  if (!startCheck.test(name)) {
    errorMsg = localeV('utils.pleaseLower')
    return errorMsg
  }
  // a-zA-Z0-9- body check
  const bodyCheck = /^[a-z]{1}[a-z0-9-]*$/
  if (!bodyCheck.test(name)) {
    errorMsg = localeV('utils.serveNameCheck')
    return errorMsg
  }
  // min length check
  if (name.length < 3) {
    errorMsg = localeV('utils.nameValidate')
    return errorMsg
  }
  // existName check
  if (existNameFlag) {
    errorMsg = itemName + localeV('utils.exist')
    return errorMsg
  }
  // max length check
  if (name.length > 63) {
    errorMsg = localeV('utils.string63')
    return errorMsg
  }
  // a-z0-9 end check
  const endCheck = /^[a-z]{1}[a-z0-9-]{1,61}[a-z0-9]$/
  if (!endCheck.test(name)) {
    errorMsg = localeV('utils.littleLetter')
    return errorMsg
  }
  return 'success'
}

/*
  * this function for userName
  */
export function userNameCheck (name, itemName, existNameFlag) {
  // name for check, itemName for show, existNameFlag for show existed
  let errorMsg = ''
  // null check
  if (!name || name.length === 0) {
    errorMsg = localeV('utils.pleaseIpt') + itemName
    return errorMsg
  }
  const bodyCheck = /^[\u4e00-\u9fa5a-zA-Z0-9-]+$/gi
  if (!bodyCheck.test(name)) {
    errorMsg = localeV('utils.userNameCheck')
    return errorMsg
  }

  // min length check
  if (name.length < 3) {
    errorMsg = localeV('utils.nameValidate')
    return errorMsg
  }
  // existName check
  if (existNameFlag) {
    errorMsg = itemName + localeV('utils.exist')
    return errorMsg
  }
  // max length check
  if (name.length > 63) {
    errorMsg = localeV('utils.string63')
    return errorMsg
  }
  return 'success'
}

/**
 * this function for create app service env check
 */
export function appEnvCheck (name, itemName, existNameFlag) {
  // name for check, itemName for show, existNameFlag for show existed
  let errorMsg = ''
  // null check
  if (!name || name.length === 0) {
    errorMsg = localeV('utils.pleaseIpt') + itemName
    return errorMsg
  }
  // a-zA-Z start check
  const startCheck = /^[-._a-zA-Z]{1}/
  if (!startCheck.test(name)) {
    errorMsg = localeV('utils.appEnvCheck1')
    return errorMsg
  }
  // a-zA-Z0-9_- body check
  const bodyCheck = /^[-._a-zA-Z][-._a-zA-Z0-9]*$/
  if (!bodyCheck.test(name)) {
    errorMsg = itemName + localeV('utils.appEnvCheck2')
    return errorMsg
  }
  // min length check
  if (name.length < 2) {
    errorMsg = localeV('utils.string2')
    return errorMsg
  }
  // existName check
  if (existNameFlag) {
    errorMsg = itemName + localeV('utils.exist')
    return errorMsg
  }
  // max length check
  if (name.length > 63) {
    errorMsg = localeV('utils.string63')
    return errorMsg
  }
  return 'success'
}
export function IDValide (ID) {
  if (!/^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$/.test(ID) && !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(ID)) {
    return localeV('utils.idValide')
  }
  if (ID.length === 15) {
    return ''
  }
  const v = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const remainder = [1, 0, 'x', 9, 8, 7, 6, 5, 4, 3, 2]
  let valide = 0
  for (let index = 0; index < 18; index++) {
    if (index === 17) {
      continue
    }
    valide += (ID[index].charCodeAt(0) - 48) * v[index]
  }
  if (remainder[valide % 11] === ID[17]) {
    return ''
  }
  return localeV('utils.idValide')
}

// github.com/kubernetes/apimachinery/pkg/util/validation/validation.go
export function KubernetesValidator () {
  this.DNS1123SubdomainMaxLength = 253
  this.dns1123LabelFmt = '[a-z0-9]([-a-z0-9]*[a-z0-9])?'
  this.dns1123SubdomainFmt = this.dns1123LabelFmt + '(\\.' + this.dns1123LabelFmt + ')*'
  this.dns1123SubdomainRegexp = /^' + this.dns1123SubdomainFmt + '$/
  this.qualifiedNameMaxLength = 63
  this.qnameCharFmt = '[A-Za-z0-9]'
  this.qnameExtCharFmt = '[-A-Za-z0-9_.]'
  this.qualifiedNameFmt = '(' + this.qnameCharFmt + this.qnameExtCharFmt + '*)?' + this.qnameCharFmt
  this.qualifiedNameRegexp = new RegExp('^' + this.qualifiedNameFmt + '$')
  this.qualifiedNameErrMsg = "must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character"
  this.dns1123SubdomainErrorMsg = "a DNS-1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character"
  this.LabelValueMaxLength = 63
  this.labelValueFmt = '(' + this.qualifiedNameFmt + ')?'
  this.labelValueRegexp = new RegExp('^' + this.labelValueFmt + '$')
  this.labelValueErrMsg = "a valid label must be an empty string or consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character"
  this.EmptyError = function () {
    return 'must be non-empty'
  }

  this.RegexError = function (msg, fmt, examples) {
    if (examples.length === 0) {
      return msg + " (regex used for validation is '" + fmt + "')"
    }
    msg += ' (e.g. '
    examples.forEach((example, i) => {
      if (i > 0) {
        msg += ' or '
      }
      msg += "'" + example + "', "
    })
    msg += "regex used for validation is '" + fmt + "')"
    return msg
  }

  this.MaxLenError = function (length) {
    return 'must be no more than ' + length + ' characters'
  }

  this.IsDNS1123Subdomain = function (value) {
    const errs = []
    if (value.length > this.DNS1123SubdomainMaxLength) {
      errs.push(this.MaxLenError(this.DNS1123SubdomainMaxLength))
    }
    if (!this.dns1123SubdomainRegexp.test(value)) {
      errs.push(this.RegexError(this.dns1123SubdomainErrorMsg, this.dns1123SubdomainFmt, ['example.com']))
    }
    return errs
  }

  this.IsQualifiedName = function (value) {
    const errs = []
    const parts = value.split('/')
    const prefix = parts[0]
    let name = ''
    switch (parts.length) {
      case 1:
        name = parts[0]
        break
      case 2:
        name = parts[1]
        if (prefix.length === 0) {
          errs.push('prefix part ' + this.EmptyError())
        } else {
          const msgs = this.IsDNS1123Subdomain(prefix)
          if (msgs.length > 0) {
            msgs.map(msg => 'prefix part ' + msg).forEach(msg => errs.push(msg))
          }
        }
        break
      default:
        errs.push('a qualified name ' +
          this.RegexError(this.qualifiedNameErrMsg, this.qualifiedNameFmt, ['MyName', 'my.name', '123-abc']) +
          " with an optional DNS subdomain prefix and '/' (e.g. 'example.com/MyName')")
        return errs
    }
    const nameLength = name.length
    if (nameLength === 0) {
      errs.push('name part ' + this.EmptyError())
    } else if (nameLength > this.qualifiedNameMaxLength) {
      errs.push('name part ' + this.MaxLenError(this.qualifiedNameMaxLength))
    }
    if (!this.qualifiedNameRegexp.test(name)) {
      errs.push('name part ' +
        this.RegexError(this.qualifiedNameErrMsg, this.qualifiedNameFmt, ['MyName', 'my.name', '123-abc']))
    }
    return errs
  }

  this.IsValidLabelValue = function (value) {
    const errs = []
    if (value.length > this.LabelValueMaxLength) {
      errs.push(this.MaxLenError(this.LabelValueMaxLength))
    }
    if (!this.labelValueRegexp.test(value)) {
      errs.push(this.RegexError(this.labelValueErrMsg, this.labelValueFmt, ['MyValue', 'my_value', '12345']))
    }
    return errs
  }
}
/**
 * this function for create auto scale name check
 */
export function autoScaleNameCheck (value) {
  if (!value) {
    return Vue.prototype.$tForJs('containersService.EnterPolicyName')
  }
  if (value.length < 3 || value.length > 21) {
    return Vue.prototype.$tForJs('containersService.PolicyNameLength')
  }
  const regx = /^[a-zA-Z0-9]+([-.~/][a-zA-Z0-9]+)*$/
  if (!regx.test(value)) {
    return Vue.prototype.$tForJs('containersService.PolicyNameFormat')
  }
  return 'success'
}

/**
 * this function for ingress name check
 */

export function ingressNameCheck (value) {
  if (!value) {
    return $tForServiceConfig('pleaseEnter') + $tForServiceConfig('ingressName')
  }
  const regx = /^[a-zA-Z0-9]+([-.~/][a-zA-Z0-9]+)*$/
  if (!regx.test(value)) {
    return $tForServiceConfig('ingressNameRegMessage')
  }
  return 'success'
}

/**
 * this function for ingress relayRule check
 */

export function ingressRelayRuleCheck (value, relayRuleType) {
  if (!value) {
    return localeV('utils.ingressRelayRuleCheck')
  }
  if (!relayRuleType || relayRuleType === 'path') {
    if (value.includes('://')) {
      return localeV('utils.cantAgreement')
    }
    const regx = relayRuleType === 'path'
      ? /^[/]([-a-zA-Z0-9/]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([-/a-zA-Z0-9]*[a-zA-Z0-9])?)*$/
      : /^[/a-z0-9]([-a-z0-9/]*[a-z0-9])?(\.[a-z0-9]([-/a-z0-9]*[a-z0-9])?)*$/
    if (!regx.test(value)) {
      return relayRuleType === 'path'
        ? localeV('utils.ingressRelayRuleCheck1')
        : localeV('utils.ingressRelayRuleCheck2')
    }
  }
  return 'success'
}

/**
 * this function for ingress ingressPath check
 */
// export function ingressPathRuleCheck (value, relayRuleType) {
//   if (!value) {
//     return '服务位置不能为空'
//   }
//   if (!relayRuleType || relayRuleType === 'path') {
//     if (value.startsWith('/')) {
//       if (value.includes('://')) {
//         return '服务位置不能有协议'
//       }
//       const regx = relayRuleType === 'path'
//         ? /^[/]([-a-zA-Z0-9/]*[a-zA-Z0-9])?/
//         : /^[/a-z0-9]([-a-z0-9/]*[a-z0-9])?(\.[a-z0-9]([-/a-z0-9]*[a-z0-9])?)*$/
//       if (!regx.test(value)) {
//         return relayRuleType === 'path'
//           ? '大小写字母、数字、中划线、“.”或“/”组成，域名或“/”开头'
//           : '小写字母、数字、中划线-或 / 组成，以字母、数字或 / 开头，字母或数字结尾'
//       }
//     } else {
//       return isUrl(value, { hasProtocol: false }) ? 'success' : '大小写字母、数字、中划线、“.”或“/”组成，域名或“/”开头'
//     }
//   }
//   return 'success'
// }

/**
 * 不包含protocol的path check
 */
export function ingressPathRuleCheck2 (value, relayRuleType) {
  if (!value) {
    return localeV('utils.ingressRelayRuleCheck')
  }
  if (!relayRuleType || relayRuleType === 'path') {
    if (value.includes('://')) {
      return localeV('utils.cantAgreement')
    }
    const regx = relayRuleType === 'path'
      ? /[\w\-_]+(\.[\w\-_]+)+([\w\-\\.,@?^=%&:/~\\+#]*[\w\-\\@?^=%&/~\\+#])?/
      : /^[/a-z0-9]([-a-z0-9/]*[a-z0-9])?(\.[a-z0-9]([-/a-z0-9]*[a-z0-9])?)*$/
    if (!regx.test(value)) {
      return relayRuleType === 'path'
        ? localeV('utils.ingressRelayRuleCheck3')
        : localeV('utils.ingressRelayRuleCheck2')
    }
  }
  return 'success'
}

export function ingressPathRuleCheck3 (value, relayRuleType) {
  if (!value) {
    return localeV('utils.ingressRelayRuleCheck')
  }
  if (!relayRuleType || relayRuleType === 'path') {
    if (value.includes('://')) {
      return localeV('utils.cantAgreement')
    }
    const regx = relayRuleType === 'path'
      ? /^(?!.*\.\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/
      : /^[/a-z0-9]([-a-z0-9/]*[a-z0-9])?(\.[a-z0-9]([-/a-z0-9]*[a-z0-9])?)*$/
    if (!regx.test(value)) {
      return relayRuleType === 'path'
        ? localeV('utils.ingressRelayRuleCheck4')
        : localeV('utils.ingressRelayRuleCheck2')
    }
  }
  return 'success'
}

/**
 * this function for ingress context check
 */

export function ingressContextCheck (value) {
  if (!value) {
    return 'success'
  }
  const regx = /^\/[-/_a-zA-Z0-9]*$/
  if (!regx.test(value)) {
    return $tForServiceConfig('accessPathRegMsg')
  }
  return 'success'
}
/**
 * this function for loadbalance name check
 */

export function lbNameCheck (value) {
  return serviceNameCheck(value, localeV('utils.lbNameCheck'))
}

/**
 * this function for app template name check
 */

export function templateNameCheck (value) {
  if (!value) {
    return $tForServiceConfig('pleaseEnter') + $tForServiceConfig('appTemplate') + $tForServiceConfig('name')
  }
  if (value.length < 3 || value.length > 63) {
    return $tForServiceConfig('appTemplateLengthLimit')
  }
  // a-zA-Z start check
  const startCheck = /^[A-Za-z0-9]{1}/
  if (!startCheck.test(value)) {
    return $tForServiceConfig('appTemplateCheckStartMsg')
  }
  // a-zA-Z0-9 end check
  const endCheck = /[A-Za-z0-9]$/
  if (!endCheck.test(value)) {
    return $tForServiceConfig('appTempCheckEndMsg')
  }
  // a-zA-Z0-9_- body check
  const bodyCheck = /^[a-zA-Z0-9]+([_.~/][a-zA-Z0-9]+)*$/
  if (!bodyCheck.test(value)) {
    return $tForServiceConfig('appTempCheckComposeMsg')
  }
  return 'success'
}

export function vmWrapNameValidation (value) {
  if (!value) {
    return localeV('utils.vmWrapNameValidation')
  }
  if (value.length < 3 || value.length > 63) {
    return localeV('utils.vmWrapNameValidation1')
  }
  const regx = /^[a-zA-Z][-a-zA-Z0-9]{1,58}[a-zA-Z0-9]$/
  if (!regx.test(value)) {
    return localeV('utils.vmWrapNameValidation2')
  }
  return 'success'
}

export function checkName (_, value, cb) {
  if (!value) {
    return cb(new Error(localeV('utils.checkName')))
  }
  if (value.length < 3 || value.length > 32) {
    return cb(new Error(localeV('utils.checkName1')))
  }
  if (/^root$/i.test(value)) {
    return cb(new Error(`${value} ${localeV('utils.checkName2')}`))
  }
  if (!/^[a-zA-Z0-9]{1}[A-Za-z0-9_\\-]{1,30}[a-zA-Z0-9]+$/.test(value)) {
    return cb(new Error(localeV('utils.checkName3')))
  }
  // if (this.props) {
  //   const { data } = this.props
  //   if (data) {
  //     const result = data.some(item => item.name == value)
  //     if (result) {
  //       return cb(new Error('名称已经存在')
  //     }
  //   }
  // }
  cb()
}
