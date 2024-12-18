<template>
  <div class="vue-code-diff">
    <template>
      <div class="diff-editor-header">
        <div class="diff-editor-header-title-left">
          {{ $t('AppModule.AppServiceDetailIntl.currentVersion') }}
        </div>
        <div class="diff-editor-header-title-right">
          {{ $t('AppModule.AppServiceDetailIntl.targetVersion') }}
        </div>
      </div>
    </template>
    <code-diff
      :old-string="original"
      :new-string="modified"
      :context="10"
      :is-show-no-change="true"
      output-format="side-by-side"
      style="width:100%;height:100%;"
    />
  </div>
</template>

<script>
import CodeDiff from 'vue-code-diff'

export default {
  components: {
    CodeDiff
  },
  props: {
    options: Object,
    modified: String,
    original: String
  },
  watch: {

  },
  created () {

  },
  methods: {
  }
}
</script>

<style scoped lang="less">
.vue-code-diff {
  margin: 0;
  padding: 0;
  width:100%;
  overflow: auto;
  :deep(.d2h-info){
    height:19px;
  }
  .d2h-info{
     height:19px;
  }
  .diff-editor-header {
    height: 40px;
    line-height: 40px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    background-color: #f8f8f8;
  }
  .diff-editor-header-title-left,.diff-editor-header-title-right{
    position: relative;
    display: inline-block;
  }
  .diff-editor-header-title-left {
  left: 70px;
  }
  .diff-editor-header-title-right {
    left: calc(50% + 30px);
  }
  :deep(.d2h-code-line-ctn){
    width: auto;
  }
   :deep(.d2h-code-side-line){
    padding-right: 0;
    box-sizing: border-box;
  }
}
</style>
