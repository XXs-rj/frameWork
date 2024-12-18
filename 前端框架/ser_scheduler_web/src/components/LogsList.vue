<template>
  <div
    id="ContainerLogs"
    class="ContainerLogs"
    ref="ContainerLogs"
  >
    <common-editor
      ref="editor"
      :value="containerLogs"
      :options="editorOptions"
    >
      <template

        slot="operate"
      >
        <el-link
          v-if="!hideHistoryBtn"
          key="link"
          to=""
          type="primary"
          style="margin-right:10px"
        >
          {{ $t('Container.Detail.historyLogs') }}
        </el-link>
        <el-tooltip
          key="tooltip"
          placement="top"
          :content="`click to ${loopWatchStatus()}`"
        >
          <i
            style="margin-right:10px"
            :class="`fa fa-${loopWatchStatus()}-circle-o`"
            @click="handleLoopWatchStatus"
          />
        </el-tooltip>
      </template>
    </common-editor>
    <WebSocket
      @setup="onLogsWebsocketSetup"
      :debug="false"
      :reconnect="reconnect"
    />
  </div>
</template>
<script>
import { getContainerEventList, getLogToken } from '../api/api_container'
import CommonEditor from '@/components/editor/commonEditor'
import { formatDate } from '../utils/tools.js'
import { getWatchToken } from '@/api/common'
import { mapGetters } from 'vuex'
import WebSocket from '@/components/Websocket.vue'

export default {
  components: {
    CommonEditor,
    WebSocket
  },
  computed: {
    ...mapGetters('entities', { current: 'getCurrent' }),
    ...mapGetters('user', { loginUser: 'currentUser' })

  },
  props: {
    containerName: String,
    selectContainer: String,
    k8sContainerName: String,
    hideHistoryBtn: Boolean,
    isSysServiceManage: Boolean
  },
  data () {
    return {
      watchStatus: null,
      reconnect: true,
      attempts: 1,
      setupWebsocketTimeout: null,
      logsLoadingTimeout: null,
      pingInterval: null,
      logsLoading: false,
      containerLogs: '',
      editorOptions: {
        mode: 'text/yaml',
        readOnly: true
      },
      protocol: window.location.protocol,
      retryTimeout: 5000,
      watchToken: null
    }
  },
  mounted () {
    // this.setupWebsocket()
  },
  beforeDestroy () {
    this.reconnect = false
    this.pingInterval && clearInterval(this.pingInterval)
  },
  methods: {
    loopWatchStatus () {
      return this.watchStatus === 'pause' ? 'play' : 'pause'
    },
    handleLoopWatchStatus () {
      const nextWatchStatus = this.loopWatchStatus()
      const ws = this.ws
      const data = {
        action: nextWatchStatus
      }
      ws && ws.send(JSON.stringify(data))
      this.watchStatus = nextWatchStatus
    },
    generateInterval (k) {
      return Math.min(30, (Math.pow(2, k) - 1)) * 1000
    },
    async getLogTokenMethod () {
      return await getWatchToken()
    },
    async onLogsWebsocketSetup (ws) {
      const watchToken = this.watchToken || await getWatchToken()
      this.watchToken = watchToken
      this.logsLoading = true
      if (!this.current.cluster.clusterID || !this.containerName) return
      this.ws = ws
      const { namespace } = this.loginUser
      const watchAuthInfo = {
        accessToken: watchToken,
        namespace: namespace,
        type: 'log',
        name: this.containerName,
        containerName: this.k8sContainerName || [this.selectContainer],
        cluster: this.current.cluster.clusterID
      }
      if (this.current.space.namespace !== 'default') {
        watchAuthInfo.teamspace = this.current.space.namespace
      }
      if (this.isSysServiceManage) {
        watchAuthInfo.teamspace = 'kube-system'
      }
      if (this.current.space.userName) {
        watchAuthInfo.onbehalfuser = this.current.space.userName
      }

      ws.send(JSON.stringify(watchAuthInfo))
      ws.onmessage = (event) => {
        if (event.data === 'TENXCLOUD_END_OF_STREAM') {
          this.reconnect = false
          return
        }
        clearTimeout(this.logsLoadingTimeout)
        this.logsLoadingTimeout = setTimeout(function () {
          this.logsLoading = false
        }, this.retryTimeout)
        let { data } = event
        data = JSON.parse(data)
        const { name, log } = data
        if (log === undefined) {
          return
        }
        const logArray = log.split('\n')
        const temp = []
        logArray.map(log => {
          if (log) {
            temp.push({
              name,
              log
            })
          }
        })
        if (this.watchStatus !== 'pause') {
          let content = this.getLogs(temp)
          if (content.length) {
            content = content.join('\n') + '\n'
            this.$refs.editor?.insert(content)
            this.$nextTick(() => {
              const currentDom = this.$refs.ContainerLogs
              const codemirrorScroll = currentDom?.getElementsByClassName('CodeMirror-scroll')?.[0]
              if (codemirrorScroll) {
                codemirrorScroll.scrollTop = codemirrorScroll.scrollHeight + 100
              }
            })
          }
        }
      }
      ws.onCloseExtend = err => {
        this.logsLoading = true
      }
      setTimeout(() => {
        getContainerEventList(this.current.cluster.clusterID, this.containerName).then().catch((err) => {
          this.$message.error('获取容器日志失败')
        })
      }, this.retryTimeout)
    },
    renderLog (logObj, index) {
      let { name, log, mark } = logObj
      const dateReg = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,})?(Z|(\+\d{2}:\d{2}))\b/
      const logDateArray = log.match(dateReg)
      let logDate = ''
      if (logDateArray && logDateArray[0]) {
        logDate = logDateArray[0] || ''
        log = log.replace(logDate, '')
      }
      if (logDate) {
        logDate = ` [${formatDate(logDate)}]`
      }
      return `[${name}]${mark ? ` [${mark}]` : ''}${logDate}${log}`
    },
    getLogs (logs) {
      if (!this.logsLoading && logs.length < 1) {
        return '\nNo logs.'
      }

      return logs.map(this.renderLog)
    }
  }
}
</script>
<style lang="less" scoped>
.ContainerLogs {
  height:400px;
  .tenx-ui-logs-header {
    position: relative;
  }

  .leftHeader {
    position: absolute;
    right: 120px;
  }

  .operaBox {
    position: relative;
    width: 100%;
    height: 40px;
    line-height: 40px;

    span:nth-child(2) {
      margin-right: 20px;
    }

    span {
      float: right;
      margin-right: 10px;

      .ant-input:hover {
        border-color: inherit;
      }

      i {
        font-size: 13px;
      }
    }

    .fa {
      float: right;
      color: #5CB85C;
      line-height: 40px;
      margin-right: 10px;
      cursor: pointer;
    }

    .ant-calendar-picker-clear {
      margin-right: 20px !important;
    }
  }

  font-size: 14px;
}
</style>
