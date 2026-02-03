<template>
  <!--文件显示 列表显示-->
  <div class="main-filelist main-list__table"
  >
    <div class="table is-show-header">
      <div class="table__header">
        <table class="table__header-table">
          <colgroup>
            <col width="3%">
            <col width="47%">
            <col width="22%">
            <col width="23%">
          </colgroup>
          <thead>
          <tr class="table__header-row">
            <th class="table__header-th text-center table__header-select">
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
                        class="u-checkbox__original"
                        @click.stop="selectAll($event)"
                        value=""
                      />
                    </span>
                <span class="u-checkbox__label title">{{
                    this.selectedFileCount > 0
                      ? '已选择' +
                      `${this.selectedFileCount}` +
                      '个文件/文件夹'
                      : ''
                  }}</span>
              </label>
            </th>
            <th class="table__header-th cursor-p is-name" v-for="(item,index) in header" :key="index">
              <div class="text-ellip content inline-block-v-middle">
                <template v-if="item.name == '文件名'">
                  <span v-show="selectedFileCount === 0" name="显示文件名1" class="title">{{ item.name }}</span>
                </template>
                <template v-else>
                  <span class="title">{{ item.name }}</span>
                </template>
              </div>
            </th>
          </tr>
          </thead>
        </table>
      </div>
      <!--文件列表主体-->
      <div class="table__body mouse-choose-list">
        <table class="table__body-table mouse-choose-box">
          <colgroup>
            <col width="3%">
            <col width="47%">
            <col width="22%">
            <col width="23%">
          </colgroup>
          <tbody>
          <tr :data-id="item.id" class="table__body-row  mouse-choose-item"
              :class="selectedFile[index] === true ? 'is-checked' : ''"
              v-contextmenu:contextmenu
              @contextmenu.prevent="showContentMenuType(index,$event)"
              :index="index"
              :fid="item.id"
              :key="'id' + index"
              v-for="(item,index) in fileList">
            <td class="text-center is-select">
              <label
                class="u-checkbox"
                :id="selectedFile[index] === true ? 'is-checked' : ''"
                :class="[
                  selectedFile[index] === true ? 'is-checked' : '',
                  selectedFile[index] === true ? 'is-checked' : ''
                ]"
              >
                <span
                  class="u-checkbox__input"
                  :class="[
                    selectedFile[index] === true ? 'is-checked' : '',
                    selectAllFiles === true ? 'is-checked' : ''
                  ]"
                >
                  <span
                    class="u-checkbox__inner"
                    @click.stop="selectFile(index, $event)"
                  ></span>
                  <!--@click.stop="selectFile(index, $event)"-->
                  <input
                    type="checkbox"
                    aria-hidden="false"
                    class="u-checkbox__original"
                    value=""
                  />
                </span>
              </label>
            </td>
            <!--文件名-->
            <td class="text-ellip table__td"
                @click="clickActions(
                   index,
                  item
                )"
            >
              <div class="list-name cursor-p">
                <div class="pointer-events-all cursor-p">
                  <img v-if="1 === 1"
                       :data-source="getRowImageSrc(item)"
                       class="list-name__title-icon img-before-icon iconfont icon-pure-color v-viewer"
                       :src="setFileImg(item)"
                  />
                  <img v-else
                       class="list-name__title-icon img-before-icon iconfont icon-pure-color"
                       :src="setFileImg(item)"
                  />
                  <a :title="item.fileName"
                     class="list-name__title-text inline-block-v-middle text-ellip">
                    {{ item.fileName }}
                  </a>
                </div>
              </div>
            </td>
            <!--修改时间-->
            <td class="text-ellip nd-table__td normal-column">
              <div class="file-list-time-column">
                <p class="column-content-hide">{{ item.fileUpdateTime }}</p>
                <div class="nd-file-list__line-action theme-primary-text column-content-show">
                  <i title="分享"
                     class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"></i>
                  <i title="下载"
                     class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"></i>
                  <i title="更多"
                     class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"></i>
                </div>
              </div>
            </td>
            <!--大小-->
            <td class="text-ellip nd-table__td normal-column">
              <section>
                <span v-if="item.isDir === 0">{{
                    item.fileSize | storageTrans
                  }}</span>
                <span v-else>-</span>
              </section>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <!--无文件显示-->
      <div class="table__body-empty" v-show="fileList.length === 0" style="margin-top: 20%">
        <p class="table__body-empty-text">暂无数据</p>
      </div>
      <v-contextmenu class="contextmenu" ref="contextmenu" style="width: 120px" v-if="usePage==='tools'">
        <!--<v-contextmenu-item @click="enterFolder(fileList[selectFileIndex].filePath)"-->
        <!--&gt;打开-->
        <!--</v-contextmenu-item>-->
        <v-contextmenu-item @click="menuDelete(fileList[selectFileIndex])"
        >删除
        </v-contextmenu-item>

        <!--<v-contextmenu-item @click="menu(item.methodName)" v-for="(item,index) in menuList"-->
        <!--                    :key="index">-->
        <!--  >{{ item.name }}-->
        <!--</v-contextmenu-item>-->

      </v-contextmenu>
    </div>
  </div>
