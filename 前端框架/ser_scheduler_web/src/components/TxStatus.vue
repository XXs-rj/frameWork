<template>
  <div
    class="TxStatus"
    :style="smart?'display:inline-block':''"
  >
    <template v-if="smart">
      <span>
        <span :class="className ? className : phase">
          <i class="fa fa-circle" />
          <span
            :title="$t(`TxStatus.${status.phase}`)"
            class="statusWrapper"
          >
            {{ $t(`TxStatus.${status.phase}`) }}
          </span>
        </span>
      </span>
    </template>
    <template v-else>
      <div :class="phase">
        <template v-if="isProcess">
          <div>
            <span
              :title="$t(`TxStatus.${status.phase}`)"
              class="statusWrapper"
            >
              {{ $t(`TxStatus.${status.phase}`) }}
            </span>
          </div>
          <el-progress
            style="max-width:120px"
            stroke-width="8"
            :show-text="false"
            :percentage="percent"
          />
        </template>
        <template v-else>
          <div>
            <i class="fa fa-circle" />
            <span
              :title="$t(`TxStatus.${status.phase}`)"
              class="statusWrapper"
            >
              {{ $t(`TxStatus.${status.phase}`) }}
            </span>
        &nbsp;
            <el-tooltip
              v-if="showDesc"
              :title="description"
            >
              <i class="el-icon-question" />
            </el-tooltip>
          </div>
        </template>
      </div>
      <div class="text">
        <template v-if="(status && !status.disableReplicasElement && !isProcess)">
          <div>
            {{ `${status.availableReplicas || 0}/${status.replicas} ` }}
            <span>
              <template v-if="status.text">
                <span v-if="(status.availableReplicas || 0) < status.replicas">
                  {{ status.text }}
                  <i class="el-icon-warning-outline"></i>
                </span>
                <span v-else>{{ status.text }}</span>

              </template>
              <template v-else-if="(status.availableReplicas || 0)===0">{{ $t('TxStatus.StoppedMsg') }}</template>
              <template v-else-if="(status.availableReplicas || 0) < status.replicas">
                {{ $t('TxStatus.SectionRunningMsg') }}
                <i class="el-icon-warning-outline"></i>
              </template>
              <template v-else>{{ $t('TxStatus.AllRunningMsg') }}</template>
            </span>
          </div>
        </template>
        <template v-if="creationTimestamp">
          <template v-if="phase === 'Failed'">
            <div v-if=" status.reason && status.reason === 'Evicted'">
              {{ $t('TxStatus.Evicted') }}
              <Tooltip :content="$t('TxStatus.EvictedTip')">
                <i class="el-icon-warning-outline"></i>
              </Tooltip>
            </div>
            <div v-else>
              {{ status.reason }}<Tooltip :title="status.message">
                <i class="el-icon-warning-outline"></i>
              </Tooltip>
            </div>
          </template>
          <template v-else-if="!isProcess">
            <div>
              {{ status.abnormalText }}
            </div>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
const PROGRESS_PHASES = [
  'Pending',
  'Terminating', 'Starting', 'Stopping',
  'Scaling', 'Restarting', 'Redeploying',
  'Rebuilding', 'RollingUpdate', 'ScrollRelease', 'ContainerCreating'
]
export default {
  props: {
    status: Object,
    smart: Boolean,
    showDesc: Boolean,
    description: String,
    creationTimestamp: String,
    phase: {
      required: true,
      type: String
    },
    progress: {
      type: Object
    }
  },
  data () {
    return {
      percent: this.progress && this.progress.percent
        ? this.progress.percent
        : 5,
      progressInterval: null
    }
  },
  watch: {
    progress: {
      handler (newVal, oldVal) {
        if (newVal && newVal.percent) {
          this.percent = newVal.percent
        } else if (!isEqual(newVal, oldVal)) {
          this.percent = 5
        }
      }
    },
    isProcess: {
      handler (newVal) {
        if (newVal && !this.progressInterval) {
          this.setProgressPercent(this.percent)
        }
      },
      immediate: true
    }
  },
  computed: {
    isProcess () {
      const {
        phase,
        progress
      } = this

      if (progress && progress.status === false) {
        return false
      }
      if (progress || PROGRESS_PHASES.indexOf(phase) > -1) {
        return true
      }
      return false
    }
  },
  beforeDestroy () {
    clearInterval(this.progressInterval)
    delete this.progressInterval
  },
  methods: {
    setProgressPercent (percent) {
      this.progressInterval = setInterval(() => {
        if (percent >= 90) {
          clearInterval(this.progressInterval)
          delete this.progressInterval
          return
        }
        percent += 5
        this.percent = percent
      }, 100)
    }
  }
}
</script>

<style scoped lang="less">
.el-icon-warning-outline{
  color: orange;
  margin-left: 5px;
}
.TxStatus{
  line-height: 30px;
  .Pending, .ContainerCreating, .Starting, .Deploying, .Unpublished, .Checking, .ImageCopy {
    color: #0b9eeb;
    position: relative;
    //top: 5px;
    :deep(.el-progress-bar__inner) {
      border-radius: 100px;
      background-color: #0eb4ff;
      background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);

      transition: all 0.4s cubic-bezier(0.08, 0.82, 0.17, 1) 0s;
      position: relative;
    }
  }
  .Running, .Restarting, .Redeploying, .Rebuilding, .Succeeded, .UploadPkgAndEnvSuccess, .Published, .CheckPass {
    color: #33b867;
    position: relative;
    //top: 5px;
    :deep(.el-progress-bar__inner) {
      border-radius: 100px;
      background-color: #2fb866;
      background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
      transition: all 0.4s cubic-bezier(0.08, 0.82, 0.17, 1) 0s;
      //transition: width .6s ease;
      position: relative;
    }
  }
  .Unknown, .OffShelf, .ImageCopyFailed {
    color: #636363;
    position: relative;
    //top: 5px;
  }
  .OffShelf {
    color: #cccccc;
    position: relative;
    //top: 5px;
  }
  .Terminating, .Abnormal, .WaitForCheck, .CrashLoopBackOff, .RunContainerError, .NodeLost {
    color: #ed9325;
    position: relative;
    //top: 5px;
    :deep(.el-progress-bar__inner) {
      border-radius: 100px;
      background-color: #eda946;
      background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);

      transition: all 0.4s cubic-bezier(0.08, 0.82, 0.17, 1) 0s;
      position: relative;
    }
  }
  .CheckWrapPass {
    color: #5a5ae5;
  }
  .Stopping, .Stopped, .Failed, .UploadPkgAndEnvFailed, .ServiceInitFailed, .ServiceNormalFailed, .CheckReject, .Deleted {
    color: #f23e3f;
    position: relative;
    //top: 5px;
    :deep(.el-progress-bar__inner) {
      border-radius: 100px;
      background-color: #f0383a;
      background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
      transition: all 0.4s cubic-bezier(0.08, 0.82, 0.17, 1) 0s;
      position: relative;
    }
  }
  .Scaling {
    color: #7f81f0;
    position: relative;
    //top: 5px;
    :deep(.el-progress-bar__inner) {
      border-radius: 100px;
      background-color: #5a5beb;
      background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);

      transition: all 0.4s cubic-bezier(0.08, 0.82, 0.17, 1) 0s;
      position: relative;
    }
  }
  .statusWrapper {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
    position: relative;
    margin-bottom: -11px;
  }
  .text {
    color: grey;
    position: relative;
    top: -2px;
  }
  .el--progress-line {
    position: relative;
    top: -7px;
  }
  i{
    margin-right: 5px;
  }
}

</style>
