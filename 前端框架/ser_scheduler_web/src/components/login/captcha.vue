<template>
  <div style="height:47px;width:100px;">
    <canvas id="code-canvas" style="cursor: pointer" :width="contentWidth" :height="contentHeight" @click="reflesh" />
  </div>
</template>

<script>
// import { getLoginCode } from '@/api/user'
// import AES from '@/utils/AES.js'

export default {
  name: 'Captcha',
  props: {
    uuid: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      contentWidth: 100,
      contentHeight: 47,
      vicTime: null,
      identifyCode: '',
      backgroundColorMin: 160,
      backgroundColorMax: 240,
      fontSizeMin: 22,
      fontSizeMax: 26,
      colorMin: 50,
      colorMax: 160,
    }
  },
  created () {
  },
  mounted () {
    // this.drawPic()
    this.reflesh()
    // this.vicTime = setInterval(() => {
    //   this.reflesh()
    // }, 60000)
  },
  destroyed () {
    clearInterval(this.vicTime)
  },
  methods: {
    getLoginCode () {
      // getLoginCode({ uuid: this.uuid }).then(data => {
      //   if (data !== null) {
      //     this.identifyCode = AES.decrypt(data)
      //     this.drawPic()
      //   }
      // })
      this.identifyCode = this.generateRandomString(4)
      this.$emit('verifyCode', this.identifyCode);
      this.drawPic()
    },
    generateRandomString (length) {
      var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      // var length = Math.floor((Math.random() * (chars.length - 1)) + 1); // 随机长度
      var result = '';

      for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor((Math.random() * (chars.length - 1)));
        result += chars[randomIndex];
      }

      return result;
    },
    reflesh () {
      //   this.uuid = this.createuuid()
      if (this.uuid !== undefined && this.uuid !== '') {
        this.getLoginCode()
      }

    },
    drawPic () {
      const canvas = document.getElementById('code-canvas')
      const ctx = canvas.getContext('2d')
      // ctx.textBaseline = 'bottom'
      // 绘制背景
      ctx.fillStyle = this.randomColor(this.backgroundColorMin, this.backgroundColorMax) // 图形填充颜色设置
      ctx.strokeStyle = this.randomColor(this.backgroundColorMin, this.backgroundColorMax) // 图形轮廓的颜色设置
      ctx.fillRect(0, 0, this.contentWidth, this.contentHeight) // 绘制一个填充的矩形 0 0 width height x起点 y起点  宽 高
      ctx.strokeRect(0, 0, this.contentWidth, this.contentHeight) // 绘制一个矩形边框 0 0 width height x起点 y起点  宽 高
      // ctx.clearRect(50,0,this.contentWidth,this.contentHeight)  //清除指定矩形区域，清除部分完全透明
      // 绘制文字
      // 使用 fillText 填充文本  
      //   ctx.fillStyle = 'red';
      for (let i = 0; i < this.identifyCode.length; i++) {
        this.drawText(ctx, this.identifyCode[i], i)
      }
      this.drawLine(ctx, 7)
      this.drawDot(ctx, 16)
    },
    randomNum (min, max) {
      return Math.floor(Math.random() * (max - min) + min)
    },
    // 生成一个随机的颜色
    randomColor (min, max) {
      const r = this.randomNum(min, max)
      const g = this.randomNum(min, max)
      const b = this.randomNum(min, max)
      return 'rgb(' + r + ',' + g + ',' + b + ')'
    },
    drawText (ctx, txt, i) {
      ctx.fillStyle = this.randomColor(this.colorMin, this.colorMax)
      ctx.font = this.randomNum(this.fontSizeMin, this.fontSizeMax) + 'px SimHei' // 字体大小
      ctx.textBaseline = 'alphabetic' // 基线对齐
      const x = (i + 1) * (this.contentWidth / (this.identifyCode.length + 1))
      const y = this.randomNum(this.fontSizeMax, this.contentHeight - 5)
      var deg = this.randomNum(-45, 45)
      // 修改坐标原点和旋转角度
      ctx.translate(x, y) // 移动不同位置  参数偏移量
      ctx.rotate((deg * Math.PI) / 180) // 旋转 参数角度
      ctx.fillText(txt, 0, 0)
      // 恢复坐标原点和旋转角度
      ctx.rotate((-deg * Math.PI) / 180)
      ctx.translate(-x, -y)
    },
    /*绘制干扰线:
    ctx：画笔
    count：干扰线数量
    width：画布宽度px,
    height：画布高度px,
*/
    drawLine (ctx, count) {
      for (let i = 0; i < count; i++) {
        ctx.strokeStyle = this.randomColor(0, 255);
        ctx.beginPath();
        ctx.moveTo(
          this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight)
        );
        ctx.lineTo(
          this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight)
        );
        ctx.stroke()
      }
    },
    drawDot (ctx, count) {
      // 绘制干扰点
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = this.randomColor(0, 255)
        ctx.beginPath()
        // 绘制圆弧或圆，x,y,radius，startAngle,endAngle,anticlockwise // x,y 圆心点，radius 半径，从startAngle开始到endAngle结束
        ctx.arc(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight), 1, 0, 2 * Math.PI)
        ctx.fill() // 通过填充路径的内容区域生成实心的图形。
      }
    },
  },
}
</script>

<style scoped>
</style>
