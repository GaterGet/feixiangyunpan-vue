<template>
  <div class="upload-file-wrapper" @mousedown="mousedown" v-bind:id="id">
    <!-- 上传文件组件 -->
    <uploader
      class="uploader-app"
      ref="uploader"
      :options="options"
      :autoStart="false"
      :fileStatusText="fileStatusText"
      @files-added="handleFilesAdded"
      @file-success="handleFileSuccess"
      @file-error="handleFileError"
    >
      <uploader-unsupport></uploader-unsupport>
      <!-- 选择按钮 在这里隐藏 -->
      <uploader-btn class="select-file-btn" :attrs="attrs" ref="uploadBtn"
      >选择文件
      </uploader-btn>
      <uploader-btn
        class="select-file-btn"
        :attrs="attrs"
        :directory="true"
        ref="uploadDirBtn"
      >选择目录
      </uploader-btn>
      <!-- 拖拽上传 -->
      <uploader-drop
        class="drop-box"
        id="dropBox"
        @paste.native="handlePaste"
        v-show="dropBoxShow"
      >
        <div class="paste-img-wrapper" v-show="pasteImg.src">
          <div class="paste-name">{{ pasteImg.name }}</div>
          <img
            class="paste-img"
            :src="pasteImg.src"
            :alt="pasteImg.name"
            v-if="pasteImg.src"
          />
        </div>
        <span class="text" v-show="!pasteImg.src">
          截图粘贴或将文件拖拽至此区域上传
        </span>
        <i
          class="upload-icon el-icon-upload"
          v-show="pasteImg.src"
          @click="handleUploadPasteImg"
        >上传图片</i
        >
        <i
          class="delete-icon el-icon-delete"
          v-show="pasteImg.src"
          @click="handleDeletePasteImg"
        >删除图片</i
        >
        <i class="close-icon el-icon-circle-close" @click="dropBoxShow = false"
        >关闭</i
        >
      </uploader-drop>
      <!-- 上传列表 -->
      <uploader-list v-show="panelShow">
        <template v-slot:default="props">
          <div class="file-panel">
            <div class="file-title">
              <span class="title-span">
                上传列表<span class="count">({{ props.fileList.length }})</span>
              </span>
              <div class="operate">
                <el-button
                  type="text"
                  :title="collapse ? '展开' : '折叠'"
                  :icon="collapse ? 'el-icon-full-screen' : 'el-icon-minus'"
                  @click="collapse ? (collapse = false) : (collapse = true)"
                >
                </el-button>
                <el-button
                  @click="handleClosePanel"
                  type="text"
                  title="关闭"
                  icon="el-icon-close"
                >
                </el-button>
              </div>
            </div>
            <!-- 正在上传的文件列表 -->
            <el-collapse-transition>
              <ul class="file-list" v-show="!collapse">
                <li
                  class="file-item"
                  :class="{ 'custom-status-item': file.statusStr !== '' }"
                  v-for="file in props.fileList"
                  :key="file.id"
                >
                  <uploader-file
                    ref="fileItem"
                    :file="file"
                    :list="true"
                  ></uploader-file>
                  <!-- 自定义状态 -->
                  <span class="custom-status" style="margin-left: 30px">{{ file.statusStr }}</span>
                </li>
                <div class="no-file" v-if="!props.fileList.length">
                  <i class="icon-empty-file"></i> 暂无待上传文件
                </div>
              </ul>
            </el-collapse-transition>
          </div>
        </template>
      </uploader-list>
    </uploader>
  </div>
</template>

<script>
import Bus from '@/libs/bus'
import SparkMD5 from 'spark-md5'
import store from '@/store'

