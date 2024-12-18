/**
 * Licensed Materials - Property of .com
 * (C) Copyright 2019 . All Rights Reserved.
 */

/**
 * Service for build xlsx
 * v0.1 - 2019-06-18
 * @author zhangpc
 */
'use strict'

const xlsx = require('node-xlsx')
const moment = require('moment')

const MONITOR_COLUMN_NAMES = [
  '实例名称', '日期', '时间', 'CPU占用率%', '内存使用 M', '网络（出站）KB/S',
  '网络（入站）KB/S', '磁盘（读取）KB/S', '磁盘（写入）KB/S'
]
const SHEET_NAME_MAX_LENGTH = 30

function buildResourceMonitorXlsx (constainerMonitors) {
  const worksheets = constainerMonitors.map(({ name, data }) => {
    const nameLength = name.length
    if (nameLength > SHEET_NAME_MAX_LENGTH) {
      const harfMaxLength = SHEET_NAME_MAX_LENGTH / 2
      name = `${name.substr(0, (harfMaxLength - 1))}-${name.substr(nameLength - harfMaxLength)}`
    }
    return {
      name,
      data: ([MONITOR_COLUMN_NAMES]).concat(data)
    }
  })
  return xlsx.build(worksheets)
}
exports.buildResourceMonitorXlsx = buildResourceMonitorXlsx

function formatConstainerMonitors (dataList) {
  const constainerMonitorMap = {}
  dataList.forEach((dataItem, index) => {
    const {
      cpu, memory, networkTrans, networkRec, diskReadIo, diskWriteIo
    } = dataItem
    const data = cpu || memory || networkTrans || networkRec || diskReadIo || diskWriteIo || []
    data.forEach(({ container_name: containerName, name, metrics }) => {
      containerName = containerName || name
      const timestampList = []
      constainerMonitorMap[containerName] = constainerMonitorMap[containerName] || {}
      metrics.forEach(({ timestamp, floatValue, value }) => {
        timestampList.push(timestamp)
        constainerMonitorMap[containerName][timestamp] = constainerMonitorMap[containerName][timestamp] || []
        // format value
        value = floatValue || value
        if (memory) {
          value = value / 1024 / 1024
        } else if (networkTrans || networkRec || diskReadIo || diskWriteIo) {
          value = value / 1024
        }
        // 补齐在其他时间节点上没有的数据，否则会有错位(补前)
        const currentTimestampDataCount = constainerMonitorMap[containerName][timestamp].length
        // constainerMonitorMap[containerName][timestamp]容器-在某时间节点的数据（横向）
        // 如果currentTimestampDataCount!==index说明之前的数据在当前时间点没有数据，补齐当前时间点之前的数据
        if (currentTimestampDataCount !== index) {
          for (let i = 0; i < index; i++) {
            constainerMonitorMap[containerName][timestamp].push(null)
          }
        }

        constainerMonitorMap[containerName][timestamp].push(value)
      })
      // 补齐在其他时间节点上没有的数据，否则会有错位(补后)
      // 遍历当前容器所有的时间节点，如果存在当前数据中没有的时间节点，则为该时间点添加当前的数据
      Object.keys(constainerMonitorMap[containerName]).forEach(timestampKey => {
        if (timestampList.indexOf(timestampKey) < 0) {
          constainerMonitorMap[containerName][timestampKey].push(null)
        }
      })
    })
  })
  const constainerMonitors = Object.keys(constainerMonitorMap).map(name => {
    return {
      name,
      data: Object.keys(constainerMonitorMap[name]).sort((a, b) => moment(a).isBefore(moment(b)) ? -1 : 1).map(timestamp => {
        const date = moment(timestamp).format('YYYY-MM-DD')
        const time = moment(timestamp).format('HH:mm:ss.SSS')
        return ([name, date, time]).concat(constainerMonitorMap[name][timestamp])
      })
    }
  })
  return constainerMonitors
}
exports.formatConstainerMonitors = formatConstainerMonitors
