<template>
  <div>
    <el-form
      v-for="(tel,index) in value"
      :key="index"
      :model="tel"
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
          v-model="tel.itemValue"
          :placeholder="$t('containersService.enterPhoneNumber')"
        />
      </el-form-item>
      <el-form-item
        prop="itemDesc"
      >
        <el-input
          v-model="tel.itemDesc"
          :placeholder="$t('AlarmModal.remarks')"
        />
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
      {{ $t('containersService.addPhoneNumber') }}
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
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      rules: {
        itemValue: [
          { required: true, message: this.$t('containersService.Pleaseentercorrectphone'), trigger: 'blur' },
          { min: 11, max: 11, message: this.$t('containersService.Pleaseenter11mobilenumber'), trigger: 'blur' },
          {
            pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
            message: this.$t('containersService.Pleaseentercorrectnumber')
          }
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
    }
  }
}
</script>
