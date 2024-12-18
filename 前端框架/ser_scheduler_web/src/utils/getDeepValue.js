'use strict'

exports.__esModule = true

/**
 * safely get deep value in a Nested Object or Array
 * @param {object | array} target the obj or array you need to read value from
 * @param {array} propsList the propsList you read
 * @return {any} if read error, return null
 * @example getDeepValue(userList, ['group', 0, 'name'])
 */
exports.default = function (target, propsList) {
  return propsList.reduce(function (result, prop) {
    return result && result[prop] !== undefined ? result[prop] : null
  }, target)
}

module.exports = exports.default
