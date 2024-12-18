import isDomainName from 'is-domain-name'
import isIp from 'is-ip'
import urlParseLax from 'url-parse-lax'

/**
 * check url
 * @param {string} url check target url
 * @param {object} options check target url
 * @return {boolean} if url error, return false
 */

const isUrl = function isUrl (url) {
  const options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
  const _options$hasProtocol = options.hasProtocol
  const hasProtocol = _options$hasProtocol === undefined ? false : _options$hasProtocol
  const protocol = options.protocol

  const _urlParseLax = urlParseLax(url)
  const hostname = _urlParseLax.hostname
  // urlParseLax 默认给 protocol 设为 https,需手动校验

  let regProtocol = /^(http|https):\/\/*/
  if (hasProtocol && protocol && protocol.length) {
    const protocolStr = protocol.join('|')
    regProtocol = new RegExp('^(' + protocolStr + ')://*')
  }
  const errProtocol = regProtocol.test(url)
  if ((hasProtocol && !errProtocol) || (!hasProtocol && errProtocol)) {
    return false
  }
  if (!hostname || (!isIp(hostname) && hostname && !isDomainName(hostname))) {
    return false
  }
  return true
}
export default isUrl
