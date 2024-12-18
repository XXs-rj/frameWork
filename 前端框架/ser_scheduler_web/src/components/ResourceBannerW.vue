<template>
  <div class="ResourceBannerW">
    <div class="ResourceBannerWraper">
      <div class="ResourceBanner">
        <span>
          「
          <span class="nameEllipsis">({{ displayName }})</span>
          <span class="nameEllipsis">{{ namespace }}</span>
          」
        </span>
        {{ $t('containers_service.app.Projectin') }}
        <!-- {{ $t('AppModule.AppServiceDetailIntl.inCluserName',{clusterName:clusterName}) }} -->
        <span>{{ clusterName }}</span>
        <!-- <span>
          <span
            v-if="infoConfig[resourceTypes[0]]"
            class="infoConfig"
          >
            <span>{{ resourceName }}</span>
            <el-tooltip :content="infoConfig[resourceTypes[0]]">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <span v-else>
            「
            <span>{{ resourceName }}</span>
            」
          </span>
          配额使用情况
        </span> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  props: {
    resourceType: String || Array,
    infoConfig: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters('entities', { current: 'getCurrent' }),
    displayName () {
      return this.current.space.displayName
    },
    namespace () {
      return this.current.space.namespace
    },
    clusterName () {
      return this.current.cluster.clusterName
    },
    resourceTypes () {
      return typeof this.resourceType === 'string' ? [this.resourceType] : this.resourceType
    }
  }
}
</script>

<style scoped lang="less">
.ResourceBanner {
  display: flex;
  overflow: hidden;
  > div {
    padding-right: 8px;
  }
  > div:last-child {
    flex: 1;
    text-align: right;
    padding-right: 0;
  }
  .progress {
    width: 200px;
    .ant-progress-inner {
      background-color: #c4dff6 !important;
    }
  }
  .reload {
    padding-left: 8px;
    color: #006b6b;
    cursor: pointer;
    user-select: none;
    &:hover {
      color: #4fc4fa;
    }
    &:active {
      color: #76d4ff;
    }
  }
}
.ResourceBannerWraper {
  border: 1px dashed #006b6b;
  border-radius: 4px;
  line-height: 28px;
  background-color: #e5f2fa;
  padding: 4px 16px;
  margin-bottom: 24px;
}
.ResourceBannerW {
  i {
    font-size: 12px !important;
  }
}
.ResourceBanner {
  font-size: 12px;
  color: #666;
  display: -ms-flexbox;
  display: flex;
  overflow: hidden;
}
.ResourceBanner > div {
  padding-right: 8px;
}
.ResourceBanner > div:last-child {
  -ms-flex: 1;
  flex: 1;
  text-align: right;
  padding-right: 0;
}
.ResourceBanner .nameEllipsis {
  max-width: 135px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom;
}
.ResourceBanner .progress {
  width: 200px;
}
.ResourceBanner .progress .ant-progress-inner {
  background-color: #c4dff6 !important;
}
.ResourceBanner .reload {
  padding-left: 8px;
  white-space: nowrap;
  color: #2db7f5;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.ResourceBanner .reload:hover {
  color: #4fc4fa;
}
.ResourceBanner .reload:active {
  color: #76d4ff;
}
.ResourceBanner .infoConfig {
  color: #4fc4fa;
}
.ResourceBanner .infoConfig i {
  font-size: 15px;
  padding-left: 4px;
}
.ResourceBanner .infoConfig svg {
  vertical-align: middle;
  font-size: 12px;
}
</style>
