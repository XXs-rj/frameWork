<template>
  <span
    id="CommonStatus"
    key="commonStatus"
  >
    <span :class="statusClass(status)">
      <i
        v-if="circle"
        class="fa fa-circle"
      />
      <span v-if="!!content">{{ content }}</span>
      <span v-else>
        {{ status==='Warning'? $t('AppCreate.public'): $t('hostList.search') }}
      </span>
    </span>
  </span>
</template>

<script>
export default {
  props: {
    status: String,
    content: String

  },
  methods: {
    statusClass (status) {
      // this function for show different status class
      switch (status) {
        case 'Running':
          return 'Running'
        case 'Waiting':
          return 'Waiting'
        case 'Pending':
          return 'Pending'
        case 'Stopped':
          return 'Stopped'
        case 'Failed':
          return 'Failed'
        case 'Initialization':
          return 'Initialization'
        case 'Terminating':
          return 'Terminating'
        case 'Abnormal':
          return 'Abnormal'
        case 'Normal':
          return 'Normal'
        case 'Warning':
          return 'Warning'
        default:
          break
      }
    }

  }
}
</script>

<style scoped lang="less">
#CommonStatus{
  .fa{
    margin-left: 5px;
  }
  .Running{
    color: #65BC2C;
  }
  .Waiting{
    color: #FFA000;
  }
  .Pending{
    color: #5E99E1;
  }
  .Stopped{
    color: #DF582C;
  }
  .Failed{
    color: #DF582C;
  }
  .Initialization{
    color: #5E99E1;
  }
  .Terminating{
    color: #FFA000;
  }
  .Abnormal{
    color: #DF582C;
  }
  .Normal{
    color: #5cb85c;
  }
  .Warning{
    color: #FFA000;
  }
  .cssTooltip {
    max-width: 100%;
    height: 30px;
    display: inline-block;
  }
}
</style>
