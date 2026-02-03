<template>
  <div class="note-main">
    <div class="note-main__tip">
      <div class="text">
        提示: 新建笔记在文件管理中同样可以查看
      </div>
      <div class="actions">
        <button
          class="u-button u-button--primary u-button--small is-round"
          @click="createNewNote()"
        >
          <i class="iconfont icon-add"></i>
          <span>新建笔记</span>
        </button>
      </div>
    </div>

    <div class="note-main__title">
      <div class="name">全部文件</div>
      <div class="count">已全部加载,共 {{ fileList.length }} 个</div>
    </div>

    <div class="container" id="share-list">
      <!--列表-->
      <div class="table share-list is-show-header">
        <div class="table__header">
          <table class="table__header-table">
            <colgroup>
              <col width="3%" />
              <col width="35%" />
              <col width="20%" />
              <col width="15%" />
              <col width="15%" />
            </colgroup>
            <thead>
            <tr class="table__header-row">
              <th class="text-center table__header-select">
                <label
                  class="u-checkbox file-grid-list__select-all"
                  :class="selectAllFiles === true ? 'is-checked' : ''"
                >
                    <span
                      class="u-checkbox__input"
                      :class="selectAllFiles === true ? 'is-checked' : ''"
                    >
                      <span class="u-checkbox__inner"></span>
                      <input
                        type="checkbox"
                        aria-hidden="false"
                        @click.stop="selectAll($event)"
                        class="u-checkbox__original"
                        value=""
                      />
                    </span>
                </label>
              </th>
              <th class="table__header-th">
                <div class="text-ellip content inline-block-v-middle">
                  <section class="share-list__name_header">
                      <span @click="changeOrder('fileName')">{{
                          selectedFileCount > 0
                            ? '已选择' + selectedFileCount + '个文件'
                            : '文档名称'
                        }}</span>
                  </section>
                  <div class="nd-sort" v-show="orderColumn=='fileName'" @click="changeOrder('fileName')">
                    <i class="iconfont icon icon-shangsanjiaoxing"
                       :class="order==='asc'?'active':''"></i>
                    <i class="iconfont icon icon-xiasanjiaoxing"
                       :class="order==='desc'?'active':''"></i>
                  </div>
                </div>
              </th>
              <th class="table__header-th">
                <div class="text-ellip content inline-block-v-middle">
                  <section class="share-list__name_header">
                    <span @click="changeOrder('shareTime')">更新时间</span>
                  </section>
                  <div class="nd-sort" v-show="orderColumn=='shareTime'" @click="changeOrder('shareTime')">
                    <i class="iconfont icon icon-shangsanjiaoxing"
                       :class="order==='asc'?'active':''"></i>
                    <i class="iconfont icon icon-xiasanjiaoxing"
                       :class="order==='desc'?'active':''"></i>
                  </div>
                </div>
              </th>
              <th class="table__header-th">
                <div class="text-ellip content inline-block-v-middle">
                  <section class="share-list__name_header">
                    <span @click="changeOrder('expiredTimes')">当前版本</span>
                  </section>
                  <div class="nd-sort" v-show="orderColumn=='browseTime'" @click="changeOrder('expiredTime')">
                    <i class="iconfont icon icon-shangsanjiaoxing"
                       :class="order==='asc'?'active':''"></i>
                    <i class="iconfont icon icon-xiasanjiaoxing"
                       :class="order==='desc'?'active':''"></i>
                  </div>
                </div>
              </th>
              <th class="table__header-th">
                <div class="text-ellip content inline-block-v-middle">
                  <section class="share-list__name_header">
                    <span @click="changeOrder('browseTimes')" title="选择历史版本可进行编辑">历史版本</span>
                  </section>
                  <div class="nd-sort" v-show="orderColumn=='browseTimes'" @click="changeOrder('browseTimes')">
                    <i class="iconfont icon icon-shangsanjiaoxing"
                       :class="order==='asc'?'active':''"></i>
                    <i class="iconfont icon icon-xiasanjiaoxing"
                       :class="order==='desc'?'active':''"></i>
                  </div>
                </div>
              </th>
            </tr>
            </thead>
          </table>
        </div>
        <!--数据显示主体-->
        <div class="table__body" v-if="fileList.length > 0">
          <table class="table__body-table">
            <colgroup>
              <col width="3%" />
              <col width="35%" />
              <col width="20%" />
              <col width="15%" />
              <col width="15%" />
            </colgroup>
            <tbody>
            <tr
              class="table__body-row"
              :class="selectedFile[index] === true ? 'selected' : ''"

              v-contextmenu:contextmenu
              :index="index"
              @contextmenu.prevent="openMenu($event, item, index)"
              v-for="(item, index) in fileList"
              :key="index"
              :sid="item.batchNum"
            >
              <td class="text-center">
                <label
                  class="u-checkbox"
                  :class="selectedFile[index] === true ? 'is-checked' : ''"
                >
                    <span
                      class="u-checkbox__input"
                      :class="selectedFile[index] === true ? 'is-checked' : ''"
                    >
                      <span class="u-checkbox__inner"></span>
                      <input
                        type="checkbox"
                        aria-hidden="false"
                        @click="selectFile(index, $event)"
                        class="u-checkbox__original"
                        value=""
                      />
                    </span>
                </label>
              </td>
              <td class="text-ellip table__td">
                <div class="list-name share-list__list-title" style="padding-left: 0">
                  <div class="pointer-events-all cursor-p" draggable="true">
                    <img
                      :src="setFileImg(item)"
                      class="list-name__title-icon img-before-icon iconfont icon-pure-color"
                    />
                    <a
                      class="list-name__title-text inline-block-v-middle text-ellip"
                      title="点击打开最新版本文档"
                      @click.stop="editNote(index, $event)"
                    >{{ item.fileName }}</a
                    >
                  </div>
                </div>
              </td>
              <td class="text-ellip table__td normal-column update-time">
                <section class="column-content-hide" style="text-align: left">
                    <span>{{
                        item.fileUpdateTime
                      }}</span>
                </section>
              </td>
              <td class="text-ellip table__td normal-column current-version">
                <span>{{ docVersions[item.id] ? parseFloat(docVersions[item.id][0].version) : '无版本信息' }}</span>
              </td>
              <td class="text-ellip table__td normal-column history-version">
                <div
                  class="share-list__list-title share-lefttime-column column-content-hide"
                >
                  <template>
                    <el-select v-model="selectDocVersin[item.id]" placeholder="请选择"
                               v-show="docVersions[item.id] && docVersions[item.id].length">
                      <el-option
                        v-for="version in docVersions[item.id] || []"
                        :key="version.id"
                        :label="version.version"
                        :value="version.id">
                      </el-option>
                    </el-select>
                  </template>
                  <span v-show="!docVersions[item.id] ">{{ '无版本信息' }}</span>
                  <!--<span>{{ item.browseTimes }}次</span>-->
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div
          class="nd-table__body-empty"
          v-if="fileList.length === 0"
          style="vertical-align: middle;margin-top: 30px"
        >
          <p class="nd-table__body-empty-text">暂无数据</p>
        </div>
      </div>

      <FileInfo
        :file-list="fileList"
        :selectFileIndex="selectFileIndex"
        :selectedFileCount="selectedFileCount"
      ></FileInfo>
      <Loading v-show="loading"></Loading>
    </div>
    <v-contextmenu class="contextmenu" ref="contextmenu" style="width: 120px">
      <template>
        <v-contextmenu-item style="margin: 3px 0" v-show="selectedFileCount === 1"

                            @click="renameDoc(fileList[selectFileIndex])">
          <!--<i class="iconfont icon-wenzishibie v-contextmenu-submenu__icon" style="font-size: 14px">-->
          <!--</i>-->
          重命名
        </v-contextmenu-item>
        <v-contextmenu-item style="margin: 3px 0"
                            @click="cancelShare(fileList[selectFileIndex])">
          <!--<i class="iconfont icon-wenzishibie v-contextmenu-submenu__icon" style="font-size: 14px">-->
          <!--</i>-->
          删除
        </v-contextmenu-item>
      </template>
    </v-contextmenu>

    <!--菜单-->
    <!--<ContextMenu-->
    <!--  :left="menuLeft"-->
    <!--  :top="menuTop"-->
    <!--  v-show="showMenu"-->
    <!--  :selectedFile="selectedFile"-->
    <!--  :file="fileList[this.selectFileIndex]"-->
    <!--  :count="selectedFileCount"-->
    <!--&gt;</ContextMenu>-->
  </div>
