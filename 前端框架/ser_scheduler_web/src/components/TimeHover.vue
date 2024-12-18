<template>
  <span class="time-hover">
    <el-tooltip :content="fmtTime">
      <span>{{ showtime }}</span>
    </el-tooltip>
  </span>
</template>

<script>
import moment from 'moment'
import Vue from 'vue'
const userLang = window.localStorage.getItem('lang') || window.navigator.language || window.navigator.userLanguage
moment.locale(userLang.includes('zh') ? 'zh-cn' : 'en')
export default {
  props: {
    time: String
  },
  data () {
    return {
      showtime: moment(new Date(this.time)).fromNow(),
      fmtTime: this.time && moment(new Date(this.time)).format('YYYY-MM-DD HH:mm:ss'),
      timer: null
    }
  },
  mounted () {
    this.setTimeInterval(new Date(this.time))
  },
  beforeDestroy () {
    this.clearTimer()
  },
  watch: {
    time: {
      handler (val) {
        this.showtime = moment(val).fromNow()
        this.setTimeInterval(new Date(val))
      }
    }
  },
  methods: {
    setTimeInterval (time) {
      this.clearTimer()
      const now = moment()
      const timeMoment = moment(time)
      const diff = now.diff(timeMoment)
      if (diff > 0 && diff < 60 * 60 * 1000) {
        this.timer = setInterval(() => {
          this.showtime = moment(time).fromNow()
        }, 60 * 1000)
      }
    },
    clearTimer () {
      this.timer && clearInterval(this.timer)
    }
  }

}
</script>

<style scoped>
.time-hover{
  cursor: pointer;
}
</style>
