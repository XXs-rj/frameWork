<template>
  <TxStatus v-if="status.phase" :phase="status.phase" :status="status" :smart="smart" />
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
  computed: {
    status () {
      if (isEmpty(this.app)) {
        return {}
      }
      let { appStatus, services = [] } = this.app || { services: [] }
      if (!appStatus) {
        appStatus = getAppStatus(services, this.statusReady)
      }
      appStatus.text = `${this.$t('TxStatus.AppReplicasMsg', { total: services.length + '' })}`
      return appStatus
    }
  }
}
</script>

<style>
</style>
