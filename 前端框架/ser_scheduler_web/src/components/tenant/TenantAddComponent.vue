<!--
 * @Description: 
 * @Author: 张晨
 * @Date: 2024-08-15 09:40:36
 * @LastEditTime: 2024-10-12 15:44:34
 * @LastEditors: 张晨
-->
<template>
  <el-dialog :title="title" :visible.sync="isShow" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" @open="openEvent">
    <el-form :model="form">
      <!-- <el-form-item label="租户编码" :label-width="formLabelWidth">
        <el-input v-model="form.tenantCode" autocomplete="off"></el-input>
      </el-form-item> -->
      <el-form-item label="租户名称" :label-width="formLabelWidth">
        <el-input v-model="form.tenantName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="登录名称" :label-width="formLabelWidth">
        <el-input v-model="form.loginName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="状态" :label-width="formLabelWidth">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="addTenant">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addTenant, editTenant } from '@/api/tenant'

export default {
  name: 'TenantAddComponent',
  data () {
    return {
      form: {
        tenantCode: '',
        tenantName: '',
        loginName: '',
        status: 1
      },
      formLabelWidth: '120px'
    }
  },
  props: {
    isShow: {
      type: Boolean,
      required: true
    },
    tenantItem: {
      type: Object,
      require: false
    },
    title: {
      type: String,
      default: '新增租户'
    }
  },
  methods: {
    openEvent () {
      if (this.tenantItem === undefined) {
        this.form.tenantCode = ""
        this.form.tenantName = ""
        this.form.loginName = ""
        this.form.status = 1
      } else {
        this.form = { ...this.tenantItem }
        this.form.status = 0
        if (this.tenantItem.status === '1') {
          this.form.status = 1
        }
      }
    },
    closeDialog () {
      this.$emit("changeAddDialogStatus", false);
    },
    result (data) {
      if (data.status === 200) {
        this.$emit("changeAddDialogStatus", "success");
        this.$message.success("操作成功");
      } else {
        this.$message.error("操作失败，请重试");
      }
    },
    addTenant () {
      const param = { ...this.form }
      if (this.tenantItem === undefined) {
        addTenant(param).then((res) => {
          this.result(res)
        });
      } else {
        editTenant(param).then((res) => {
          this.result(res)
        });
      }
    }
  }
}
</script>

<style scoped>
</style>
