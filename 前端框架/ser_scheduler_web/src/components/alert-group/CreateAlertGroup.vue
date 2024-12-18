<template>
  <el-dialog
    :title="$t('containersService.alertgroup.dialogTitle')"
    :visible="true"
    width="650px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :modal="false"
  >
    <!-- 功能说明 -->
    <el-alert
      :title="$t('containersService.alertgroup.alertInfo')"
      type="info"
      :closable="false"
      style="background-color: #e5f2fa;border:1px dashed #2db7f5;color:#666666;margin-bottom: 10px;margin-top:10px;"
    />
    <el-form
      :model="value"
      status-icon
      :rules="rules"
      ref="groupForm"
      label-position="right"
      label-width="100px"
    >
      <el-form-item
        prop="groupName"
        :label="$t('containersService.alertgroup.labelGroupName')"
      >
        <el-input v-model="value.groupName" />
      </el-form-item>
      <el-form-item
        prop="groupDesc"
        :label="$t('containersService.alertgroup.labelGroupDesc')"
      >
        <el-input
          v-model="value.groupDesc"
          type="textarea"
        />
      </el-form-item>
      <el-form-item
        prop="email"
        :label="$t('containersService.alertgroup.labelEmailList')"
      >
        <EmailSet
          ref="email"
          v-model="value.receivers.email"
        />
      </el-form-item>
      <el-form-item
        prop="tel"
        :label="$t('containersService.alertgroup.labelPhoneList')"
      >
        <PhoneSet
          ref="phone"
          v-model="value.receivers.tel"
        />
      </el-form-item>
      <el-form-item
        prop="webhook"
        :label="$t('containersService.alertgroup.labelWebhook')"
      >
        <WebhookSet
          ref="webhook"
          v-model="value.receivers.webhook"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="cancle"
        >
          {{ $t('containersService.alertgroup.buttonTextCancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="submit"
        >
          {{ $t('containersService.alertgroup.buttonTextSave') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import { createMsgGroup } from '../../api/api_autoScale'
import EmailSet from './EmailSet'
import { mapGetters } from 'vuex'
import PhoneSet from './PhoneSet'
import WebhookSet from './WebhookSet'

export default {
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          groupName: '',
          groupDesc: '',
          receivers: {
            email: [],
            tel: [],
            // ding: [],
            // wechat: [],
            webhook: []
          }
        }
      }
    }
  },
  components: {
    // DingSet,
    EmailSet,
    PhoneSet,
    // WechatSet,
    WebhookSet
  },
  data () {
    return {
      rules: {
        groupName: [
          { required: true, message: this.$t('AlarmModal.plsInputName'), trigger: 'blur' },
          { min: 3, max: 21, message: this.$t('AlarmModal.plsInput321'), trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  computed: {
    ...mapGetters('app4Paas', {
      currentProjectId: 'getCurrentProjectId'
    }),
    ...mapGetters('entities', {
      current: 'getCurrent'
    })
  },
  methods: {
    handleClose () {
      this.$emit('closeGroup')
    },
    cancle () {
      this.handleClose()
    },
    addMsg () {
      const that = this
      this.loading = true
      this.value.items = []
      for (const a of this.value.receivers.email) {
        this.value.items.push({ ...a, itemType: 1 })
      }
      for (const b of this.value.receivers.tel) {
        this.value.items.push({ ...b, itemType: 2 })
      }
      for (const b of this.value.receivers.webhook) {
        this.value.items.push({ ...b, itemType: 3 })
      }
      this.value.parentProjectId = this.currentProjectId || ''
      this.value.namespace = this.current.space.namespace || ''
      const data = { ...this.value }
      delete data.receivers
      createMsgGroup(data).then(() => {
        that.$message.success(that.$t('AppModule.AppServiceDetailIntl.addSuccess'))
        that.handleClose()
      }
      ).catch(err => {
        that.$message.error(err.toString())
      }).finally(() => {
        this.loading = false
      })
    },
    async submit () {
      this.validate().then(valid => {
        if (valid) {
          // this.$emit('input', this.value)
          this.addMsg()
        }
      })
    },
    async validate () {
      let validResult = true
      await this.$refs.groupForm.validate(valid => {
        validResult = validResult && valid
      })
      const refKeys = ['email', 'phone', 'webhook']
      for (const key of refKeys) {
        await this.$refs[key].validate().then(valid => {
          validResult = validResult && valid
        })
      }
      return validResult
    }

  }
}
</script>
