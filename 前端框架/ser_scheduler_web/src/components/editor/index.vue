<template>
  <div id="CodeMirror" :class="matchClass">
    <div class="tenxEditorWrapper">
      <FileEditor class="defaultEditorStyle" :file-value="value" :editor-options="options" @onLoad="onLoad" @change="codeMirrorChange" :show="show">
      </FileEditor>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import FileEditor from './FileEditor.vue'
import fscreen from 'fscreen'

export default {
  components: {
    FileEditor
  },
  props: {
    autoSave: Boolean, // Automatically persist changes to underlying textarea (default false)
    value: String, // The editor value
    preserveScrollPosition: Boolean, // Preserve previous scroll position after updating value (default false)
    options: Object, // options passed to the CodeMirror instance (https://codemirror.net/doc/manual.html#api)
    show: Boolean // 是否显示，解决初始时不显示后面需要聚焦输入框才能显示得问题
  },
  data () {
    return {
      currentBox: 'normal',
      currentTheme: 'monokai',
      screenFull: false
    }
  },

  computed: {
    currentValues () {
      return this.value || ''
    },
    matchClass () {
      const { currentBox, options: config } = this
      // this function for match different class name
      if (currentBox === 'big' || currentBox === 'superBig') {
        if (config.readOnly) {
          return 'bigCodeMirror bigCodeMirrorNoEdit'
        } else {
          if (config.mode === 'yaml') {
            return 'bigCodeMirror'
          }
          if (config.mode === 'dockerfile' || config.mode === 'shell') {
            return 'bigCodeMirror bigCodeMirrorNoEdit'
          }
        }
      } else {
        return 'normalCodeMirror'
      }
      return ''
    }
  },
  mounted () {
    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener('fullscreenchange', this.onFullChange)
    }
  },
  beforeDestroy () {
    if (fscreen.fullscreenEnabled) {
      fscreen.removeEventListener('fullscreenchange', this.onFullChange)
    }
  },
  methods: {
    onFullChange () {
      this.screenFull = !this.screenFull
      // this.currentBox = !this.screenFull ? 'superBig' : 'normal'
    },

    codeMirrorChange (value) {
      this.$emit('onChange', value)
    },
    onLoad (value) {
      this.$emit('onLoad', value)
    }
  }
}
</script>

<style scoped lang="less">
#CodeMirror {
  transition: all 0.3s;
  min-height: 340px;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 40px);
  border-radius: 5px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  overflow: hidden;
  .ant-tooltip {
    .ant-tooltip-inner {
      background-color: #1a1a1a;
    }
    .ant-tooltip-arrow {
      border-left-color: #1a1a1a;
    }
  }
  .editOperaBox {
    position: relative;
    padding: 0 16px;
    font-size: 14px;
    min-height: 49px;
    line-height: 49px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background-color: #333333 !important;
    .title {
      color: #16b9fe;
      font-weight: bold;
    }
    .operaBtn {
      float: right;
      color: #999;
      cursor: pointer;
      .anticon-question-circle-o {
        float: right;
        margin-right: 20px;
        line-height: 49px;
        font-size: 15px;
      }
      .anticon-arrow-salt,
      .anticon-shrink {
        float: right;
        line-height: 49px;
      }
    }
    &:after {
      content: '.';
      display: block;
      height: 0;
      visibility: hidden;
      clear: both;
    }
  }
  .react-codemirror2 {
    height: calc(~'100% - 49px');
  }
  .ReactCodeMirror {
    .CodeMirror {
      font-family: Consolas, Menlo, Courier, monospace;
      pre.CodeMirror-line > span {
        margin-left: 30px;
      }
    }
  }
  .CodeMirrorErrorBox {
    display: flex;
    flex-direction: column;
    z-index: 9;
    position: absolute;
    bottom: -32px;
    padding: 0 16px;
    width: 100%;
    min-height: 32px;
    line-height: 32px;
    color: #f85a5a;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    background-color: #333333;
    .errorNumSpan {
      float: left;
      line-height: 32px;
    }
    .noErrorSpan {
      color: #5cb85c !important;
    }
    .line {
      margin: 10px 10px 0;
      float: left;
      width: 2px;
      height: 12px;
      border-left: 1px solid #efefef;
    }
    .codeMirrorErrorDetailAnimate {
      float: left;
      line-height: 32px;
      background-color: #efefef;
    }
    .CodeMirrorBtnBox {
      padding: 5px 0;
      float: right;
      .commonBtn {
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        margin-right: 10px;
        padding: 0 5px;
        float: left;
        height: 22px;
        line-height: 22px;
        color: #ffffff;
        border-radius: 3px;
        background-color: #006b6b;
        cursor: pointer;
        &:hover {
          background-color: #006b6b;
        }
      }
    }
  }
}
.bigCodeMirror {
  position: fixed !important;
  z-index: 999;
  margin-top: 40px;
  .editOperaBox {
    border-radius: 0 !important;
  }
  .ReactCodeMirror {
    height: calc(~'100% - 80px') !important;
  }
  .CodeMirror {
    height: 100% !important;
  }
  .CodeMirrorErrorBox {
    border: 0 !important;
    border-radius: 0 !important;
    overflow-y: auto;
  }
  .ant-tooltip {
    top: 7px !important;
  }
}
.normalCodeMirror {
  position: relative !important;
}
.bigCodeMirrorNoEdit {
  .ReactCodeMirror {
    height: calc(~'100% - 50px') !important;
  }
}

.tenxEditorWrapper {
  width: 100%;
  height: 100%;
  min-height: 340px;
  position: relative;
  .defaultEditorStyle {
    width: 100%;
    height: 100%;
    // min-height: 360px;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
