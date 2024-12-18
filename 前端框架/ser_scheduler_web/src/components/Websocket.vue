<template>
  <div></div>
</template>

<script>
const PING_NUMBER = 0

export default {
  props: {
    url: String,
    debug: {
      type: Boolean,
      default: false
    },
    heartBeat: {
      type: Boolean,
      default: false
    },
    reconnect: {
      type: Boolean,
      default: true
    },
    protocol: String,
    pingInterval: {
      type: Number,
      default: 2000
    }
  },
  data () {
    return {
      socketUrl: process.env.NODE_ENV === 'production'
        ? `${window.location.protocol === 'http:' ? 'ws:' : 'wss:'}//${window.location.host}/spi/v2/watch`
        : `${window.location.protocol === 'http:' ? 'ws:' : 'wss:'}//192.168.12.110:30618/spi/v2/watch`,
      ws: null,
      attempts: 1
    }
  },
  mounted () {
    this.ws = new WebSocket(this.url || this.socketUrl, this.protocol)
    this.setupWebsocket()
  },
  beforeDestroy () {
    this.shouldReconnect = false
    const websocket = this.ws
    websocket.close()
    this.pingInterval && clearInterval(this.pingInterval)
  },
  methods: {
    logging (logline) {
      if (this.debug === true) {
        // window.console.log(logline)
      }
    },

    generateInterval (k) {
      return Math.min(30, (Math.pow(2, k) - 1)) * 1000
    },

    setupWebsocket () {
      const websocket = this.ws
      const that = this
      const { url, socketUrl, protocol, pingInterval, heartBeat } = this
      websocket.onopen = () => {
        this.logging('Websocket connected')
        this.logging(new Date())
        // Return a websocket
        this.$emit('setup', websocket)
        // Heart beats for keep connect
        if (heartBeat) {
          this.pingInterval = setInterval(() => {
            this.logging('Heart beats')
            websocket.send(PING_NUMBER)
          }, pingInterval)
        }
      }

      websocket.onmessage = (evt) => {
        this.logging('Websocket onmessage')
        this.logging(evt.data)
      }

      websocket.onerror = err => {
        this.logging('Websocket onerror')
        this.logging(err)
      }

      websocket.onclose = (err) => {
      // extend for onclose event
        const onCloseExtend = websocket.onCloseExtend
        if (onCloseExtend) {
          onCloseExtend(err)
        }
        this.pingInterval && clearInterval(this.pingInterval)
        const time = this.generateInterval(this.attempts)
        let attempts = this.attempts
        attempts++
        this.attempts = attempts
        clearTimeout(this.setupWebsocketTimeout)
        this.setupWebsocketTimeout = setTimeout(() => {
          this.logging('Websocket disconnected')
          this.shouldReconnect = this.reconnect
          this.logging(this.shouldReconnect)
          this.logging(new Date())
          if (this.shouldReconnect) {
            this.logging(time)
            this.ws = new WebSocket(url || socketUrl, protocol)
            this.setupWebsocket()
          }
        }, time)
      }
    }
  }
}
</script>

<style>

</style>
