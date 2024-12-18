<template>
  <div>
    <el-form
      v-for="(item,index) in value"
      :key="index"
      :model="item"
      status-icon
      :rules="rules"
      ref="form"
      label-position="left"
      label-width="100px"
      inline
    >
      <el-form-item
        prop="itemValue"
      >
        <el-input
          v-model="item.itemValue"
          :placeholder="$t('containersService.WebhookAddress')"
        />
      </el-form-item>
      <el-form-item
        prop="itemDesc"
      >
        <el-input
          v-model="item.itemDesc"
          :placeholder="$t('AlarmModal.remarks')"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          plain
          @click="verify(index, item)"
        >
          {{ $t('containersService.verify') }}
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          type="text"
          plain
          @click="remove(index)"
        >
          {{ $t('remove') }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-button
      type="primary"
      @click="addData"
    >
      {{ $t('containersService.addWebhookAddress') }}
    </el-button>
  </div>
</template>
<script>
import { add, remove, validData } from './setUtil'
import { mapGetters } from 'vuex'
import { verifyWebhook } from '../../api/api_autoScale'

export default {
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters('entities', { current: 'getCurrent' }),
    namespace () {
      return this.current?.space?.namespace
    }

  },
  data () {
    return {
      rules: {
        itemValue: [
          { type: 'url', required: true, message: this.$t('containersService.enterCorrectAddress'), trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    addData () {
      const item = { itemValue: '', itemDesc: '' }
      add(this.value, item, this.$refs)
    },
    async validate () {
      return validData(this.value, this.$refs)
    },
    remove (index) {
      return remove(this.value, index)
    },
    verify (index, ding) {
      this.$refs.form[index].validate(valid => {
        if (valid) {
          verifyWebhook(this.namespace, ding).then(result => {
            // TODO：反馈验证结果
            this.$message.success(this.$t('containersService.Verificationsuccessful'))
          }).catch(err => {
            this.$message.error(this.$t('containersService.Verificationfailed') + err.toString())
          })
        }
      })
    }
  }
}
</script>
