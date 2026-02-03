import Vue from 'vue'
import Cookies from 'js-cookie'
import router from '@/router'
import config from '@/config/index.js'
import store from '@/store'
// import { Message, Notification } from 'element-ui'
import { fileImgMap, fileSuffixCodeModeMap, unknownImg, userAvatar } from '@/libs/map.js'
import { getFileListByPath } from '@/request/file'

// 全局函数
const baseUrl = process.env.NODE_ENV === 'development' ? '' : '/pan'
const globalFunction = {
  getHostUrl () {
    console.log(location)
    return window.location.origin + baseUrl
  },
  getHost () {
    // {
    //   "ancestorOrigins": {},
    //   "href": "http://localhost:8081/#/index?category=all",
    //   "origin": "http://localhost:8081",
    //   "protocol": "http:",
    //   "host": "localhost:8081",
    //   "hostname": "localhost",
    //   "port": "8081",
    //   "pathname": "/",
    //   "search": "",
    //   "hash": "#/index?category=all"
    // }
    //  http://localhost:8080/api/filetransfer/preview?time=1648104219000&id=675899e5e0d6c45d2ad7acf23e124b95&fileType=1&extensionName=png
    // 8080/api/filetransfer/preview?time=1648104219000&id=675899e5e0d6c45d2ad7acf23e124b95&fileType=1&extensionName=png

    return window.location.origin.replace('8081', config.serverPort)
  },
  goAccount (path, target = '_self') {
    open(`https://txcdn.leaving.top${path}?redirect=${location.href}`, target)
  },
  // 校验网址是否有效
  checkUrl (str) {
    var regUrl = /(http:\/\/)?([\w.]+)(\/[\w- ./?%&=]*)?/gi
    var result = str.match(regUrl)
    if (result != null) {
      return true
    } else {
      return false
    }
  },
  /*
   * 截取视频的第一帧
   */
  getVideoBase64 (url) {
    return new Promise(function(resolve) {
      let dataURL = ''
      const video = document.createElement('video')
      video.setAttribute('crossOrigin', 'anonymous') // 处理跨域
      video.setAttribute('src', url)
      video.setAttribute('width', 400)
      video.setAttribute('height', 240)
      video.setAttribute('autoplay', 'autoplay')
      video.addEventListener('canplaythrough', function() {
        const canvas = document.createElement('canvas')
        const width = video.width // canvas的尺寸和图片一样
        const height = video.height
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(video, 0, 0, width, height) // 绘制canvas
        dataURL = canvas.toDataURL('image/jpeg') // 转换为base64
        resolve(dataURL)
      })
    })
  },
  // 获取用户剩余空间大小
  getRemindSpace () {
    return (
      this.$store.state.userStorage.storageSize -
      this.$store.state.userStorage.storageSizeUsed
    )
  },
  // 更新复制移动的目标文件夹
  updateTargetFilepath (path) {
    store.commit('updateCopyMovePath', path)
  },
  getIndexPageTitle (category) {
    if (category === 'all') {
      return '全部文件'
    } else if (category === '1') {
      return '全部图片'
    } else if (category === '2') {
      return '全部文档'
    } else if (category === '3') {
      return '全部视频'
    } else if (category === '4') {
      return '全部种子'
    } else if (category === '5') {
      return '全部音频'
    } else if (category === '6') {
      return '其他文件'
    }
  },
  /**
   * 排序  order参数为 -1 时降序,为正数时升序
   * @param property
   * @param order
   * @returns {(function(*, *): *)|*}
   */
  compare (property, order) {
    return function(a, b) {
      var value1 = a[property]
      var value2 = b[property]
      if (order === -1) {
        return value2 - value1
      } else {
        return value1 - value2
      }
    }
  },
  /**
   * 去除字符串所有空格
   * @param str
   * @param isGlobal
   * @returns {*}
   * @constructor
   */
  trim (str, isGlobal) {
    var result
    result = str.replace(/(^\s+)|(\s+$)/g, '')
    if (isGlobal.toLowerCase() == 'g') {
      result = result.replace(/\s/g, '')
    }
    return result
  },
  /**
   * 复制到剪贴板
   * @param str
   * @returns {*}
   */
  copyToClipboard (text, tip) {
    var tipText = tip || '复制成功'
    const input = document.createElement('input')
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('Copy')
    document.body.removeChild(input)
    this.$toast.success(tipText)
  },

  /**
   * 格式化文件大小
   * @param {number} size 文件大小
   * @returns {string} 文件大小(带单位)
   */
  calculateFileSize (size) {
    const B = 1024
    const KB = Math.pow(1024, 2)
    const MB = Math.pow(1024, 3)
    const GB = Math.pow(1024, 4)
    if (size === 0) {
      return '0KB'
    } else if (!size) {
      return '_'
    } else if (size < KB) {
      return `${(size / B).toFixed(0)}KB`
    } else if (size < MB) {
      return (size / KB).toFixed(1) + 'MB'
    } else if (size < GB) {
      return (size / MB).toFixed(0) + 'GB'
    } else {
      return (size / GB).toFixed(3) + 'TB'
    }
  },
  /**
   * 获取文件创建时间时间戳
   * @param row
   * @returns {number}
   */
  getFileCreateTimeStamp (row) {
    // 转换时间戳
    if (typeof row.fileCreateTime === 'number') {
      return row.fileCreateTime
    }
    var date = row.fileCreateTime
    date = date.substring(0, 19)
    date = date.replace(/-/g, '/') // 必须把日期'-'转为'/'
    var timestamp = new Date(date).getTime()
    return timestamp
  },
  // 获取时间差
  getTimeDifference (timeStamp) {
    const now = new Date().getTime()
    const diff = timeStamp - now
    const day = Math.floor(diff / (24 * 3600 * 1000))
    // const hour = Math.floor(diff / (3600 * 1000)) - day * 24
    // const minute = Math.floor(diff / (60 * 1000)) - day * 24 * 60 - hour * 60
    // const second =
    //   Math.floor(diff / 1000) -
    //   day * 24 * 60 * 60 -
    //   hour * 60 * 60 -
    //   minute * 60
    if (day > 0) {
      return day + 1
    } else {
      return day
    }
  },
  // 计算时间差
  calcDiffTime (Time) {
    var now = new Date() // 新建一个日期对象，默认现在的时间
    var expireTime = new Date(Time) // 设置过去的一个时间点，"yyyy-MM-dd HH:mm:ss"格式化日期

    if (now.getTime() > expireTime.getTime()) {
      // 如果现在的时间大于过去的时间，则返回差值
      // 交换两个时间的值
      const temp = now
      now = expireTime
      expireTime = temp
    }
    const difftime = (expireTime - now) / 1000 // 计算时间差,并把毫秒转换成秒
    // console.log('expireTime:' + expireTime + '       now:' + now + '      difftime:' + difftime)
    const days = parseInt(difftime / 86400) // 天  24*60*60*1000
    const hours = parseInt(difftime / 3600) - 24 * days // 小时 60*60 总小时数-过去的小时数=现在的小时数
    const minutes = parseInt((difftime % 3600) / 60) // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
    if (days > 0) {
      return days + '天'
    } else if (hours > 0) {
      return hours + '小时'
    } else if (minutes > 0) {
      return minutes + '分钟'
    } else {
      return minutes + '秒'
    }
    // this.BindTime = days + '天' + hours + '时' + minutes + '分'
  },
  // 时间加指定天数返回新的时间Date
  addDate (date, days) {
    if (days == undefined || days == '') {
      days = 1
    }
    var newDate = new Date(date)
    newDate.setDate(date.getDate() + days)
    return newDate
  },
  getNumFromString (text) {
    var value = text.replace(/[^0-9]/gi, '')
    return value
  },
  storageTrans (size, status) {
    const B = 1024
    const KB = Math.pow(1024, 2)
    const MB = Math.pow(1024, 3)
    const GB = Math.pow(1024, 4)
    if (status) {
      // 截取整数部分
      if (!size) {
        return 0 + 'KB'
      } else if (size < KB) {
        return (size / B).toFixed(0) + 'KB'
      } else if (size < MB) {
        return (size / KB).toFixed(0) + 'MB'
      } else if (size < GB) {
        return (size / MB).toFixed(0) + 'GB'
      } else {
        return (size / GB).toFixed(0) + 'TB'
      }
    } else {
      if (!size) {
        return 0 + 'KB'
      } else if (size < KB) {
        return (size / B).toFixed(0) + 'KB'
      } else if (size < MB) {
        return (size / KB).toFixed(2) + 'MB'
      } else if (size < GB) {
        return (size / MB).toFixed(3) + 'GB'
      } else {
        return (size / GB).toFixed(4) + 'TB'
      }
    }
  },
  /**
   * 获取原图地址
   * @param row
   * @returns {string}
   */
  getRowImageSrc (row) {
    // 转换时间戳
    const timestamp = this.getFileCreateTimeStamp(row)
    var extensionName
    // 如果是视频的预览则统一图片格式为png
    if (row.fileExt === 'mp4') {
      extensionName = 'png'
    } else {
      extensionName = row.fileExt
    }
    return `${config.baseContext}/filetransfer/image?time=${timestamp}&id=${row.identifier}&fileType=${row.fileType}&extensionName=${extensionName}`
  },
  /**
   * 获取图片缩略图路径
   * @param {object} row 文件信息
   * @returns {string} 图片缩略图路径
   */
  getImgMinPath (row) {
    // 转换时间戳
    const timestamp = this.getFileCreateTimeStamp(row)
    var extensionName
    // 如果是视频的预览则统一图片格式为png
    if (row.fileExt === 'mp4') {
      extensionName = 'png'
    } else {
      extensionName = row.fileExt
    }
    // 如果是视频的预览则统一图片格式为png
    if (row.fileExt === 'mp4') {
      extensionName = 'png'
    } else {
      extensionName = row.fileExt
    }
    // 对于小于500KB的图片直接使用原图显示
    if (row.fileType === 1 && row.fileSize < 512000) {
      return this.getRowImageSrc(row)
    } else {
      return `${config.baseContext}/filetransfer/preview?time=${timestamp}&id=${row.identifier}&fileType=${row.fileType}&extensionName=${extensionName}`
    }
    // return `${config.baseContext}/filetransfer/preview?fileId=${
    //   row.id
    // }&isMin=true&shareBatchNum=${row.shareBatchNum}&extractionCode=${
    //   row.extractionCode
    // }&token=${globalFunction.getCookies('token')}`
  },
  /**
   * 获取文件查看路径
   * @param {object} row 文件信息
   * @returns {string} 文件路径
   */
  getViewFilePath (row) {
    const timestamp = this.getFileCreateTimeStamp(row)
    return `${config.baseContext}/filetransfer/preview/document?id=${row.identifier}&time=${timestamp}&fileType=${row.fileType}&extensionName=${row.fileExt}`
    // }&isMin=false&shareBatchNum=${row.shareBatchNum}&extractionCode=${
    //   row.extractionCode
    // }&token=${globalFunction.getCookies('token')}`
  },
  /**
   * 获取音视频流
   * @param row
   * @returns {string}
   */
  getMediaStreamPath (row) {
    const timestamp = this.getFileCreateTimeStamp(row)
    // var type
    // if (row.fileType === 3) {
    //   type = 'video'
    // } else {
    //   type = 'audio'
    // }
    return `${config.baseContext}/filetransfer/preview/stream?id=${row.identifier}&time=${timestamp}&fileType=${row.fileType}&extensionName=${row.fileExt}`
  },
  /**
   * 获取视频流播放地址
   * @param row
   * @returns {string}
   */
  getVideoStreamPath (row) {
    const timestamp = this.getFileCreateTimeStamp(row)

    return `${config.baseContext}/filetransfer/preview/video/stream?id=${row.identifier}&time=${timestamp}&fileType=${row.fileType}&extensionName=${row.fileExt}`
  },
  getVideoStreamObject (row) {
    var o = {
      id: row.identifier,
      time: new Date(row.fileCreateTime.valueOf()).getTime(),
      fileType: row.fileType,
      extensionName: row.fileExt
    }
    return o
  },
  /**
   * 获取文件下载路径
   * @param {object} row 文件信息
   * @returns {string}  文件下载路径
   */
  getDownloadFilePath (row) {
    if (row == undefined) {
      return
    }
    // TODO 下载地址生成
    // if (row.isDir===1) {
    //   var identifier = row.identifier
    // } else {
    //   identifier = row.id
    // }

    if (store.state.selectFileCount <= 1) {
      if (row.isDir === 0) {
        return `${config.baseContext}/filetransfer/download?id=${
          row.identifier
        }&uid=${row.userId}&fid=${row.id}&count=${
          store.state.selectFileIdList.length
        }&t=${new Date().getTime()}`
      } else {
        return `${config.baseContext}/filetransfer/download?uid=${
          row.userId
        }&fid=${row.id}&count=${
          store.state.selectFileIdList.length
        }&t=${new Date().getTime()}`
      }
    } else {
      // var secret
      // // secret = window.atob(store.state.selectFileIdList.toString())
      // secret = escape(store.state.selectFileIdList.toString()) // 编码
      // console.log(secret)
      var encodedData = window.btoa(store.state.selectFileIdList.toString()) // 编码
      return `${config.baseContext}/filetransfer/download/batch?filePath=${
        store.state.fullPath
      }&fileList=${encodedData}&t=${new Date().getTime()}`
    }
  },

  /**
   * 获取分享文件下载链接
   * @param batchNum
   * @param extractionCode
   * @returns {string}
   */
  getShareDownloadPath (shareInfo, extractionCode) {
    if (extractionCode !== null) {
      return `${config.baseContext}/filetransfer/download/batch?filePath=${shareInfo.filePath}&extractionCode=${extractionCode}`
    } else {
      return `${config.baseContext}/filetransfer/download/batch?filePath=${shareInfo.filePath}}`
    }
  },

  getFilePath (row) {
    return `${config.baseContext}/filetransfer/download?id=${row.identifier}&uid=${row.userId}&fid=${row.id}&count=${store.state.selectFileIdList.length}&download=1`
  },
  /**
   * 文件名称拼接，包括文件名称 + 文件后缀
   * @param {object} file 文件信息
   * @param {boolean} isHighlight 是否需要展示高亮效果，默认不需要
   * @returns {string} 完整文件名称
   */
  getFileNameComplete (file, isHighlight = false) {
    return isHighlight === true && file.highlightFields
      ? `${file.highlightFields}${
        file.isDir === 0 && file.fileExt ? `.${file.fileExt}` : ''
      }`
      : `${file.fileName}${
        file.isDir === 0 && file.fileExt ? `.${file.fileExt}` : ''
      }`
  },
  /**
   * 设置 Cookies
   * @param {string} name 名称
   * @param {string} value 值
   * @param {object} others 域名、路径、有效期等,封装到对象中
   */
  setCookies (name, value, others = null) {
    Cookies.set(name, value, { domain: config.domain, ...others })
  },
  /**
   * 获取 Cookies
   * @param {string} name 名称
   * @param {object} others 域名、路径等,封装到对象中
   * @returns {string} Cookies 值
   */
  getCookies (name, others = null) {
    return Cookies.get(name, { domain: config.domain, ...others })
  },
  /**
   * 移除 Cookies
   * @param {string} name 名称
   * @param {object} others 域名、路径等,封装到对象中
   */
  removeCookies (name, others = null) {
    Cookies.remove(name, { domain: config.domain, ...others })
  },
  clearCookies () {
    // 清除所有的cookies
    Cookies.remove()
  },
  /**
   * 获取分享链接
   * @param {string} shareBatchNum
   * @returns {string} 完整的分享链接
   */
  getShareLink (shareBatchNum) {
    return `${location.protocol}//${location.host}/share/${shareBatchNum}`
  },
  /**
   * 复制分享链接
   * @param {string} shareBatchNum
   * @param {string} extractionCode
   */
  copyShareLink (shareBatchNum, extractionCode) {
    const input = document.createElement('textarea')
    // 直接构建textarea以保持换行
    input.value =
      extractionCode === null
        ? `分享链接:${this.getShareLink(
          shareBatchNum
        )}\n复制链接到浏览器中并输入提取码即可查看文件`
        : `分享链接:${this.getShareLink(
          shareBatchNum
        )}\n提取码:${extractionCode}\n复制链接到浏览器中并输入提取码即可查看文件` // 设置内容
    document.body.appendChild(input) // 添加临时实例
    input.select() // 选择实例内容
    document.execCommand('Copy') // 执行复制
    document.body.removeChild(input) // 删除临时实例
    // Message.success('复制成功')
  },
  /**
   * 根据文件扩展名设置文件图片
   * @param {object} file 文件信息
   */
  setFileImg (file) {
    if (file.isDir === 1) {
      //  文件夹
      return fileImgMap.get('dir')
    } else if (file.fileName.includes('mp4')) {
      return fileImgMap.get('mp4')
    } else if (
      Number(router.currentRoute.query.fileType) !== 6 &&
      ['jpg', 'png', 'jpeg', 'gif', 'mp4'].includes(file.fileExt)
    ) {
      // 图片、视频类型,直接显示缩略图
      return this.getImgMinPath(file)
    } else if (fileImgMap.has(file.fileExt)) {
      // 可以识别文件类型的文件
      return fileImgMap.get(file.fileExt)
    } else {
      // 无法识别文件类型的文件
      return unknownImg
    }
  },
  setUserAvatar (row) {
    if (row.avatar) {
      return row.avatar
    } else {
      return userAvatar
    }
  },
  setFolderImg () {
    return fileImgMap.get('dir')
  },
  /**
   * 返回文件的类型图标
   * @param file
   * @returns {unknown}
   */
  setFileImgByFileType (file) {
    if (file.isDir === 1) {
      //  文件夹
      return fileImgMap.get('dir')
    } else if (file.fileName.includes('mp4')) {
      return fileImgMap.get('mp4')
    } else if (fileImgMap.has(file.fileExt)) {
      // 可以识别文件类型的文件
      return fileImgMap.get(file.fileExt)
    } else {
      // 无法识别文件类型的文件
      return unknownImg
    }
  },
  getImageCompleteUrl (row) {
    // 转换时间戳
    const timestamp = this.getFileCreateTimeStamp(row)
    // http://localhost:8081/api/filetransfer/image?time=…82a9ec0277b788ed77e8&fileType=1&extensionName=png
    // return `${location.protocol}//${location.host}/share/${shareBatchNum}`
    console.log(window.location)
    if (config.serverPort > 8000) {
      var s = `${window.location.protocol}//${location.hostname}:${config.serverPort}${config.baseContext}/filetransfer/image?time=${timestamp}&id=${row.identifier}&fileType=${row.fileType}&extensionName=${row.fileExt}`
    } else {
      s = `${window.location.protocol}//${location.hostname}${config.baseContext}/filetransfer/image?time=${timestamp}&id=${row.identifier}&fileType=${row.fileType}&extensionName=${row.fileExt}`
    }
    return s
  },
  /**
   * 图片预览
   * @param {*} currentIndex 当前图片索引
   * @param {*} imgInfo 单个图片信息
   * @param {*} imgInfoList 多个图片列表
   */
  handleImgPreview (currentIndex, imgInfo = {}, imgInfoList = []) {
    // 图片分类下 - 传递整个页面的图片列表;非图片分类下 - 由单个图片构建图片列表
    const imgList =
      Number(router.currentRoute.query.fileType) === 1
        ? imgInfoList.map((item) => {
          return {
            fileUrl: this.getViewFilePath(item),
            downloadLink: this.getDownloadFilePath(item),
            fileName: item.fileName,
            extendName: item.extendName
          }
        })
        : [
          {
            fileUrl: this.getViewFilePath(imgInfo),
            downloadLink: this.getDownloadFilePath(imgInfo),
            fileName: imgInfo.fileName,
            extendName: imgInfo.extendName
          }
        ]
    const defaultIndex =
      Number(router.currentRoute.query.fileType) === 1 ? currentIndex : 0
    Vue.prototype.$previewImg({
      imgList,
      defaultIndex
    })
  },
  /**
   * 视频预览
   * @param {*} currentIndex 当前视频索引
   * @param {*} videoInfo 单个视频信息
   * @param {*} videoInfoList 多个视频列表
   */
  handleVideoPreview (currentIndex, videoInfo = {}, videoInfoList = []) {
    // 视频分类下 - 传递整个页面的视频列表;非视频分类下 - 由单个视频构建视频列表
    const videoList =
      Number(router.currentRoute.query.category) === 3
        ? videoInfoList.map((item) => {
          return {
            ...item,
            fileUrl: this.getViewFilePath(item),
            downloadLink: this.getDownloadFilePath(item),
            fileName: item.fileName,
            extendName: item.fileExt
          }
        })
        : [
          {
            ...videoInfo,
            fileUrl: this.getViewFilePath(videoInfo),
            downloadLink: this.getDownloadFilePath(videoInfo),
            fileName: videoInfo.fileName,
            extendName: videoInfo.fileExt
          }
        ]
    const defaultIndex =
      Number(router.currentRoute.query.category) === 3 ? currentIndex : 0
    console.log('defaultIndex====' + defaultIndex)
    Vue.prototype.$previewVideo({
      videoList,
      defaultIndex
    })
  },
  getLocalFilePath (row) {
    var createdAt = row.fileCreateTime.replace(/-/g, '/')
    var dataText = createdAt.substring(0, 10).replaceAll('/', '')
    var path =
      'D:/ideaWorkspace/pan/static/file/' +
      dataText +
      '/' +
      row.identifier +
      '.' +
      row.fileExt
    return path
  },
  /**
   * 文件预览处理方法
   * @param index
   * @param row
   * @param e
   * @returns {boolean}
   */
  handleFilePreview (index, row, fileList) {
    var createdAt = row.fileCreateTime.replace(/-/g, '/')
    var dataText = createdAt.substring(0, 10).replaceAll('/', '')
    console.log(
      '本地文件路径' +
      'D:/ideaWorkspace/pan/static/file/' +
      dataText +
      '/' +
      row.identifier +
      '.' +
      row.fileExt
    )
    // 图片预览
    if (row.fileType === 1) {
      var imgLists = fileList.filter((item) => {
        return item.fileType === 1
      })
      const imageIndex = imgLists.findIndex((file) => file.id === row.id)
      if (Number(router.currentRoute.query.category) === 1) {
        var imgList = fileList
          .filter((item) => item.fileType === 1)
          .map((item, index) => {
            return Object.assign(
              {},
              {
                src: this.getHost() + this.getImgMinPath(item),
                'data-source': this.getHost() + this.getRowImageSrc(item),
                alt: item.fileName
              }
            )
          })
        this.previewImgObject(imageIndex, imgList)
      } else {
        imgList = fileList
          .filter((item) => item.fileType === 1)
          .map((item, index) => {
            return Object.assign(
              {},
              {
                src: this.getHost() + this.getImgMinPath(item),
                'data-source': this.getHost() + this.getRowImageSrc(item),
                alt: item.fileName
              }
            )
          })
        this.previewImgObject(imageIndex, imgList)
        //
      }
    }
    // 文档操作
    if (row.fileType === 2 || row.fileType === 9) {
      //  若当前点击项是doc文档
      if (
        // ...this.officeFileType
        ['doc', 'docx'].includes(row.fileExt.toLowerCase())
      ) {
        this.$toast.error('该文件格式无法在线预览')
        return false
      }
      //  若当前点击项是代码或文本文件
      if (row.fileExt === 'pdf') {
        Vue.prototype.$previewPdf({ fileInfo: row })
      }
      if (row.fileExt === 'xlsx') {
        this.$router.push({
          path: '/excel',
          query: {
            index: index,
            fid: row.id,
            type: 1
          }
        })
        // Vue.prototype.$previewExcel({ fileInfo: row })
      }
      let codeFileSuffix = row.fileExt.toLowerCase()
      if (codeFileSuffix === 'yaml') {
        codeFileSuffix = 'yml'
      }
      // 无格式文件也可以在线编辑
      if (
        fileSuffixCodeModeMap.has(codeFileSuffix) ||
        (row.isDir === 0 && row.fileExt === '')
      ) {
        Vue.prototype.$previewCode({ fileInfo: row })
        return false
      }
      //  若当前点击项是 markdown 文档
      const MARKDOWN = ['markdown', 'md']
      if (MARKDOWN.includes(row.fileExt.toLowerCase())) {
        if (!row.identifier) {
          row.type = 'notes'
        }
        Vue.prototype.$previewMarkdown({ fileInfo: row })
        return false
      }
    } else if (row.fileType === 3) {
      // 视频类型文件
      const VIDEO = ['mp4', 'avi', 'rmvb', 'rm', 'wmv', 'mkv', 'flv']
      if (VIDEO.includes(row.fileExt.toLowerCase())) {
        this.handleVideoPreview(index, row, fileList)
        return false
      }
    } else if (row.fileType === 4) {
      // 压缩包
      this.$toast.error('压缩文件格式无法在线预览,请选择解压文件后查看')
    } else if (row.fileType === 5) {
      // 音频类型文件
      var audioList = fileList.filter((item) => item.fileType === 5)
      const di =
        audioList.length > 1
          ? audioList.indexOf(
            audioList.filter((d) => d.fileName == row.fileName)[0]
          )
          : 0
      Vue.prototype.$preivewAudio({
        audioObj: row,
        audioList: audioList,
        defaultIndex: di
      })
      return false
    }
  },
  randomString (len) {
    len = len || 32
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length
    var pwd = ''
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
  },
  // 获取当前服务器基础地址和端口
  getBaseUrl () {
    const protocol = window.location.protocol
    // console.log('protocol', protocol)
    const hostName = window.location.hostname
    // console.log('hostName', hostName)
    // const port = config.serverPort
    if (config.serverPort === 80) {
      // var baseUrl = `${protocol}//${hostName}${config.baseContext}`
      // console.log('baseUrl', baseUrl)
      return `${protocol}//${hostName}${config.baseContext}`
    } else {
      // baseUrl = `${protocol}//${hostName}:${config.serverPort}${config.baseContext}`
      // console.log('baseUrl', baseUrl)
      return `${protocol}//${hostName}:${config.serverPort}${config.baseContext}`
    }
  },
  getStaticPicUrl (picUrl) {
    if (picUrl != null) {
      // return this.getBaseUrl() + picUrl
      return `${this.getBaseUrl()}${picUrl}`
    } else {
      return this.getBaseUrl() + '/images/avatar/avatar.jpg'
    }
    // return 'http://' + location.hostname + ':' + config.serverPort + '/api' + picUrl
  },

  // 排序 按照列名 和 升降序
  generateNewList (col, order, list) {
    const newList = list.slice()
    if (order == 'desc') {
      newList.sort((a, b) => {
        return a[col] < b[col] ? 1 : -1
      })
    } else if (order == 'asc') {
      newList.sort((a, b) => {
        return a[col] > b[col] ? 1 : -1
      })
    }
    return newList
  },

  // refreshFileList () {
  //   if (this.$route.query.category === 'all') {
  //     this.getFileList(this.fullPath, true)
  //   } else {
  //     this.getFileListByType(this.$route.query.fileType)
  //   }
  // },
  // 获取文件列表(通过全路径)
  getFileList (path, isRefresh) {
    if (!this.$route.path.includes('index')) {
      // this.getFileListByType(this.$route.query.category)
      return false
    }
    this.showLoading = true
    this.selectAllFiles = false
    this.fileList.length = 0
    this.sortFileList.length = 0

    if (path === this.$route.query.filePath) {
      this.selectedFileCount = 0
    }
    debugger
    const data = {
      userId: this.getCookies('uid'),
      filePath: path === '' ? '/' : path,
      refresh: !!isRefresh
    }
    if (data.filePath == undefined) {
      return
    }
    // if (isRefresh) {
    //   this.refreshFileList()
    // }
    getFileListByPath(data).then((res) => {
      if (res.code === 0) {
        this.init()
        this.fileList = res.data.list
        // console.log(JSON.parse(JSON.stringify(res.data.list)))
        // 获取首页图片
        this.imageList = this.fileList.filter((item) => item.fileType === 1)
        // 关闭动画
        this.showLoading = false
        this.sortFileList = this.fileList.sort(this.compare('isDir', -1))
        this.$store.commit('updateFileList', this.fileList)
        this.selectedFile = new Array(this.fileList.length).fill(false)
        this.auditCount = res.data.auditCount
      } else {
        this.showLoading = false
        if (res.code === 401) {
          this.$toast.error(res.msg)
          this.$router.push('/login')
        }
      }
    })
  }
}

export default globalFunction
