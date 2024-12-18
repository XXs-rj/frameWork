<!--
 * @Description: 
 * @Author: 张晨
 * @Date: 2024-08-15 09:40:36
 * @LastEditTime: 2024-10-12 15:32:46
 * @LastEditors: 张晨
-->
<template>
  <el-dialog :title="title" :visible.sync="isShow" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" @open="openEvent">
    <el-form :model="form">
      <!-- <el-form-item label="租户编码" :label-width="formLabelWidth">
        <el-input v-model="form.tenantCode" autocomplete="off"></el-input>
      </el-form-item> -->
      <el-form-item label="套餐名称" :label-width="formLabelWidth">
        <el-input v-model="form.packageName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="套餐价格/元" :label-width="formLabelWidth">
        <el-input v-model="form.packagePrice" type="number" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="传输速率/Mbps" :label-width="formLabelWidth">
        <el-input v-model="form.transSpeed" type="number" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="addPackage">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addPackage, editPackage } from '@/api/package'

export default {
  name: 'PackageComponent',
  data () {
    return {
      form: {
        packageName: '',
        packagePrice: null,
        transSpeed: null,
      },
      formLabelWidth: '120px'
    }
  },
  props: {
    isShow: {
      type: Boolean,
      required: true
    },
    packageItem: {
      type: Object,
      require: false
    },
    title: {
      type: String,
      default: '新增套餐'
    }
  },
  methods: {
    openEvent () {
      if (this.packageItem === undefined  || this.packageItem === null) {
        this.form.packageName = ""
        this.form.packagePrice = null
        this.form.transSpeed = null
      } else {
        this.form = { ...this.packageItem }
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
    addPackage () {
      const param = { ...this.form }
      if (this.packageItem === undefined || this.packageItem === null) {
        addPackage(param).then((res) => {
          this.result(res)
        });
      } else {
        editPackage(param).then((res) => {
          this.result(res)
        });
      }
    }
  }
}
</script>

<style scoped>
</style>
