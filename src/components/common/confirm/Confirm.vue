<template>
  <div class="u-dialog__wrapper dialog-common-header" ref="dialog" style="z-index: 7999">
    <!--:class="{ 'pop-up': true, show: show }"-->
    <div class="u-dialog u-dialog__mini" ref="dialog__mini" style="top: 59.5px; width: 440px">
      <!--通用头部-->
      <div class="u-dialog__header">
        <span class="u-dialog__title"> {{ title }}</span>
        <button type="button" aria-label="Close" class="u-dialog__headerbtn">
          <i class="u-dialog__close u-icon u-icon-close iconfont icon-guanbi" @click="noClick"></i>
        </button>
      </div>
      <div class="u-dialog__body u-dialog-copy-move">
        <!--普通确认提示框-->
        <p class="dialog__delete-tip" v-if="showType === 0" style="margin: 20px">
          {{ msg }}
        </p>
        <!--复制移动框-->
        <div
          class="folder-selector-dialog__body"
          v-if="showType === 1 || showType === 2"
          ref="formRef"
        >
          <div class="folder-selector-dialog__selector-wrapper">
            <div class="file-selector__body">
              <div class="file-selector__nav">
                <div class="file-selector__nav-left">
                  <div class="item-group" v-show="fullPath === '/'">
                    <span class="file-selector__nav-item">{{ getUserInfo.userName }}</span>
                  </div>
                  <div v-if="fullPath !== '/'">
                    <span class="file-selector__nav-item">
                      <span class="file-selector__nav-item-title text-ellip" @click="back()"
                      >返回上一级</span
                      >
                      <span class="file-selector__nav-item-sep">|</span>
                    </span>
                    <span class="file-selector__nav-item">
                      <span class="file-selector__nav-item-title text-ellip" @click="back('/')"
                      >全部文件
                      </span>
                      <span class="file-selector__nav-item-sep">></span>
                    </span>
                    <span
                      class="file-selector__nav-item"
                      v-for="(item, index) in fullPath.split('/').slice(1)"
                      :key="item"
                    >
                      <span
                        class="file-selector__nav-item-title text-ellip is-current-nav"
                        :path="fullPath.split('/')"
                        @click="navigate(index)"
                        :index="index"
                      >{{ item }}</span
                      >
                      <span class="file-selector__nav-item-sep">></span>
                    </span>
                  </div>

                  <!--<div v-if="fullPath === '/'">-->
                  <!--  <span class="title">{{ this.store.state.userInfo.userName }}</span>-->
                  <!--</div>-->
                </div>
                <!--<path-nav-->
                <!--  :fileList.sync="fileList"-->
                <!--  :currentPath="''"-->
                <!--&gt;</path-nav>-->
              </div>

              <div class="detail-filelist__list bg">
                <div>
                  <div
                    class="detail-filename"
                    :key="index"
                    :index="index"
                    :class="index === selectIndex ? 'active' : ''"
                    :data-path="item.filePath"
                    v-for="(item, index) in fileList"
                    @click="enterFolder(index, item.fileName, $event)"
                  >
                    <!--@click="selectTargetPath(item, $event)"-->
                    <img
                      :src="setFileImg(item)"
                      alt=""
                      class="detail-filename__title-icon img-before-icon iconfont icon-pure-color"
                    />

                    <span class="detail-filename__title-text inline-block-v-middle text-ellip">{{
                        item.fileName
                      }}</span>
                  </div>
                </div>
                <div class="el-loading-mask" v-show="showLoading">
                  <div class="el-loading-spinner">
                    <svg viewBox="25 25 50 50" class="circular">
                      <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
                    </svg>
                    <p class="el-loading-text">加载中...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--重命名 输入框-->
        <div class="rename-body" v-if="showType === 3">
          <div class="rename-input">
            <!--v-model="renameFileName"-->
            <input
              type="text"
              class="rename-input_input"
              @keyup.enter="yesClick"
              @focus="focus($event)"
              v-model="renameFileName"
              @input="changeInput($event)"
              ref="renameInputBox"
              autofocus="true"
              :palceholder="operation === 'offlineDownload' ? '请输入下载网址' : '请输入文件夹名'"
              name="renameFileName"
            />
            <!--:value="this.renameFileName"-->
            <!--  autocomplete="off"-->
          </div>
        </div>

        <!--分享-->
        <div class="share-body" v-if="showType === 4">
          <div class="common-tabs u-tabs u-tabs--top">
            <div class="u-tabs__header is-top">
              <div class="u-tabs__nav-wrap is-top">
                <div class="u-tabs__nav-scroll">
                  <div class="u-tabs__nav is-top" style="transform: translateX(0px)">
                    <div
                      class="u-tabs__active-bar is-top"
                      style="width: 28px; transform: translateX(0px)"
                    ></div>
                    <div
                      id="tab-1"
                      aria-controls="pane-1"
                      role="tab"
                      aria-selected="true"
                      tabindex="0"
                      class="u-tabs__item is-top active"
                    >
                      分享
                    </div>
                    <!--<div-->
                    <!--  id="tab-2"-->
                    <!--  aria-controls="pane-2"-->
                    <!--  role="tab"-->
                    <!--  tabindex="-1"-->
                    <!--  class="u-tabs__item is-top"-->
                    <!--&gt;-->
                    <!--  发给网盘好友-->
                    <!--</div>-->
                  </div>
                </div>
              </div>
            </div>

            <div class="u-tabs__content">
              <div class="u-tab-pane share-file__body" id="tab1" v-show="!shareSuccess">
                <div class="share-file__link">
                  <div class="share-file__link-setting">
                    <div class="share-file__link-expired">
                      <div class="share-file__link-expired-label inline-block-v-middle">
                        有效期:
                      </div>
                      <div
                        class="u-select share-file__link-expired-select inline-block-v-middle u-select--small"
                      >
                        <div class="u-input u-input--small u-input--suffix">
                          <input
                            type="text"
                            readonly="readonly"
                            v-model="expiredTimeList[selectExpiredIndex].name"
                            autocomplete="off"
                            placeholder="请选择"
                            class="u-input__inner"
                          />
                          <span class="u-input__suffix">
                            <span
                              class="u-input__suffix-inner"
                              :show="showSelectExpired"
                              @click="showSelectExpiredDropdown()"
                            >
                              <i
                                class="u-select__caret u-input__icon iconfont"
                                :class="
                                  showSelectExpired === true ? 'icon-xiangshang' : 'icon-xiangxia'
                                "
                              >
                              </i>
                            </span>
                          </span>
                        </div>
                        <!--选择下拉框-->
                        <div
                          class="u-select-dropdown u-popper"
                          v-show="showSelectExpired === true"
                          ref="expiredDropdown"
                          style="
                            min-width: 120px;
                            transform-origin: center top;
                            z-index: 2033;
                            position: absolute;
                            top: 35px;
                            left: 2px;
                          "
                        >
                          <div class="u-scrollbar" style="background-color: #fff !important">
                            <div
                              class="u-select-dropdown__wrap u-scrollbar__wrap"
                              style="margin-bottom: -6px; margin-right: -6px"
                            >
                              <ul class="u-scrollbar__view u-select-dropdown__list">
                                <li
                                  class="u-select-dropdown__item hover"
                                  v-for="(item, index) in expiredTimeList"
                                  :index="index"
                                  :key="item.time"
                                  @click="selectExpired(item.time, index)"
                                  :class="item.time === expiredTime ? 'selected' : ''"
                                >
                                  <span>{{ item.name }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="share-file__auto-fixed-code">
                      <div class="wp-share-file__code-text">提取方式:</div>
                      <label
                        class="u-checkbox nd-file-grid-list__select-all"
                        :class="enableShareCode === true ? 'is-checked' : ''"
                      >
                        <span
                          class="u-checkbox__input"
                          :class="enableShareCode === true ? 'is-checked' : ''"
                        >
                          <span class="u-checkbox__inner"></span>
                          <input
                            type="checkbox"
                            aria-hidden="false"
                            @click.stop="useShareCode($event)"
                            class="u-checkbox__original"
                            value=""
                          />
                        </span>
                        <span class="u-checkbox__label">分享链接自动填充提取码</span>
                      </label>
                    </div>
                    <div class="share-file__link-center"></div>
                    <div class="share-file__link-bottom">
                      <div class="share-file__link-copy-wrapper">
                        <button
                          type="button"
                          @click="createShare(enableShareCode)"
                          class="u-button share-file__link-copy u-button--primary u-button--medium is-round"
                        >
                          <span>创建分享</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="u-tab-pane share-file__body" id="tab2" v-show="shareSuccess">
                <div class="share-file__link">
                  <div class="share-file__link-created">
                    <div class="share-file__link-info">
                      <div class="share-file__link-info-status theme-primary-text">
                        <!--<i-->
                        <!--  class="iconfont icon-zhengquetishitianchong -->
                        <!--  wp-share-file__link-info-status-icon -->
                        <!--  inline-block-v-middle "></i>-->

                        <span class="share-file__link-info-status-text inline-block-v-middle"
                        >成功创建私密链接</span
                        >
                      </div>
                      <div class="share-file__link-info-url-wrapper">
                        <div class="share-file__link-info-url u-input u-input--small">
                          <input
                            type="text"
                            readonly="readonly"
                            autocomplete="off"
                            id="share-link-input"
                            v-model="shareLink"
                            class="u-input__inner"
                          />
                        </div>
                      </div>
                      <div class="share-file__link-pwd">
                        <div class="share-file__link-pwd-label inline-block-v-middle">提取码</div>
                        <div
                          class="share-file__link-pwd-val inline-block-v-middle u-input u-input--small"
                        >
                          <input
                            type="text"
                            readonly="readonly"
                            v-model="extractionCode"
                            autocomplete="off"
                            class="u-input__inner"
                          />
                        </div>
                      </div>
                      <div class="share-file__link-info-tip">
                        有效期:
                        <span class="theme-primary-text">{{
                            expiredTimeList[selectExpiredIndex].name
                          }}</span>
                      </div>
                      <div class="share-file__link-copy-wrapper">
                        <button
                          type="button"
                          @click="copyShareLink()"
                          class="u-button share-file__link-copy u-button--primary u-button--medium is-round"
                        >
                          <span>{{ enableShareCode ? '复制链接及提取码' : '复制分享链接' }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!--分享成功-->
          <div class="share-body_success">
            <div class="u-tab-pane nd-share-file__body" id="pane-1"></div>

            <!--<div class="u-tab-pane nd-share-file__body" id="pane-2"></div>-->
          </div>
        </div>
      </div>

      <!--通用底部  确定取消按钮-->
      <div class="u-dialog__footer" v-if="showType !== 4">
        <div class="dialog-footer-center dialog-common-footer">
          <button
            class="u-button second-primary-btn btn-fix-size-middle u-button--week u-button--medium is-round"
            type="button"
            @click="noClick"
            v-show="showType !== 4"
          >
            <span> 取消 </span>
          </button>
          <button
            @click="yesClick"
            type="button"
            class="u-button btn-fix-size-middle u-button--primary u-button--medium is-round"
          >
            <span>
              <!--showType === 1 ? copyOptinon.noBtnText : showType === 2 ? moveOptinon.noBtnText ? showType === 3 ? renameOption.noBtnText : defaultOption.noBtnText-->
              {{
                showType === 1
                  ? copyOptinon.yesBtnText
                  : showType === 2
                    ? moveOptinon.yesBtnText
                    : showType === 3
                      ? operation === 'offlineDownload'
                        ? '创建任务'
                        : renameOption.yesBtnText
                      : showType === 4
                        ? shareOption.yesBtnText
                        : '确定'
              }}</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import Loading from '@/components/common/loading/Loading'
import PathNav from '@/components/common/pathNav/PathNav'
import { getFileListByPath, shareFile } from '@/request/file'
import bus from '@/libs/bus'
import config from '@/config'

export default {
  name: 'Confirm',
  comments: {
    PathNav,
    Loading
  },
  props: {
    file: {
      type: Object
    },
    fileName: {
      type: String
    },
    originName: {
      type: String
    },
    title: {
      type: String,
      default: '提示'
    },
    msg: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'alert'
    },
    // 显示类型 0:普通确认取消 1:复制框 2:移动框 3:重命名 4:分享
    showType: {
      type: Number
      // default: 0
    },
    alertBtnText: {
      type: String,
      default: '确定要删除吗?'
    },
    yesBtnText: {
      type: String,
      default: '确定'
    },
    noBtnText: {
      type: String,
      default: '取消'
    },
    hasMark: {
      type: Boolean,
      default: true
    },
    operation: {
      type: String,
      default: 'delete'
    }
  },
  data () {
    return {
      visible: false,
      // 显示选择过期时间
      showSelectExpired: false,
      // 选择过期时间列表索引
      selectExpiredIndex: 1,
      // 过期时间
      expiredTime: 30,
      // 分享提取码
      extractionCode: '',
      expiredTimeList: [
        {
          time: 0,
          name: '永久有效'
        },
        {
          time: 30,
          name: '30天'
        },
        {
          time: 7,
          name: '7天'
        },
        {
          time: 1,
          name: '1天'
        }
      ],
      // 使用提取码
      enableShareCode: true,
      shareLinkBase: window.location.host + '/#/s/',
      shareLink: '',
      batchNum: '',
      shareSuccess: false,
      renameFileName: '',
      promiseStatus: null,
      show: false,
      showLoading: false,
      selectIndex: -1,
      shareAction: 0,
      optionText: {},
      defaultOption: {
        yesBtnText: '确定',
        noBtnText: '取消'
      },
      copyOptinon: {
        yesBtnText: '复制到此',
        noBtnText: '取消'
      },
      moveOptinon: {
        yesBtnText: '移动到此',
        noBtnText: '取消'
      },
      renameOption: {
        yesBtnText: '重命名',
        noBtnText: '取消'
      },
      shareOption: {
        yesBtnText: '创建分享',
        noBtnText: '取消'
      },
      resolveData: {},
      fileList: [],
      sortFileList: [],
      fullPath: '/',
      currentPath: ''
    }
  },
  created () {
    // this.init()
    if (this.file === undefined) {
      this.show = false
    }
    // this.renameFileName = this.file.fileName
    if (this.show) {
      if (this.showType === 1 || this.showType === 2) {
        this.getFileList(this.fullPath, false)
      } else if (this.showType === 3) {
        this.renameFileName = store.state.fileList[store.state.selectFileIndex]
      }
    }
  },
  mounted () {
    this.resolveData = {}
    if (this.showType === 1) {
      this.defaultOption = this.copyOptinon
    } else if (this.showType === 2) {
      this.defaultOption = this.moveOptinon
    } else if (this.showType === 3) {
      this.defaultOption = this.renameOption
      this.$nextTick(function() {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
          bus.$on('fileName', (e) => {
            this.renameFileName = e
          })
          this.$refs.renameInputBox.focus()
        }, 2000)
      })
    }
    // 点击空白区域自动关闭登录弹窗
    document.addEventListener('mouseup', (e) => {
      const el = this.$refs.dialog__mini
      if (el) {
        if (!el.contains(e.target)) {
          this.show = false
        }
      }
    })
    // this.renameFileName = this.file.fileName
    // this.$bus.$on('sendOperationFile', (data) => {
    //   console.log('接收到操作文件对象')
    //   console.log(data)
    // })
  },
  watch: {
    // fullPath (value) {
    //   this.getFileList(this.fullPath)
    // },
    show (value) {
      console.log('showType', this.showType)
      this.renameFileName = ''
      if (value) {
        if (this.showType === 1 || this.showType === 2) {
          console.log('获取复制移动目录列表')
          this.getFileList('/', false)
        } else if (this.showType === 3) {
          this.renameFileName = this.originName
          // this.$refs.renameInputBox.focus()
        }
      }
      this.shareSuccess = false
    },
    renameFileName (value) {
      // bus.$on('renameFileName', value => {
      //   this.renameFileName = value
      //   console.log('bus接收:' + value)
      // })
      console.log('renameFileName:' + value)
      if (this.operation === 'offlineDownload') {
        this.resolveData.url = this.renameFileName
      } else {
        this.resolveData.fileName = this.renameFileName
      }
      store.commit('updateRenameFileName', this.renameFileName)
    }
  },
  computed: {
    getUserInfo () {
      return store.state.userInfo
    }
  },
  methods: {
    // 组件方法
    confirm () {
      const _this = this
      this.show = true

      return new Promise(function(resolve, reject) {
        _this.promiseStatus = {
          resolve,
          reject
        }
      })
    },
    init () {
      this.fullPath = '/'
    },
    // 路径导航
    navigate (index) {
      const routerLength = this.fullPath.split('/').length
      // 判断点击导航是否是最后一个,即当前路径,不是最后一个则回退
      if (routerLength - 2 - index !== 0) {
        const pathArr = this.fullPath.split('/')
        const targetPath = pathArr[index + 1]
        let newFullPath = ''
        for (let i = 0; i < pathArr.indexOf(targetPath) + 1; i++) {
          if (i !== 0) {
            newFullPath = newFullPath + '/' + pathArr[i]
          }
        }
        this.fullPath = newFullPath
        this.getFileList(this.fullPath, false)
      }
    },
    // 返回上一级目录
    back (path) {
      if (path === '/') {
        this.fullPath = '/'
        store.commit('updateCopyMovePathId', -1)

        this.getFileList(this.fullPath, false)
      } else {
        const index = this.fullPath.lastIndexOf('/')
        this.fullPath = this.fullPath.substring(0, index)
        this.getFileList(this.fullPath, false)
        if (this.fullPath === '') {
          this.fullPath = '/'
          store.commit('updateCopyMovePath', this.fullPath)
        }
      }
    },
    enterFolder (index, path, e) {
      this.selectTargetPath(this.fileList[index], e)
      store.commit('updateCopyMovePathId', this.fileList[index].id)
      // this.showLoading = true
      this.selectedFileCount = 0
      this.selectAllFiles = false
      console.log('enterFolder进入的文件夹:' + path)
      // var prePath = ''
      // 在根目录下 目录前缀为 '/',则重置前缀为空,由于参数path是带 '/'的,防止目录多一个'/'
      // if (this.fullPath === '/') {
      //   // prePath = ''
      // } else {
      //   prePath = this.fullPath
      // }
      if (this.fullPath === '/') {
        this.fullPath = this.fullPath + path
      } else {
        this.fullPath = this.fullPath + '/' + path
      }
      this.currentPath = '/' + path
      this.resolveData.filePath = this.fullPath
      this.getFileList(this.fullPath, false)
    },
    selectTargetPath (item, e) {
      this.selectIndex = e.target.index

      store.commit('updateCopyMovePathId', item.id)
    },
    async getFileList (path, isRefresh) {
      this.showLoading = true
      const data = {
        filePath: path,
        dir: 1,
        refresh: !!isRefresh
      }
      getFileListByPath(data).then((res) => {
        store.commit('updateCopyMovePath', this.fullPath)
        if (res.code === 0) {
          this.fileList.length = 0
          this.fileList = res.data.list.filter((item) => item.isDir === 1)
          console.log(this.fileList)
          this.showLoading = false
        }
      })
    },
    changeInput (e) {
      if (this.showType === 3) {
        store.commit('updateRenameFileName', this.renameFileName)
      }
    },
    // 选中分享过期时间
    selectExpired (t, index) {
      this.selectExpiredIndex = index
      this.expiredTime = t
      this.showSelectExpired = false
      this.resolveData.expiredTime = t
      store.commit('updateExpiredTime', t)
    },
    showSelectExpiredDropdown () {
      this.showSelectExpired = !this.showSelectExpired
    },
    useShareCode (e) {
      this.enableShareCode = !this.enableShareCode
    },
    // 创建分享
    createShare (enableShareCode) {
      var fileId = this.file.id

      var file = store.state.fileList.find((item) => item.id === fileId)
      var filelist = store.state.selectFileIdList.map((item) => {
        return {
          fileId: item
        }
      })
      console.log(typeof filelist)
      const data = {
        expired: this.expiredTime,
        fileId: fileId,
        type: 1,
        filePath: file.filePath
      }
      shareFile(data).then((res) => {
        if (res.code === 0) {
          if (enableShareCode) {
            this.shareLink =
              this.getHostUrl() +
              '/#/s/' +
              res.data.batchNum +
              '?extractionCode=' +
              res.data.extractionCode
          } else {
            this.shareLink = this.getHostUrl() + '/#/s/' + res.data.batchNum
          }
          console.log('分享链接基础baseURK-===:' + config.shareBaseUrl)
          this.extractionCode = res.data.extractionCode
          if (this.enableShareCode) {
            this.shareCode = res.data.shareCode
          }
          this.$toast.success(res.msg)
          this.shareSuccess = true
        } else {
          this.$toast.error(res.msg)
        }
      })
    },
    // 复制分享链接
    copyShareLink () {
      var input = document.createElement('input') // 直接构建input
      input.value = this.shareLink // 设置内容
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      document.execCommand('Copy') // 执行复制
      document.body.removeChild(input) // 删除临时实例
      this.$toast.success('复制成功')
    },

    noClick () {
      this.show = false
      var self = document.querySelector('.dialog-common-header')
      if (!this.show) {
        document.body.removeChild(self)
      }
      this.promiseStatus && this.promiseStatus.reject()
      // this.$refs.formRef.resetFields()
      // Object.assign(this.$data, this.$options.data.call(this))
    },
    yesClick (ev) {
      var self = document.querySelector('.dialog-common-header')
      const obj = {}
      console.log('选择文件夹:' + this.fullPath)
      this.resolveData.filePath = this.fullPath
      this.resolveData.fileName = this.renameFileName
      Object.assign(obj, this.resolveData)
      this.show = false
      this.promiseStatus && this.promiseStatus.resolve(obj)
      document.body.removeChild(self)
    },
    alertClick () {
      this.show = false
      this.promiseStatus && this.promiseStatus.resolve()
    },
    focus (event) {
      event.currentTarget.select()
    }
  },
  destroyed () {
    Object.assign(this.$data, this.$options.data.call(this))
    // this.$destroy()
    // this.$el.parentNode.removeChild(this.$el)
  }
}
</script>

