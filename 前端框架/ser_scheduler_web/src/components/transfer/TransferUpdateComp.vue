<template>
  <div>
    <el-dialog title="编辑传输信息" :visible.sync="isShow" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" width="50%" top="0px" style="height: 100vh;" @open="openEvent">
      <div class="step-div" style="margin-top: 50px;">
        <div style="width: 60%;">
          <el-form :model="form" ref="form" label-width="120px">
            <el-form-item label="租户ID">
              <el-input v-model="form.tenantId" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="租户名称">
              <el-input v-model="form.tenantName" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="接收端IP">
              <el-input v-model="form.receiveIp"></el-input>
            </el-form-item>
            <el-form-item label="接收端端口">
              <el-input v-model="form.receivePort"></el-input>
            </el-form-item>
            <el-form-item label="发送端IP">
              <el-input v-model="form.sendIp"></el-input>
            </el-form-item>
            <el-form-item label="上传带宽上限">
              <el-slider v-model="form.uploadBandwidthLimit" :min="1" :max="10" :step="1" show-stops>
              </el-slider>
              上传带宽上限当前为<el-tag>{{form.uploadBandwidthLimit}}Gbit/s</el-tag>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div style="display: flex; justify-content: right;margin-top: 0px;">
            <el-button type="default" @click="closeDialog">取消</el-button>
            <el-button ref="transferInfoNextBtn" type="primary" @click="updateTransfer">确认</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
    
  <script>
import { updateTransferItem } from "@/api/transfer";
export default {
  name: 'TranferUpdateComp',
  props: {
    isShow: {
      type: Boolean,
      required: true
    },
    transferItem: {
      type: Object,
      require: false
    }
  },
  data () {
    return {
      form: {
        tenantId: "",
        receiveIp: "",
        receivePort: "",
        sendIp: "",
        uploadBandwidthLimit: "1",
        status: 1
      }
    };
  },
  methods: {
    closeDialog () {
      this.$emit("changeDialogStatus", false);
    },
    openEvent () {
      if (this.transferItem === undefined) {
        this.form.tenantId = ""
        this.form.receiveIp = ""
        this.form.receivePort = ""
        this.form.sendIp = ""
        this.form.uploadBandwidthLimit = "1"
        this.form.status = 1
      } else {
        this.form = { ...this.transferItem }
        this.form.status = 0
        if (this.transferItem.status === '1') {
          this.form.status = 1
        }
      }
    },
    validateForm (step) {
      return new Promise((resolve, reject) => {
        let formRef = `form${step}`;
        this.$refs[formRef].validate((valid) => {
          if (valid) {
            resolve();
          } else {
            reject();
            this.$message.error('验证失败，请检查表单项！');
          }
        });
      });
    },
    submitForm () {
      this.validateForm(this.activeStep).then(() => {
        // 提交表单数据
        console.log(this.form);
        // 重置表单
        this.activeStep = 0;
        this.form = {
          name: '',
          email: '',
          address: ''
        };
      });
    },
    updateTransfer () {
      const param = { ...this.form }
      updateTransferItem(param).then((data) => {
        if (data.status === 200) {
          this.$emit("changeDialogStatus", "success");
          this.form.receiveIp = "";
          this.form.receivePort = "";
          this.form.sendIp = "";
          this.form.uploadBandwidthLimit = "1";
          this.form.status = 1;
          this.$message.success("操作成功");
        } else {
          this.$message.error("操作失败，请重试");
        }
      });
    }
  }
};
</script>

<style scoped>
::v-deep .el-dialog {
  height: 100vh !important;
}

::v-deep .el-input {
  width: 80%;
}

.step-div {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>