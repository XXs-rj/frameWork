<template>
  <div
    class="yaml-editor-page"
    :class="webFullScreen?'web-full-screen':''"
    ref="wrapper"
  >
    <div class="codeEditorHeader">
      <div class="title">
        <slot name="title"></slot>
      </div>
      <div
        class="rightBtn"
      >
        <slot name="operate"></slot>
        <span
          :style="fullscreen?{ display:'none'}:null"
          class="toggleFullscreen"
          @click="onWebFullClick"
        >
          <el-tooltip
            placement="bottom"
            :content="!webFullScreen ? $t('CommonStatus.pageFullScreen') : $t('CommonStatus.exitPageFullScreen')"
          >
            <img
              v-if="!webFullScreen"
              class="tenx-editor-icon"
              :src="webFullIcon"
            />
            <img
              v-else
              :src="webFullExitIcon"
              class="tenx-editor-icon"
            />
          </el-tooltip>

        </span>
        <span
          :style="webFullScreen?{ display:'none'}:null"
          class="toggleFullscreen"
          @click="onFullClick"
        >
          <el-tooltip
            placement="bottom"
            :content="!fullscreen ?$t('CommonStatus.fullScreen') : $t('CommonStatus.exitFullScreen')"
          >

            <i :class="!fullscreen ? 'fa fa-expand' : 'el-icon-crop'" />
          </el-tooltip>
        </span>
      </div>
    </div>
    <Editor
      class="editorHeight"
      :value="value"
      :options="newOpts"
      @onLoad="onLoad"
      :parent-id="parentId"
      @onChange="onChangeFunc"
      :show="show"
    >
    </Editor>
  </div>
</template>

<script>
import Editor from './index.vue'
import fscreen from 'fscreen'
import webFullExitIcon from '@/assets/app/webFullExit.svg'
import webFullIcon from '@/assets/app/webFull.svg'
import yaml from 'js-yaml'

export default {
  components: {
    Editor
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    options: {
      type: Object,
      default () {
        return {}
      }
    },
    value: String,
    parentId: String,
    show: Boolean
  },
  data () {
    return {
      errorList: [],
      currentErrorIndex: 0,
      fullscreen: false,
      editor: null,
      webFullIcon,
      webFullExitIcon,
      webFullScreen: false,
      isScroll: 0,
      scrollTimeout: null
    }
  },
  computed: {
    newOpts () {
      return {
        lineNumbers: true,
        mode: 'yaml',
        styleActiveLine: true,
        lineWrapping: true,
        tabSize: 2,
        // titleDisplay: false,
        ...(this.options || {})
      }
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
    // const codemirrorScroll = document.getElementsByClassName('CodeMirror-vscrollbar')[0]
    // codemirrorScroll?.removeEventListener('scroll')
  },
  methods: {
    onWebFullClick () {
      this.webFullScreen = !this.webFullScreen
    },
    onFullChange () {
      const { fullscreen } = this
      const now = !fullscreen
      this.fullscreen = now
      this.webFullScreen = false
    },
    onFullClick () {
      const { fullscreen } = this
      if (!fullscreen) {
        fscreen.requestFullscreen(this.$refs.wrapper)
      } else {
        fscreen.exitFullscreen(this.$refs.wrapper)
      }
    },
    Search () {
      this.editor && this.editor.execCommand('find')
    },
    onLoad (Editor) {
      this.editor = Editor
      const codemirrorScroll = document.getElementsByClassName('CodeMirror-vscrollbar')[0]
      // codemirrorScroll.addEventListener('scroll', (event) => {
      //   this.isScroll = true
      // })
    },
    onChangeFunc (value) {
    // this function for user input new words
    // and we will test the text is right or not
    // and the new words will be callback from the props
    // sometimes the code may not only one and they were split by '---'
      let { errorList, currentErrorIndex } = this
      const _this = this
      const newErrorList = []

      if (this.newOpts.mode.includes('yaml')) {
        if (value.indexOf('---') > -1) {
          // multi codes
          const codeList = value.split('---')
          codeList.map((item, index) => {
            let height = 0
            for (const item of value) {
              if (item === '\n') {
                height++
              }
            }
            try {
              yaml.safeLoad(item)
            } catch (error) {
              newErrorList.push(this.matchYamlError(error, index, _this, height))
            }
          })
        } else {
          // only one
          try {
            yaml.safeLoad(value)
          } catch (error) {
            let height = 0
            for (const item of value) {
              if (item === '\n') {
                height++
              }
            }
            newErrorList.push(this.matchYamlError(error, 0, _this, height))
          }
        }
        // the error num changed
        if (newErrorList.length !== errorList.length && newErrorList.length > 0) {
          currentErrorIndex = newErrorList.length - 1
          this.currentErrorIndex = currentErrorIndex
        }
        if (newErrorList.length === 0) {
          currentErrorIndex = 0
          this.currentErrorIndex = currentErrorIndex
        }
        this.errorList = newErrorList
      }

      this.$emit('change', value)
    },
    matchYamlError (e, index, scope, height) {
      // this function for format yaml error
      // and we will change it to intl
      let markExist = true
      let reasonExist = true
      if (!e.mark) {
        // sometime the mark is undefined
        markExist = false
      }
      if (!e.reason) {
        // sometime the reason is undefined
        reasonExist = false
        return this.$t('containersService.Unknownerror')
      }
      const errorBody = {
        index: (index + 1),
        reason: e.reason
      }
      if (markExist) {
        errorBody.column = e.mark.column
        errorBody.line = e.mark.line - 2
      }
      return errorBody
    },

    onChangeLastError () {
    // this function for view user last one error
      let { errorList, currentErrorIndex } = this
      currentErrorIndex--
      if (currentErrorIndex < 0) {
        currentErrorIndex = errorList.length - 1
      }
      this.currentErrorIndex = currentErrorIndex
    },

    onChangeNextError () {
    // this function for view user next one error
      let { errorList, currentErrorIndex } = this
      currentErrorIndex++
      if (currentErrorIndex >= errorList.length) {
        currentErrorIndex = 0
      }
      this.currentErrorIndex = currentErrorIndex
    },
    insert (lines) {
      const lineCount = this.editor.lineCount()
      this.editor?.replaceRange(lines, { line: lineCount + 1, ch: 0 })
    },
    setValue (content) {
      this.editor?.setValue(content)
    }

  }
}
</script>

<style scoped lang="less">
.yaml-editor-page{
  width: 100%;
  height: 100%;
  .codeEditorHeader {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    font-size: 14px;
    height: 40px;
    color: #2db7f5;
    padding-left: 16px;
    background-color: #333;
    display: flex;
    .title{
      flex: 1;
    }
    .rightBtn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        line-height: normal;
      .toggleFullscreen {
        display: inline-block;
        margin: 0 10px;
        height: 14px;
        text-align: center;
        cursor: pointer;
        &:hover {
          color: #ccc;
        }
      }
    }
  }
  .editorHeight {
    height: calc(100% - 40px)
  }
}
.web-full-screen{
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>
