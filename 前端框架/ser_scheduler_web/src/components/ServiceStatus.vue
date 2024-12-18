<template>
  <TxStatus
    v-if="status.phase"
    :phase="status.phase"
    :progress="status.progress"
    :status="status"
    :smart="smart"
  />
</template>

<script>
import { getServiceStatus } from '@/utils/status_identify'
import TxStatus from './TxStatus.vue'
export default {
  components: {
    TxStatus
  },
  props: {
    service: Object,
    smart: Boolean,
    statusReady: Boolean // 是否不用重新计算status
  },
  computed: {
    status () {
      let status = {}
      if (this.statusReady) {
        status = this.service.status
      } else {
        status = getServiceStatus(this.service)
        status.replicas = parseInt(status.replicas)
      }
      return status
    }
  }
}
</script>

<style>

</style>
