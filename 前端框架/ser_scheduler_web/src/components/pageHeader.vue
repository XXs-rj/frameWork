<template>
  <el-page-header
    @back="back"
    :content="content"
    style="padding:16px;background:#F5F7FA"
  >
  </el-page-header>
</template>

<script>
export default {
  props: {
    content: String,
    url: String
  },
  data () {
    return {}
  },
  methods: {
    back () {
      if (this.url) {
        return this.$router.push(this.url)
      }
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
:deep(.el-page-header__content){
  font-size: 14px;
}
</style>
