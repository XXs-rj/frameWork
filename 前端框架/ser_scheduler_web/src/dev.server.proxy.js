const urlObj = {
}
const target = urlObj.companyDev
module.exports = {

  // '/help/portal': {
  //   // target: 'http://10.72.27.198:8086/', // 要代理的服务器
  //   // target: 'http://192.168.50.162:8086/', // 要代理的服务器
  //   target: 'http://10.110.63.152:8086/', // 要代理的服务器
  //   // target: 'http://10.110.63.141:8083/', // 要代理的服务器
  //   pathRewrite: {
  //     '^/help/portal': ''
  //   }
  // },
  'control/api/v1/': {
    target: 'http://localhost:8088/',
    pathRewrite: {
      '^/control/api/v1/' :  '/api/v1/'
    }
  }
  
}
