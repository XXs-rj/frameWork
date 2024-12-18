<template>
  <TxStatus
    v-if="status.phase"
    :phase="status.phase"
    :status="status"
    :smart="smart"
  />
</template>

<script>
import { getAppStatus } from '@/utils/status_identify'
import isEmpty from 'lodash/isEmpty'
import TxStatus from './TxStatus.vue'
export default {
  components: {
    TxStatus
  },
  props: {
    app: Object,
    smart: Boolean,
    statusReady: Boolean // 是否不用重新计算status

  },
  data () {
    return {
      status: {
        availableReplicas: 0,
        phase: "Stopped",
        replicas: 1,
        text: "共1个服务",
        unavailableReplicas: 1
      }
    }
  },
  created () {
    console.log('smart', this.smart)
    this.test()
  },
  methods: {
    test () {
      if (isEmpty(this.app)) {
        return {}
      }
      // this.status.phase = this.app.status
      this.status.phase = this.app.status.phase
      this.status.unavailableReplicas = this.app.stopReplicas
      this.status.availableReplicas = this.app.currentReplicas
      this.status.replicas = this.app.replicas
      this.status.text = thia.app.text
      
      return this.status
    }
    }
}
</script>

<style>

</style>
