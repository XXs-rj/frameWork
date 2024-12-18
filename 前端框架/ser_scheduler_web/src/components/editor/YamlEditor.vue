<template>
  <div
    class="yaml-editor-page"
    :class="webFullScreen?'web-full-screen':''"
    ref="wrapper"
  >
    <div class="codeEditorHeader">
      <el-row>
        <el-col span="12">
          {{ title || 'Yaml' }}
          <span>
            （{{ newOpts.readOnly ? $t('CommonStatus.readOnly') : $t('CommonStatus.readWrite') }}）
          </span>
        </el-col>
        <el-col
          class="rightBtn"
          span="12"
        >
          <div class="toggleFullscreen">
            <el-tooltip
              placement="left"
              @getTooltipContainer="() => document.getElementsByClassName('toggleFullscreen')[0]"
              :content="$t('CommonStatus.tooltipContent')"
            >
              <i class="el-icon-question"></i>
            </el-tooltip>
          </div>
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
              :content="!fullscreen ? $t('CommonStatus.fullScreen') : $t('CommonStatus.exitFullScreen')"
            >

              <i :class="!fullscreen ? 'fa fa-expand' : 'el-icon-crop'" />
            </el-tooltip>
          </span>
        </el-col>
      </el-row>
    </div>
    <Editor
      :value="value"
      :options="newOpts"
      @onLoad="onLoad"
      :parent-id="parentId"
      @callback="callback"
      @onChange="onChangeFunc"
      :show="show"
    >
      <div
        v-if="showErrorTips && errorList.length && !newOpts.readOnly"
        class="CodeMirrorErrorBox"
        key="CodeMirrorErrorBox"
      >
        <div>
          <span :class=" errorList.length > 0 ? 'errorNumSpan' : 'noErrorSpan errorNumSpan'">
            <span v-if="errorList.length > 0 ">{{ $t('CommonStatus.errorCount', { count: errorList.length }) }}</span>
            <span v-else><i class="el-icon-circle-check" /></span>
          </span>
          <div class="line" />
        </div>
        <div class="codeMirrorErrorDetailAnimate">
          <div class="codeMirrorErrorDetail">
            <span :key="currentErrorIndex + 1">[{{ currentErrorIndex + 1 }}]</span>
            <span>{{ $t('CommonStatus.section', { index: errorList[currentErrorIndex].index }) }}&nbsp;
              <template v-if="Boolean(item.line)">
                <span>
                  <span>{{ $t('CommonStatus.line', { line: item.line }) }}</span>&nbsp;
                  <span>{{ $t('CommonStatus.column', { column: item.column }) }}</span>&nbsp;
                </span>
              </template>
              {{ $t('CommonStatus.errorReason', { reason: item.reason }) }}
            </span>
          </div>
        </div>
        <div class="CodeMirrorBtnBox">
          <div
            class="commonBtn"
            @click="onChangeLastError"
          >
            <i class="el-icon-caret-left" />
          </div>
          <div
            class="commonBtn"
            @click="onChangeNextError"
          >
            <i class="el-icon-caret-right" />
          </div>
        </div>
        <div style="clear: both" />
      </div>
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
      webFullScreen: false
    }
  },
  computed: {
    newOpts () {
      return {
        lineNumbers: true,
        mode: 'text/x-yaml',
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
    },
    onChangeFunc (value) {
    // this function for user input new words
    // and we will test the text is right or not
    // and the new words will be callback from the props
    // sometimes the code may not only one and they were split by '---'
      let { errorList, currentErrorIndex } = this
      const _this = this
      const newErrorList = []
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
      this.$emit('callback', value)
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
    line-height: 40px;
    color: #2db7f5;
    padding-left: 16px;
    background-color: #333;
    .rightBtn {
      text-align: right;
      .toggleFullscreen {
        display: inline-block;
        width: 40px;
        text-align: center;
        cursor: pointer;
        &:hover {
          color: #ccc;
        }
      }
    }
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
