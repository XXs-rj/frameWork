
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
 * Filter and replace events
 * 过滤、替换事件
 * @param {Array} events
 * @returns {Array}
 */
export function filtEvents (events) {
  const targetEvents = []
  if (!events) {
    return targetEvents
  }
  events.map(event => {
    let { reason } = event
    reason = reason.toLowerCase()
    switch (reason) {
      case 'failedmount':
        event.message = '尝试挂载存储卷失败，重试中...'
        targetEvents.push(event)
        break
      case 'failedscheduling':
        if (event.message.indexOf('PersistentVolumeClaim is not bound') > -1) {
          event.type = 'Normal'
          event.reason = 'Scheduling'
          event.message = '存储服务调度中...'
        }
        targetEvents.push(event)
        break
      default:
        targetEvents.push(event)
    }
  })
  return targetEvents
}
