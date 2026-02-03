<template>
  <div class="pdf-preview-main" :class="visible ? 'transition-fade-in' : 'transition-fade-out'">
    <div class="pdf-header text-elip inline-block-v-middle">
      <div
        class="head-title text-elip inline-block-v-middle"
        :title="fileInfo.fileName"
      >
        {{ this.fileInfo.fileName }}
      </div>
      <div class="header-right inline-block-v-middle">
        <i class="iconfont icon-pdfturnword" @click="toDoc(this.fileInfo,'docx')" title="PDF转Word"></i>
        <i class="iconfont icon-guanbi" @click="handleClosePreview"></i>
      </div>
    </div>
    <div class="pdf-content-wrapper  inline-block-v-middle">
      <!--目录-->
      <div class="left-bar-wrap inline-block-v-middle"
           v-show="showContent">
        <div class="tab-pane">
          <div class="thumbnail-container">
            <div class="thumbnail-list"
                 ref="contentScroll"
            >
              <div class="thumbnail-pdf thumbnail-list-item pdf-page"
                   :class="i === currentPage ? 'active' : ''"
                   v-for="i in pageNum"
                   :key="i"
                   @click="changePage(i)"
                   style=""
              >
                <pdf
                  class="thumbnail-wrapper"
                  :key="i"
                  :page="i"
                  ref="pdf"
                  :src="src"
                  :rotate="pageRotate"
                  @progress="loadedRatio = $event"
                  @page-loaded="pageLoaded($event)"
                  @error="pdfError($event)"
                  style="
                    width: 140px;
                    height: 200px;
                    padding: 0 5px;
                    margin: 0 auto;
                  "
                >
                </pdf>

                <div
                  class="thumbnail-index"
                  :class="i === currentPage ? 'active' : ''"
                  @click="changePage(i)"
                >
                  {{ i }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--显示主区域-->
      <div class="pdf-container">
        <!--全部显示-->
        <div class="pdf-dashboard pdf-page-mount default"
             ref="pdfContainer"
        >
          <!--:style="{'height': '5000px'}"-->
          <div class="pdf-page-wrapper"
               ref="dashboarScroll"
               @mouseover="changeFlag(true)"
               style="transform-origin: 0 0; transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1); transition-duration: 0ms; transform: translate(0px, 0px) scale(1) translateZ(0px);">

            <div class="pdf-page loaded"
                 v-for="i in pageNum"
                 :key="i"
                 :page="i"
                 :style="{'width':viewWidth}"
            >
              <pdf class="pdf-main"
                   ref="pdf"
                   :src="src"
                   :page="i"
                   :rotate="pageRotate"
                   @progress="loadedRatio = $event"
                   @page-loaded="pageLoaded($event)"
                   @error="pdfError($event)"
                   style="padding: 0 5px; width: 100%; margin: 0 auto"
              >
              </pdf>
            </div>
          </div>
        </div>
        <Loading v-if="pageCount=0"></Loading>
      </div>
    </div>
    <!--底部-->
    <div class="footer inline-block-v-middle">
      <div class="left inline-block">
        <i
          class="iconfont icon-mulu"
          @click="showContent = !showContent"
          title="目录"
        ></i>
        <div class="component-divider"></div>

        <i
          class="iconfont icon-diyige"
          @click.stop="firstPage"
          title="首页"
        ></i>
        <i
          class="iconfont icon-zuo mr10"
          title="上一页"
          @click.stop="prePage"
        ></i>
        <div class="page inline-block-v-middle" title="页码">
          {{ currentPage }}/{{ pageNum }}
        </div>
        <i class="iconfont icon-you" title="下一页" @click.stop="nextPage"></i>
        <i
          class="iconfont icon-zuihouyige"
          title="尾页"
          @click.stop="lastPage"
        ></i>

        <div class="component-divider"></div>

        <i
          class="iconfont icon-nishizhencounterclockwise3"
          title="逆时针旋转"
          @click.stop="counterClock"
        ></i>
        <i
          class="iconfont icon-shunshizhenfangxiangclockwise4"
          title="顺时针旋转"
          @click.stop="clock"
        ></i>

      </div>

      <div class="right inline-block">
        <i class="iconfont icon-shiheyemian" @click="changeScale(0)"></i>
        <i class="iconfont icon-shijidaxiao" @click="changeScale(100)"></i>
        <i
          class="iconfont icon-jian"
          :class="scale <= 1 ? 'disabled' : ''"
          @click="changeScale(-1)"
        ></i>
        <div class="component-divider"></div>

        <div class="scale inline-block">
          <span class="scale-text">{{ scale }}%</span>
        </div>
        <div class="component-divider"></div>

        <i class="iconfont icon-jia" @click="changeScale(1)"></i>
      </div>
    </div>
  </div>
</template>

<script>
import pdf from 'vue-pdf'
import Vue from 'vue'
import { getProgress } from '@/request/file'
import Bus from '@/libs/bus'

var formatTimer

export default {
  name: 'PdfPreview',
  props: {},
  components: {
    pdf
  },
  data () {
    return {
      visible: false,
      // 显示模式 single:单页显示  default: 全部显示
      showMode: 'default',
      showContent: true,
      flag: false,
      // pdf原始宽
      originWidth: 0,
      // pdf原始高
      originHeight: 0,
      //
      width: 0,
      height: 0,
      contentPageHeight: 200,
      pageHeight: 0,
      // 使用键盘上下移动
      pressKey: false,
      scale: 100,
      url: 'http://storage.xuetangx.com/public_assets/xuetangx/PDF/PlayerAPI_v1.0.6.pdf',
      // 总页数
      pageCount: 0,
      pageNum: 0,
      pageRotate: 0,
      // 加载进度
      loadedRatio: 0,
      currentPage: 1,
      src: ''
    }
  },
  watch: {
    pageNum: function(val) {
      // const r = this.$el.querySelector('.pdf-page-wrapper')
      // console.log(r)
    },
    currentPage: function(newValue, oldValue) {
      if (this.pressKey) {
        const l = this.$el.querySelector('.thumbnail-list')
        // 增加页
        if (newValue > oldValue) {
          if (this.currentPage <= this.pageNum) {
            if (this.currentPage < 3) {
              l.scrollTop = ((this.currentPage) / this.pageCount) * l.scrollHeight
            } else {
              l.scrollTop = ((this.currentPage - 2) / this.pageNum) * l.scrollHeight
            }
          }
        } else {
          if (this.currentPage >= 1) {
            if (this.currentPage > this.pageNum - 2) {
              l.scrollTop = ((this.currentPage) / this.pageNum) * l.scrollHeight
            } else {
              l.scrollTop = ((this.currentPage - 2) / this.pageNum) * l.scrollHeight
            }
          }
        }
        this.pressKey = false
      }
    }
  },
  computed: {
    scaleNum () {
      return this.scale + '%'
    },
    viewWidth () {
      return this.originWidth * this.scale * 0.01 + 'px'
    },
    viewHeight () {
      return this.originHeight * this.scale * 0.01 + 'px'
    }
  },
  created () {
    this.src = this.getFilePath(this.fileInfo)
    // 'http://storage.xuetangx.com/public_assets/xuetangx/PDF/PlayerAPI_v1.0.6.pdf'
    // 有时PDF文件地址会出现跨域的情况,这里最好处理一下
    debugger
    console.log(pdf)
    this.src = pdf.createLoadingTask(this.src)
    this.handlePdfTask(this.src)
    // this.src.promise.then((pdf) => {
    //   this.pageCount = pdf.numPages
    //   // this.currentPage = 1
    // })

    // 创建PDF加载任务
    // const task = pdf.createLoadingTask(this.src)
    // this.src = task
    // this.handlePdfTask(task)
    // this.src.promise.then(pdf => {
    //   this.pageCount = pdf.numPages
    // })
  },
  mounted () {
    window.addEventListener('keydown', this.KeyDown)

    const l = this.$el.querySelector('.thumbnail-list')
    const r = this.$el.querySelector('.pdf-page-wrapper')
    // 当滚动目录时.主区域跟随滚动
    // l.addEventListener('mousewheel', function() {
    //   Vue.nextTick(() => {
    //     // r.scrollTop = l.scrollTop
    //     r.scrollTop = l.scrollTop / (l.scrollHeight - l.clientHeight) * (r.scrollHeight - r.clientHeight)
    //   })
    // })
    // 当滚动主区域时.目录跟随滚动
    r.addEventListener('mousewheel', function() {
      Vue.nextTick(() => {
        l.scrollTop = r.scrollTop / (r.scrollHeight - r.clientHeight) * (l.scrollHeight - l.clientHeight)
      })
    })
    // 禁用默认缩放
    document.addEventListener('keydown', function(event) {
      if ((event.ctrlKey === true || event.metaKey === true) &&
        (event.which === 61 || event.which === 107 ||
          event.which === 173 || event.which === 109 ||
          event.which === 187 || event.which === 189)) {
        event.preventDefault()
      }
    }, false)
    // Chrome IE 360
    window.addEventListener('mousewheel', function(event) {
      if (event.ctrlKey === true || event.metaKey) {
        event.preventDefault()
      }
    }, { passive: false })

    // firefox
    window.addEventListener('DOMMouseScroll', function(event) {
      if (event.ctrlKey === true || event.metaKey) {
        event.preventDefault()
      }
    }, { passive: false })
    window.addEventListener('mousewheel', this.handleScroll, { passive: false })
  },
  methods: {
    /**
     * 新页面预览接口返回的pdf文件流
     * @param {string} url 接口url
     * @param {int} type 1为返回url对象，用于新页面除PDF外还有其它操作；2为直接打开新页面预览PDF
     * @param {string} callBack 回调
     */
    previewPdf (url, type = 1, callBack) {
      const xhr = new XMLHttpRequest()
      xhr.withCredentials = true
      xhr.open('get', url, true)
      xhr.setRequestHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      xhr.responseType = 'blob'
      xhr.onload = function() {
        if (this.status === 200) {
          let changeUrl = ''
          const file = new Blob([this.response], { type: 'application/pdf' })
          if (window.createObjectURL !== undefined) { // basic
            changeUrl = window.createObjectURL(file)
          } else if (window.webkitURL !== undefined) { // webkit or chrome
            try {
              changeUrl = window.webkitURL.createObjectURL(file)
            } catch (error) {

            }
          } else if (window.URL !== undefined) { // Mozilla (firefox)
            try {
              changeUrl = window.URL.createObjectURL(file)
            } catch (error) {
              console.error(error)
            }
          }
          if (type === 1) {
            callBack && callBack(changeUrl)
          } else {
            const a = document.createElement('a')
            a.href = changeUrl
            a.target = '_blank'
            const evt = document.createEvent('MouseEvents')
            evt.initEvent('click', true, true)
            a.dispatchEvent(evt)
          }
        }
      }
      xhr.send()
    },
    // 文件流pdf转换
    handlePreview () {
      this.previewPdf(this.src, 1, (changeUrl) => {
        this.src = changeUrl
        this.$nextTick(() => {
          this.loading = false
        })
      })
    },
    getFileUrl (file) {
      return ''
    },
    // 加载
    handlePdfLoaded (e) {
      if (e === this.pdfTotal) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.loading = false
          }, 500)
        })
      }
    },
    handlePdfTask (task) {
      const _this = this
      task.promise.then(pdf => {
        this.pageNum = pdf.numPages
        pdf.getPage(1).then(function(page) {
          var viewPort = page.getViewport({ scale: 1 })
          console.log(viewPort)
          // eslint-disable-next-line no-use-before-define
          var vp = JSON.parse(JSON.stringify(viewPort))
          console.log('vp.width===' + vp.width)

          _this.originWidth = parseInt(vp.width)
          _this.originHeight = parseInt(vp.height)
        })
      }).catch(err => {
        console.log(err)
        this.$toast.error('pdf加载失败')
      })
    },
    changeScale (num) {
      if (num === 100) {
        this.scale = num
        return
      }
      if (num == 0) {
        this.scale = 70
      }
      var step = this.scale * 0.5
      // 减
      if (num < 0) {
        if (this.scale > 500) {
          step = 150
        } else if (this.scale >= 200) {
          step = 50
        } else if (this.scale >= 100) {
          step = 25
        } else if (this.scale >= 50) {
          step = 20
        } else if (this.scale >= 35) {
          step = 15
        } else if (this.scale >= 10) {
          step = 5
        } else {
          step = 1
        }
        // 增
      } else {
        if (this.scale >= 200) {
          step = 100
        } else if (this.scale >= 100) {
          step = 50
        } else if (this.scale >= 50) {
          step = 25
        } else if (this.scale >= 35) {
          step = 20
        } else if (this.scale >= 10) {
          step = 10
        } else if (this.scale >= 5) {
          step = 5
        } else {
          step = 1
        }
      }

      this.scale += step * num
      if (this.scale <= 1) {
        this.scale = 1
      }
      if (this.scale >= 1000) {
        this.scale = 1000
      }

      // this.originWidth = this.originWidth * this.scale * 0.01
    },
    // pdf加载时
    loadPdfHandler (e) {
      this.currentPage = 1 // 加载的时候先加载第一页
    },
    changePage (index) {
      // const l = this.$el.querySelector('.thumbnail-list')
      const r = this.$el.querySelector('.pdf-page-wrapper')
      // l.scrollTop = r.scrollTop / (r.scrollHeight - r.clientHeight) * (l.scrollHeight - l.clientHeight)
      // r.scrollTop = l.scrollTop / (l.scrollHeight - l.clientHeight) * (r.scrollHeight - r.clientHeight)
      this.currentPage = index
      const pdfHeight = document.getElementsByClassName('pdf-page')[this.pageNum + 5].offsetHeight + 10
      const top = (index - 1) * pdfHeight
      r.scroll(0, top)
    },
    firstPage () {
      this.pressKey = true
      this.currentPage = 1
      this.main.scroll(0, 0)
    },
    lastPage () {
      this.pressKey = true
      this.currentPage = this.pageNum
      const r = this.$el.querySelector('.pdf-page-wrapper')
      const pdfHeight = document.getElementsByClassName('pdf-page')[this.pageNum + 5].offsetHeight + 20
      const top = (this.currentPage - 1) * pdfHeight
      console.log(pdfHeight, top)
      r.scroll(0, top)
    },
    // 上一页函数，
    prePage () {
      let page = this.currentPage
      page = page > 1 ? page - 1 : this.pageNum
      const r = this.$el.querySelector('.pdf-page-wrapper')
      this.pressKey = true
      this.currentPage = page
      const pdfHeight = document.getElementsByClassName('pdf-page')[this.pageNum + 5].offsetHeight + 10
      const top = (this.currentPage - 1) * pdfHeight
      r.scroll(0, top)
    },
    // 下一页函数
    nextPage () {
      let page = this.currentPage
      page = page < this.pageNum ? page + 1 : 1
      const r = this.$el.querySelector('.pdf-page-wrapper')
      this.pressKey = true
      this.currentPage = page
      const pdfHeight = document.getElementsByClassName('pdf-page')[this.pageNum + 5].offsetHeight + 10
      const top = (this.currentPage - 1) * pdfHeight
      r.scroll(0, top)
    },
    // 页面顺时针翻转90度。
    clock () {
      this.pageRotate += 90
    },
    // 页面逆时针翻转90度。
    counterClock () {
      this.pageRotate -= 90
    },
    // 页面加载回调函数，其中e为当前页数
    pageLoaded (e) {
      this.contentPageHeight = document.getElementsByClassName('pdf-page')[0].offsetHeight
      this.pageHeight = document.getElementsByClassName('pdf-page')[this.pageNum + 2].offsetHeight
      // this.currentPage = e
    },
    // 其他的一些回调函数。
    pdfError (error) {
      this.$toast.error(error)
      console.error(error)
    },
    // 关闭预览
    handleClosePreview () {
      this.visible = false
      setTimeout(() => {
        this.callback('cancel')
      }, 799)
    },
    changeFlag (flag) {
      this.flag = flag
    },
    KeyDown (event) {
      // eslint-disable-next-line no-caller
      const e = event || window.event || arguments.callee.caller.arguments[0]
      const key = e.keyCode // 键盘码值 keycode
      // 左
      if (key === 37) {
        // 上
      } else if (key === 38) {
        if (this.currentPage > 1) {
          this.pressKey = true
          this.changePage(this.currentPage - 1)
        }
        // 右
      } else if (key === 39) {
        // 下
      } else if (key === 40) {
        if (this.currentPage < this.pageNum) {
          this.pressKey = true
          this.changePage(this.currentPage + 1)
        }
      }
    },
    // 自定义缩放事件
    handleScroll (e) {
      // 判断是不是按下ctrl键
      var posX = 0
      var posY = 0
      // eslint-disable-next-line no-use-before-define
      var event = event || window.event
      if (event.pageX || event.pageY) {
        posX = event.pageX
        posY = event.pageY
      } else if (event.clientX || event.clientY) {
        posX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft
        posY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop
      }
      if (!(posX > 200 && posY > 60)) {
        return
      }
      if (e.ctrlKey) {
        // 取消浏览器默认的放大缩小网页行为
        e.preventDefault()
        // 判断是向上滚动还是向下滚动
        if (e.deltaY > 0) {
          this.changeScale(-1)
        } else {
          this.changeScale(1)
        }
      }
    },
    toDoc (row, conversionExt) {
      var _this = this
      var t = new Date().getTime()
      formatTimer = setInterval(function() {
        // 每5秒刷新一次
        const data = {
          type: 'conversion',
          fileExt: row.fileExt,
          convertExt: conversionExt,
          id: row.id,
          t: t
        }
        getProgress(data).then((res) => {
          Bus.$emit(
            'updateLoadingText',
            res.data.progress >= 100
              ? '转换完成'
              : '转换进度: ' + res.data.progress + '%'
          )
          if (res.data.finish === 1) {
            clearInterval(formatTimer)
            _this.getFileList()
          }
          Bus.$emit('toastMsg', ' 转换进度: ' + res.data.progress + '%')
          if (res.data.progress >= 100) {
            _this.getFileList(this.fullPath, true)
            Bus.$emit('toastMsg', ' 转换完成')
            clearInterval(formatTimer)
          }
        })
      }, 4000)
      // formatconversion(data, true).then((res) => {
      //   if (res.code === 0) {
      //     this.$toast.success('转换任务创建成功', -1)
      //     // this.file = res.data.file
      //     if (this.$route.query.category === 'all') {
      //       _this.getFileList(row.filePath, true)
      //     } else {
      //       this.getFileListByType(this.$route.query.category)
      //     }
      //   } else {
      //     this.$toast.error(res.msg)
      //   }
      // })
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

.pdf-preview-main {
  position: fixed;
  z-index: 3999;
  height: 100%;
  background-color: #fafafc;
  top: 0;
  left: 0;
  width: 100%;
  //height: 100%;

  .pdf-header {
    background-color: #000;
    //position: relative;
    width: 100%;
    height: 60px;
    border-bottom: 3px solid #878c9c;
    z-index: 1999;
    vertical-align: middle;
    min-width: 280px;

    .head-title {
      //position: absolute;
      left: 10px;
      width: calc(100% - 240px);
      max-width: calc(100% - 2.92826vw);
      margin-left: 20px;
      font-size: 17px;
      line-height: 60px;
      font-weight: 700;
      width: 100% -200px;
      //min-width: 220px;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-right {
      //position: absolute;
      margin-right: 0px;
      width: 200px;
      right: 10px;
      height: 60px;
      text-align: right;
      vertical-align: baseline;

      .iconfont:hover {
        color: #06a7ff;
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

  .pdf-content-wrapper {
    display: flex;
    background: #f2f4f7;
    flex: 1;
    position: relative;
    //background-color: #636d7e;
    //height: calc(90vh + 12px);
    overflow: hidden;
    height: calc(100% - 60px - 30px);
    min-height: 0;

    .left-bar-wrap {
      position: relative;
      //height: calc(100% - 31px);
      height: 100%;
      width: 200px;
      display: flex;
      display: -ms-flexbox;
      flex-wrap: nowrap;
      border-right: 1px solid #e2e6ed;
      background: #f2f4f7;
      //padding-bottom: 30px;


      .tab-pane {
        position: relative;
        display: inline-block;
        height: 100%;
        width: 100%;

        .thumbnail-container {
          width: 100%;
          height: 100%;

          .thumbnail-list {
            width: 100%;
            height: 100%;
            //min-height: 330px;
            overflow: auto;
            overflow-x: hidden;
            overflow-y: scroll;
            text-align: center;
            background: #f2f4f7;

            .thumbnail-pdf.active {
              border: 2px solid #ca3834 !important;

            }

            .thumbnail-pdf {
              display: inline-block;
              position: relative;
              margin: 12px 0;
              border: 2px solid #e2e6ed;

              .thumbnail-wrapper {
                display: inline-block;
                position: relative;
                overflow: hidden;
                background: #fff;
              }

              //.thumbnail-wrapper.active {
              //  border: 2px solid #ca3834 !important;
              //}
              //

            }

            .thumbnail-index.active {
              color: #ca3834;
            }

            .thumbnail-index {
              position: absolute;
              text-align: center;
              bottom: -20px;
              left: 50%;
              transform: translateX(-50%);
              line-height: 17px;
            }
          }
        }
      }
    }

    .pdf-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 1;
      background-color: #f2f4f7;

      .pdf-dashboard {
        position: relative;
        flex: 1;
        direction: ltr;
        overflow: auto;

        .pdf-page-wrapper {
          width: 100%;
          height: 100%;
          overflow-y: scroll;

          .pdf-page {
            padding: 0;
            left: 0;
            //padding: 3px 0;
            margin: 10px auto;
            background-color: #fff;
            //box-shadow: 0 2px 4px 0 hsl(0deg 0% 65% / 50%);
            //border: 2px solid #e2e6ed;
            overflow: hidden;
            background-position: 50%;
            background-repeat: no-repeat;
            z-index: 0;
          }
        }
      }
    }

    .pdf-main-body {
      height: 100%;
      display: inline-block;
      width: calc(100% - 200px);
      overflow: auto;


      .pdf-main {
        margin: 0 auto;
      }
    }
  }

  .footer {
    position: fixed;
    bottom: 0;
    height: 30px;
    width: 100%;
    background-color: #f2f4f7;
    border-top: 1px solid #e2e6ed;
    display: flex;
    justify-content: space-between;
    z-index: 99;
    user-select: none;

    .iconfont:hover {
      color: #06a7ff;
    }

    .iconfont {
      cursor: pointer;
      font-size: 18px;
      //color: #ffffff;
      margin: 0 4px;
      line-height: 30px;

      .disabled:hover {
        color: initial;
      }

      .disabled {
        pointer-events: inherit;
        opacity: 1 !important;
      }
    }

    .component-divider {
      margin: 0 4px;
      display: inline-block;
      width: 1px;
      height: 16px;
      background-color: #e2e6ed;
      flex-shrink: 0;
    }

    .left {
      text-align: left;
      min-width: 220px;


      .page {
        width: 60px;
        text-align: center;

      }
    }

    .right {
      text-align: right;
      right: 0;
      align-items: center;
      margin-right: 12px;
      vertical-align: middle;
      min-width: 150px;

      .scale {
        width: 60px;
        text-align: center;
      }

      .icon-jian.disabled {
      }
    }

    button {
      display: inline-block;
    }
  }
}
</style>