</template>

<script>
import { deleteFile, getClearFile, getShareFileList } from '@/request/file'
import Bus from '@/libs/bus'

export default {
  name: 'FileTable',
  props: {
    // 使用页面,默认为文件列表 file,可选值:share,recycle
    usePage: {
      type: String,
      default: 'file'
    },
    shareUser: {
      type: Object,
      default: () => {
        return {}
      }
    },
    header: {
      type: Array,
      default: () => {
        return [
          {
            name: '文件名'
          },
          {
            name: '修改时间'
          },
          {
            name: '大小'
          }
        ]
      }
    },
    fileList: {
      type: Array,
      required: true,
      default: () => []
    },
    options: {
      type: Object,
      default: () => {
        return {
          menu: [
            {
              id: 2,
              name: '下载',
              iconClassName: 'icon-xiazai',
              methodName: 'menuDownload'
            },
            {
              id: 3,
              name: '分享',
              iconClassName: 'icon-fenxiang1',
              methodName: 'menuShare'
            },
            {
              id: 4,
              name: '复制',
              iconClassName: 'icon-fuzhi',
              methodName: 'menuCopy'
            },
            {
              id: 5,
              name: '移动',
              iconClassName: 'icon-yidong',
              methodName: 'menuMove'
            },
            // {
            //   id: 6,
            //   name: '重命名',
            //   iconClassName: 'icon-zhongmingming',
            //   methodName: 'menuRename'
            // },
            {
              id: 7,
              name: '删除',
              iconClassName: 'icon-shanchu',
              methodName: 'menuDelete'
            }
          ]
        }
      }
    }
  },
  components: {},
  data () {
    return {
      menuList: [
        {
          id: 7,
          name: '删除',
          iconClassName: 'icon-shanchu',
          methodName: 'menuDelete'
        }
      ],
      clearFileList: [],
      // 选中文件数量
      selectedFileCount: 0,
      // 当前点击文件索引
      selectFileIndex: -1,
      // 选中文件记录 长度为文件数量,true选中,false未选中
      selectedFile: [],
      // 是否选中所有文件
      selectAllFiles: false,
      // 选中文件对象数组
      selectFileArray: [],
      // 排序文件列表
      sortFileList: [],
      // 选中文件列表 包含file所有信息
      selectFileList: [],
      // 选中文件id列表
      selectFileIdList: [],
      deleteFileSize: 0
    }
  },
  watch: {
    '$route.query.filePath': function(newVal, oldVal) {
      var data
      // 后退操作时获取文件列表
      if (newVal.length < oldVal.length) {
        // 当后退到根路径时,获取根路径下的文件列表
        if (newVal === '/') {
          Bus.$emit('getShare', true)
          data = {
            batchNum: this.$route.query.batchNum
          }
          getShareFileList(data).then(res => {
            if (res.code === 0) {
              this.fileList = res.data.list
            }
          })
        } else {
          data = {
            path: newVal,
            userId: this.shareUser.id
          }
          getShareFileList(data).then(res => {
            if (res.code === 0) {
              this.fileList = res.data.list
            }
          })
        }
      } else {

      }
    },
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
          // this.$store.commit('updateSelectFileIdList', this.selectFileIdList)
        }
        i++
      }
      this.$store.commit('updateSelectFileIdList', this.selectFileIdList)
    }
  },
  computed: {},
  created () {

  },
  mounted () {
    this.sortFileList.length = 0
    this.sortFileList = this.fileList

    if (this.usePage == 'tools' || this.usePage == 'share') {
      this.sortFileList = this.fileList.sort(this.compare('isDir', -1))
    } else if (this.usePage == 'notes') {

    }
    this.init()
  },
  methods: {
    init () {
      this.selectedFileCount = 0
      this.selectFileIndex = -1
      this.selectedFile = new Array(this.fileList.length).fill(false)
    },
    // 打开右键菜单
    openMenu (e, item, index) {
      this.e = e
      this.selectFileIndex = index
      this.item = this.fileList[index]
      if (this.selectedFile[index] === true) {
      } else {
        this.init()
      }
      this.menuLeft = e.screenX
      this.menuTop = e.screenY - 110
      if (this.getSelectedFileIndex(this.selectedFile, index) === index) {
        this.selectFile(index)
      } else if (this.selectedFileCount === 0) {
        this.selectFile(index)
      }
      this.showMenu = true
    },
    menu (e) {
      this.method[e.name]()
    },
    menuDelete (e) {
      this.deleteFileSize = this.calcTotalSize()
      this.$toast.success(this.storageTrans(this.deleteFileSize))
      this.$confirmBox({
        title: '删除文件',
        msg: '确定删除这' + this.selectedFileCount + '个项目吗',
        showType: 0
      }).then(() => {
        deleteFile({
          id: e.id
        }).then(res => {
          if (res.code === 0) {
            getClearFile({
              fileSize: 10
            }).then(res => {
              if (res.code === 0) {
                this.init()
                this.fileList.length = 0
                this.fileList = res.data.list
              } else {
                this.$toast.error(res.msg)
              }
            })
            this.$toast.success('删除成功共释放' + this.storageTrans(this.deleteFileSize) + '空间')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    calcTotalSize () {
      var totalSize = 0
      for (const item in this.selectFileList) {
        totalSize += item.fileSize
      }
      return totalSize
    },
    // 关闭窗口
    closeMenu () {
      this.showMenu = false
      this.showCreateFolder = false
    },
    showContentMenuType (index, e) {
      if (this.selectedFile[index] === true) {
      } else {
        this.init()
      }
      this.menuFileIndex = e.target
        .closest('.table__body-row')
        .getAttribute('index')
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
    clickActions: function(index, item, e) {
      if (item.isDir === 1) {
        if (this.$route.path.includes('/s/')) {
          this.openShareFolder(index, item.fileName)
        } else {
          this.handleFilePreview(index, item, this.fileList)
        }
      } else {
        if (this.usePage == 'share') {
          this.$toast.error('转存到自己网盘后才可以预览')
        }
      }
      // if (fileType !== '') {
      //
      //   // if (this.supportOpenFile(fileType)) {
      //   //   // this.selectFile(index, e)
      //   //   this.openFileIndex = index
      //   //   this[fileType](index, item.fileName, e)
      //   // } else {
      //   //   this.selectFile(index, e)
      //   // }
      // }
    },
    // 选择文件
    selectFile (index) {
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
    // 获取选中文件索引
    getSelectedFileIndex (arrays, obj) {
      var i = arrays.length
      while (i--) {
        if (arrays[i] === obj) {
          return i
        }
      }
      return false
    },
    // 选择全部文件
    selectAll (e) {
      if (this.selectAllFiles === true) {
        // 取消选中所有
        this.selectedFileCount = 0
        this.$store.commit('updateSelectFileCount', this.fileList.length)
        this.selectedFile = new Array(this.fileList.length).fill(false)
      } else {
        this.selectedFileCount = this.fileList.length
        this.$store.commit('updateSelectFileCount', this.fileList.length)
        this.selectedFile = new Array(this.fileList.length).fill(true)
      }
      this.selectAllFiles = !this.selectAllFiles
    },
    /**
     * 打开目录
     * @param index 选择的文件索引
     * @param path 当前选中的文件目录 如根目录下的 '我的音乐'为 '/我的音乐'
     * @param e 点击事件
     */
    openShareFolder (index, path) {
      this.showLoading = true
      this.selectedFileCount = 0
      this.selectAllFiles = false
      var prePath = ''
      // 在根目录下 目录前缀为 '/',则重置前缀为空,由于参数path是带 '/'的,防止目录多一个'/'
      if (this.$route.query.filePath === undefined) {
        prePath = '/'
      } else if (this.$route.query.filePath === '/') {
        prePath = '/'
      } else {
        prePath = this.$route.query.filePath + '/'
      }
      this.fullPath = prePath + path
      this.currentPath = path
      const data = {
        // filePath: this.fileList[index].filePath,
        fileId: this.fileList[index].id,
        userId: this.fileList[index].userId
      }
      getShareFileList(data).then((res) => {
        this.showLoading = false
        if (res.code === 0) {
          this.fileList = res.data.list
        } else {
          this.$toast.error(res.msg)
        }
      })
      this.$router.push({
        query: {
          filePath: this.fullPath
        }
      })
    }
  }
}
</script>

<style lang="less">
</style>
