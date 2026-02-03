<template>
  <transition>
    <div class="image-main" :class="visible ? 'transition-fade-in' : 'transition-fade-out'">
      <div class="image-header text-elip inline-block-v-middle">
        <div class="head-title text-elip inline-block-v-middle"
             :title="activeFileObj.fileName">
          {{ activeFileObj.fileName }}
        </div>
        <div class="header-right inline-block-v-middle">
          <a href="">
            <i class="iconfont icon-xiazai"></i>
          </a>
          <i class="iconfont"
             :class="showOcrTextList ? 'icon-shouqiliebiao':'icon-zhankailiebiao'"
             :title="showOcrTextList ? '关闭识别文本' : '打开识别文本'"
             @click="showOcrTextList = !showOcrTextList"
          ></i>
          <i class="iconfont icon-guanbi" @click="handleClosePreview"></i>
        </div>
      </div>


      <div class="image-box-main">
        <div class="image-viewer-wrapper">
          <div class="image-container">
            <img :src="getRowImageSrc(this.imageList[playIndex])"
                 @mousedown.prevent="mousedown"
                 id="image"
                 alt="">
          </div>
        </div>
        <div class="ocr-text-wrapper" v-show="!showOcrTextList">
          <div class="text-list">
            <div class="text-list-item"
                 v-for="(item,index) in res" :key="index">
              <span class="inline-block-v-middle">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  </transition>

</template>

<script>
import { imageOcr } from '@/request/file'

export default {
  name: 'ImageOcr',
  props: {},
  components: {},
  data () {
    return {
      visible: false,
      playIndex: 0,
      showOcrTextList: false,
      fileInfo: Object,
      ocrResult: [],
      imageScale: 1,
      imageWidth: 0,
      imageHeight: 0,
      res: []
    }
  },
  watch: {},
  computed: {
    // 当前显示的文件信息
    activeFileObj () {
      return this.imageList.length ? this.imageList[this.playIndex] : {}
    }
  },
  created () {
    if (this.activeFileObj.length > 4194304) {
      this.$message.error('图片大小不能超过4M')
      this.handleClosePreview()
    }
  },
  mounted () {
    this.playIndex = this.defaultIndex
    this.ocr(this.imageList[this.playIndex].id)
  },
  methods: {
    ocr (id) {
      const data = {
        fileId: id
      }
      imageOcr(data).then((res) => {
        console.log(res)
        if (res.code === 0) {
          console.log(res.data)
          this.res = res.data.result
          console.log(this.res)
          // this.pageData.total = res.data.total
          // this.loading = false
        } else {
          this.$toast.error(res.msg)
        }
      })
    },
    mousedown (event) {
      this.selectElement = document.getElementById('image')
      const div1 = this.selectElement
      this.selectElement.style.cursor = 'move'
      this.isDowm = true
      const distanceX = event.clientX - this.selectElement.offsetLeft
      const distanceY = event.clientY - this.selectElement.offsetTop
      document.onmousemove = function(ev) {
        const oevent = ev || event
        div1.style.left = oevent.clientX - distanceX + 'px'
        div1.style.top = oevent.clientY - distanceY + 'px'
      }
      document.onmouseup = function() {
        document.onmousemove = null
        document.onmouseup = null
        div1.style.cursor = 'default'
      }
    },
    handleClosePreview () {
      this.visible = false
      setTimeout(() => {
        this.callback('cancel')
      }, 799)
    }
  }
}
</script>

<style lang="less" scoped>
@keyframes bottom-to-top {
  0% {
    transform: translateY(100%);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes top-to-bottom {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(100%);
  }
}

.transition-fade-in {
  animation: bottom-to-top .8s forwards;
  animation-duration: .8s; /*动画持续时间*/
  -webkit-animation: bottom-to-top .8s; /*针对webkit内核*/
}

.transition-fade-out {
  animation-duration: .8s; /*动画持续时间*/
  animation: top-to-bottom 1s ease-in;
  -webkit-animation: top-to-bottom .8s; /*针对webkit内核*/
}


.image-main {
  width: 100%;
  height: 100%;
  background-color: #000000;
  //position: relative;
  position: fixed;
  transition: bottom 0.5s ease;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  //display: flex;
  flex-flow: row;
  z-index: 1999;

  .image-header {
    width: 100%;
    height: 60px;
    border-bottom: 3px solid #878c9c;
    z-index: 1999;
    vertical-align: middle;
    min-width: 280px;

    .head-title {
      left: 10px;
      width: calc(100% - 240px);
      max-width: calc(100% - 2.92826vw);
      margin-left: 20px;
      font-size: 17px;
      line-height: 60px;
      font-weight: 700;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-right {
      //position: absolute;
      margin-right: 0;
      width: 200px;
      right: 10px;
      height: 60px;
      text-align: right;
      vertical-align: baseline;


      .iconfont:hover {
        color: #06a7ff;
      }

      .icon-tishi:hover + .player-hotkey-panel-container {
        display: block !important;
      }

      .iconfont {
        color: #fff;
        cursor: pointer;
        padding: 0 15px;
      }

      .icon-xiazai {
        //margin-right: 10px;
        font-size: 20px;
        font-weight: 700;
      }

      .icon-guanbi {
        //height: 5vh;
        //line-height: 5vh;
        //margin-left: 15px;
        font-size: 20px;
        line-height: 60px;
        //position: absolute;
        //right: 20px;
      }
    }
  }

  .image-box-main {
    display: flex;
    height: calc(100vh - 60px);
    display: -webkit-box;
    display: -ms-flexbox;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;

    .image-viewer-wrapper {
      top: 0;
      -webkit-box-flex: 1;
      -ms-flex: 1;
      //flex: 1;
      width: 50%;
      height: 100%;
      -o-object-fit: fill;

      .image-container {
        position: relative;
        width: 100%;
        height: calc(100% - 60px);

        img {
          position: absolute;
          left: 50%;
          top: 50%;
          object-fit: contain;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;

        }
      }
    }

    .ocr-text-wrapper {
      margin-left: 8px;
      background: #000;
      //width: 50%;
      flex: 1;
      height: 100%;
      color: #fff;
      border-left: 3px solid #636d7e;

      .text-list {
        width: 100%;
        height: calc(100% - 60px);
        padding-left: 15px;
        line-height: 30px;
        font-weight: 600;
        text-align: left;
        overflow-y: auto;
      }
    }
  }
}
</style>
