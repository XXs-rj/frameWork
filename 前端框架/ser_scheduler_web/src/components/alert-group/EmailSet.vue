<template>
  <div>
    <el-form
      v-for="(email,index) in value"
      :key="index"
      :model="email"
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
          v-model="email.itemValue"
          :placeholder="$t('sysMgt.emailAddress')"
        />
      </el-form-item>
      <el-form-item
        prop="itemDesc"
      >
        <el-input
          v-model="email.itemDesc"
          :placeholder="$t('AlarmModal.remarks')"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          plain
          @click="emailTest(index, email)"
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
      {{ $t('AlarmModal.addEmail') }}
    </el-button>
    <el-button
      type="primary"
    >
      {{ $t('containersService.batchImport') }}
    </el-button>
  </div>
</template>
<script>
import { add, remove, validData } from './setUtil'
import { mapGetters } from 'vuex'
import { testEmail } from '../../api/api_autoScale'

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
          { required: true, message: this.$t('msg48'), trigger: 'blur' },
          { type: 'email', message: this.$t('msg47'), trigger: ['blur'] }
        ]
      }
    }
  },

  methods: {
    emailTest (index, email) {
      this.$refs.form[index].validate(valid => {
        if (valid) {
          testEmail(this.namespace, email.itemValue).then(result => {
            // TODO：反馈验证结果
            this.$message.success(this.$t('containersService.Emailverificationsuccessful'))
          }).catch(err => {
            this.$message.error(this.$t('containersService.Emailverificationfailed') + err.toString())
          })
        }
      })
    },
    addData () {
      add(this.value, { itemValue: '', itemDesc: '' }, this.$refs)
    },
    async validate () {
      return validData(this.value, this.$refs)
    },
    remove (index) {
      return remove(this.value, index)
    }
  }
}
</script>
