import {
  flowContainerIN,
  flowContainerOut,
  LimitFlowContainer,
  PodKeyMapping,
  SYSTEM_DEFAULT_SCHEDULE,
  OTHER_IMAGE,
  GPU_ALGORITHM,
  GPU_ALGORITHM_NV,
  GPU_ALGORITHM_OR,
  DCU_ALGORITHM,
  MLU_ALGORITHM,
  NPU_ALGORITHM,
  NO_CLASSIFY,
  CONFIGMAP_CLASSIFY_CONNECTION

} from '@/constant/index'
import Deployment from '@/utils/kubernetes/deployment'
import { getResourceByMemory } from '@/utils/tools'
import { isCidr } from './kubernetes/ip'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import NpuTrain from '@/utils/kubernetes/npuTrain'
import PersistentVolumeClaim from '@/utils/kubernetes/persistentVolumeClaim'
import Service from '@/utils/kubernetes/service'
import Vue from 'vue'

/**
 * 校验配置文件路径、加密配置文件路径、存储卷挂载目录是否冲突
 *
 * @export
 * @param {object} form form 对象
 * @param {string} index 当前表单所在 index
 * @param {string} value 当前输入值
 * @param {string} type 'configMap' || 'secretConfigMap' || 'volume'
 * @return {string} 'error' || undefined
 */
export function checkVolumeMountPath (form, index, value, type) {
  const values = form
  const {
    configMapKeys = [],
    secretConfigMapKeys = [],
    storageList = []
  } = values
  let error

  // 1.检查配置文件路径
  const isConfigMap = type === 'configMap'
  configMapKeys.every(_key => {
    if (_key.deleted) {
      return true
    }
    const _keyValue = _key.value
    const configMapMountPath = values[`configMapMountPath${_keyValue}`]
    if ((!isConfigMap || _keyValue !== index) && value === configMapMountPath) {
      error = isConfigMap ? '已填写过该路径' : '该目录已被普通配置使用'
      return false
    }
    return true
  })

  // 2.检查加密配置文件路径
  const isSecretConfigMap = type === 'secretConfigMap'
  secretConfigMapKeys.every(_key => {
    if (_key.deleted) {
      return true
    }
    const _keyValue = _key.value
    const secretConfigMapMountPath = values[`secretConfigMapMountPath${_keyValue}`]
    if ((!isSecretConfigMap || _keyValue !== index) && value === secretConfigMapMountPath) {
      error = isSecretConfigMap ? '已填写过该路径' : '该目录已被加密配置使用'
      return false
    }
    return true
  })

  // 3.检查存储卷挂载目录
  const isVolume = type === 'volume'
  storageList.every(({ mountPath }, _index) => {
    if ((!isVolume || _index !== index) && value === mountPath) {
      error = type === 'volume' ? '已填写过该路径' : '该目录已被存储卷目录使用'
      return false
    }
    return true
  })
  return error
}
export function formatValuesToFields (values) {
  const fields = {}
  Object.keys(values).map(key => fields[key] = { name: key, value: values[key] })
  return fields
}

export const getCommand = command => {
  if (!command) return ''
  const a = command.startsWith(' ')
  const b = command.endsWith(' ')
  let temp = command
  if (a) {
    temp.replace(' ', '')
  }
  if (b) {
    const arr = temp.split('')
    arr.pop()
    temp = arr.join('')
  }
  const c = temp.startsWith(' ')
  const d = temp.endsWith(' ')
  if (c || d) {
    return getCommand(temp)
  }
  return temp
}
// buildJson的v2版本，增加了服务版本概念、增加链路追踪开关、映射端口name字段调整、
// 容器配置-GPU:GPU单位及字段调整，增加显存字段
/**
 *
 * @param {*} fields 当前服务对应的表单内容
 * @param {*} cluster 集群
 * @param {*} loginUser 登录用户信息
 * @param {*} imageConfigs 镜像信息
 * @param {*} isTemplate
 * @param {*} isTemplateDeploy
 * @param {*} location
 * @param {*} tenantId 租户id
 * @param {*} isDualStack 当前集群是否支持双栈
 * @returns
 */
