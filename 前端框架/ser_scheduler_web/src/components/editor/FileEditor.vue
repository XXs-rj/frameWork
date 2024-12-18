
<template>
  <div style="height: 100%;width: 100%">
    <textarea
      ref="codemirrorDom"
      :value="fileValue"
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
// import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import 'codemirror/mode/yaml/yaml'

import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/yaml-lint'
import 'codemirror/theme/monokai.css'

import 'codemirror/addon/display/autorefresh'
import 'codemirror/addon/selection/active-line'
// 搜索功能相关资源
import 'codemirror/addon/scroll/annotatescrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/match-highlighter.js'
import 'codemirror/addon/search/jump-to-line.js'

import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'

import Codemirror from 'codemirror'

export default {
  components: {
    // codemirror
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
      // 编辑器实例
      myEditor: null,
      // 默认配置
      defaultOptions: {
        mode: 'yaml',
        tabSize: 4,
        gutters: ['CodeMirror-lint-markers'],
        theme: 'monokai',
        lineNumbers: true,
        cursorHeight: 1,
        readOnly: false,
        autoRefresh: true
      }
    }
  },
  computed: {
    options () {
      return { ...this.defaultOptions, ...(this.editorOptions || {}) }
    }
  },
  watch: {
    options: {
      handler (newV) {
        const keys = Object.keys(newV)
        keys.map(key => {
          this.myEditor?.setOption(key, newV[key])
        })
      },
      deep: true,
      immediate: true
    },
    show: {
      handler (val) {
        if (val) {
          this.refresh()
        }
      }
    },
    fileValue: {
      handler (val) {
        const cmvalue = this.myEditor.getValue()
        if (val !== cmvalue) {
          this.myEditor?.setValue(val)
        }
      }
    }
  },
  mounted () {
    // 初始化
    this.myEditor = Codemirror.fromTextArea(this.$refs.codemirrorDom, this.options)
    this.myEditor.on('change', cm => {
      const content = cm.getValue()
      this.inputChange(content)
    })
    this.$emit('onLoad', this.myEditor)
  },
  methods: {
    editorDidMount (editor) {
      this.$emit('onLoad', editor)
    },
    inputChange (value) {
      this.$emit('change', value)
    },
    refresh () {
      this.myEditor && this.myEditor.refresh()
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