<style lang="less" scoped>
.el-loading-mask.is-fullscreen {
  //position: fixed;
}

.el-loading-mask {
  position: absolute;
  z-index: 2000;
  background-color: hsla(0, 0%, 100%, 0.9);
  margin: 0;
  //top: 0;
  //right: 0;
  //bottom: 0;
  //left: 0;
  transition: opacity 0.3s;
}

.el-loading-mask {
  position: absolute;
  z-index: 10000;
  background-color: hsla(0, 0%, 100%, 0.9);
  margin: 0;
  //top: 0;
  //right: 0;
  //bottom: 0;
  //left: 0;
  transition: opacity 0.3s;
}

.el-loading-mask.is-fullscreen .el-loading-spinner {
  margin-top: -25px;
}

.el-loading-spinner {
  top: 50%;
  margin-top: -21px;
  width: 100%;
  text-align: center;
  position: absolute;
}

.el-loading-mask.is-fullscreen .el-loading-spinner .circular {
  width: 50px;
  height: 50px;
}

.el-loading-spinner .circular {
  width: 42px;
  height: 42px;
  animation: loading-rotate 2s linear infinite;
}

svg:not(:root) {
  overflow: hidden;
}

.el-loading-spinner .el-loading-text {
  color: #20a0ff !important;
}

.el-loading-spinner .el-loading-text {
  color: #20a0ff;
  margin: 3px 0;
  font-size: 14px;
}

.el-loading-spinner .path {
  stroke: #20a0ff !important;
}

.el-loading-spinner .path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: #20a0ff;
  stroke-linecap: round;
}

@keyframes loading-rotate {
  to {
    transform: rotate(1turn);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  to {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>
