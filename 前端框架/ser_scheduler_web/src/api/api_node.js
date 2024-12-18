import request from '@/utils/request'

// 获取CPU使用率数据
export function getCpuUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/cpu`,
      method: 'post',
      data: params
  })
}

// 获取内存使用率数据
export function getMemoryUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/memory`,
      method: 'post',
      data: params
  })
}

// 获取网络带宽入站使用率数据
export function getNetrxUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/networkfrx`,
      method: 'post',
      data: params
  })
}

// 获取网络带宽出站使用率数据
export function getNettxUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/networkftx`,
      method: 'post',
      data: params
  })
}

// 获取IO读使用率数据
export function getIoReadUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/ioread`,
      method: 'post',
      data: params
  })
}

// 获取IO写使用率数据
export function getIoWriteUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/iowrite`,
      method: 'post',
      data: params
  })
}

// 获取TCP使用率数据
export function getTcpUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/tcp`,
      method: 'post',
      data: params
  })
}

// 获取GPU温度数据
export function getGpuTemperatureUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/gputemperature`,
      method: 'post',
      data: params
  })
}

// 获取GPU功率数据
export function getGpuPowerUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/gpupower`,
      method: 'post',
      data: params
  })
}

// 获取GPU内存数据
export function getGpuMemoryUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/gpumemory`,
      method: 'post',
      data: params
  })
}

// 获取GPUAiCore数据
export function getGpuAiCoreUseRate(params) {
  return request({
      url: `/api/v1/cloud/MetricData/gpuaicore`,
      method: 'post',
      data: params
  })
}

// 查询百度CPU使用率
export function getBaiduCpuRate(ip) {
  return request({
      url: `/api/v1/cloud/qianfanData/cpuRate?ip=${ip}`,
      method: 'get'
  })
}

// 查询百度内存使用率
export function getBaiduMemoryTotal(node) {
  return request({
      url: `/api/v1/cloud/qianfanData/memoryTotal?node=${node}`,
      method: 'get'
  })
}

// 查询百度GPU功耗
export function getBaiduGpuPower(node) {
  return request({
      url: `/api/v1/cloud/qianfanData/gpuPower?node=${node}`,
      method: 'get'
  })
}

// 查询百度GPU温度
export function getBaiduGpuTemperature(node) {
  return request({
      url: `/api/v1/cloud/qianfanData/gpuTemperature?node=${node}`,
      method: 'get'
  })
}

// 查询百度GPU内存利用率
export function getBaiduGpuMemoryRate(ip) {
  return request({
      url: `/api/v1/cloud/qianfanData/gpuMemoryRate?ip=${ip}`,
      method: 'get'
  })
}

// 查询百度GPU AiCoreGPU利用率
export function getBaiduGpuAiCoreRate(ip) {
  return request({
      url: `/api/v1/cloud/qianfanData/gpuAiCoreRate?ip=${ip}`,
      method: 'get'
  })
}

// 查询百度GPU IO读
export function getBaiduIoDiskRead(ip) {
  return request({
      url: `/api/v1/cloud/qianfanData/ioDiskRead?ip=${ip}`,
      method: 'get'
  })
}

// 查询百度GPU IO写
export function getBaiduIoDiskWrite(ip) {
  return request({
      url: `/api/v1/cloud/qianfanData/ioDiskWrite?ip=${ip}`,
      method: 'get'
  })
}

// 查询百度GPU网络发送速率
export function getBaiduNetworkTransmit(ip) {
  return request({
      url: `/api/v1/cloud/qianfanData/networkTransmit?ip=${ip}`,
      method: 'get'
  })
}

// 查询百度GPU网络接收速率
export function getBaiduNetworkReceive(ip) {
  return request({
      url: `/api/v1/cloud/qianfanData/networkReceive?ip=${ip}`,
      method: 'get'
  })
}
