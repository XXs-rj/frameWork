<template>
  <TxStatus
    :phase="status.phase"
    :status="status"
    :smart="smart"
    :creation-timestamp="container?.metadata?.creationTimestamp"
    :progress="status.progress"
  />
</template>

<script>
import { getContainerPodStatus } from '@/utils/status_identify'

import TxStatus from './TxStatus.vue'
export default {
  components: {
    TxStatus
  },
  props: {
    container: Object,
    smart: Boolean,
    showReadyCount: Boolean
  },
  computed: {
    status () {
      const status = getContainerPodStatus(this.container)
      const { restartCount, readyContainers, totalContainers } = status
      status.abnormalText = this.showReadyCount ? `${readyContainers}/${totalContainers} Ready` : this.$t('containersService.restartedCount', { restartCount: restartCount })
      status.disableReplicasElement = true
      return status
    }
  }
}
</script>

<style>

</style>
