import Vue from 'vue'
const options = {
  baseURL: '/'
}
export default {
  getLogToken () {
    return Vue.axios.get('spi/v2/watch/token', options)
  }
}
