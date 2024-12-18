<template>
  <div>
    <el-dialog title="新增传输信息" :visible.sync="isShow" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" width="50%" top="0px" style="height: 100vh;">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="选择租户"></el-step>
        <el-step title="传输信息"></el-step>
        <el-step title="信息确认"></el-step>
      </el-steps>

      <div v-if="activeStep === 0" class="step-div">
        <div style="width: 85%;">
          <el-form :inline="true" ref="search" :model="search" label-width="70px" class="demo-form-inline" style="margin-top: 20px;">
            <el-form-item label="租户名称">
              <el-input v-model="search.tenantName"></el-input>
            </el-form-item>
            <!-- <el-form-item label="租户编码">
              <el-input v-model="search.tenantCode"></el-input>
            </el-form-item> -->
            <el-form-item label="登录名称">
              <el-input v-model="search.loginName"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="mb-1" icon="el-icon-search" size="middle" @click="getList">
                查询
              </el-button>
              <el-button type="primary" class="mb-15" icon="el-icon-refresh" size="middle" @click="onRefresh">
                重置
              </el-button>
            </el-form-item>
          </el-form>
          <el-table ref="singleTable" :data="tableData" highlight-current-row @row-click="selectRow" style="width: 100%;height: calc(100vh - 350px);">
            <el-table-column width="30">
              <template slot-scope="scope">
                <el-radio :label="scope.row.id" v-model="tenantId" @change="selectRow(scope.row)"></el-radio>
              </template>
            </el-table-column>
            <el-table-column property="id" label="租户ID">
            </el-table-column>
            <el-table-column property="tenantName" label="租户名称">
            </el-table-column>
            <el-table-column property="tenantCode" label="租户编码">
            </el-table-column>
            <el-table-column property="loginName" label="登录名称">
            </el-table-column>
          </el-table>
          <div style="display: flex;">
            <div style="width: 79%;margin-top: 10px;">
              <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" background layout="prev, pager, next" :current-page="params.pageNum" :total="total">></el-pagination>
            </div>
            <div style="width: 20%;display: flex; justify-content: right;margin-top: 10px;">
              <el-button type="default" @click="closeDialog">取消</el-button>
              <el-button ref="selectTenantNextBtn" type="primary" @click="nextStep" :disabled="true">下一步</el-button>
            </div>
          </div>

        </div>

      </div>

      <div v-else-if="activeStep === 1" class="step-div" style="margin-top: 50px;">
        <div style="width: 60%;">
          <el-form :model="form" ref="form" label-width="120px">
            <el-form-item label="租户ID">
              <el-input v-model="tenantId" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="租户名称">
              <el-input v-model="tenantName" :disabled="true"></el-input>
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
            <el-button type="default" @click="prevStep">上一步</el-button>
            <el-button ref="transferInfoNextBtn" type="primary" @click="nextStep" :disabled="!(form.receiveIp !== '' && form.receivePort !== '' && form.sendIp !== '')">下一步</el-button>
          </div>
        </div>
      </div>

      <div v-else-if="activeStep === 2" class="step-div" style="margin-top: 50px;">
        <el-descriptions title="传输信息确认" style="width:70%;margin-top: 20px; font-size: 16px;" :column="2">
          <el-descriptions-item label="ID">{{tenantId}}</el-descriptions-item>
          <el-descriptions-item label="租户名称">{{tenantName}}</el-descriptions-item>
          <el-descriptions-item label="接收端IP">{{form.receiveIp}}</el-descriptions-item>
          <el-descriptions-item label="接收端端口">{{form.receivePort}}</el-descriptions-item>
          <el-descriptions-item label="发送端IP">{{form.sendIp}}</el-descriptions-item>
          <el-descriptions-item label="上传带宽上限">{{form.uploadBandwidthLimit}}Gbit/s</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag type="success" v-if="form.status === 1">正常</el-tag>
            <el-tag type="danger" v-else-if="form.status === 0">禁用</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div style="display: flex; justify-content: center;margin-top: 80px;">
          <el-button type="default" @click="prevStep">上一步</el-button>
          <el-button type="primary" style="margin-left: 30px;" @click="addTransfer" :disabled="!(form.receiveIp !== '' && form.receivePort !== '' && form.sendIp !== '')">新 增</el-button>
        </div>
        <!-- <el-button type="primary" @click="doOnceAgin">{{$t('doAgain')}}</el-button>
        <el-button style="margin-left: 8px">{{$t('bill')}}</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>
  
<script>
import { getTenantList } from "@/api/tenant";
import { addTransferItem } from "@/api/transfer";
export default {
  props: {
    isShow: {
      type: Boolean,
      required: true
    }
    // iconClass: {
    //   type: String,
    //   required: true
    // }
  },
  data () {
    return {
      tenantId: null,
      tenantName: null,
      activeStep: 0, // 当前步骤的索引
      search: {
        tenantName: '',
        tenantCode: '',
        loginName: '',
        status: ''
      },
      form: {
        tenantId: "",
        receiveIp: "",
        receivePort: "",
        sendIp: "",
        uploadBandwidthLimit: "1",
        status: 1
      },
      params: {
        pageNum: 1,
        pageSize: 10,
      },
      total: 10,
      tableData: [],
    };
  },
  mounted () {
    this.getList()
  },
  methods: {
    // 单选框绑定值变化时触发的事件（选中的 Radio label 值）
    selectRow (row) {
      this.tenantId = row.id
      this.tenantName = row.tenantName
      //   this.selection = row
    },
    closeDialog () {
      this.$emit("changeDialogStatus", false);
    },
    nextStep () {
      //   this.validateForm(this.activeStep).then(() => {
      this.activeStep++;
      //   });
    },
    prevStep () {
      if (this.activeStep > 0) {
        this.activeStep--;
      }
    },
    getList () {
      const param = { ...this.params, ...this.search }
      getTenantList(param).then((res) => {
        if (res.status === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total
        } else {
          this.$message(res.message);
        }
      });
    },
    handleSizeChange (row) {
      this.params.pageSize = row
      this.params.pageNum = 1
      this.getList()
    },
    handleCurrentChange (row) {
      this.params.pageNum = row
      this.getList()
    },
    onRefresh () {
      this.search.tenantName = '';
      this.search.tenantCode = '';
      this.search.loginName = '';
      this.search.status = '';
      this.params.pageNum = 1
      this.getList()
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
    addTransfer () {
      this.form.tenantId = this.tenantId
      const param = { ...this.form }
      addTransferItem(param).then((data) => {
        if (data.status === 200) {
          this.$emit("changeDialogStatus", "success");
          this.activeStep = 0;
          this.tenantId = null;
          this.onRefresh()
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
  },
  watch: {
    // 监听message数据的变化
    tenantId (newValue, oldValue) {
      console.log(`message changed from ${oldValue} to ${newValue}`);
      // 在这里可以执行更多的逻辑
      this.$refs.selectTenantNextBtn.disabled = true;
      if (newValue !== null || newValue !== undefined) {
        this.$refs.selectTenantNextBtn.disabled = false;
      }
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