export default {
  name: 'UploadTask',
  props: {},
  components: {},
  data () {
    return {
      options: {
        target: `${this.$config.baseContext}/filetransfer/upload`, // 上传地址
        maxChunkRetries: 3,
        chunkSize: 1024 * 1024, //  每个分片的大小
        fileParameterName: 'file', //  上传文件时文件的参数名,默认 file
        testChunks: true, //  是否开启分片已存在于服务器的校验
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function(chunk, message) {
          const objMessage = JSON.parse(message)
          if (objMessage.code === 0) {
            const data = objMessage.data
            if (data.skipUpload) {
              // 分片已存在于服务器中
              return true
            }
            return (data.uploaded || []).indexOf(chunk.offset + 1) >= 0
          } else {
            console.log(objMessage.msg)
            return true
          }
        },
        // singleFile: true,
        query: { // 传参,没有可以不传
          module: 10
        }

      },
      attrs: {
        accept: '*'
      },
      // 文件状态文案映射
      fileStatusText: {
        success: '上传成功',
        error: 'error',
        uploading: '上传中',
        paused: '暂停中',
        waiting: '等待中'
      },
      panelShow: false, //  上传文件面板是否显示
      // 上传文件面板是否折叠
      collapse: false,
      dropBoxShow: false, //  拖拽上传是否显示
      // 粘贴图片的信息
      pasteImg: {
        src: '',
        name: ''
      },
      pasteImgObj: null, //  粘贴图片 File 对象
      filesLength: 0, //  上传的文件个数
      id: 'list_title'
    }
  },
  watch: {
    filesLength (val) {
      if (val === 0) {
        // this.getFileList('/', true)
      }
    }
  },
  computed: {
    // Uploader上传组件实例
    uploaderInstance () {
      return this.$refs.uploader.uploader
    },
    // 剩余存储空间
    remainderStorageValue () {
      // return 1024 * 1024 * 1024
      var used = store.state.userStorage.storageSizeUsed
      var size = store.state.userStorage.storageSize
      // var used = window.localStorage.getItem('userStorage').storageSizeUsed
      // var size = window.localStorage.getItem('userStorage').storageSize
      // var size = JSON.parse(window.localStorage.getItem('userStorage')).storageSize
      return size - used
      // return this.$store.getters.remainderStorageValue
    }
  },
  methods: {
    /**
     * 上传组件预处理
     */
    handlePrepareUpload () {
      // this.options.headers.Authorization = 'Bearer ' + localStorage.getItem('token')
      // this.options.target = 'http://localhost:8080' + '?filePath=' + store.state.fullPath
      switch (this.uploadWay) {
        case 1: {
          this.$refs.uploadBtn.$el.click()
          break
        }
        case 2: {
          this.$refs.uploadDirBtn.$el.click()
          break
        }
        case 3: {
          this.pasteImg.src = ''
          this.pasteImg.name = ''
          this.pasteImgObj = null
          this.dropBoxShow = true
          break
        }
      }
    },
    // 图片粘贴事件
    handlePaste (event) {
      const pasteItems = (event.clipboardData || window.clipboardData).items
      if (pasteItems && pasteItems.length) {
        // 获取剪切板中最新的对象
        const imgObj = pasteItems[0].getAsFile()
        this.pasteImgObj =
          imgObj !== null
            ? new File(
              [imgObj],
              `fxyp_${new Date().valueOf()}.${
                imgObj.name.split('.')[1]
              }`,
              {
                type: imgObj.type
              }
            )
            : null
      } else {
        this.$message.error('当前浏览器不支持')
        return false
      }
      if (!this.pasteImgObj) {
        this.$message.error('粘贴内容非图片')
        return false
      }
      this.pasteImg.name = this.pasteImgObj.name
      // 此时file就是剪切板中的图片对象
      // 如果需要预览,可以执行下面代码
      const reader = new FileReader()
      const _this = this
      reader.onload = function(event) {
        _this.pasteImg.src = event.target.result
      }
      reader.readAsDataURL(this.pasteImgObj)
    },
    // 上传粘贴的图片
    handleUploadPasteImg () {
      this.uploaderInstance.addFile(this.pasteImgObj) //  触发文件添加事件
    },
    // 删除粘贴的图片
    handleDeletePasteImg () {
      this.pasteImg.src = ''
      this.pasteImg.name = ''
      this.pasteImgObj = null
    },
    /**
     * 添加批量文件的回调函数
     * @description 对单个或批量文件都按此逻辑处理
     * @param {object} files 批量文件信息
     */
    handleFilesAdded (files) {
      // 批量选择的文件的总体大小
      const filesTotalSize = files
        .map((item) => item.size)
        .reduce((pre, next) => {
          return pre + next
        }, 0)
      if (this.remainderStorageValue < filesTotalSize) {
        // 批量选择的文件超出剩余存储空间
        this.$toast.warning(
          `剩余存储空间不足,请重新选择${files.length > 1 ? '批量' : ''}文件`
        )
        // https://github.com/simple-uploader/vue-uploader/blob/master/README_zh-CN.md#%E4%BA%8B%E4%BB%B6
        files.ignored = true //  本次选择的文件过滤掉
      } else {
        // var index = files[0].relativePath.indexOf('/') // 20，获取/符号的位置
        // var path = files[0].relativePath.substring(files[0].relativePath.length, files[0].relativePath.length - index) // ，截取最后一位数

        // 批量或单个选择的文件未超出剩余存储空间,正常上传
        this.filesLength += files.length
        files.forEach((file) => {
          this.dropBoxShow = false
          this.panelShow = true
          this.collapse = false
          this.computeMD5(file)
        })
      }
    },
    /**
     * 文件上传成功 回调函数
     * @param {object} rootFile 成功上传的文件所属的根 Uploader.File 对象,它应该包含或者等于成功上传文件
     * @param {object} file 当前成功的 Uploader.File 对象本身
     * @param {string} response 服务端响应内容,永远都是字符串
     */
    handleFileSuccess (rootFile, file, response) {
      if (response == '') {
        file.statusStr = '上传失败'
        this.callback(false)
        return
      }

      const result = JSON.parse(response)
      // store.commit('updateUserStorage', result.data.storage)
      if (result.code === 0) {
        file.statusStr = ''
        if (this.filesLength === 1) {
          // 本次所有的文件均已上传完毕
          this.$toast.success('上传完毕')
          Bus.$emit('updateFileList')
          // this.getFileList(this.fullPath,true)
          // this.serviceEl.$store.dispatch('showStorage')
          this.callback(true)
        }
      } else {
        this.$message.error(result.message)
        file.statusStr = '上传失败'
      }
      this.filesLength--
    },
    /**
     * 文件上传失败 回调函数
     * @param {object} rootFile 成功上传的文件所属的根 Uploader.File 对象,它应该包含或者等于成功上传文件
     * @param {object} file 当前成功的 Uploader.File 对象本身
     * @param {string} response 服务端响应内容,永远都是字符串
     */
    handleFileError (rootFile, file, response) {
      this.$toast.error(response)
    },
    /**
     * 计算md5,实现断点续传及秒传
     * @param {object} file 文件信息
     */
    computeMD5 (file) {
      const fileReader = new FileReader()
      const blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice
      let currentChunk = 0
      const chunkSize = 1024 * 1024
      const chunks = Math.ceil(file.size / chunkSize)
      const spark = new SparkMD5.ArrayBuffer()
      // 文件状态设为"计算MD5"
      file.statusStr = '计算MD5'
      file.pause()
      loadNext()
      fileReader.onload = (e) => {
        spark.append(e.target.result)
        if (currentChunk < chunks) {
          currentChunk++
          loadNext()
          // 实时展示MD5的计算进度
          file.statusStr = `校验MD5 ${((currentChunk / chunks) * 100).toFixed(
            0
          )}%`
        } else {
          const md5 = spark.end()
          this.calculateFileMD5End(md5, file)
        }
      }
      fileReader.onerror = function() {
        this.$notify({
          title: '错误',
          message: `文件${file.name}读取出错,请检查该文件`,
          type: 'error',
          duration: 2000
        })
        file.cancel()
      }

      function loadNext () {
        const start = currentChunk * chunkSize
        const end =
          start + chunkSize >= file.size ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },
    /**
     * 文件MD5计算结束
     * @param {string} md5 文件 MD5 值
     * @param {object} file 文件对象
     */
    calculateFileMD5End (md5, file) {
      // 将自定义参数直接加载uploader实例的opts上
      Object.assign(this.uploaderInstance.opts, {
        query: {
          ...this.params
        }
      })
      file.uniqueIdentifier = md5
      file.resume()
      // 移除自定义状态
      file.statusStr = ''
    },
    /**
     * 关闭上传面板,并停止上传
     */
    handleClosePanel () {
      this.uploaderInstance.cancel()
      this.panelShow = false
      this.callback('cancel')
    },
    mousedown (event) {
      this.selectElement = document.getElementById(this.id)
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
    }
  },
  created () {
  },
  destroyed () {
    Bus.$off('fileAdded')
    Bus.$off('fileSuccess')
  }
}
</script>

<style lang="less" scoped>
.upload-file-wrapper {
  position: absolute;
  z-index: 2999;
  right: 16px;
  bottom: 16px;

  .drop-box {
    position: fixed;
    z-index: 19;
    top: 0;
    left: 0;
    border: 5px dashed #8091a5 !important;
    background: #ffffffd9;
    color: #8091a5 !important;
    text-align: center;
    box-sizing: border-box;
    height: 100%;
    line-height: 100%;
    width: 100%;

    .text {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      transform: translate(-50%, -50%);
      font-size: 30px;
    }

    .upload-icon {
      position: absolute;
      right: 176px;
      top: 16px;
      cursor: pointer;

      &:hover {
        color: #409EFF;
      }
    }

    .delete-icon {
      position: absolute;
      right: 80px;
      top: 16px;
      cursor: pointer;

      &:hover {
        color: #F56C6C;
      }
    }

    .close-icon {
      position: absolute;
      right: 16px;
      top: 16px;
      cursor: pointer;

      &:hover {
        color: #409EFF;
      }
    }

    .paste-img-wrapper {
      width: 100%;
      height: 100%;
    }

    .paste-img {
      margin-top: 16px;
      max-width: 90%;
      max-height: 80%;
    }

    .paste-name {
      height: 24px;
      line-height: 24px;
      font-size: 18px;
      color: #409EFF;
    }
  }

  .uploader-app {
    width: 560px;
  }

  .file-panel {
    background-color: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 7px 7px 0 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #ddd;

      .title-span {
        padding-left: 0;
        margin-bottom: 0;
        font-size: 16px;

        .count {
          color: #409EFF;
        }
      }

      .operate {
        flex: 1;
        text-align: right;

        .el-button--text {
          color: #303133;

          i[class^=el-icon-] {
            font-weight: 600;
          }

          &:hover {
            .el-icon-full-screen, .el-icon-minus {
              color: #409EFF;
            }

            .el-icon-close {
              color: #F56C6C;
            }
          }
        }
      }
    }

    .file-list {
      position: relative;
      height: 240px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;
      font-size: 12px;
      list-style: none;
      //setScrollbar(6px, #EBEEF5, #C0C4CC);

      .file-item {
        position: relative;
        background-color: #fff;

        .uploader-file {
          height: 40px;
          line-height: 40px;

          .uploader-file-progress {
            border: 1px solid #409EFF;
            border-right: none;
            border-left: none;
            background: #e1f3d8;
          }

          .uploader-file-name {
            width: 44%;
          }

          .uploader-file-size {
            width: 16%;
          }

          .uploader-file-meta {
            display: none;
          }

          .uploader-file-status {
            width: 30%;
            text-indent: 0;
          }

          .uploader-file-actions > span {
            margin-top: 12px;
          }
        }

        .uploader-file[status='success'] {
          .uploader-file-progress {
            border: none;
          }
        }
      }

      .file-item.custom-status-item {
        .uploader-file-status {
          visibility: hidden;
        }

        .custom-status {
          position: absolute;
          top: 0;
          right: 10%;
          width: 24%;
          height: 40px;
          line-height: 40px;
        }
      }
    }

    &.collapse {
      .file-title {
        background-color: #E7ECF2;
      }
    }
  }

  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }

  :deep(.uploader-file-icon ) {
    display: none;
  }

  :deep(.uploader-file-actions > span ) {
    margin-right: 6px;
  }
}

/* 隐藏上传按钮 */
.select-file-btn {
  display: none;
}
</style>
