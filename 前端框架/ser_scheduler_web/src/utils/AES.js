var CryptoJS = require('crypto-js')
export default {
  /**
 * 生成密钥字节数组, 原始密钥字符串不足128位, 补填0.
 * @param {string} key - 原始 key 值
 * @return Buffer
 */
  fillKey(key) {
    const filledKey = Buffer.alloc(128 / 8)
    const keys = Buffer.from(key)
    if (keys.length < filledKey.length) {
      filledKey.map((b, i) => {
        filledKey[i] = keys[i]
      })
    }
    return filledKey
  },
  encrypt(word) {
    const key = CryptoJS.enc.Utf8.parse(this.fillKey('Abcd123456')) // 16位
    let encrypted = ''
    if (typeof (word) === 'string') {
      const srcs = CryptoJS.enc.Utf8.parse(word)
      encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
    } else if (typeof (word) === 'object') { // 对象格式的转成json字符串
      const data = JSON.stringify(word)
      const srcs = CryptoJS.enc.Utf8.parse(data)
      encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
    }
    return encrypted.toString()
  },
  decrypt(word) {
    const key = CryptoJS.enc.Utf8.parse(this.fillKey('Abcd123456'))
    const decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return decrypt.toString(CryptoJS.enc.Utf8)
  }
}

