import Vue from 'vue'

export default {
  getAllProjects (params) {
    return Vue.axios.get('/v2/projects/index', {
      params
    })
  }
}