export function buildJsonV2 ({
  fields, cluster, loginUser, imageConfigs, isTemplate, isTemplateDeploy, location, tenantId, isDualStack
}) {
  const fieldsValues = fields
  // 获取各字段值
  const {
    appName, // 应用名称
    serviceName, // 服务名称
    serviceVersion, // 服务版本
    systemRegistry, // 镜像服务类型
    imageUrl, // 镜像地址
    appPkgID, // 应用包
    imageTag, // 镜像版本
    systemTracing, // 是否开启了链路追踪
    apm, // 是否开通 APM
    bindNode, // 绑定节点
    imageTagOS, // 绑定节点 OS
    imageTagArch, // 绑定节点 Arch
    bindNodeType, // 绑定节点类型
    bindLabel, // 主机标签绑定
    resourceAlgorithm, // 容器配置算法 one of [X86, GPU,NPU,DCU]
    GPULimits, // GPU limits 数量
    VRAMLimits, // gpu自定义配置-显存配置
    resourceType, // 容器配置
    DIYMemory, // 自定义配置-内存
    DIYCPU, // 自定义配置-CPU
    DIYMaxMemory, // 自定义配置-最大内存
    DIYMaxCPU, // 自定义配置-最大CPU
    gpuKey, // GPU品牌，类型
    gpuValue, // GPU型号
    NPULimits, // NPU limits 数量
    customNpuType, // NPU 自定义类型 训练/推理
    GPUNvLimits,
    gpuNvConfig, // Nv品牌高性能GPU配置
    GPUOrLimits, // orionx品牌高性能GPU配置
    GPUOrGmem, // 显存
    GPUOrRatio, // 使用率
    npuConfig, // NPU显卡信息
    dcuConfig,
    DCULimits,
    mluConfig,
    MLULimits,
    serviceType, // 服务类型(有状态, 无状态)
    storageType, // 存储类型(rbd, hostPath)
    storageList, // 存储的配置列表
    // storageKeys, // 存储的 keys(数组)
    replicas, // 实例数量
    hostname,
    aliasesKeys, // hostname 别名 key
    subdomain, // 子域名
    accessType, // 是否为负载均衡
    agentType, // 集群内/外 方式
    accessMethod, // 访问方式
    publicNetwork, // 公网出口
    internaletwork, // 内网出口
    portsKeys, // 端口的 keys(数组)
    loadBalance,
    lbKeys, // 访问方式为负载均衡时的端口(数组)
    tcpKeys,
    udpKeys,
    argsType,
    commandKeys, // 进入点 keys
    isRemoveCommand, // 进入点 未修改则 remove
    argsKeys, // 启动命令的 keys(数组) 非默认
    defaultArgsKeys, // 启动命令的 keys(数组) 默认
    imagePullPolicy, // 重新部署时拉取镜像的方式(Always, IfNotPresent)
    timeZone, // 时区设置
    sourceType, // 日志采集-来源类型
    name, // 日志采集
    path, // 日志采集-日志目录
    inregex, // 日志采集-采集规则
    exregex, // 日志采集-排除规则
    readinessProtocol, // 高可用-就绪状态-协议类型
    readinessPort, // 高可用-就绪状态-端口
    readinessExecCommand, // 高可用-就绪状态-执行命令
    readinessInitialDelaySeconds, // 高可用-就绪状态-首次检查延时
    readinessTimeoutSeconds, // 高可用-就绪状态-检查超时
    readinessPeriodSeconds, // 高可用-就绪状态-检查间隔
    readinessPath, // 高可用-就绪状态-Path 路径
    readinessSuccessThreshold, // 高可用-就绪状态-健康阈值
    readinessFailureThreshold, // 高可用-就绪状态-不健康阈值
    useReadinessConfig, // 高可用-就绪状态配置是否使用存活状态相同的配置
    livenessProtocol, // 高可用-存活状态-协议类型
    livenessPort, // 高可用-存活状态-端口
    livenessExecCommand, // 高可用-存活状态-执行命令
    livenessInitialDelaySeconds, // 高可用-存活状态-首次检查延时
    livenessTimeoutSeconds, // 高可用-存活状态-检查超时
    livenessPeriodSeconds, // 高可用-存活状态-检查间隔
    livenessPath, // 高可用-存活状态-Path 路径
    livenessSuccessThreshold, // 高可用-存活状态-健康阈值
    livenessFailureThreshold, // 高可用-存活状态-不健康阈值
    envKeys, // 环境变量的 keys(数组)
    configMapKeys, // 普通配置目录的 keys(数组)
    secretConfigMapKeys, // 加密配置目录的 keys(数组)
    serviceTag, // 服务与节点 标签
    serviceBottomTag, // 服务与服务 标签
    advanceSet, // 服务与服务 高级设置
    modelSet, // 模型集
    serviceMesh, // 服务网格
    replicasCheck, // 实例数量/固定IP(calico)
    ipPool, // IP Pool (calico)
    ipAssignment, // IP Pool (macvlan)
    isStaticIP, // macvlan 固定ip
    flowSliderCheck, // 流量控制
    flowSliderInput,
    flowSliderOut,
    postKeys, // post start keys
    preKeys, // pre stop keys
    // eslint-disable-next-line camelcase
    post_start,
    // eslint-disable-next-line camelcase
    pre_stop,
    tty, // tty
    stdin, // stdin
    UpgradeStrategyKind,
    USInstanceNumber,
    updateIntervals,
    maxNewNumber,
    maxNoUseNumber,
    privileged, // 特权容器
    runAsUser, // runAsUser
    fsGroup, // fsGroup
    ServiceAccount, // 服务账户
    systemRegistryID, // 第三方harbor
    EnableCustomMonitorScraping, // 是否开启自定义监控
    prometheusPath, // 自定义监控端点配置：路径
    prometheusPort, // 自定义监控端点配置：端口
    prometheusScheme// 自定义监控端点配置：协议
  } = fieldsValues
  const MOUNT_PATH = 'mountPath' // 容器目录
  const VOLUME = 'volume' // 存储卷(rbd)
  const READ_ONLY = 'readOnly' // 只读(rbd)
  const HOST_PATH = 'hostPath' // 本地目录(hostPath)
  const PORT = 'port' // 端口
  const PORT_PROTOCOL = 'portProtocol' // 端口协议(HTTP, TCP)
  const MAPPING_PORTTYPE = 'mappingPortType' // 映射服务端口类型(auto, special)
  const MAPPING_PORT = 'mappingPort' // 映射服务端口
  const MAPPING_PROTOCOL = 'mappingProtocol' // 映射服务端口协议
  const deployment = new Deployment(serviceName)
  // set annotation => system/registry = dockerhub
  const randomStr = randomString()
  // 更改1：metadata.name后拼接5位随机字母
  // deployment.metadata.name = serviceName + '-' + randomStr
  // 更改2：增加服务版本信息
  deployment.addServiceVersion(serviceVersion)

  // deployment.setAnnotations({
  //   'system/registry': systemRegistry
  // })
  // 设置应用包appPkgID
  if (isTemplate && appPkgID) {
    deployment.setAnnotations({
      appPkgID
    })
  }
  if (systemRegistryID) {
    deployment.setAnnotations({
      'system/registryID': systemRegistryID
    })
  }
  // 设置流量控制
  if (flowSliderCheck === true) {
    deployment.setAnnotations({
      [flowContainerIN]: flowSliderInput + 'M',
      [flowContainerOut]: flowSliderOut + 'M'
    })
  }
  if (isTemplate && !isTemplateDeploy && location.query.other) {
    deployment.setAnnotations({
      [OTHER_IMAGE]: location.query.other
    })
  }
  if (modelSet) {
    deployment.metadata.labels['tensorflow/model-serving-app'] = ''
    deployment.setAnnotations({ 'tensorflow/modelset-name': modelSet })
  }
  // 设置镜像地址
  deployment.addContainer(serviceName, `${imageUrl}:${imageTag}`)
  // 设置 APM
  if (apm) {
    deployment.setApmServiceLabel('pinpoint')
  }
  // 设置服务网格
  if (!serviceMesh) {
    deployment.setAnnotations({ 'sidecar.istio.io/inject': 'false' })
    deployment.setMetaAnnotations({ 'sidecar.istio.io/inject': 'false' })
  }
  if (imageTagOS) {
    deployment.setAnnotations({ imagetag_os: imageTagOS })
    deployment.setNodeSelector({ os: imageTagOS, arch: imageTagArch })
  }
  if (imageTagArch) {
    deployment.setAnnotations({ imagetag_arch: imageTagArch })
  }
  // 设置绑定节点
  if (bindNodeType === 'default') {
    deployment.setServiceNodeLabel(serviceTag)
  }
  if (bindNodeType === 'hostname') {
    if (bindNode !== SYSTEM_DEFAULT_SCHEDULE) {
      deployment.setNodeSelector({ hostname: bindNode })
    } else {
      deployment.setServiceNodeLabel(serviceTag)
    }
  } else if (bindNodeType === 'hostlabel') {
    // 设置主机标签绑定节点
    // deployment.setLabelSelector(bindLabel)
    let deafultServiceTag = []
    if ([GPU_ALGORITHM, DCU_ALGORITHM, GPU_ALGORITHM_NV].includes(resourceAlgorithm)) {
      if (resourceAlgorithm === GPU_ALGORITHM && gpuKey && gpuValue) {
        deafultServiceTag = [
          {
            key: gpuKey,
            value: gpuValue,
            mark: 'In',
            point: '最好'
          }
        ]
      } else if (resourceAlgorithm === GPU_ALGORITHM_NV && gpuNvConfig?.label) {
        deafultServiceTag = [
          {
            key: gpuNvConfig.label,
            value: gpuNvConfig.value,
            mark: 'In',
            point: '最好',
            isDefault: true
          }
        ]
      } else if (resourceAlgorithm === DCU_ALGORITHM && dcuConfig) {
        deafultServiceTag = [
          {
            key: dcuConfig.label,
            value: dcuConfig.value,
            mark: 'In',
            point: '最好'
          }
        ]
      }
      serviceTag.find(item => {
        if (isEqual(item, deafultServiceTag[0])) {
          deafultServiceTag = []
          return true
        }
      })
    }

    // 设置服务 标签
    deployment.setServicePointSelector((serviceTag || []).concat(deafultServiceTag))
    deployment.setServicePodSelector(serviceBottomTag, advanceSet, serviceName)
  }
  // 设置资源
  const { cpu, memory, limitCpu, limitMemory } = getResourceByMemory(resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU)
  const paramsArray = [serviceName, memory, cpu, limitMemory, limitCpu, resourceAlgorithm]
  if (resourceAlgorithm === GPU_ALGORITHM) {
    paramsArray.push({ GPULimits, VRAMLimits })
    deployment.setAnnotations({ 'tencent.com/vcuda-core-limit': GPULimits + '' })
  } else if (resourceAlgorithm === GPU_ALGORITHM_NV) {
    paramsArray.push({ GPUNvLimits })
    deployment.setGpuNvToleration()
  } else if (resourceAlgorithm === DCU_ALGORITHM) {
    paramsArray.push({ DCULimits })
  } else if (resourceAlgorithm === MLU_ALGORITHM) {
    paramsArray.push({ MLULimits, mluConfig })
  } else if (resourceAlgorithm === GPU_ALGORITHM_OR) {
    paramsArray.push({
      GPUOrLimits, // orionx品牌高性能GPU配置
      GPUOrGmem, // 显存
      GPUOrRatio
    })
  }
  deployment.setContainerResources.apply(deployment, paramsArray)
  // 服务类型&存储
  const storage = []
  if (serviceType) {
    const storageForTemplate = []
    storageList.forEach((item, index) => {
      // volume
      const volume = {
        name: `volume-${index}`
      }
      let {
        type, mountPath, strategy,
        readOnly, name, volumeIsOld,
        size, fsType, storageClassName,
        // eslint-disable-next-line camelcase
        hostPath, type_1
      } = item
      // @Todo: reclaimPolicy??
      if (type === 'host') {
        const volumeMounts = [{
          mountPath,
          readOnly
        }]
        volume.hostPath = {
          path: hostPath
        }
        if (isTemplate) {
          const volumeObj = {
            name: `${type}-${volume.name}`,
            storageClassName: `${type}-storage`,
            mountPath,
            hostPath,
            readOnly,
            type_1,
            isTemplate: true
          }
          // 模版更新和部署只在annotations中添加自动创建的的存储
          if (item.volume === 'create') {
            storageForTemplate.push(volumeObj)
          }
          deployment.setAnnotations({
            'system/template': JSON.stringify(storageForTemplate)
          })
        }
        deployment.addContainerVolumeV2(serviceName, volume, volumeMounts)
      } else {
        let volumeInfo = item.volume
        let image
        if (volumeInfo === 'create') {
          image = name
          const persistentVolumeClaim = new PersistentVolumeClaim({
            name,
            storageType: type === 'private'
              ? (() => {
                  // eslint-disable-next-line camelcase
                  if (type_1 === 'rbd') {
                    return 'ceph'
                  }
                  // eslint-disable-next-line camelcase
                  return type_1
                })()
              : 'nfs',
            storageClassName,
            fsType,
            storage: size ? `${size}Mi` : '512Mi'
          })
          storage.push(persistentVolumeClaim)
        } else {
          volumeInfo = volumeInfo.split(' ')
          image = volumeInfo[0]
          fsType = volumeInfo[1]
        }
        const volumeMounts = [{
          mountPath,
          readOnly
        }]
        if (volumeIsOld) {
          volume.image = image
          volume.fsType = fsType
          deployment.addContainerVolume(serviceName, volume, volumeMounts)
        } else {
          volume.persistentVolumeClaim = {
            claimName: image,
            readOnly
          }
          if (isTemplate) {
            // delete volume.persistentVolumeClaim.claimName
            const storageType = type === 'private'
              ? (() => {
                  // eslint-disable-next-line camelcase
                  if (type_1 === 'rbd') {
                    return 'ceph'
                  }
                  // eslint-disable-next-line camelcase
                  return type_1
                })()
              : 'nfs'
            volume.name = `${storageType}-volume-${index}`
            const volumeObj = {
              name: volume.name,
              storageClassName,
              mountPath,
              readOnly,
              type_1,
              isTemplate: true
            }
            if (type === 'private') {
              Object.assign(volumeObj, {
                fsType,
                storage: size ? `${size}Mi` : '512Mi'
              })
            }
            if (volumeInfo === 'create') {
              storageForTemplate.push(volumeObj)
            }
          }
          deployment.addContainerVolumeV2(serviceName, volume, volumeMounts)
        }
        if (isTemplate) {
          deployment.setAnnotations({
            'system/template': JSON.stringify(storageForTemplate)
          })
        }
      }
      /* if (storageType == 'rbd') {
        let volumeInfo = fieldsValues[`${VOLUME}${key}`]
        volumeInfo = volumeInfo.split(' ')
        volume.image = volumeInfo[0]
        volume.fsType = volumeInfo[1]
      } else if (storageType == 'hostPath') {
        const hostPath = fieldsValues[`${HOST_PATH}${key}`]
        volume.hostPath = {
          path: hostPath,
        }
      } */
    })
  }

  // 设置实例数量
  deployment.setReplicas(replicas)
  // 设置 IP Pool (calico)
  if (ipPool) {
    let key = 'cni.projectcalico.org/ipv4pools'
    if (isCidr(ipPool, 'v6')) key = 'cni.projectcalico.org/ipv6pools'
    deployment.setAnnotations({
      [key]: `["${ipPool}"]`
    })
  }

  // 设置 IP Pool (macvlan)
  if (ipAssignment) {
    deployment.setAnnotations({
      'system/ip-assignment-name': ipAssignment
    })
  }

  // 设置固定 IP (calico)
  if (replicasCheck) {
    const { ipKeys } = fieldsValues
    const replicasIPArr = []
    ipKeys.forEach(item => {
      replicasIPArr.push(fieldsValues[`replicasIP${item}`])
    })
    const replicasIPStr = JSON.stringify(replicasIPArr)
    deployment.setAnnotations({
      'cni.projectcalico.org/ipAddrs': replicasIPStr
    })
  }

  // macvlan 固定ip
  if (isStaticIP) {
    const { ipKeys } = fieldsValues
    let ipStr = ''
    ipKeys.forEach(item => {
      ipStr = ipStr + fieldsValues[`replicasIP${item}`] + ','
    })
    ipStr = ipStr.substring(0, ipStr.length - 1)
    deployment.setMetaAnnotations({
      'system/reserved-ips': ipStr
    })
  }

  // 设置 hostname 和 subdomain
  deployment.setHostnameAndSubdomain(hostname, subdomain)
  // 设置 hostname aliases
  if (!isEmpty(aliasesKeys)) {
    const hostAliases = []
    aliasesKeys.forEach(key => {
      const ip = fieldsValues[`ipHost-${key}`]
      const hostnames = [fieldsValues[`hostAliases-${key}`]]
      hostAliases.push({
        ip,
        hostnames
      })
    })
    deployment.setHostAliases(hostAliases)
  }
  // 设置端口
  const service = new Service(serviceName, cluster, isDualStack)
  const { proxyType } = loginUser
  // 设置访问方式
  let groupID = 'none'
  // 模板访问方式
  let templateGroup = 'none'
  switch (accessMethod) {
    case 'PublicNetwork': groupID = publicNetwork; templateGroup = 'PublicNetwork'; break
    case 'InternalNetwork': groupID = internaletwork; templateGroup = 'InternalNetwork'; break
    case 'Cluster':
    default:
      groupID = 'none'; templateGroup = 'Cluster'; break
  }
  if (isTemplate) {
    // 设置访问方式类型
    deployment.setAnnotations({
      accessType
    })
  }
  if (!serviceMesh) {
    if (accessType === 'loadBalance') {
      // 访问方式为负载均衡

      // 设置负载均衡方式
      deployment.setAnnotations({
        agentType,
        loadBalance
      })
      !isEmpty(lbKeys) && lbKeys.forEach(key => {
        const port = parseInt(fieldsValues[`${PORT}-${key}`])
        const name = `${serviceName}-${key}`
        deployment.addContainerPort(serviceName, port)
        service.addPort(proxyType, name, 'HTTP', port, port)
      })
      const tcpIngressArray = []
      !isEmpty(tcpKeys) && tcpKeys.forEach(key => {
        const port = parseInt(fieldsValues[`tcp-servicePort-${key}`])
        const exportPort = parseInt(fieldsValues[`tcp-exportPort-${key}`])
        const name = `${serviceName}-${key}`
        deployment.addContainerPort(serviceName, port)
        service.addPort(proxyType, name, 'TCP', port, port)
        // tcp 和 upd 监听器放入 annotations 用于回显
        if (isTemplate) {
          tcpIngressArray.push({
            servicePort: port,
            exportPort
          })
        }
      })
      if (!isEmpty(tcpIngressArray)) {
        deployment.setAnnotations({
          tcpIngress: JSON.stringify(tcpIngressArray)
        })
      }
      const udpIngressArray = []
      !isEmpty(udpKeys) && udpKeys.forEach(key => {
        const port = parseInt(fieldsValues[`udp-servicePort-${key}`])
        const exportPort = parseInt(fieldsValues[`udp-exportPort-${key}`])
        const name = `${serviceName}-${key}`
        deployment.addContainerPort(serviceName, port, 'UDP')
        service.addPort(proxyType, name, 'UDP', port, port)
        if (isTemplate) {
          udpIngressArray.push({
            servicePort: port,
            exportPort
          })
        }
      })
      if (!isEmpty(udpIngressArray)) {
        deployment.setAnnotations({
          udpIngress: JSON.stringify(udpIngressArray)
        })
      }
      // 默认访问方式 集群内
      service.addLBGroupAnnotation('none')
    } else {
      if (isTemplate && !isTemplateDeploy) {
        service.addLBGroupAnnotation(templateGroup)
      } else {
        service.addLBGroupAnnotation(groupID)
      }
      portsKeys && portsKeys.forEach(key => {
        if (key.deleted) {
          return
        }
        const keyValue = key.value
        const port = fieldsValues[`${PORT}${keyValue}`]
        const portProtocol = fieldsValues[`${PORT_PROTOCOL}${keyValue}`]
        const name = `${serviceName}-${keyValue}`
        const mappingPort = fieldsValues[`${MAPPING_PORT}${keyValue}`] || ''
        const mappingProtocol = fieldsValues[`${MAPPING_PROTOCOL}${keyValue}`]
        const mappingPortType = fieldsValues[`${MAPPING_PORTTYPE}${keyValue}`]
        service.addPort(proxyType, name, portProtocol, port, port, mappingPort, mappingProtocol)
        if (groupID !== 'none' && !!mappingProtocol) {
          // No need to expose ports if network mode is 'none'
          if (mappingPortType === 'special') {
            service.addPortAnnotation(name, mappingProtocol, mappingPort)
          } else {
            service.addPortAnnotation(name, mappingProtocol)
          }
        }
        deployment.addContainerPort(serviceName, port, portProtocol)
      })
    }
  } else {
    portsKeys && portsKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      const port = fieldsValues[`${PORT}${keyValue}`]
      const portProtocol = fieldsValues[`${PORT_PROTOCOL}${keyValue}`]
      const name = `${serviceName}-${keyValue}`
      service.addPort(proxyType, name, portProtocol, port, port)
      deployment.addContainerPort(serviceName, port, portProtocol)
    })
  }
  // 设置进入点
  let {
    entrypoint
  } = imageConfigs || { entrypoint: '' }
  entrypoint = entrypoint && entrypoint.join(' ')
  // if (command && command !== entrypoint) {

  if (commandKeys && commandKeys.length && isRemoveCommand !== true) {
    deployment.addContainerCommand(serviceName, commandKeys.map(item => {
      if (item && !item._delete) {
        return getCommand(fieldsValues['command' + item.key])
      }
    }).filter(i => !!i))
  }
  // 设置启动命令
  // if ((argsType && argsType !== 'default') && argsKeys) {
  // 模板需要将默认启动命令添加进去
  if (argsType === 'DIY' && argsKeys) {
    const args = []
    argsKeys.forEach(key => {
      if (!key.deleted) {
        args.push(fieldsValues[`args${key.value}`])
      }
    })
    deployment.addContainerArgs(serviceName, args)
  }
  // else if (argsType === 'default' && defaultArgsKeys) {
  //   const args = []
  //   defaultArgsKeys.forEach(key => {
  //     args.push(fieldsValues[`args${key.value}_default`])
  //   })
  //   deployment.addContainerArgs(serviceName, args)
  // }

  // 设置重新部署
  deployment.setContainerImagePullPolicy(serviceName, imagePullPolicy)
  // 设置时区
  if (timeZone) {
    deployment.syncTimeZoneWithNode(serviceName)
  }
  // eslint-disable-next-line camelcase
  if (post_start && postKeys) {
    deployment.addPostStart(serviceName, postKeys.filter(item => !item.deleted).map(item =>
      fieldsValues[`postcmd_${item.value}`]
    ))
  }
  // eslint-disable-next-line camelcase
  if (pre_stop && preKeys) {
    deployment.addPreStop(serviceName, preKeys.filter(item => !item.deleted).map(item =>
      fieldsValues[`precmd_${item.value}`]
    ))
  }
  if (tty) {
    deployment.addTTY(serviceName, tty)
  }
  if (stdin) {
    deployment.addStdin(serviceName, stdin)
  }

  // 特权容器
  deployment.setContainerPrivileged(serviceName, privileged || false)
  // fsGroup, runAsUser
  runAsUser && deployment.setSecurityContext({ runAsUser: Number(runAsUser) })
  fsGroup && deployment.setSecurityContext({ fsGroup: Number(fsGroup) })

  // 设置日志采集
  if (sourceType === 'directory') {
    const item = {
      path
    }
    if (inregex) {
      const reg = new RegExp(inregex)
      item.inregex = reg.toString()
    }
    if (exregex) {
      const reg = new RegExp(exregex)
      item.exregex = reg.toString()
    }
    if (name) {
      item.name = name
    } else {
      const name = 'volumename' + (Math.random() * 10000).toFixed(0)
      item.name = name
    }
    deployment.setCollectLog(serviceName, item)
  }
  // 设置高可用
  if (readinessProtocol && readinessProtocol !== 'none') {
    // set readiness
    const readinessProbe = {
      port: readinessPort && parseInt(readinessPort),
      execCommand: readinessExecCommand && readinessExecCommand,
      path: readinessPath,
      initialDelaySeconds: parseInt(readinessInitialDelaySeconds),
      timeoutSeconds: parseInt(readinessTimeoutSeconds),
      periodSeconds: parseInt(readinessPeriodSeconds),
      successThreshold: parseInt(readinessSuccessThreshold),
      failureThreshold: parseInt(readinessFailureThreshold)
    }
    deployment.setReadinessProbe(serviceName, readinessProtocol, readinessProbe)
    // set liveness use readiness config
    if (useReadinessConfig) {
      const livenessProbe = {
        ...readinessProbe,
        successThreshold: 1 // livenessSuccessThreshold of liveness must be 1
      }
      deployment.setLivenessProbe(serviceName, readinessProtocol, livenessProbe)
    }
  }
  deployment.setAnnotations({
    useReadinessConfig: JSON.stringify(!!useReadinessConfig)
  })
  // set liveness use own config
  if (livenessProtocol && livenessProtocol !== 'none' && !useReadinessConfig) {
    const livenessProbe = {
      port: livenessPort && parseInt(livenessPort),
      execCommand: livenessExecCommand && livenessExecCommand,
      path: livenessPath,
      initialDelaySeconds: parseInt(livenessInitialDelaySeconds),
      timeoutSeconds: parseInt(livenessTimeoutSeconds),
      periodSeconds: parseInt(livenessPeriodSeconds),
      successThreshold: 1, // livenessSuccessThreshold of liveness must be 1
      failureThreshold: parseInt(livenessFailureThreshold)
    }
    deployment.setLivenessProbe(serviceName, livenessProtocol, livenessProbe)
  }
  // 设置环境变量
  const {
    defaultEnv
  } = imageConfigs || { defaultEnv: '' }
  if (envKeys) {
    const envObj = {}
    defaultEnv && defaultEnv.forEach(env => {
      const [key, ...value] = env.split('=')
      envObj[key] = value.join('=')
    })
    envKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const envName = fieldsValues[`envName${keyValue}`]
        const envValueType = fieldsValues[`envValueType${keyValue}`]
        const envValue = fieldsValues[`envValue${keyValue}`] || '' // 环境变量值可以为空
        if (envName && envValue !== envObj[envName]) {
          if (envValueType === 'secret') {
            const valueFrom = {
              secretKeyRef: {
                name: envValue[0],
                key: envValue[1]
              }
            }
            deployment.addContainerEnv(serviceName, envName, null, valueFrom)
          } else if (envValueType === 'config') {
            const valueFrom = {
              configMapKeyRef: {
                name: envValue[0],
                key: envValue[1]
              }
            }
            deployment.addContainerEnv(serviceName, envName, null, valueFrom)
          } else if (envValueType === 'Podkey') {
            const valueFrom = {
              fieldRef: {
                fieldPath: PodKeyMapping[envValue]
              }
            }
            deployment.addContainerEnv(serviceName, envName, null, valueFrom)
          } else {
            deployment.addContainerEnv(serviceName, envName, envValue)
          }
        }
      }
    })
  }

  // 设置普通配置目录
  const wholeDir = {}
  if (configMapKeys) {
    const volumes = {}
    configMapKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const configMapMountPath = fieldsValues[`configMapMountPath${keyValue}`]
        const configMapIsWholeDir = fieldsValues[`configMapIsWholeDir${keyValue}`]
        const configGroupName = fieldsValues[`configGroupName${keyValue}`]
        const configMapSubPathValues = fieldsValues[`configMapSubPathValues${keyValue}`]
        let volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
        if (Array.isArray(configGroupName)) {
          if (configGroupName[0] !== Vue.prototype.$tForJs('ServiceConfig.Service.groupsWithoutClass')) {
            if (isTemplate && !isTemplateDeploy) {
              volumeName = `${configGroupName[0]}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
            } else {
              // 创建应用时，不能有中文
              volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
            }
          }
        } else {
          volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
        }
        const configMapName = Array.isArray(configGroupName) ? configGroupName[1] : configGroupName
        // 如果是已添加过的 volume，则使用原来的 name
        if (volumes[configMapName]) {
          volumeName = volumes[configMapName].volume.name
        }
        const volume = {
          name: volumeName,
          configMap: {
            name: configMapName,
            items: configMapSubPathValues.map(value => {
              return {
                key: value,
                path: value
              }
            })
          }
        }
        const volumeMounts = []
        if (configMapIsWholeDir) {
          Object.assign(wholeDir, {
            [volumeName]: true
          })
          volumeMounts.push({
            mountPath: configMapMountPath
          })
        } else {
          Object.assign(wholeDir, {
            [volumeName]: false
          })
          configMapSubPathValues.map(value => {
            volumeMounts.push({
              name: volumeName,
              mountPath: configMapMountPath +
              (configMapMountPath.endsWith('/') ? '' : '/') + value,
              subPath: value
            })
          })
        }
        volumes[configMapName] = {
          volume, volumeMounts
        }
        deployment.addContainerVolume(serviceName, volume, volumeMounts, configMapIsWholeDir)
      }
    })
  }

  // 设置升级策略
  setStrategyValue(
    deployment,
    UpgradeStrategyKind,
    USInstanceNumber,
    updateIntervals,
    maxNewNumber,
    maxNoUseNumber,
    replicas
  )
  // 设置加密配置目录
  if (secretConfigMapKeys) {
    secretConfigMapKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const secretConfigMapMountPath = fieldsValues[`secretConfigMapMountPath${keyValue}`]
        const secretConfigMapIsWholeDir = fieldsValues[`secretConfigMapIsWholeDir${keyValue}`]
        const secretConfigGroupName = fieldsValues[`secretConfigGroupName${keyValue}`]
        const secretConfigMapSubPathValues = fieldsValues[`secretConfigMapSubPathValues${keyValue}`]
        const volume = {
          name: `secret-volume-${keyValue}`,
          secret: {
            secretName: secretConfigGroupName
          }
        }
        Object.assign(wholeDir, {
          [volume.name]: secretConfigMapIsWholeDir
        })
        volume.secret.items = (secretConfigMapSubPathValues || []).map(value => {
          return {
            key: value,
            path: value
          }
        })
        const volumeMounts = []
        volumeMounts.push({
          name: `secret-volume-${keyValue}`,
          mountPath: secretConfigMapMountPath,
          readOnly: true
        })
        deployment.addContainerVolume(serviceName, volume, volumeMounts, true)
      }
    })
  }
  if (!isEmpty(wholeDir) && isTemplate && !isTemplateDeploy) {
    deployment.setAnnotations({
      wholeDir: JSON.stringify(wholeDir)
    })
  }
  // 设置 ServiceAccount
  deployment.setSA(ServiceAccount)
  // 更改3：增加链路跟踪
  if (systemTracing) {
    deployment.metadata.labels['system/tracing'] = 'opentelemetry'
    deployment.metadata.labels['system/tenant'] = tenantId
    deployment.metadata.labels.app = appName

    deployment.spec.template.metadata.labels['system/tracing'] = 'opentelemetry'
    deployment.spec.template.metadata.labels['system/tenant'] = tenantId
    deployment.spec.template.metadata.labels.app = appName

    let str = ''
    deployment.spec.template.spec.containers.map(item => {
      str += item.name + ','
    })
    str = str.slice(0, -1)
    deployment.spec.template.metadata.annotations['ipaas.io/otel-agent-containers'] = str
  }
  // 增加npu

  let npu
  if (resourceAlgorithm === NPU_ALGORITHM) {
    const intPattern = /\d+/
    const intMatch = npuConfig.chipModel?.match(intPattern)
    const npuInfo = Object.assign(npuConfig, {
      chipModelNum: intMatch?.[0],
      npuLimits: NPULimits
    })
    if (customNpuType === 'train') {
      npu = new NpuTrain(serviceName, npuInfo)
    }
    deployment.setNpu(customNpuType, npuInfo, serviceName)
  }
  if (EnableCustomMonitorScraping) {
    deployment.setAnnotations({
      'prometheus.io/port': prometheusPort + '',
      'prometheus.io/path': prometheusPath,
      'prometheus.io/scrape': 'true',
      'prometheus.io/scheme': prometheusScheme

    })
  } else {
    deployment.setAnnotations({
      'prometheus.io/scrape': 'false'
    })
  }
  return { deployment, service, storage, npu }
}
export function buildJson (fields, cluster, loginUser, imageConfigs, isTemplate, isTemplateDeploy, location) {
  const fieldsValues = fields
  // 获取各字段值
  const {
    appName, // 应用名称
    serviceName, // 服务名称
    systemRegistry, // 镜像服务类型
    imageUrl, // 镜像地址
    appPkgID, // 应用包
    imageTag, // 镜像版本
    apm, // 是否开通 APM
    bindNode, // 绑定节点
    imageTagOS, // 绑定节点 OS
    imageTagArch, // 绑定节点 Arch
    bindNodeType, // 绑定节点类型
    bindLabel, // 主机标签绑定
    resourceAlgorithm, // 容器配置算法 one of [X86, GPU]
    GPULimits, // GPU limits 数量
    resourceType, // 容器配置
    DIYMemory, // 自定义配置-内存
    DIYCPU, // 自定义配置-CPU
    DIYMaxMemory, // 自定义配置-最大内存
    DIYMaxCPU, // 自定义配置-最大CPU
    serviceType, // 服务类型(有状态, 无状态)
    storageType, // 存储类型(rbd, hostPath)
    storageList, // 存储的配置列表
    // storageKeys, // 存储的 keys(数组)
    replicas, // 实例数量
    hostname,
    aliasesKeys, // hostname 别名 key
    subdomain, // 子域名
    accessType, // 是否为负载均衡
    agentType, // 集群内/外 方式
    accessMethod, // 访问方式
    publicNetwork, // 公网出口
    internaletwork, // 内网出口
    portsKeys, // 端口的 keys(数组)
    loadBalance,
    lbKeys, // 访问方式为负载均衡时的端口(数组)
    tcpKeys,
    udpKeys,
    argsType,
    commandKeys, // 进入点 keys
    isRemoveCommand, // 进入点 未修改则 remove
    argsKeys, // 启动命令的 keys(数组) 非默认
    defaultArgsKeys, // 启动命令的 keys(数组) 默认
    imagePullPolicy, // 重新部署时拉取镜像的方式(Always, IfNotPresent)
    timeZone, // 时区设置
    sourceType, // 日志采集-来源类型
    name, // 日志采集
    path, // 日志采集-日志目录
    inregex, // 日志采集-采集规则
    exregex, // 日志采集-排除规则
    readinessProtocol, // 高可用-就绪状态-协议类型
    readinessPort, // 高可用-就绪状态-端口
    readinessExecCommand, // 高可用-就绪状态-执行命令
    readinessInitialDelaySeconds, // 高可用-就绪状态-首次检查延时
    readinessTimeoutSeconds, // 高可用-就绪状态-检查超时
    readinessPeriodSeconds, // 高可用-就绪状态-检查间隔
    readinessPath, // 高可用-就绪状态-Path 路径
    readinessSuccessThreshold, // 高可用-就绪状态-健康阈值
    readinessFailureThreshold, // 高可用-就绪状态-不健康阈值
    useReadinessConfig, // 高可用-就绪状态配置是否使用存活状态相同的配置
    livenessProtocol, // 高可用-存活状态-协议类型
    livenessPort, // 高可用-存活状态-端口
    livenessExecCommand, // 高可用-存活状态-执行命令
    livenessInitialDelaySeconds, // 高可用-存活状态-首次检查延时
    livenessTimeoutSeconds, // 高可用-存活状态-检查超时
    livenessPeriodSeconds, // 高可用-存活状态-检查间隔
    livenessPath, // 高可用-存活状态-Path 路径
    livenessSuccessThreshold, // 高可用-存活状态-健康阈值
    livenessFailureThreshold, // 高可用-存活状态-不健康阈值
    envKeys, // 环境变量的 keys(数组)
    configMapKeys, // 普通配置目录的 keys(数组)
    secretConfigMapKeys, // 加密配置目录的 keys(数组)
    serviceTag, // 服务与节点 标签
    serviceBottomTag, // 服务与服务 标签
    advanceSet, // 服务与服务 高级设置
    modelSet, // 模型集
    serviceMesh, // 服务网格
    replicasCheck, // 实例数量/固定IP(calico)
    ipPool, // IP Pool (calico)
    ipAssignment, // IP Pool (macvlan)
    isStaticIP, // macvlan 固定ip
    flowSliderCheck, // 流量控制
    flowSliderInput,
    flowSliderOut,
    postKeys, // post start keys
    preKeys, // pre stop keys
    // eslint-disable-next-line camelcase
    post_start,
    // eslint-disable-next-line camelcase
    pre_stop,
    tty, // tty
    stdin, // stdin
    UpgradeStrategyKind,
    USInstanceNumber,
    updateIntervals,
    maxNewNumber,
    maxNoUseNumber,
    privileged, // 特权容器
    runAsUser, // runAsUser
    fsGroup, // fsGroup
    ServiceAccount, // 服务账户
    systemRegistryID // 第三方harbor
  } = fieldsValues
  const MOUNT_PATH = 'mountPath' // 容器目录
  const VOLUME = 'volume' // 存储卷(rbd)
  const READ_ONLY = 'readOnly' // 只读(rbd)
  const HOST_PATH = 'hostPath' // 本地目录(hostPath)
  const PORT = 'port' // 端口
  const PORT_PROTOCOL = 'portProtocol' // 端口协议(HTTP, TCP)
  const MAPPING_PORTTYPE = 'mappingPortType' // 映射服务端口类型(auto, special)
  const MAPPING_PORT = 'mappingPort' // 映射服务端口
  const MAPPING_PROTOCOL = 'mappingProtocol' // 映射服务端口协议
  const deployment = new Deployment(serviceName)
  // set annotation => system/registry = dockerhub
  deployment.setAnnotations({
    'system/registry': systemRegistry
  })
  // 设置应用包appPkgID
  if (isTemplate && appPkgID) {
    deployment.setAnnotations({
      appPkgID
    })
  }
  if (systemRegistryID) {
    deployment.setAnnotations({
      'system/registryID': systemRegistryID
    })
  }
  // 设置流量控制
  if (flowSliderCheck === true) {
    deployment.setAnnotations({
      [flowContainerIN]: flowSliderInput + 'M',
      [flowContainerOut]: flowSliderOut + 'M'
    })
  }
  if (isTemplate && !isTemplateDeploy && location.query.other) {
    deployment.setAnnotations({
      [OTHER_IMAGE]: location.query.other
    })
  }
  if (modelSet) {
    deployment.metadata.labels['tensorflow/model-serving-app'] = ''
    deployment.setAnnotations({ 'tensorflow/modelset-name': modelSet })
  }
  // 设置镜像地址
  deployment.addContainer(serviceName, `${imageUrl}:${imageTag}`)
  // 设置 APM
  if (apm) {
    deployment.setApmServiceLabel('pinpoint')
  }
  // 设置服务网格
  if (!serviceMesh) {
    deployment.setAnnotations({ 'sidecar.istio.io/inject': 'false' })
    deployment.setMetaAnnotations({ 'sidecar.istio.io/inject': 'false' })
  }
  if (imageTagOS) {
    deployment.setAnnotations({ imagetag_os: imageTagOS })
    deployment.setNodeSelector({ os: imageTagOS })
  }
  if (imageTagArch) {
    deployment.setAnnotations({ imagetag_arch: imageTagArch })
  }
  // 设置绑定节点
  if (bindNodeType === 'default') {
    deployment.setServiceNodeLabel(serviceTag)
  }
  if (bindNodeType === 'hostname') {
    if (bindNode !== SYSTEM_DEFAULT_SCHEDULE) {
      deployment.setNodeSelector({ hostname: bindNode })
    } else {
      deployment.setServiceNodeLabel(serviceTag)
    }
  } else if (bindNodeType === 'hostlabel') {
    // 设置主机标签绑定节点
    // deployment.setLabelSelector(bindLabel)

    // 设置服务 标签
    deployment.setServicePointSelector(serviceTag)
    deployment.setServicePodSelector(serviceBottomTag, advanceSet, serviceName)
  }
  // 设置资源
  const { cpu, memory, limitCpu, limitMemory } = getResourceByMemory(resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU)
  const paramsArray = [serviceName, memory, cpu, limitMemory, limitCpu]
  if (resourceAlgorithm === GPU_ALGORITHM) {
    paramsArray.push(GPULimits)
  }
  deployment.setContainerResources.apply(deployment, paramsArray)
  // 服务类型&存储
  const storage = []
  if (serviceType) {
    const storageForTemplate = []
    storageList.forEach((item, index) => {
      // volume
      const volume = {
        name: `volume-${index}`
      }
      let {
        type, mountPath, strategy,
        readOnly, name, volumeIsOld,
        size, fsType, storageClassName,
        // eslint-disable-next-line camelcase
        hostPath, type_1
      } = item
      // @Todo: reclaimPolicy??
      if (type === 'host') {
        const volumeMounts = [{
          mountPath,
          readOnly
        }]
        volume.hostPath = {
          path: hostPath
        }
        if (isTemplate) {
          const volumeObj = {
            name: `${type}-${volume.name}`,
            storageClassName: `${type}-storage`,
            mountPath,
            hostPath,
            readOnly,
            type_1,
            isTemplate: true
          }
          // 模版更新和部署只在annotations中添加自动创建的的存储
          if (item.volume === 'create') {
            storageForTemplate.push(volumeObj)
          }
          deployment.setAnnotations({
            'system/template': JSON.stringify(storageForTemplate)
          })
        }
        deployment.addContainerVolumeV2(serviceName, volume, volumeMounts)
      } else {
        let volumeInfo = item.volume
        let image
        if (volumeInfo === 'create') {
          image = name
          const persistentVolumeClaim = new PersistentVolumeClaim({
            name,
            storageType: type === 'private'
              ? (() => {
                  // eslint-disable-next-line camelcase
                  if (type_1 === 'rbd') {
                    return 'ceph'
                  }
                  // eslint-disable-next-line camelcase
                  return type_1
                })()
              : 'nfs',
            storageClassName,
            fsType,
            storage: size ? `${size}Mi` : '512Mi'
          })
          storage.push(persistentVolumeClaim)
        } else {
          volumeInfo = volumeInfo.split(' ')
          image = volumeInfo[0]
          fsType = volumeInfo[1]
        }
        const volumeMounts = [{
          mountPath,
          readOnly
        }]
        if (volumeIsOld) {
          volume.image = image
          volume.fsType = fsType
          deployment.addContainerVolume(serviceName, volume, volumeMounts)
        } else {
          volume.persistentVolumeClaim = {
            claimName: image,
            readOnly
          }
          if (isTemplate) {
            // delete volume.persistentVolumeClaim.claimName
            const storageType = type === 'private'
              ? (() => {
                  // eslint-disable-next-line camelcase
                  if (type_1 === 'rbd') {
                    return 'ceph'
                  }
                  // eslint-disable-next-line camelcase
                  return type_1
                })()
              : 'nfs'
            volume.name = `${storageType}-volume-${index}`
            const volumeObj = {
              name: volume.name,
              storageClassName,
              mountPath,
              readOnly,
              type_1,
              isTemplate: true
            }
            if (type === 'private') {
              Object.assign(volumeObj, {
                fsType,
                storage: size ? `${size}Mi` : '512Mi'
              })
            }
            if (volumeInfo === 'create') {
              storageForTemplate.push(volumeObj)
            }
          }
          deployment.addContainerVolumeV2(serviceName, volume, volumeMounts)
        }
        if (isTemplate) {
          deployment.setAnnotations({
            'system/template': JSON.stringify(storageForTemplate)
          })
        }
      }
      /* if (storageType == 'rbd') {
        let volumeInfo = fieldsValues[`${VOLUME}${key}`]
        volumeInfo = volumeInfo.split(' ')
        volume.image = volumeInfo[0]
        volume.fsType = volumeInfo[1]
      } else if (storageType == 'hostPath') {
        const hostPath = fieldsValues[`${HOST_PATH}${key}`]
        volume.hostPath = {
          path: hostPath,
        }
      } */
    })
  }

  // 设置实例数量
  deployment.setReplicas(replicas)
  // 设置 IP Pool (calico)
  if (ipPool) {
    let key = 'cni.projectcalico.org/ipv4pools'
    if (isCidr(ipPool, 'v6')) key = 'cni.projectcalico.org/ipv6pools'
    deployment.setAnnotations({
      [key]: `["${ipPool}"]`
    })
  }

  // 设置 IP Pool (macvlan)
  if (ipAssignment) {
    deployment.setAnnotations({
      'system/ip-assignment-name': ipAssignment
    })
  }

  // 设置固定 IP (calico)
  if (replicasCheck) {
    const { ipKeys } = fieldsValues
    const replicasIPArr = []
    ipKeys.forEach(item => {
      replicasIPArr.push(fieldsValues[`replicasIP${item}`])
    })
    const replicasIPStr = JSON.stringify(replicasIPArr)
    deployment.setAnnotations({
      'cni.projectcalico.org/ipAddrs': replicasIPStr
    })
  }

  // macvlan 固定ip
  if (isStaticIP) {
    const { ipKeys } = fieldsValues
    let ipStr = ''
    ipKeys.forEach(item => {
      ipStr = ipStr + fieldsValues[`replicasIP${item}`] + ','
    })
    ipStr = ipStr.substring(0, ipStr.length - 1)
    deployment.setMetaAnnotations({
      'system/reserved-ips': ipStr
    })
  }

  // 设置 hostname 和 subdomain
  deployment.setHostnameAndSubdomain(hostname, subdomain)
  // 设置 hostname aliases
  if (!isEmpty(aliasesKeys)) {
    const hostAliases = []
    aliasesKeys.forEach(key => {
      const ip = fieldsValues[`ipHost-${key}`]
      const hostnames = [fieldsValues[`hostAliases-${key}`]]
      hostAliases.push({
        ip,
        hostnames
      })
    })
    deployment.setHostAliases(hostAliases)
  }
  // 设置端口
  const service = new Service(serviceName, cluster)
  const { proxyType } = loginUser
  // 设置访问方式
  let groupID = 'none'
  // 模板访问方式
  let templateGroup = 'none'
  switch (accessMethod) {
    case 'PublicNetwork': groupID = publicNetwork; templateGroup = 'PublicNetwork'; break
    case 'InternalNetwork': groupID = internaletwork; templateGroup = 'InternalNetwork'; break
    case 'Cluster':
    default:
      groupID = 'none'; templateGroup = 'Cluster'; break
  }
  if (isTemplate) {
    // 设置访问方式类型
    deployment.setAnnotations({
      accessType
    })
  }
  if (!serviceMesh) {
    if (accessType === 'loadBalance') {
      // 访问方式为负载均衡

      // 设置负载均衡方式
      deployment.setAnnotations({
        agentType,
        loadBalance
      })
      !isEmpty(lbKeys) && lbKeys.forEach(key => {
        const port = parseInt(fieldsValues[`${PORT}-${key}`])
        const name = `${serviceName}-${key}`
        deployment.addContainerPort(serviceName, port)
        service.addPort(proxyType, name, 'HTTP', port, port)
      })
      const tcpIngressArray = []
      !isEmpty(tcpKeys) && tcpKeys.forEach(key => {
        const port = parseInt(fieldsValues[`tcp-servicePort-${key}`])
        const exportPort = parseInt(fieldsValues[`tcp-exportPort-${key}`])
        const name = `${serviceName}-${key}`
        deployment.addContainerPort(serviceName, port)
        service.addPort(proxyType, name, 'TCP', port, port)
        // tcp 和 upd 监听器放入 annotations 用于回显
        if (isTemplate) {
          tcpIngressArray.push({
            servicePort: port,
            exportPort
          })
        }
      })
      if (!isEmpty(tcpIngressArray)) {
        deployment.setAnnotations({
          tcpIngress: JSON.stringify(tcpIngressArray)
        })
      }
      const udpIngressArray = []
      !isEmpty(udpKeys) && udpKeys.forEach(key => {
        const port = parseInt(fieldsValues[`udp-servicePort-${key}`])
        const exportPort = parseInt(fieldsValues[`udp-exportPort-${key}`])
        const name = `${serviceName}-${key}`
        deployment.addContainerPort(serviceName, port, 'UDP')
        service.addPort(proxyType, name, 'UDP', port, port)
        if (isTemplate) {
          udpIngressArray.push({
            servicePort: port,
            exportPort
          })
        }
      })
      if (!isEmpty(udpIngressArray)) {
        deployment.setAnnotations({
          udpIngress: JSON.stringify(udpIngressArray)
        })
      }
      // 默认访问方式 集群内
      service.addLBGroupAnnotation('none')
    } else {
      if (isTemplate && !isTemplateDeploy) {
        service.addLBGroupAnnotation(templateGroup)
      } else {
        service.addLBGroupAnnotation(groupID)
      }
      portsKeys && portsKeys.forEach(key => {
        if (key.deleted) {
          return
        }
        const keyValue = key.value
        const port = fieldsValues[`${PORT}${keyValue}`]
        const portProtocol = fieldsValues[`${PORT_PROTOCOL}${keyValue}`]
        const name = `${serviceName}-${keyValue}`
        const mappingPort = fieldsValues[`${MAPPING_PORT}${keyValue}`] || ''
        const mappingProtocol = fieldsValues[`${MAPPING_PROTOCOL}${keyValue}`]
        const mappingPortType = fieldsValues[`${MAPPING_PORTTYPE}${keyValue}`]
        service.addPort(proxyType, name, portProtocol, port, port, mappingPort, mappingProtocol)
        if (groupID !== 'none' && !!mappingProtocol) {
          // No need to expose ports if network mode is 'none'
          if (mappingPortType === 'special') {
            service.addPortAnnotation(name, mappingProtocol, mappingPort)
          } else {
            service.addPortAnnotation(name, mappingProtocol)
          }
        }
        deployment.addContainerPort(serviceName, port, portProtocol)
      })
    }
  } else {
    portsKeys && portsKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      const port = fieldsValues[`${PORT}${keyValue}`]
      const portProtocol = fieldsValues[`${PORT_PROTOCOL}${keyValue}`]
      const name = `${serviceName}-${keyValue}`
      service.addPort(proxyType, name, portProtocol, port, port)
      deployment.addContainerPort(serviceName, port, portProtocol)
    })
  }
  // 设置进入点
  let {
    entrypoint
  } = imageConfigs || { entrypoint: '' }
  entrypoint = entrypoint && entrypoint.join(' ')
  // if (command && command !== entrypoint) {

  if (commandKeys && commandKeys.length && isRemoveCommand !== true) {
    deployment.addContainerCommand(serviceName, commandKeys.map(item => {
      if (item && !item._delete) {
        return getCommand(fieldsValues['command' + item.key])
      }
    }).filter(i => !!i))
  }
  // 设置启动命令
  // if ((argsType && argsType !== 'default') && argsKeys) {
  // 模板需要将默认启动命令添加进去
  if (argsType === 'DIY' && argsKeys) {
    const args = []
    argsKeys.forEach(key => {
      if (!key.deleted) {
        args.push(fieldsValues[`args${key.value}`])
      }
    })
    deployment.addContainerArgs(serviceName, args)
  }
  // else if (argsType === 'default' && defaultArgsKeys) {
  //   const args = []
  //   defaultArgsKeys.forEach(key => {
  //     args.push(fieldsValues[`args${key.value}_default`])
  //   })
  //   deployment.addContainerArgs(serviceName, args)
  // }

  // 设置重新部署
  deployment.setContainerImagePullPolicy(serviceName, imagePullPolicy)
  // 设置时区
  if (timeZone) {
    deployment.syncTimeZoneWithNode(serviceName)
  }
  // eslint-disable-next-line camelcase
  if (post_start && postKeys) {
    deployment.addPostStart(serviceName, postKeys.filter(item => !item.deleted).map(item =>
      fieldsValues[`postcmd_${item.value}`]
    ))
  }
  // eslint-disable-next-line camelcase
  if (pre_stop && preKeys) {
    deployment.addPreStop(serviceName, preKeys.filter(item => !item.deleted).map(item =>
      fieldsValues[`precmd_${item.value}`]
    ))
  }
  if (tty) {
    deployment.addTTY(serviceName, tty)
  }
  if (stdin) {
    deployment.addStdin(serviceName, stdin)
  }

  // 特权容器
  deployment.setContainerPrivileged(serviceName, privileged || false)
  // fsGroup, runAsUser
  runAsUser && deployment.setSecurityContext({ runAsUser: Number(runAsUser) })
  fsGroup && deployment.setSecurityContext({ fsGroup: Number(fsGroup) })

  // 设置日志采集
  if (sourceType === 'directory') {
    const item = {
      path
    }
    if (inregex) {
      const reg = new RegExp(inregex)
      item.inregex = reg.toString()
    }
    if (exregex) {
      const reg = new RegExp(exregex)
      item.exregex = reg.toString()
    }
    if (name) {
      item.name = name
    } else {
      const name = 'volumename' + (Math.random() * 10000).toFixed(0)
      item.name = name
    }
    deployment.setCollectLog(serviceName, item)
  }
  // 设置高可用
  if (readinessProtocol && readinessProtocol !== 'none') {
    // set readiness
    const readinessProbe = {
      port: readinessPort && parseInt(readinessPort),
      execCommand: readinessExecCommand && readinessExecCommand,
      path: readinessPath,
      initialDelaySeconds: parseInt(readinessInitialDelaySeconds),
      timeoutSeconds: parseInt(readinessTimeoutSeconds),
      periodSeconds: parseInt(readinessPeriodSeconds),
      successThreshold: parseInt(readinessSuccessThreshold),
      failureThreshold: parseInt(readinessFailureThreshold)
    }
    deployment.setReadinessProbe(serviceName, readinessProtocol, readinessProbe)
    // set liveness use readiness config
    if (useReadinessConfig) {
      const livenessProbe = {
        ...readinessProbe,
        successThreshold: 1 // livenessSuccessThreshold of liveness must be 1
      }
      deployment.setLivenessProbe(serviceName, readinessProtocol, livenessProbe)
    }
  }
  deployment.setAnnotations({
    useReadinessConfig: JSON.stringify(!!useReadinessConfig)
  })
  // set liveness use own config
  if (livenessProtocol && livenessProtocol !== 'none' && !useReadinessConfig) {
    const livenessProbe = {
      port: livenessPort && parseInt(livenessPort),
      execCommand: livenessExecCommand && livenessExecCommand,
      path: livenessPath,
      initialDelaySeconds: parseInt(livenessInitialDelaySeconds),
      timeoutSeconds: parseInt(livenessTimeoutSeconds),
      periodSeconds: parseInt(livenessPeriodSeconds),
      successThreshold: 1, // livenessSuccessThreshold of liveness must be 1
      failureThreshold: parseInt(livenessFailureThreshold)
    }
    deployment.setLivenessProbe(serviceName, livenessProtocol, livenessProbe)
  }
  // 设置环境变量
  const {
    defaultEnv
  } = imageConfigs || { defaultEnv: '' }
  if (envKeys) {
    const envObj = {}
    defaultEnv && defaultEnv.forEach(env => {
      const [key, ...value] = env.split('=')
      envObj[key] = value.join('=')
    })
    envKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const envName = fieldsValues[`envName${keyValue}`]
        const envValueType = fieldsValues[`envValueType${keyValue}`]
        const envValue = fieldsValues[`envValue${keyValue}`] || '' // 环境变量值可以为空
        if (envName && envValue !== envObj[envName]) {
          if (envValueType === 'secret') {
            const valueFrom = {
              secretKeyRef: {
                name: envValue[0],
                key: envValue[1]
              }
            }
            deployment.addContainerEnv(serviceName, envName, null, valueFrom)
          } else if (envValueType === 'config') {
            const valueFrom = {
              configMapKeyRef: {
                name: envValue[0],
                key: envValue[1]
              }
            }
            deployment.addContainerEnv(serviceName, envName, null, valueFrom)
          } else if (envValueType === 'Podkey') {
            const valueFrom = {
              fieldRef: {
                fieldPath: PodKeyMapping[envValue]
              }
            }
            deployment.addContainerEnv(serviceName, envName, null, valueFrom)
          } else {
            deployment.addContainerEnv(serviceName, envName, envValue)
          }
        }
      }
    })
  }

  // 设置普通配置目录
  const wholeDir = {}
  if (configMapKeys) {
    const volumes = {}
    configMapKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const configMapMountPath = fieldsValues[`configMapMountPath${keyValue}`]
        const configMapIsWholeDir = fieldsValues[`configMapIsWholeDir${keyValue}`]
        const configGroupName = fieldsValues[`configGroupName${keyValue}`]
        const configMapSubPathValues = fieldsValues[`configMapSubPathValues${keyValue}`]
        let volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
        if (Array.isArray(configGroupName)) {
          if (configGroupName[0] !== Vue.prototype.$tForJs('ServiceConfig.Service.groupsWithoutClass')) {
            if (isTemplate && !isTemplateDeploy) {
              volumeName = `${configGroupName[0]}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
            } else {
              // 创建应用时，不能有中文
              volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
            }
          }
        } else {
          volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
        }
        const configMapName = Array.isArray(configGroupName) ? configGroupName[1] : configGroupName
        // 如果是已添加过的 volume，则使用原来的 name
        if (volumes[configMapName]) {
          volumeName = volumes[configMapName].volume.name
        }
        const volume = {
          name: volumeName,
          configMap: {
            name: configMapName,
            items: configMapSubPathValues.map(value => {
              return {
                key: value,
                path: value
              }
            })
          }
        }
        const volumeMounts = []
        if (configMapIsWholeDir) {
          Object.assign(wholeDir, {
            [volumeName]: true
          })
          volumeMounts.push({
            mountPath: configMapMountPath
          })
        } else {
          Object.assign(wholeDir, {
            [volumeName]: false
          })
          configMapSubPathValues.map(value => {
            volumeMounts.push({
              name: volumeName,
              mountPath: configMapMountPath +
              (configMapMountPath.endsWith('/') ? '' : '/') + value,
              subPath: value
            })
          })
        }
        volumes[configMapName] = {
          volume, volumeMounts
        }
        deployment.addContainerVolume(serviceName, volume, volumeMounts, configMapIsWholeDir)
      }
    })
  }

  // 设置升级策略
  setStrategyValue(
    deployment,
    UpgradeStrategyKind,
    USInstanceNumber,
    updateIntervals,
    maxNewNumber,
    maxNoUseNumber,
    replicas
  )
  // 设置加密配置目录
  if (secretConfigMapKeys) {
    secretConfigMapKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const secretConfigMapMountPath = fieldsValues[`secretConfigMapMountPath${keyValue}`]
        const secretConfigMapIsWholeDir = fieldsValues[`secretConfigMapIsWholeDir${keyValue}`]
        const secretConfigGroupName = fieldsValues[`secretConfigGroupName${keyValue}`]
        const secretConfigMapSubPathValues = fieldsValues[`secretConfigMapSubPathValues${keyValue}`]
        const volume = {
          name: `secret-volume-${keyValue}`,
          secret: {
            secretName: secretConfigGroupName
          }
        }
        Object.assign(wholeDir, {
          [volume.name]: secretConfigMapIsWholeDir
        })
        volume.secret.items = (secretConfigMapSubPathValues || []).map(value => {
          return {
            key: value,
            path: value
          }
        })
        const volumeMounts = []
        volumeMounts.push({
          name: `secret-volume-${keyValue}`,
          mountPath: secretConfigMapMountPath,
          readOnly: true
        })
        deployment.addContainerVolume(serviceName, volume, volumeMounts, true)
      }
    })
  }
  if (!isEmpty(wholeDir) && isTemplate && !isTemplateDeploy) {
    deployment.setAnnotations({
      wholeDir: JSON.stringify(wholeDir)
    })
  }
  // 设置 ServiceAccount
  deployment.setSA(ServiceAccount)
  return { deployment, service, storage }
}
// 根据表单数据设升级策略值
export function setStrategyValue (
  deployment,
  UpgradeStrategyKind,
  USInstanceNumber,
  updateIntervals,
  maxNewNumber,
  maxNoUseNumber,
  replicas
) {
  deployment.addStrategyType('RollingUpdate')
  if (UpgradeStrategyKind) {
    if (UpgradeStrategyKind === 'preCreateNew') {
      deployment.addMaxunavailable(0)
      deployment.addMaxSurge(USInstanceNumber)
      deployment.addminReadySeconds(updateIntervals)
      deployment.addProgressDeadlineSeconds(calProgressDeadlineSeconds(updateIntervals, replicas, USInstanceNumber))
    } else if (UpgradeStrategyKind === 'preDeleteOld') {
      deployment.addMaxunavailable(USInstanceNumber)
      deployment.addMaxSurge(0)
      deployment.addminReadySeconds(updateIntervals)
      deployment.addProgressDeadlineSeconds(calProgressDeadlineSeconds(updateIntervals, replicas, USInstanceNumber))
    } else if (UpgradeStrategyKind === 'preDeleteOldAll') {
      deployment.addStrategyType('Recreate')
    } else if (UpgradeStrategyKind === 'customize') {
      deployment.addMaxunavailable(maxNoUseNumber)
      deployment.addMaxSurge(maxNewNumber)
      deployment.addminReadySeconds(updateIntervals)
      deployment.addProgressDeadlineSeconds(calProgressDeadlineSeconds(updateIntervals, replicas, maxNewNumber))
    }
  } else {
    // deployment.addMaxunavailable(0)
    // deployment.addMaxSurge(1)
    // deployment.addminReadySeconds(10)
    // deployment.addProgressDeadlineSeconds(calProgressDeadlineSeconds(10,replicas,1))
    deployment.addStrategyType('Recreate')
  }
  return deployment
}
// 更新时间间隔 * （副本数 / 每次更新个数 + 2） 设置progressDeadlineSeconds
const calProgressDeadlineSeconds = (updateIntervals, replicas, num) => {
  let time = updateIntervals * (parseInt(replicas / num) + 2)
  if (time < 600) { time = 600 }
  return time
}
function randomString () {
  const startCode = 'a'.charCodeAt(0)
  let randomStr = ''
  for (let i = 0; i < 5; i++) {
    randomStr += String.fromCharCode(
      Math.floor(Math.random() * 26) + startCode
    )
  }
  return randomStr
}
