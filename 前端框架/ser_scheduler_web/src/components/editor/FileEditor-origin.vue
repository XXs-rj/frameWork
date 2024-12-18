
<template>
  <div style="height: 100%;width: 100%">
    <codemirror
      ref="codemirror"
      v-model="fileValue"
      :options="options"
      @input="inputChange"
      @ready="editorDidMount"
      style="height: 100%;width: 100%"
    />
  </div>
</template>
<!--
使用:引入,<file-editor></file-editor>
参数:
      fileValue  必传
      editorOptions 可选
      使用此组件，需要在外层加一层父标签<div>,并设定div的宽度和高度（也可使用其他标签），组件便会自适应大小
-->
<script>

import 'codemirror/mode/yaml/yaml'

import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/yaml-lint'
import 'codemirror/theme/monokai.css'

import 'codemirror/addon/display/autorefresh'
import 'codemirror/addon/selection/active-line'

import { codemirror } from 'vue-codemirror'

export default {
  components: {
    codemirror
  },
  name: 'FileEditor',
  model: {
    prop: 'fileValue',
    event: 'change'
  },
  props: {
    // 外部传入的内容，用于实现双向绑定
    // fileObject: Object,
    fileValue: {
      type: String,
      default: ''
    },
    editorOptions: {
      type: Object,
      default () { return {} }
      /*
       传递自定义的editor配置,若传递了.则使用自定义,否则使用默认
       建议必传参数:
       文档格式:   mode:'x-yaml',
       自动刷新:   autoRefresh: true,
       缩进格式:   tabSize: 4,
       主题:       theme: 'idea',
       显示行号:   lineNumbers: true,
       最大撤销次数:undoDepth:200 ,默认200次
       是否只读:    readOnly: true,true/false
      */
    },
    show: Boolean
  },
  data () {
    return {
      // 默认的语法类型
      mode: 'YAML',
      // 编辑器实例
      myEditor: null,
      // 默认配置
      defaultOptions: {
        mode: 'yaml',
        tabSize: 4,
        theme: 'monokai',
        lineNumbers: true,
        cursorHeight: 1,
        readOnly: false,
        autoRefresh: true

      },
      // 支持切换的语法高亮类型，对应 JS 已经提前引入
      // 使用的是 MIME-TYPE ，不过作为前缀的 text/ 在后面指定时写死了
      modes: [
        {
          value: 'x-yaml',
          label: 'YAML'
        }
      ]
    }
  },
  computed: {
    options () {
      return { ...this.defaultOptions, ...(this.editorOptions || {}) }
    }
  },
  watch: {
    show: {
      handler (val) {
        if (val) {
          this.refresh()
        }
      }
    }
  },
  mounted () {
    // 初始化
    // this.initialize()
    this.refresh()
    this.$emit('onLoad', this.$refs.codemirror.codemirror)
  },
  methods: {
    editorDidMount (editor) {
      this.$emit('onLoad', editor)
    },
    inputChange (value) {
      this.$emit('change', value)
    },
    // 获取当前语法类型
    getLanguage (language) {
      // 在支持的语法类型列表中寻找传入的语法类型
      return this.modes.find((mode) => {
        // 所有的值都忽略大小写，方便比较
        const currentLanguage = language.toLowerCase()
        const currentLabel = mode.label.toLowerCase()
        const currentValue = mode.value.toLowerCase()
        // 由于真实值可能不规范，例如 java 的真实值是 x-java ，所以讲 value 和 label 同时和传入语法进行比较
        return currentLabel === currentLanguage || currentValue === currentLanguage
      })
    },

    refresh () {
      this.$refs.codemirror && this.$refs.codemirror.codemirror && this.$refs.codemirror.codemirror.refresh()
    }
  }
}
</script>

<style scoped>
  :deep(.CodeMirror){
    flex-grow:1;
    z-index:0;
    height: 100%;
    text-align: left;
  }

  :deep(.CodeMirror-code){
    line-height:14px

  }
  :deep(.CodeMirror-scroll){
    margin-bottom: 0px;
    padding-bottom: 0px;
    font-size: 14px;
    height: 100%;
    overflow-y: auto;
    overflow-x: auto;
  }
  :deep(.CodeMirror-hscrollbar){
    overflow-x: hidden;
  }
</style>