</template>

<script>
import FileInfo from '@/components/index/fileInfo/FileInfo'
import Loading from '@/components/common/loading/Loading'
import { cancelShareFile, getNotesFileList, getShareList, renameFile } from '@/request/file'
import Vue from 'vue'
// import config from '@/config'

export default {
  name: 'Notes',
  props: {},
  components: {
    // ContextMenu,
    FileInfo,
    Loading
  },
  data () {
    return {
      showDialog: false,
      selectedFileCount: 0,
      selectFileIndex: -1,
      selectedFile: [],
      selectAllFiles: false,
      fileList: [],
      docVersions: {},
      selectDocVersin: {},
      // 右键菜单
      showMenu: false,
      selectFileList: [],
      selectFileIdList: [],
      visible: false,
      // 右键菜单弹窗左边距离
      menuLeft: 0,
      // 右键菜单弹窗上边距离
      menuTop: 0,
      menuFileIndex: -1,
      loading: true,
      orderColumn: '',
      order: ''
    }
  },
  watch: {
    // 监听选择文件数量
    selectedFileCount: function() {
      if (this.selectedFileCount === 1) {
        this.menuType = 1
      } else if (this.selectedFileCount > 1) {
        this.menuType = 2
      }
      this.selectFileList.length = 0
      this.selectFileIdList.length = 0

      var i = 0
      for (const argumentsKey of this.selectedFile) {
        if (argumentsKey === true) {
          this.selectFileList.push(this.fileList[i])
          this.selectFileIdList.push(this.fileList[i].id)
        }
        i++
      }
    },
    showMenu (value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  computed: {
    calcExpiredTime (item) {
      if (item.expired === 0) {
        return '永久有效'
      }
      var day = this.getTimeDifference(new Date(item.expiredTime).getTime())
      if (day > 0) {
        return day + '天后到期'
      } else if (day === 0) {
        return '今天到期'
      } else {
        return '已过期' + Math.abs(day) + '天'
      }
    }
  },
  created () {
    this.getNotesFileList()
  },
  mounted () {
    document.addEventListener('mouseup', (e) => {
      const el = this.$refs.dialog__mini
      if (el) {
        if (el !== e.target) {
          this.showDialog = false
        }
        if (!el.contains(e.target)) {
          this.showDialog = false
        }
      }
    })
  },
  methods: {
    init () {
      this.selectedFileCount = 0
      this.selectFileIndex = -1
      this.selectedFile = new Array(this.fileList.length).fill(false)
    },
    // 修改排序方式
    changeOrder (column) {
      if (column !== this.orderColumn) {
        this.order = 'desc'
      } else {
        if (this.order == '') {
          this.order = 'desc'
        } else if (this.order == 'desc') {
          this.order = 'asc'
        } else if (this.order == 'asc') {
          this.order = 'desc'
        }
      }
      this.orderColumn = column
      this.fileList = this.generateNewList(this.orderColumn, this.order, this.fileList)
    },
    selectFile (index, e) {
      if (this.selectAllFiles === true) {
        this.selectAllFiles = false
      }
      if (this.selectedFile[index] == false) {
        this.selectedFileCount += 1
        this.selectedFile[index] = true
        this.$store.commit('updateSelectFileCount', this.selectedFileCount)
        // 判断是否所有都选则
        if (
          this.selectedFile.filter((file) => file == true).length ===
          this.fileList.length
        ) {
          this.selectAllFiles = true
        } else {
          this.selectAllFiles = false
        }
      } else {
        this.selectedFileCount -= 1
        this.selectedFile[index] = false
        this.$store.commit('updateSelectFileCount', this.selectedFileCount)
      }
      if (this.selectedFileCount === 1) {
        this.selectFileIndex = this.getSelectedFileIndex(
          this.selectedFile,
          true
        )
      } else {
        this.selectFileIndex = -1
      }
    },
    openMenu (e, item, index) {
      if (this.selectedFile[index] === true) {
      } else {
        this.init()
      }
      this.menuFileIndex = e.target
        .closest('.table__body-row')
        .getAttribute('index')
      this.rightClickItem = item
      this.menuLeft = e.screenX - 190
      this.menuTop = e.screenY - 160
      this.showMenu = true
      if (this.getSelectedFileIndex(this.selectedFile, index) === index) {
        this.selectFile(index, e)
      } else if (this.selectedFileCount === 0) {
        this.selectFile(index, e)
      }
      if (this.selectedFile.length === 0) {
        this.selectedFileCount = 0
      }
    },
    closeMenu () {
      this.showMenu = false
    },
    getSelectedFileIndex (arrays, obj) {
      var i = arrays.length
      while (i--) {
        if (arrays[i] === obj) {
          return i
        }
      }
      return false
    },
    // 选择所有文件
    selectAll (e) {
      if (this.selectAllFiles === true) {
        // 取消选中所有
        this.selectedFileCount = 0
        this.selectedFile = new Array(this.fileList.length).fill(false)
      } else {
        this.selectedFileCount = this.fileList.length
        this.selectedFile = new Array(this.fileList.length).fill(true)
      }
      this.selectAllFiles = !this.selectAllFiles
    },
    renameDoc (doc) {
      this.$confirmBox({
        title: '重命名笔记',
        showType: 3,
        file: this.fileList[this.selectFileIndex],
        originName: this.fileList[this.selectFileIndex].fileName.replace('.md', ''),
        operation: 'rename'
      }).then(res => {
        debugger
        if (res.fileName <= 0) {
          this.$toast.error('文件名不能为空')
          return
        }
        const data = {
          userId: this.getCookies('uid'),
          fileId: this.fileList[this.selectFileIndex].id,
          fileName: res.fileName,
          filePath: '/',
          isDir: 0
        }
        renameFile(data).then(res => {
          if (res.code === 0) {
            this.$toast.success('重命名成功')
            this.getNotesFileList()
          } else {
            this.$toast.error(res.msg)
          }
        })
      })
    },
    copyShareLink (row) {
      if (this.selectedFileCount > 1) {
        this.$toast.error('请选择一个文件复制链接')
        return
      }
      if (new Date(row.expiredTime).getTime() < new Date().getTime()) {
        this.$toast.error('该分享已过期,无法复制链接')
        return
      }
      var input = document.createElement('input') // 直接构建input
      input.value = this.getHostUrl() + '/#/s/' + row.batchNum + '?extractionCode=' + row.extractionCode // 设置内容
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      document.execCommand('Copy') // 执行复制
      document.body.removeChild(input) // 删除临时实例
      this.$toast.success('复制成功')
    },
    // 获取分享列表
    getShareList () {
      getShareList().then((res) => {
        if (res.code === 0) {
          this.loading = false
          this.selectedFileCount = 0
          this.fileList.length = 0
          this.fileList = res.data.list
          this.selectedFile = new Array(this.fileList.length).fill(false)
          this.loading = false
        } else {
          this.$toast.error(res.msg)
        }
      })
    },
    getNotesFileList () {
      const data = {
        userId: this.getCookies('uid'),
        filePath: '/',
        dir: 0,
        refresh: false
      }
      getNotesFileList(data).then((res) => {
        if (res.code === 0) {
          this.loading = false
          this.selectedFileCount = 0
          this.fileList.length = 0
          this.fileList = res.data.list
          this.docVersions = res.data.versions
          for (const docVersion in res.data.versions) {
            this.selectDocVersin[docVersion] = res.data.versions[docVersion][0].version
          }
          this.selectedFile = new Array(this.fileList.length).fill(false)
        } else {
          this.$toast.error(res.msg)
        }
      })
    },
    createNewNote () {
      Vue.prototype.$previewMarkdown({
        fileInfo: {
          id: 0,
          type: 'notes'
        }
      }).then(res => {
        // 刷新
        this.getNotesFileList()
      })
    },
    editNote (index, doc) {
      const file = this.fileList[index]
      if (!file.identifier) {
        file.type = 'notes'
        Vue.prototype.$previewMarkdown({
          fileInfo: file,
          doc: this.docVersions[file.id][0]
        })
        // loadDocInfo({ fileId: file.id }).then(res => {
        //
        // })
      } else {
        Vue.prototype.$previewMarkdown({ fileInfo: file })
      }
    },
    cancelShare (row) {
      const data = {
        id: row.id,
        batchNum: row.batchNum
      }
      this.$confirmBox({
        title: '取消分享',
        msg: '取消分享后，该条分享记录将被删除，好友将无法再访问此分享链接。\n' +
          '你确认要取消分享吗？',
        showType: 0
      })
        .then(() => {
          cancelShareFile(data).then((res) => {
            if (res.code === 0) {
              this.$toast.success(res.msg)
              this.getShareList()
            } else {
              this.$toast.error(res.msg)
            }
          })
        })
        .catch(() => {
          this.$toast.success('已取消')
        })
    }
  }
}
</script>

<style lang="less" scoped>
.note-main {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 20px;
  min-width: 750px;

  .note-main__tip {
    color: #666;
    padding: 10px 0;
    font-size: 12px;
    height: 56px;
    position: relative;

    .text {
      position: absolute;
      left: 0;
      max-width: 79%;
      display: inline-block;
      line-height: 36px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      //width: 400px;
      //text-align: left;
    }

    .actions {
      display: inline-block;
      position: absolute;
      right: 0;
      //width: 100px !important;

      .u-button--small,
      .u-button--small.is-round {
        padding: 9px 16px;
      }

      .u-button.is-round {
        border-radius: 20px;
        padding: 12px 36px;
      }

      .u-button--primary {
        color: #fff;
        background-color: #06a7ff;
        border-color: #06a7ff;
      }
    }
  }

  .note-main__title {
    width: calc(100% - 288px);;
    font-size: 12px;
    padding-right: 18px;
    position: relative;
    height: 40px;

    .name {
      color: #03081a;
      font-weight: 700;
      display: inline-block;
      position: absolute;
      left: 0;
    }

    .count {
      color: #afb3bf;
      display: inline-block;
      position: absolute;
      right: 0;
    }
  }

  .container {
    //height: calc(100% - 150px);

    .table td,
    .table th,
    .table tr {
      line-height: 1;
    }

    .share-list {
      height: 100%;
      width: calc(100% - 288px);
      display: inline-block;
      vertical-align: top;

      .table__header-table {
        width: 100%;
        table-layout: fixed;

        .table__header-row {
          height: 50px;
          line-height: 50px;
          border-bottom: 1px solid #f9f9f9;
          color: #03081a;
          text-align: left;
          font-size: 12px;

          .table__header-th {
            .content {
              position: relative;
              width: 100%;
              text-align: left;

              .share-list__name_header {
                display: inline-block;
                margin-left: 8px;
                font-weight: 700;
              }
            }
          }
        }
      }

      .table__body-table {
        width: 100%;
        table-layout: fixed;
        color: #424e67;

        .table__body-row:hover {
          background-color: #fafafc;
          border-color: #fafafc;
        }

        .table__body-row.selected {
          background: #f0faff !important;
        }

        .table__body-row {
          //padding-left: 14px;
          border-bottom: 1px solid #f9f9f9;
          height: 50px;
          line-height: 50px;
          color: #03081a;
          font-size: 12px;

          .normal-column {
            font-size: 12px;
            color: #afb3bf;
            overflow: inherit;
          }

          .text-center {
            text-align: center;
          }

          .share-list__list-title {
            position: relative;
            padding-right: 6.36896vw;
            line-height: 1;
            cursor: pointer;
            text-align: left;

            .list-name__title-icon {
              width: 30px;
              height: 30px;
              vertical-align: middle;
              position: relative;
              color: hsla(0, 0%, 74.1%, 0.28);
              line-height: 1;
            }

            .iconfont {
              font-size: 22px;
            }

            .list-name__title-text {
              margin-left: 6px;
            }
          }

          .column-content-hide {
          }
        }
      }
    }
  }
}
</style>
