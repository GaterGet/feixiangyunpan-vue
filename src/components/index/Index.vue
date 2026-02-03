<template>
  <div class="main-list" style="overflow: hidden">
    <div class="file-list-toolbar__wrapper">
      <div class="nd-file-list-toolbar nd-file-list-toolbar__actions inline-block-v-middle">
        <!--上传-->
        <a
          class="upload-button upload_wrapper"
          @mouseover="uploadMouseover"
          @mouseout="uploadMouseout"
        >
          <button
            trigger="hover"
            type="button"
            class="u-button upload-button nd-file-list-toolbar-action-item u-button--primary u-button--small is-round is-has-icon"
          >
            <i class="iconfont icon-shangchuan"></i>
            <span class="upload_text" @click="handleUploadFileBtnClick(1)">上传</span>
          </button>
          <ul class="dropdown-list nd-common-float-menu" style="display: none" ref="dropdown">
            <li
              id="menu_uploader-file"
              class="sub cursor-p upload-wrapper"
              @click="handleUploadFileBtnClick(1)"
            >
              上传文件
            </li>
            <li
              id="menu_uploader-directory"
              class="sub cursor-p upload-wrapper"
              @click="handleUploadFileBtnClick(2)"
            >
              上传文件夹
            </li>
            <li
              id="menu_uploader-drag"
              class="sub cursor-p upload-wrapper"
              @click="handleUploadFileBtnClick(3)"
            >
              拖拽上传
            </li>
          </ul>
        </a>
        <!--默认功能条-->
        <div
          class="btn-group inline-block-v-middle theme-primary-text"
          v-if="this.selectedFileCount === 0"
        >
          <button
            type="button"
            class="u-button toolbar-item is-need-left-sep"
            @click="createFolder"
            v-show="$route.query.category === 'all'"
          >
            <i class="iconfont icon-xinjianwenjianjia"></i>
            <span class="toolbar_text">新建文件夹</span>
          </button>

          <!--<button-->
          <!--  type="button"-->
          <!--  class="u-button toolbar-item is-need-left-sep"-->
          <!--  @click="createDocument"-->
          <!--  v-show="$route.query.category === 'all'"-->
          <!--&gt;-->
          <!--  <i class="iconfont icon-xinjianwendang"></i>-->
          <!--  <span class="toolbar_text">新建在线文档</span>-->
          <!--</button>-->
          <button
            type="button"
            class="u-button toolbar-item is-need-left-sep"
            @click="offlineDownload"
            v-show="$route.query.category === 'all'"
          >
            <i class="iconfont icon-xiazai"></i>
            <span class="toolbar_text">离线下载</span>
          </button>
          <!--<button-->
          <!--  type="button"-->
          <!--  :id="index"-->
          <!--  :method="item.methods"-->
          <!--  v-show="item.methods"-->
          <!--  class="u-button toolbar-item is-need-left-sep"-->
          <!--  v-for="(item, index) in defaultToolBarList"-->
          <!--  @click="toolOperation(item.methods)"-->
          <!--  :key="item.name"-->
          <!--&gt;-->
          <!--  <i class="iconfont" :class="item.iconClassName"></i>-->
          <!--  <span class="toolbar_text">{{ item.name }}</span>-->
          <!--</button>-->
        </div>
        <!--选中文件功能梯条-->
        <div class="btn-group inline-block-v-middle theme-primary-text" v-else>
          <!--下载-->
          <button type="button" class="u-button toolbar-item is-need-left-sep">
            <a
              :href="getDownloadFilePath(this.fileList[this.selectFileIndex])"
              class="theme-primary-text"
            >
              <i class="iconfont icon-xiazai"></i>
              <span class="toolbar_text theme-primary-text">下载</span>
            </a>
          </button>
          <!--重命名-->
          <button
            class="u-button toolbar-item is-need-left-sep"
            v-show="this.selectedFileCount === 1"
            type="button"
            @click="renameFile"
          >
            <i class="iconfont icon-zhongmingming"></i>
            <span class="toolbar_text">重命名</span>
          </button>

          <button
            type="button"
            :id="index"
            class="u-button toolbar-item is-need-left-sep"
            v-for="(item, index) in fileToolBarList"
            @click="fileOption(item.methodName)"
            :key="item.name"
          >
            <i class="iconfont" :class="item.iconClassName"></i>
            <span class="toolbar_text">{{ item.name }}</span>
          </button>
        </div>
      </div>
      <!--搜索-->
      <div class="file-list-toolbar__search inline-block-v-middle">
        <div class="u-input u-input--primary u-input--small u-input--suffix">
          <input
            type="text"
            class="search_input u-input__inner"
            placeholder="搜索我的文件"
            autocomplete="off"
            v-model="searchKeyWords"
            @keyup.enter="search()"
          />
          <span class="u-input__suffix">
            <span class="u-input__suffix-inner">
              <i
                class="iconfont icon-sousuo"
                v-if="$route.query.search === undefined"
                @click="search"
              ></i>
              <i
                class="iconfont icon-guanbi"
                v-if="$route.query.search !== undefined"
                @click="back('/'), (searchKeyWords = '')"
              ></i>
            </span>
          </span>
        </div>
      </div>
    </div>
    <!--文件路径导航条-->
    <div class="main-list__nav file-main__nav grid">
      <!--导航条左-->
      <div class="file-main__nav-left">
        <div v-if="$route.query.filePath !== undefined || $route.query.search !== undefined">
          <span class="file-selector__nav-item">
            <span
              class="file-selector__nav-item-title text-ellip"
              @click="back($route.query.filePath)"
            >返回上一级</span
            >
            <span class="file-selector__nav-item-sep">|</span>
          </span>
          <span class="file-selector__nav-item">
            <span
              class="file-selector__nav-item-title text-ellip"
              @click="back('/')"
              :style="{ color: $route.query.search !== undefined ? '#06a7ff !important' : '' }"
            >全部文件
            </span>
            <span class="file-selector__nav-item-sep">></span>
            <!--搜索导航显示-->
            <span class="file-selector__nav-item" v-if="searchKeyWords !== ''">
              <span class="file-selector__nav-item-sep" style="display: inline-block">></span>
              <span class="file-selector__nav-item-title text-ellip is-current-nav"
              >搜索:
                {{ searchKeyWords }}
              </span>
            </span>
          </span>
          <template v-if="this.$route.query.filePath !== undefined">
            <span
              class="file-selector__nav-item"
              v-for="(item, index) in this.$route.query.filePath.split('/').slice(1)"
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
          </template>
        </div>
        <div v-if="$route.path === '/index'">
          <span class="title">{{ this.getIndexPageTitle($route.query.category) }}</span>
        </div>
      </div>
      <!--导航条右-->
      <div class="file-main__nav-right">
        <span class="file-main__nav-right-count">
          <template v-if="auditCount > 0">
            已加载{{ this.sortFileList ? this.sortFileList.length : 0 }}个, {{ auditCount }}个未审核
          </template>
          <template v-else>
            已全部加载,共{{ this.sortFileList ? this.sortFileList.length : 0 }}个
          </template>
        </span>
        <i
          class="iconfont cursor-p file-main__nav-right-icon inline-block-v-middle"
          :class="displayMode === 'block' ? 'icon-xianshifangshi_lie' : 'icon-xianshifangshi_kuai'"
          @click="selectDisplayMode(displayMode)"
        ></i>
        <i
          class="iconfont icon-shuaxin cursor-p file-main__nav-right-icon inline-block-v-middle"
          @click="refreshFileList"
          style="margin-left: 5px"
          title="刷新文件列表"
        ></i>
      </div>
    </div>
    <!--文件显示  缩略图显示-->
    <div class="file-grid-list clearfix main-list__grid" v-show="displayMode === 'block'">
      <!--文件选择提示-->
      <div class="file-grid-list__nav">
        <label
          class="u-checkbox nd-file-grid-list__select-all"
          :class="selectAllFiles === true ? 'is-checked' : ''"
        >
          <span class="u-checkbox__input" :class="selectAllFiles === true ? 'is-checked' : ''">
            <span class="u-checkbox__inner"></span>
            <input
              type="checkbox"
              aria-hidden="false"
              @click.stop="selectAll($event)"
              class="u-checkbox__original"
              value=""
            />
          </span>
          <span class="u-checkbox__label">{{
              this.selectedFileCount > 0
                ? '已选择' + `${this.selectedFileCount}` + '个文件/文件夹'
                : '全选'
            }}</span>
        </label>
        <div class="clear"></div>
      </div>
      <!--无文件提示-->
      <div
        class="nd-grid-list__body-empty"
        v-if="sortFileList.length === 0 && showCreateFolder == false"
      >
        <div class="nd-main-filelist__empty">
          <div class="nd-main-filelist__empty-body">
            <img
              src="https://nd-static.bdstatic.com/m-static/v20-main/img/empty-folder.55c81ea2.png"
              class="nd-main-filelist__empty-icon"
            />
            <p class="nd-main-filelist__empty-title">空空如也</p>
          </div>
        </div>
      </div>
      <!-- -->
      <!--文件显示列表  缩略图显示-->
      <div
        class="file-grid-list__body show-mode-block mouse-choose-list"
        v-contextmenu:contextmenu
        style=""
      >
        <div
          class="mouse-choose-box"
          style="
            padding-top: 0px;
            padding-bottom: 0px;
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
          "
        >
          <!--新建文件夹编辑-->
          <div class="grid-list__item text-center edit-mode" v-if="showCreateFolder">
            <div class="grid-list__title-edit-action">
              <div
                class="grid-list__title-edit-action--btn is-confirm inline-block-v-middle cursor-p"
              >
                <i class="iconfont icon-duihao" @click="createFolderAction"></i>
              </div>
              <div
                class="grid-list__title-edit-action--btn is-cancel inline-block-v-middle cursor-p"
              >
                <i
                  class="iconfont icon-guanbi"
                  @click="function () {showCreateFolder = false}"
                ></i>
              </div>
            </div>
            <div class="grid-list__item-icon-wrapper">
              <img
                src="@/assets/files/folder.png"
                alt=""
                class="grid-list__item-icon img-before-icon iconfont icon-pure-color"
              />
            </div>
            <div class="grid-list__item-detail-tip">
              <div class="grid-list__title-edit-input u-input u-input--small">
                <input
                  type="text"
                  v-model="createFolderName"
                  class="u-input__inner"
                  @keyup.enter="createFolderAction"
                  autofocus="autofocus"
                  autocomplete="off"
                  ref="createFolderInput"
                />
              </div>
            </div>
          </div>

          <!--文件列表-->
          <div
            class="grid-list__item text-center cursor-p"
            v-for="(item, index) in sortFileList"
            v-contextmenu:contextmenu
            @contextmenu.prevent="showContentMenuType(index)"
            :fid="item.id"
            :key="'id' + index"
            :class="selectedFile[index] === true ? 'is-checked' : ''"
          >
            <!--顶部操作功能-->
            <div class="grid-list__item-top">
              <label
                class="u-checkbox"
                :id="selectedFile[index] === true ? 'is-checked' : ''"
                :class="[selectedFile[index] === true ? 'is-checked' : '']"
              >
                <span
                  class="u-checkbox__input"
                  :class="[
                    selectedFile[index] === true ? 'is-checked' : '',
                    selectAllFiles === true ? 'is-checked' : ''
                  ]"
                >
                  <span class="u-checkbox__inner" @click.stop="selectFile(index, $event)"></span>
                  <!--@click.stop="selectFile(index, $event)"-->
                  <input
                    type="checkbox"
                    aria-hidden="false"
                    class="u-checkbox__original"
                    value=""
                  />
                </span>
              </label>
              <!--<div-->
              <!--  class="file-list__line-action theme-primary-text grid-list__item-list-action"-->
              <!--&gt;-->
              <!--  <i-->
              <!--    title="更多"-->
              <!--    class="iconfont icon-qita u-tooltip u-icon u-icon-more cursor-p file-list__line-action-item"-->
              <!--    @click="showContentMenuType(index)"-->
              <!--  ></i>-->
              <!--</div>-->
            </div>
            <!--文件显示主体-->
            <!--clickActions(getClickFileType(item) !== undefined?getClickFileType(item):'' ,-->
            <div draggable="true" @click="clickActions(index, item, e)">
              <div class="file-list-drag-copy">
                <div class="file-list-drag-copy__item is-id-1">
                  <!--<i class="iconfont icon-wenjianjia1"></i>-->
                  <img
                    src="@/assets/files/folder.png"
                    class="file-list-drag-copy__item-title-icon img-before-icon iconfont icon-pure-color"
                  />
                  <span
                    class="file-list-drag-copy__item-title-text inline-block-v-middle text-ellip"
                  >{{ item }}</span
                  >
                </div>
              </div>
              <div class="grid-list__item-icon-wrapper">
                <img
                  v-if="item.fileType === 1"
                  :data-source="getRowImageSrc(item)"
                  class="nd-grid-list__item-icon img-before-icon iconfont icon-pure-color"
                  :src="setFileImg(item)"
                />
                <img
                  v-else
                  class="nd-grid-list__item-icon img-before-icon iconfont icon-pure-color"
                  :src="setFileImg(item)"
                />
              </div>
              <div class="u-tooltip">
                <p class="grid-list__item-title text-ellip" :title="item.fileName">
                  <!--item.fileName-->
                  {{ item.fileName !== undefined ? item.fileName : '' }}
                </p>
                <p class="grid-list__item-desc text-ellip" :title="item.fileUpdateTime">
                  {{ compareYear(parseInt(new Date(item.fileUpdateTime).getFullYear())) ? dayjs(item.fileUpdateTime).format('YYYY-MM-DD HH:mm:ss') : dayjs(item.fileUpdateTime).format('YYYY-MM-DD HH:mm:ss').slice(5)
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--文件显示 列表显示-->
    <div
      class="main-filelist main-list__table"
      v-show="displayMode === 'list'"
      v-contextmenu:contextmenu
    >
      <div class="table is-show-header">
        <div class="table__header">
          <table class="table__header-table">
            <colgroup>
              <col width="4%" />
              <col width="47%" />
              <col width="22%" />
              <col width="20%" />
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
                        ? '已选择' + `${this.selectedFileCount}` + '个文件/文件夹'
                        : ''
                    }}</span>
                </label>
              </th>
              <th class="table__header-th is-name">
                <div class="text-ellip content inline-block-v-middle">
                    <span
                      v-show="this.selectedFileCount === 0"
                      class="title"
                      @click="changeOrder('fileName')"
                    >文件名</span
                    >
                  <div
                    class="nd-sort"
                    v-show="orderColumn == 'fileName' && selectedFileCount < 1"
                    @click="changeOrder('fileName')"
                  >
                    <i
                      class="iconfont icon icon-shangsanjiaoxing"
                      :class="order === 'asc' ? 'active' : ''"
                    ></i>
                    <i
                      class="iconfont icon icon-xiasanjiaoxing"
                      :class="order === 'desc' ? 'active' : ''"
                    ></i>
                  </div>
                </div>
              </th>
              <th class="table__header-th">
                <div class="text-ellip content inline-block-v-middle">
                  <span class="title" @click="changeOrder('fileUpdateTime')">修改时间</span>
                  <div
                    class="nd-sort"
                    v-show="orderColumn == 'fileUpdateTime'"
                    @click="changeOrder('fileUpdateTime')"
                  >
                    <i
                      class="iconfont icon icon-shangsanjiaoxing"
                      :class="order === 'asc' ? 'active' : ''"
                    ></i>
                    <i
                      class="iconfont icon icon-xiasanjiaoxing"
                      :class="order === 'desc' ? 'active' : ''"
                    ></i>
                  </div>
                </div>
              </th>
              <th class="table__header-th">
                <div class="text-ellip content inline-block-v-middle">
                  <span class="title" @click="changeOrder('fileSize')">大小</span>
                  <div
                    class="nd-sort"
                    v-show="orderColumn == 'fileSize'"
                    @click="changeOrder('fileSize')"
                  >
                    <i
                      class="iconfont icon icon-shangsanjiaoxing"
                      :class="order === 'asc' ? 'active' : ''"
                    ></i>
                    <i
                      class="iconfont icon icon-xiasanjiaoxing"
                      :class="order === 'desc' ? 'active' : ''"
                    ></i>
                  </div>
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
              <col width="4%" />
              <col width="47%" />
              <col width="22%" />
              <col width="20%" />
            </colgroup>
            <tbody>
            <!--新建文件夹-->
            <tr class="table__body-row mouse-choose-item" v-if="showCreateFolder">
              <td class="text-center is-select">
                <label class="u-checkbox is-disabled">
                    <span class="u-checkbox__input">
                      <span class="u-checkbox__inner"></span>
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
              <td class="text-ellip table__td">
                <div class="list-name cursor-p">
                  <div>
                    <img
                      class="list-name__title-icon img-before-icon iconfont icon-pure-color"
                      src="@/assets/files/folder.png"
                    />
                    <div
                      class="list-name__title-edit-input u-input u-input--small inline-block-v-middle"
                    >
                      <input
                        type="text"
                        class="u-input__inner inline-block-v-middle"
                        @keyup.enter="createFolderAction"
                        autofocus="autofocus"
                        v-model="createFolderName"
                        autocomplete="off"
                        ref="createFolderInput"
                      />
                    </div>
                    <div
                      class="nd-list-name__title-edit-action is-confirm inline-block-v-middle cursor-p"
                    >
                      <i class="iconfont icon-duihao" @click="createFolderAction"></i>
                    </div>
                    <div
                      class="nd-list-name__title-edit-action is-cancel inline-block-v-middle cursor-p"
                    >
                      <i
                        class="iconfont icon-guanbi"
                        @click="function () {showCreateFolder = false}"
                      ></i>
                    </div>
                  </div>
                </div>
              </td>
              <!--修改时间-->
              <td class="text-ellip nd-table__td normal-column">
                <div class="file-list-time-column">
                  <p class="column-content-hide">
                    {{
                      new Date().getFullYear() +
                      '-' +
                      (new Date().getMonth() + 1) +
                      '-' +
                      new Date().getDate() +
                      ' ' +
                      new Date().getHours() +
                      ':' +
                      new Date().getMinutes()
                    }}
                  </p>
                  <div class="nd-file-list__line-action theme-primary-text column-content-show">
                    <i
                      title="分享"
                      class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"
                    ></i>
                    <i
                      title="下载"
                      class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"
                    ></i>
                    <i
                      title="更多"
                      class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"
                    ></i>
                  </div>
                </div>
              </td>
              <!--大小-->
              <td class="text-ellip nd-table__td normal-column">
                <section>
                  <span>-</span>
                </section>
              </td>
            </tr>
            <!--@contextmenu.prevent="openMenu($event, item, index)"-->
            <tr
              :data-id="item.id"
              class="table__body-row mouse-choose-item"
              :class="selectedFile[index] === true ? 'is-checked' : ''"
              v-contextmenu:contextmenu
              @contextmenu.prevent="showContentMenuType(index)"
              :index="index"
              :fid="item.id"
              :key="'id' + index"
              :id="'fid' + item.id"
              v-for="(item, index) in sortFileList"
            >
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
              <td class="text-ellip table__td" @click="clickActions(index, item)">
                <div class="list-name cursor-p">
                  <div class="pointer-events-all cursor-p">
                    <img
                      v-if="item.fileType === 1"
                      :data-source="getRowImageSrc(item)"
                      class="list-name__title-icon img-before-icon iconfont icon-pure-color"
                      :src="setFileImg(item)"
                    />
                    <img
                      v-else
                      class="list-name__title-icon img-before-icon iconfont icon-pure-color"
                      :src="setFileImg(item)"
                    />
                    <a
                      :title="item.fileName"
                      class="list-name__title-text inline-block-v-middle text-ellip"
                    >
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
                    <i
                      title="分享"
                      class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"
                    ></i>
                    <i
                      title="下载"
                      class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"
                    ></i>
                    <i
                      title="更多"
                      class="inline-block-v-middle cursor-p u-icon file-list__line-action-item u-icon-share"
                    ></i>
                  </div>
                </div>
              </td>
              <!--大小-->
              <td class="text-ellip nd-table__td normal-column">
                <section>
                  <span v-if="item.isDir === 0">{{ item.fileSize | storageTrans }}</span>
                  <span v-else>-</span>
                </section>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <!--无文件显示-->
        <div class="table__body-empty" style="display: none"></div>
      </div>
    </div>

    <Loading v-show="showLoading" :text="this.loadingText"></Loading>
    <!--文件详情-->
    <FileInfo
      :file-list="fileList"
      :fullPath="selectFullPath"
      :fullPathArr="fullPath.split('/').slice(1)"
      :selectFileIndex="selectFileIndex"
      :selectedFileCount="selectedFileCount"
    ></FileInfo>

    <!--<div style="width: 100%; position: fixed; bottom: 50px;left: 30px;z-index: 500;" v-show="false">-->

    <!--  <uploader :options="options" :autoStart="false"-->
    <!--            :fileStatusText="{success: '上传成功',error: '上传失败',uploading: '正在上传',paused: '暂停上传',waiting: '等待上传'}"-->
    <!--            @file-success="onFileSuccess" @file-added="fileAdded" @file-error="onFileError"-->
    <!--            class="uploader-example">-->
    <!--    <uploader-unsupport></uploader-unsupport>-->
    <!--    <uploader-drop>-->
    <!--      <uploader-btn :attrs="attrs" single>上传</uploader-btn>-->
    <!--    </uploader-drop>-->
    <!--    <uploader-list></uploader-list>-->
    <!--  </uploader>-->
    <!--</div>-->

    <v-contextmenu class="contextmenu" ref="contextmenu" style="width: 120px">
      <!--空白处菜单-->
      <template v-if="selectedFileCount === 0">
        <v-contextmenu-submenu title="查看">
          <v-contextmenu-item class="contextmenu-item" @click="selectDisplayMode(displayMode)">
            <span
              class="menu__item-select-icon inline-block-v-middle"
              v-show="displayMode === 'list'"
              :class="displayMode === 'list' ? 'active' : ''"
            >
            </span>
            <span class="menu-text">列表</span>
          </v-contextmenu-item>
          <v-contextmenu-item class="contextmenu-item" @click="selectDisplayMode(displayMode)">
            <span
              class="menu__item-select-icon inline-block-v-middle"
              v-show="displayMode === 'block'"
              :class="displayMode === 'block' ? 'active' : ''"
            >
            </span>
            <span class="menu-text">缩略图</span>
          </v-contextmenu-item>
        </v-contextmenu-submenu>

        <v-contextmenu-item @click="getFileList(fullPath)">刷新</v-contextmenu-item>
        <v-contextmenu-item @click="createFolder()">新建文件夹</v-contextmenu-item>
      </template>

      <!--单文件右键菜单-->
      <template v-if="selectedFileCount === 1">
        <v-contextmenu-item
          @click="menuMethods(item.methodName)"
          style="margin: 3px 0"
          v-for="item in singleMenuList"
          :key="item.id"
        >
          <i class="iconfont v-contextmenu-submenu__icon" :class="item.iconClassName"></i>
          {{ item.name }}
        </v-contextmenu-item>
        <!--解压文件-->
        <v-contextmenu-submenu
          style="margin: 3px 0; position: relative"
          title="解压文件"
          class="unzip-menu"
          @click="unzip(selectFileIndex)"
          v-if="this.fileList[this.selectFileIndex].fileExt === 'zip'"
        >
          <!--<v-contextmenu-submenu__icon class="iconfont icon-jieyasuo"></v-contextmenu-submenu__icon>-->
          <span class="iconfont icon-jieyasuo menu__item-select-icon inline-block-v-middle"> </span>
          <!--<i class="iconfont icon-jieyasuo v-contextmenu-submenu__icon"-->
          <!--   style="font-size: 14px;position: absolute;left: 0px">-->
          <!--</i>-->
          <!--解压缩-->
          <v-contextmenu-item class="contextmenu-item" @click="unzip(fileList[selectFileIndex], 1)">
            <!--<i class="iconfont icon-jieyasuo1 v-contextmenu-submenu__icon"-->
            <!--   style="font-size: 14px">-->
            <!--</i>-->
            <span class="iconfont icon-jieyasuo menu__item-select-icon inline-block-v-middle">
            </span>
            <span class="menu-text">到当前文件夹</span>
          </v-contextmenu-item>
          <v-contextmenu-item class="contextmenu-item" @click="unzip(fileList[selectFileIndex], 2)">
            <span class="iconfont icon-jieyasuo menu__item-select-icon inline-block-v-middle">
            </span>
            <span class="menu-text">
              到"{{
                this.fileList[this.selectFileIndex].fileName.replace(
                  '.' + this.fileList[this.selectFileIndex].fileExt,
                  ''
                )
              }}"</span
            >
          </v-contextmenu-item>
          <v-contextmenu-item class="contextmenu-item" @click="unzip(fileList[selectFileIndex], 3)">
            <span class="iconfont icon-jieyasuo menu__item-select-icon inline-block-v-middle">
              <!--<i class="iconfont icon-jieyasuo1 v-contextmenu-submenu__icon"-->
              <!--   style="font-size: 14px">-->
              <!--</i>-->
            </span>
            <span class="menu-text">到目标文件夹</span>
          </v-contextmenu-item>
        </v-contextmenu-submenu>

        <!--格式转换-->
        <v-contextmenu-submenu
          title="格式转换"
          v-if="conversionExtList.includes(fileList[selectFileIndex].fileExt)"
        >
          <v-contextmenu-item
            class="contextmenu-item"
            v-show="fileList[selectFileIndex].fileExt === 'pdf'"
            @click="formatConversion(fileList[selectFileIndex], 'docx')"
          >
            <!--<span class="menu__item-select-icon inline-block-v-middle">-->
            <!--</span>-->
            <span class="menu-text">转Word</span>
          </v-contextmenu-item>
          <v-contextmenu-item
            class="contextmenu-item"
            v-show="
              fileList[selectFileIndex].fileExt === 'doc' ||
              fileList[selectFileIndex].fileExt === 'docx' ||
              fileList[selectFileIndex].fileExt === 'xlsx'
            "
            @click="formatConversion(fileList[selectFileIndex], 'pdf')"
          >
            <!--<span class="menu__item-select-icon inline-block-v-middle">-->
            <!--</span>-->
            <span class="menu-text">转PDF</span>
          </v-contextmenu-item>
        </v-contextmenu-submenu>

        <!--文字识别-->
        <v-contextmenu-item
          style="margin: 3px 0"
          @click="ocr(selectFileIndex)"
          v-if="fileList[selectFileIndex].fileType === 1"
        >
          <i class="iconfont icon-wenzishibie v-contextmenu-submenu__icon" style="font-size: 14px">
          </i>
          文字识别
        </v-contextmenu-item>
        <v-contextmenu-item style="margin: 3px 0">
          <a :href="getDownloadFilePath(this.fileList[this.selectFileIndex])" style="color: #333">
            <i class="iconfont icon-xiazai v-contextmenu-submenu__icon"></i>下载
          </a>
        </v-contextmenu-item>
      </template>

      <!--多文件右键菜单-->
      <template v-if="selectedFileCount > 1">
        <!--<v-contextmenu-item>多个文件右键</v-contextmenu-item>-->
        <v-contextmenu-item
          @click="menuMethods(item.methodName)"
          style="margin: 3px 0"
          v-for="item in multiMenuList"
          :key="item.id"
        >
          <i class="iconfont v-contextmenu-submenu__icon" :class="item.iconClassName"></i>
          {{ item.name }}
        </v-contextmenu-item>
        <v-contextmenu-item style="margin: 3px 0">
          <a :href="getDownloadFilePath(this.fileList[this.selectFileIndex])" style="color: #333">
            <i class="iconfont icon-xiazai v-contextmenu-submenu__icon"></i>下载
          </a>
        </v-contextmenu-item>
      </template>
    </v-contextmenu>

    <ContextMenu
      :event="e"
      :left="menuLeft"
      :top="menuTop"
      v-show="showMenu"
      :selectFileIndex="selectFileIndex"
      :selectedFile="selectedFile"
      :file="fileList[this.selectFileIndex === -1 ? this.selectFileIndex : 0]"
      :count="selectedFileCount"
      :type="selectedFileCount === 1 ? 1 : 2"
    ></ContextMenu>

    <Message :show="showMessage"></Message>
    <!--测试按钮-->
    <!--<div class="test-btn" v-show="this.$route.fullPath.includes('')"-->
    <!--     :path="this.$route.fullPath"-->
    <!--     @click="test"-->
    <!--     style="-->
    <!--  position: fixed;-->
    <!--  top: 80px;-->
    <!--  left: 770px;-->
    <!--  z-index: 4;cursor: pointer;-->
    <!--  background-color: #06a7ff;-->
    <!--  "-->
    <!--&gt;-->
    <!--  测试方法-->
    <!--</div>-->

    <!--<div class="test-btn" v-show="this.$route.fullPath.includes('')"-->
    <!--     :path="this.$route.fullPath"-->
    <!--     @click="test2"-->
    <!--     style="-->
    <!--  position: fixed;-->
    <!--  top: 80px;-->
    <!--  left: 880px;-->
    <!--  z-index: 4;cursor: pointer;-->
    <!--  background-color: #06a7ff;-->
    <!--  "-->
    <!--&gt;-->
    <!--  测试方法2-->
    <!--</div>-->
  </div>
</template>

<script>
import {
  batchCopyFile,
  batchDeleteFile,
  batchMoveFile,
  copyFile,
  createFolder,
  createOffline,
  deleteFile,
  getDownloadProgress,
  getFileListByType,
  moveFile,
  renameFile,
  searchFile,
  shareFile,
  unzipFile,
  getProgress,
  formatconversion
} from '@/request/file'
import viewerApi from '@/components/play/imagePreview/api'
import FileInfo from '@/components/index/fileInfo/FileInfo'
import ContextMenu from '@/components/common/contextMenu/ContextMenu.vue'
import Message from '@/components/common/message/Message'
import Loading from '@/components/common/loading/Loading'
import Bus from '@/libs/bus'
import { getUserInfo } from '@/request/user'
import { blankMenuList, conversionExtList, defaultMenuList, multiMenuList } from '@/libs/map'
import Vue from 'vue'
import { debounce } from '@/utils/utils'
import dayjs from 'dayjs'

var websocket
let unzipTimer
var formatTimer
var offlineTimer
export default {
  name: 'Index',
  props: {},
  components: {
    FileInfo,
    ContextMenu,
    Message,
    Loading
  },
  data () {
    return {
      currentYear: parseInt(new Date().getFullYear()),
      defaultMenuList,
      multiMenuList,
      blankMenuList,
      conversionExtList,
      websocket: WebSocket,
      loadingText: '加载中...',
      // 文件总数
      total: 0,
      // 文件审核中数
      auditCount: 0,
      // 总页数
      pageCount: 0,
      // 分页大小
      pageSize: 50,
      e: Object,
      // 显示加载动画
      showLoading: false,
      // 显示创建文件夹
      showCreateFolder: false,
      fileName: '',
      createFolderName: '',
      // 打开文件索引
      openFileIndex: -1,
      // 显示提示框
      showMessage: false,
      // 获取文件的全路径
      fullPath: '',
      selectFullPath: '',
      showMenu: false,
      showMarkdown: false,
      imageList: [],
      // 右键菜单弹窗左边距离
      menuLeft: 0,
      searchKeyWords: '',
      // 右键菜单弹窗上边距离
      menuTop: 0,
      menuType: 1,
      path: '/',
      currentFile: {
        id: -1
      },
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
      // 文件列表
      fileList: [],
      // 排序文件列表
      sortFileList: [],
      // 选中文件列表 包含file所有信息
      selectFileList: [],
      // 选中文件id列表
      selectFileIdList: [],
      // 文件显示方式 默认block,可选值list
      displayMode: 'block',
      fileToolBarList: [
        // {
        //   id: 2,
        //   name: '下载',
        //   iconClassName: 'icon-xiazai',
        //   methodName: 'download'
        // },
        {
          id: 3,
          name: '分享',
          iconClassName: 'icon-fenxiang1',
          methodName: 'shareFile'
        },
        {
          id: 4,
          name: '复制',
          iconClassName: 'icon-fuzhi',
          methodName: 'copyFile'
        },
        {
          id: 5,
          name: '移动',
          iconClassName: 'icon-yidong',
          methodName: 'moveFile'
        },
        // {
        //   id: 6,
        //   name: '重命名',
        //   iconClassName: 'icon-zhongmingming',
        //   methodName: 'renameFile'
        // },
        {
          id: 7,
          name: '删除',
          iconClassName: 'icon-shanchu',
          methodName: 'deleteFile'
        }
      ],
      singleMenuList: [
        {
          id: 1,
          name: '打开',
          iconClassName: 'icon-openl',
          methodName: 'menuOpen',
          count: 1
        },
        // {
        //   id: 2,
        //   name: '下载',
        //   iconClassName: 'icon-xiazai',
        //   methodName: 'menuDownload'
        // },
        {
          id: 3,
          name: '分享',
          iconClassName: 'icon-fenxiang1',
          methodName: 'shareFile'
        },
        {
          id: 4,
          name: '复制',
          iconClassName: 'icon-fuzhi',
          methodName: 'copyFile'
        },
        {
          id: 5,
          name: '移动',
          iconClassName: 'icon-yidong',
          methodName: 'moveFile'
        },
        {
          id: 6,
          name: '重命名',
          iconClassName: 'icon-zhongmingming',
          methodName: 'renameFile'
        },
        {
          id: 7,
          name: '删除',
          iconClassName: 'icon-shanchu',
          methodName: 'deleteFile'
        }
      ],
      orderColumn: '',
      order: '',
      remoteTask: 0,
      progress: 0,
      // 离线下载文件
      offlineFile: {},
      unzipTimer: null
    }
  },
  watch: {
    createFolderName: function(val) {
      var flag = new RegExp(
        '[`~!@#$^&*()=|{}\':;\',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？ ]'
      )
      // // 判断 even 是否包含特殊字符
      if (flag.test(val)) {
        this.$toast.error('文件夹名称不能包含特殊字符')
      }
    },
    // 监听选择文件数量
    selectedFileCount: function() {
      if (this.selectedFileCount === 0) {
        this.selectAllFiles = false
        this.selectFileIndex = -1
      }
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
          this.$store.commit('updateSelectFileIdList', this.selectFileIdList)
        }
        i++
      }
    },
    showMessage: function() {
      if (this.showMessage === true) {
        window.setTimeout(() => {
          this.showMessage = false
        }, 3000)
      }
    },
    // 监听路由的filePath属性的数据变化
    '$route.query.filePath': function(path) {
      // 加载新文件列表时重置数据为空,开始呢 加载动画
      this.fileList.length = 0
      this.sortFileList.length = 0
      this.showLoading = true
      // var path = this.$route.query.filePath
      this.$store.commit('updateFullPath', path)
      if (path === undefined) {
        this.fullPath = ''
        this.currentPath = ''
        this.getFileList(path)
        this.$store.commit('updateFullPath', '/')
      } else {
        this.getFileList(path)
        this.$store.commit('updateFullPath', path)
      }
    },
    // 监听文件分类变化
    '$route.query.category': function() {
      // 加载新文件列表时重置数据为空,开始 加载动画
      this.fileList.length = 0
      this.sortFileList.length = 0
      this.showLoading = true

      this.total = 0
      this.pageCount = 0
      this.selectedFileCount = 0
      // 只要categoryId的值发生变化,这个方法就会被调用
      if (this.$route.query.category != undefined) {
        if (this.$route.query.category == 'all') {
          this.fullPath = ''
          this.currentPath = ''
          this.currentFile.id = -1
          this.getFileList(this.fullPath)
        } else {
          const data = {
            fileType: this.$route.query.category,
            currentPage: this.$store.state.currentPage,
            pageCount: this.$store.state.pageCount
          }
          this.getFileListByType(data)
        }
      }
    },
    searchKeyWords: function(val) {
      debounce(this.search, 300)
    },
    showMenu (value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    },
    showCreateFolder (showCreateFolder) {
      if (!showCreateFolder === true) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        // document.body.addEventListener('click', this.closeMenu)
        document.body.removeEventListener('click', this.closeMenu)
      }
    },
    visible: {
      handler (newVal) {
        if (!newVal) {
          // 解除禁止滚动
          this.$nextTick(() => {
            document.removeEventListener('mousewheel', this.mousewheelHandler, { passive: false })
          })

          this.$emit('update:visible', false)
        } else {
          this.$emit('update:visible', true)
          // 每次弹出弹窗,让遮罩层下面的页面不能滚动
          this.$nextTick(() => {
            document.addEventListener('mousewheel', this.mousewheelHandler, { passive: false })
          })
        }
      },
      immediate: true
    }
  },
  computed: {
    // 上传文件组件参数
    uploadFileParams: {
      get () {
        const res = {
          filePath: this.fullPath === '' ? '/' : this.fullPath,
          isDir: 0
        }
        return res
      },
      set () {
        return {
          filePath: this.fullPath === '' ? '/' : this.fullPath,
          isDir: 0
        }
      }
    }
  },
  created () {
    if (this.$route.query.category === undefined) {
      this.$router.push({
        path: '/index',
        query: {
          category: 'all'
        }
      })
    }

    if (this.$route.query.category !== undefined) {
      this.selectedFileCount = 0
      // 只要categoryId的值发生变化,这个方法就会被调用
      if (this.$route.query.category === 'all') {
        this.fullPath = this.$route.query.filePath ? this.$route.query.filePath : ''
        this.currentPath = ''
        this.getFileList(this.fullPath, false)
      } else {
        const data = {
          fileType: this.$route.query.category,
          currentPage: this.$store.state.currentPage,
          pageCount: this.$store.state.pageCount
        }
        getFileListByType(data).then((res) => {
          if (res.code === 0) {
            this.fileList.length = 0
            this.sortFileList = 0
            this.fileList = res.data.list
            this.sortFileList = res.data.list
            this.$store.commit('updateFileList', this.fileList)
            this.selectedFile = new Array(this.fileList.length).fill(false)
          } else {
            this.$toast.error(res.msg)
          }
        })
      }
    }
  },
  mounted () {
    if ('WebSocket' in window) {
      // websocket = new WebSocket('ws://localhost:8080/api/push/websocket/' + JSON.parse(localStorage.getItem('userInfo')).userName)
      // websocket = new WebSocket('ws://localhost:8080/api/push/websocket?sid=' + JSON.parse(localStorage.getItem('userInfo')).userName)
      // this.initWebSocket()
    } else {
      this.$toast.error('当前浏览器不支持websocket')
    }
    this.displayMode = this.$store.state.displayMode
    // 文件选择后的回调
    Bus.$on('fileAdded', () => {
      console.log('文件已选择')
    })

    // 文件上传成功的回调
    Bus.$on('fileSuccess', () => {
      console.log('文件上传成功')
    })
    // 重新获取文件列表
    Bus.$on('updateFileList', (e) => {
      this.getFileList(this.fullPath, true)
    })
  },
  destroyed: function() {
    // 离开页面生命周期函数
  },
  methods: {
    dayjs,
    compareYear: function(val) {
      if (parseInt(val) < this.currentYear) {
        return true
      } else {
        return false
      }
    },
    createWebSocket (userId, fileId, path) {
      if (!websocket) {
        // return new WebSocket('ws://localhost:8080/api/push/websocket/?uid' + userId + '&fid' + fileId)
        return new WebSocket(
          'ws://localhost:8080/api/progress?fileName=123.zip&urlStr=https://mirrors.aliyun.com/ubuntu-releases/trusty/ubuntu-14.04.6-server-amd64.iso&userId=1&type=offline&downloadPath=/&fileSavePath=/'
        )
        // console.log('ws://' + window.location.host + '/api/push/websocket' + userId + '/' + fileId)
        // websocket = WebSocket('ws://' + window.location.host + '/api/push/websocket?sid=' + JSON.parse(localStorage.getItem('userInfo')).userName)
        // return websocket
        // return new WebSocket('ws://127.0.0.1:8080/api/push/websocket/' + userId + '/' + fileId)
      } else {
        return websocket
      }
    },
    /**
     * WebSocket
     */
    initWebSocket () {
      // 连接错误
      websocket.onerror = this.setErrorMessage

      // 连接成功
      websocket.onopen = this.setOnopenMessage

      // 收到消息的回调
      websocket.onmessage = this.setOnmessageMessage

      // 连接关闭的回调
      websocket.onclose = this.setOncloseMessage

      // 监听窗口关闭事件,当窗口关闭时,主动去关闭websocket连接,防止连接还没断开就关闭窗口,server端会抛异常.
      window.onbeforeunload = this.onbeforeunload
    },
    setErrorMessage () {
      console.log('WebSocket连接发生错误   状态码:' + websocket.readyState)
    },
    setOnopenMessage () {
      console.log('WebSocket连接成功    状态码:' + websocket.readyState)
    },
    setOnmessageMessage (event) {
      // 根据服务器推送的消息做自己的业务处理
      console.log('服务端返回:' + event.data)
    },
    setOncloseMessage () {
      console.log('WebSocket连接关闭    状态码:' + websocket.readyState)
    },
    onbeforeunload () {
      this.closeWebSocket()
    },
    closeWebSocket () {
      websocket.close()
    },
    sendWebsocketInfo () {
      getDownloadProgress().then((res) => {
        console.log(res)
        if (res.code === 0) {
        } else {
          // this.$message.error(res.message)
        }
      })
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
      this.sortFileList = this.generateNewList(this.orderColumn, this.order, this.sortFileList)
    },
    /**
     * 文件格式转换
     */
    formatConversion (row, conversionExt) {
      this.fileFormatConversion(row, conversionExt)
    },
    /**
     * 文件格式转换
     * @param row
     * @param conversionExt
     */
    fileFormatConversion (row, conversionExt) {
      // var _this = this
      var t = new Date().getTime()
      const data = {
        fileExt: row.fileExt,
        convertExt: conversionExt,
        fileId: row.id,
        t: t
      }
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
            res.data.progress >= 100 ? '转换完成' : '转换进度: ' + res.data.progress + '%'
          )
          if (res.data.finish === 1) {
            clearInterval(formatTimer)
            Bus.$emit('updateFileList')
            // _this.getFileList()
          }
          Bus.$emit('toastMsg', ' 转换进度: ' + res.data.progress + '%')
          if (res.data.progress >= 100) {
            // _this.getFileList(this.fullPath, true)
            Bus.$emit('toastMsg', ' 转换完成')
            Bus.$emit('updateFileList')
            clearInterval(formatTimer)
          }
        })
      }, 4000)
      formatconversion(data, true).then((res) => {
        if (res.code === 0) {
          this.$toast.success('转换任务创建成功', -1)
          // this.file = res.data.file
          if (this.$route.query.category === 'all') {
            // _this.getFileList(row.filePath, true)
          } else {
            // this.getFileListByType(this.$route.query.category)
          }
        } else {
          this.$toast.error(res.msg)
        }
      })
    },
    /**
     * 刷新文件列表
     */
    refreshFileList () {
      this.getFileList(this.fullPath, true)
      // if (this.$route.query.category === 'all') {
      //   refreshFile.then((res) => {
      //     if (res.code === 0) {
      //
      //     } else {
      //       this.$toast.error(res.msg)
      //     }
      //   })
      //   // this.getFileList(this.fullPath, true)
      // } else {
      //   refreshFile.then((res) => {
      //     if (res.code === 0) {
      //     } else {
      //       this.$toast.error(res.msg)
      //     }
      //   })
      //   // this.getFileListByType(this.$route.query.fileType)
      // }
    },
    // 清除定时器
    clearTimer (timer) {
      console.log('清除定时器', timer)
      clearInterval(timer)
      // clearInterval(formatTimer)
    },
    async unzip (item, type) {
      // var timer
      const _this = this

      if (type === 3) {
        var { filePath } = await this.$fileSelector({
          title: '选择目录',
          userInfo: this.$store.state.userInfo,
          onlyFolder: true,
          show: true
        })
        // 在当前文件夹下创建 解压文件目录
      } else if (type === 2) {
        filePath =
          (item.filePath === '/' ? '/' : item.filePath + '/') +
          item.fileName.replace('.' + item.fileExt, '')
      } else {
        filePath = this.$store.state.fullPath
      }
      _this.remoteTask = new Date().getTime()
      const data = {
        fid: this.fileList[this.selectFileIndex].id,
        unzipMode: type,
        filePath: filePath,
        t: _this.remoteTask
      }
      // websocket = new WebSocket('ws://localhost:8080/api/progress/unzip?id=' + this.fileList[this.selectFileIndex].id + '&uid=' + this.$store.state.userInfo.id)
      // this.$toast.success(',解压文件所在目录解压文件所在目录解压文件所在目录解压文件所在目录:' + filePath, -1)
      // 解压到指定文件夹
      this.unzipTimer = window.setInterval(function() {
        // 每5秒刷新一次
        const data = {
          type: 'unzip',
          fid: item.id,
          unzipMode: type,
          filePath: filePath,
          t: _this.remoteTask
        }
        getProgress(data).then((res) => {
          Bus.$emit('toastMsg', ' 解压进度: ' + res.data.progress + '%')
          // Bus.$emit('updateLoadingText', res.data.progress >= 100 ? '解压完成' : '解压进度: ' + res.data.progress + '%')
          if (res.code === 0) {
            if (res.data.progress >= 100) {
              Bus.$emit('toastMsg', ' 解压完成')
              window.clearInterval(_this.unzipTimer)
              _this.unzipTimer = null
              Bus.$emit('updateFileList')
              // _this.getFileList(this.fullPath, true)
            } else {
              Bus.$emit('toastMsg', ' 解压进度: ' + res.data.progress + '%')
            }
          } else {
            Bus.$emit('toastMsg', ' 解压失败')
            window.clearInterval(_this.unzipTimer)
            _this.unzipTimer = null
          }
        })
      }, 2000)
      unzipFile(data).then((res) => {
        if (res.code === 0) {
          // clearInterval(unzipTimer)
          this.$toast.success('解压任务创建成功,保存路径:' + filePath, -1)
        } else {
          // clearInterval(unzipTimer)
          this.$toast.error(res.msg)
        }
      })
    },
    ocr (index) {
      const image = this.fileList[index]
      if (image.fileSize > 4194304) {
        this.$toast.error('图片大小不能超过4M')
        return
      }
      var imageList = this.fileList.filter((item) => item.fileType === 1)
      const di =
        imageList.length > 1
          ? imageList.indexOf(
            imageList.filter((d) => d.fileName == this.fileList[this.selectFileIndex].fileName)[0]
          )
          : 0
      Vue.prototype.$previewImageOcr({
        imageList: imageList,
        defaultIndex: di
      })
    },
    menuMethods (method) {
      this[method]()
    },
    // 打开
    menuOpen: function() {
      var index = this.$store.state.selectFileIndex
      this.clickActions(index, this.fileList[index])
    },
    // 分享文件
    menuShare: function() {
      this.shareFile()
    },
    // 复制文件
    menuCopy: function() {
      this.copyFile()
    },
    // 移动文件
    menuMove: function() {
      this.moveFile()
    },
    // 文件重命名
    menuRename: function() {
      this.renameFile()
      // bus.$emit('renameFileName', this.$store.state.fileList[this.$store.state.selectFileIndex].fileName)
    },
    // 删除文件
    menuDelete: function() {
      this.deleteFile()
    },
    menuDownload: function() {
      // this.$parent.download()
    },
    // 刷新页面
    menuRefresh: function() {
      if (this.$route.query.category === 'all') {
        this.getFileList(this.fullPath)
      } else {
        this.getFileListByType(this.$route.query.category)
      }
    },
    // 创建文件夹
    menuCreateFolder: function() {
      this.createFolder()
    },
    menuRestoreFile: function() {
      console.log('还原文件')
      this.restoreFile()
    },
    menuDeleteRecycle: function() {
      console.log('彻底删除')
      this.deleteRecycle()
    },
    showContentMenuType (index) {
      // const _this = this
      this.selectFileIndex = index
      this.item = this.fileList[index]
      if (this.selectedFile[index] === true) {
      } else {
        this.init()
      }
      if (this.getSelectedFileIndex(this.selectedFile, index) === index) {
        this.selectFile(index)
      } else if (this.selectedFileCount === 0) {
        this.selectFile(index)
      }
      return this.$store.state.selectFileCount
    },
    getUserInfo () {
      getUserInfo().then((res) => {
        console.log(res)
        if (res.code === 0) {
          localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
          localStorage.setItem('userStorage', JSON.stringify(res.data.userStorage))
          this.$store.commit('updateIsLogin', true)
          this.$store.commit('updateUserInfo', res.data.userInfo)
          this.$store.commit('updateUserStorage', res.data.userStorage)
        } else {
          this.$toast.error(res.msg)
        }
      })
    },
    // 文件搜索
    search (val) {
      this.selectAllFiles = false
      this.selectedFileCount = 0
      if (this.searchKeyWords === '') {
        this.$toast.error('搜索关键词不能为空')
        return
      }
      val = this.searchKeyWords
      const data = {
        keywords: val
      }
      searchFile(data, true).then((res) => {
        if (res.code === 0) {
          this.fileList.length = 0
          this.sortFileList.length = 0
          this.fileList = res.data
          this.sortFileList = res.data
          this.$store.commit('updateFileList', this.fileList)
          this.selectedFile = new Array(this.fileList.length).fill(false)
          // this.pageData.total = res.data.total
          // this.loading = false
        } else {
          this.$toast.error(res.msg)
        }
      })
      // this.$router.replace({
      //   // path: '/index',
      //   query: {
      //     category: 'all',
      //     search: this.searchKeyWords
      //   }
      // })
    },
    /**
     * 上传文件按钮点击事件
     * @description 通过Bus通信,开启全局上传文件流程
     * @param {boolean} uploadWay 上传方式 0-文件上传 1-文件夹上传 2-粘贴图片或拖拽上传
     */
    handleUploadFileBtnClick (uploadWay) {
      this.$uploadFile({
        params: this.uploadFileParams,
        uploadWay,
        serviceEl: this
      })
    },

    // test方法
    async test () {
      this.$toast.success('加载中...', -1)
      // this.sendWebsocketInfo()
      websocket = this.createWebSocket(1, 1, '')

      // this.downloadFile = this.fileList[4]
      // await this.$request(
      //   '/filetransfer/download',
      //   this.downloadFile,
      //   'get',
      //   'params'
      // )
    },
    test2 () {
      clearInterval(unzipTimer)

      // const data = {
      //   fileName: '20220508'
      // }
      // createCosFolder(data).then(res => {
      //   console.log(res)
      // })
      // this.progress++
      // if (this.progress > 5) {
      //   const data = {
      //     content: '打开文件位置',
      //     src: '/index'
      //   }
      //   Bus.$emit('toastMenu', data)
      // }
      // Bus.$emit('toastMsg', '下载进度' + this.progress + '%')
    },
    init () {
      this.selectedFileCount = 0
      this.selectFileIndex = -1
      this.selectedFile = new Array(this.fileList.length).fill(false)
    },
    previewImgObject (index, imageList) {
      const $viewer = viewerApi({
        options: {
          toolbar: true,
          url: 'data-source',
          initialViewIndex: index
        },
        images: imageList
      })
      console.log($viewer)
    },

    // 文件夹
    folder: function(index, fileName, e) {
      console.log('点击目录:' + fileName)
      this.enterFolder(index, '/' + fileName, e)
    },
    // 路径导航
    navigate (index) {
      var currentPath = this.$route.query.filePath
      // console.log('当前路径:' + currentPath)
      var routeArr = currentPath.split('/').slice(1)
      // 将routeArr的前index个元素前面添加/再拼接
      var path = '/' + routeArr.slice(0, index + 1).join('/')
      // var routerLength = this.$route.query.filePath.split('/').length
      // console.log('跳转新路径:' + path)
      // console.log('routeArr,截取掉第一个空:', routeArr)
      // console.log('routerLength:' + routerLength)
      // console.log('点击index:', index)
      // console.log('点击当前路径:', routeArr[index])
      // 获取currentPath的routerLength[index]左边的路径
      // console.log('进入的路径:' + )
      if (path === '/') {
        // this.getFileList('/')
        this.$router.push({
          path: '/index',
          query: {
            category: 'all'
          }
        })
        // this.getFileList('/', false)
      } else {
        this.$router.push({
          path: '/index',
          query: {
            category: 'all',
            filePath: path
          }
        })
        this.$nextTick(function() {
          // this.getFileList(this.$store.state.fullPath)
        })
      }
    },
    // 返回上一级目录
    back (path) {
      this.searchKeyWords = ''
      this.showLoading = true
      this.selectedFileCount = 0
      this.selectAllFiles = false
      this.sortFileList.length = 0
      if (path === '/') {
        // this.getFileList('/')
        this.$router.push({
          path: '/index',
          query: {
            category: 'all'
          }
        })
        this.getFileList('/', false)
      } else {
        this.$router.go(-1)
        this.$nextTick(function() {
          // this.getFileList(this.$store.state.fullPath)
        })
      }
    },
    moreOption () {
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
    // 关闭窗口
    closeMenu () {
      this.showMenu = false
      this.showCreateFolder = false
    },

    // 选择文件
    selectFile (index) {
      this.selectFileIndex = index
      // e.stopImmediatePropagation()
      if (this.selectAllFiles === true) {
        this.selectAllFiles = false
      }
      if (this.selectedFile[index] == false) {
        this.selectedFileCount += 1
        this.selectedFile[index] = true
        this.$store.commit('updateSelectFileCount', this.selectedFileCount)
        // 判断是否所有都选则
        if (this.selectedFile.filter((file) => file == true).length === this.fileList.length) {
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
        this.$store.commit('updateSelectFileIndex', index)
        // 选中文件为1 且路径为空时
        if (this.$route.query.filePath === undefined) {
          this.selectFullPath = '/' + this.fileList[index].fileName
          this.$store.commit('updateSelectFullPath', this.selectFullPath)
        } else {
          // 路径不为空时
          this.selectFullPath = this.$route.query.filePath + '/' + this.fileList[index].fileName
          this.$store.commit('updateSelectFullPath', this.selectFullPath)
        }
        this.selectFileIndex = this.getSelectedFileIndex(this.selectedFile, true)
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
    // 点击不同文件实现不同的功能
    clickActions: function(index, item, e) {
      console.log('==index:' + index + '==fileName:' + item.fileName)
      if (item.isDir === 1) {
        this.currentFile.id = item.id
        if (this.searchKeyWords !== '') {
          console.log('搜索进入文件夹')
          this.$router.push({
            query: {
              category: 'all',
              filePath:
                item.filePath === '/' ? '/' + item.fileName : item.filePath + '/' + item.fileName
            }
          })
          this.searchKeyWords = ''
        } else {
          this.enterFolder(index, '/' + item.fileName)
        }
      } else {
        this.handleFilePreview(index, item, this.fileList)
      }
    },
    /**
     * 打开目录
     * @param index 选择的文件索引
     * @param path 当前选中的文件目录 如根目录下的 '我的音乐'为 '/我的音乐'
     * @param e 点击事件
     */
    enterFolder (index, path) {
      this.showLoading = true
      this.selectedFileCount = 0
      this.selectAllFiles = false
      var prePath = ''
      // 在根目录下 目录前缀为 '/',则重置前缀为空,由于参数path是带 '/'的,防止目录多一个'/'
      if (this.$store.state.fullPath === '/') {
        prePath = ''
      } else {
        prePath = this.$store.state.fullPath
      }
      this.fullPath = prePath + path
      this.currentPath = path
      // console.log('fullPath:' + this.fullPath)
      // console.log('currentPath:' + this.currentPath)
      this.$router.push({
        path: '/index',
        query: {
          category: 'all',
          filePath: this.fullPath
        }
      })
    },
    // 复制文件
    copyFile () {
      this.$fileSelector({
        title: '复制文件',
        userInfo: this.$store.state.userInfo,
        onlyFolder: true,
        show: true
      })
        .then((res) => {
          console.log('res:', res)
          if (this.selectedFileCount === 1 && this.fileList[this.selectFileIndex].isDir !== 1) {
            if (res.filePath == this.fileList[this.selectFileIndex].filePath) {
              this.$toast.error('不能复制到当前目录')
              return
            }
            const data = {
              userId: this.getCookies('uid'),
              filePath: res.filePath,
              fileId: this.fileList[this.selectFileIndex].id
            }
            copyFile(data, true).then((res) => {
              console.log(res)
              if (res.code === 0) {
                this.selectedFile = new Array(this.fileList.length).fill(false)
                this.$toast.success(res.msg)
                this.getFileList(this.fullPath, true)
              } else {
                this.$toast.error(res.msg)
              }
            })
          } else {
            if (res.filePath == this.selectFileList[0].filePath) {
              this.$toast.error('不复制到当前目录')
              return
            }
            const data = {
              // userId: this.getCookies('uid'),
              filePath: res.filePath,
              fileList: this.selectFileList
            }
            batchCopyFile(data).then((res) => {
              if (res.code === 0) {
                this.getFileList(this.fullPath)
              } else {
                this.$toast.error(res.msg)
              }
            })
            console.log('批量复制')
          }
        })
        .catch((err) => {
          console.log(err)
        })

      // this.$confirmBox({
      //   title: '复制文件',
      //   showType: 1
      // })
      //   .then(() => {
      //     console.log('复制文件接口调用')
      //     if (this.selectedFileCount === 1 && this.fileList[this.selectFileIndex].isDir !== 1) {
      //       const data = {
      //         filePath: this.$store.state.copyMovePath,
      //         fileId: this.fileList[this.selectFileIndex].id
      //       }
      //       copyFile(data, true).then((res) => {
      //         console.log(res)
      //         if (res.code === 0) {
      //           this.selectedFile = new Array(this.fileList.length).fill(false)
      //           this.$toast.success(res.msg)
      //           this.getFileList(this.fullPath, true)
      //         } else {
      //           this.$toast.error(res.msg)
      //         }
      //       })
      //     } else {
      //       const data = {
      //         filePath: this.$store.state.copyMovePath,
      //         fileList: this.selectFileList
      //       }
      //       batchCopyFile(data).then((res) => {
      //         if (res.code === 0) {
      //           this.getFileList(this.fullPath)
      //         } else {
      //           this.$toast.error(res.msg)
      //         }
      //       })
      //       console.log('批量复制')
      //     }
      //   })
      //   .catch(() => {
      //   })
    },
    // 移动文件
    moveFile () {
      this.$fileSelector({
        title: '移动文件',
        userInfo: this.$store.state.userInfo,
        onlyFolder: true,
        show: true
      })
        .then((res) => {
          console.log('res:', res)
          if (this.selectedFileCount === 1 && this.fileList[this.selectFileIndex].isDir !== 1) {
            // let files
            // this.fileList.filter((item,index) => item)
            if (res.filePath == this.fileList[this.selectFileIndex].filePath) {
              this.$toast.error('不能移动到当前目录')
              return
            }
            const data = {
              userId: this.getCookies('uid'),
              fileId: this.fileList[this.selectFileIndex].id,
              filePath: res.filePath
            }
            moveFile(data).then((res) => {
              console.log(res)
              if (res.code === 0) {
                this.getFileList(this.fullPath, true)
              } else {
                this.$toast.error(res.msg)
              }
            })
          } else {
            const data = {
              // userId: this.getCookies('uid'),
              filePath: res.filePath,
              fileList: this.selectFileList
            }
            batchMoveFile(data).then((res) => {
              if (res.code === 0) {
                this.getFileList(this.fullPath)
                this.selectedFile.length = 0
                this.selectedFileCount = 0
              } else {
                this.$toast.error(res.msg)
              }
            })
            // 批量移动
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 重命名文件
    renameFile () {
      this.$bus.$emit('sendOperationFile', this.fileList[this.selectFileIndex])
      this.$store.commit('updateRenameFileName', this.fileList[this.selectFileIndex].fileName)
      Bus.$emit('fileName', this.fileList[this.selectFileIndex].fileName)
      this.$confirmBox({
        title: '重命名文件',
        showType: 3,
        file: this.fileList[this.selectFileIndex],
        originName: this.fileList[this.selectFileIndex].fileName.replace('.' + this.fileList[this.selectFileIndex].fileExt, ''),
        operation: 'rename'
      })
        .then((res) => {
          console.log(res)
          // var fileName = this.fileList[this.selectFileIndex].fileExt !== null
          //   ? this.$store.state.renameFileName + '.' + this.fileList[this.selectFileIndex].fileExt : this.$store.state.renameFileName
          if (res.fileName <= 0) {
            this.$toast.error('文件名不能为空')
            return
          }
          const data = {
            userId: this.getCookies('uid'),
            fileId: this.fileList[this.selectFileIndex].id,
            fileName: res.fileName,
            filePath: res.filePath,
            isDir: this.fileList[this.selectFileIndex].isDir
          }
          renameFile(data).then((res) => {
            console.log(res)
            if (res.code === 0) {
              this.getFileList(this.fullPath, true)
              this.$toast.success(res.msg)
            } else {
              this.$toast.error(res.msg)
            }
          })
        })
        .catch(() => {
        })
    },
    // 删除文件 单个
    deleteFile () {
      this.$confirmBox({
        title: '删除文件',
        msg: '确定删除这' + this.$store.state.selectFileCount + '个项目吗',
        showType: 0
      })
        .then(() => {
          console.log('确认删除')
          if (this.selectedFileCount === 1) {
            const data = {
              userId: this.getCookies('uid'),
              id: this.fileList[this.selectFileIndex].id
            }
            deleteFile(data).then((res) => {
              console.log(res)
              if (res.code === 0) {
                this.init()
                this.$store.commit('updateUserStorage', res.data.userStorage)
                if (this.$route.query.category === 'all') {
                  this.getFileList(this.fullPath, true)
                } else {
                  this.getFileListByType(this.$route.query.category)
                }
                this.$toast.success('删除成功')
              } else {
                this.$toast.error(res.msg)
              }
            })
          } else {
            // 批量删除
            // const data = {
            //   // this.selectFileIdList
            //   // filePath: this.filePath,
            // }
            batchDeleteFile(this.selectFileIdList).then((res) => {
              console.log(res)
              if (res.code === 0) {
                this.getFileList(this.fullPath, true)
                this.selectedFile = new Array(this.fileList.length).fill(false)
                this.$toast.success('删除成功')
              } else {
                this.$toast.error(res.msg)
              }
            })
          }
        })
        .catch(() => {
        })
    },
    // 分享文件
    shareFile () {
      if (this.selectedFileCount > 1) {
        this.$toast.error('请选择一个文件或文件夹分享')
        return
      }
      this.$confirmBox({
        title: '分享文件',
        showType: 4,
        file: this.fileList[this.selectFileIndex]
      })
        .then((p) => {
          console.log('p.expiredTime' + p.expiredTime)
          if (this.selectedFileCount === 1) {
            const data = {
              id: this.fileList[this.selectFileIndex].id
            }
            shareFile(data).then((res) => {
              console.log(res)
              if (res.code === 0) {
                this.getFileList(this.fullPath)
                this.$toast('分享成功')
              } else {
                this.$toast.error(res.msg)
              }
            })
          } else {
            // 批量分享
            const data = {
              fileList: this.selectFileIdList
            }
            shareFile(data).then((res) => {
              console.log(res)
              if (res.code === 0) {
                this.getFileList(this.fullPath)
                this.selectedFile = new Array(this.fileList.length).fill(false)
                this.$toast.success('分享成功')
              } else {
                this.$toast.error(res.msg)
              }
            })
          }
        })
        .catch(() => {
        })
    },
    // 文件展示方式
    selectDisplayMode (mode) {
      this.showCreateFolder = false
      if (mode == 'block') {
        this.displayMode = 'list'
        window.localStorage.setItem('display', 'list')
        this.$store.commit('updateDisplayMode', 'list')
      } else if (mode == 'list') {
        this.displayMode = 'block'
        window.localStorage.setItem('display', 'block')
        this.$store.commit('updateDisplayMode', 'block')
      }
    },
    toolOperation: function(itemMethods) {
      this[itemMethods]()
    },
    fileOption: function(itemMethods) {
      this[itemMethods]()
    },

    // 获取文件列表(通过全路径)
    // async getFileList (path, isRefresh) {
    //   this.showLoading = true
    //   this.selectAllFiles = false
    //   this.fileList.length = 0
    //   this.sortFileList.length = 0
    //
    //   if (path === this.$route.query.filePath) {
    //     this.selectedFileCount = 0
    //   }
    //   const data = {
    //     filePath: path === '' ? '/' : path,
    //     refresh: !!isRefresh
    //   }
    //   getFileListByPath(data).then((res) => {
    //     if (res.code === 0) {
    //       this.init()
    //       this.fileList = res.data.list
    //       console.log(JSON.parse(JSON.stringify(res.data.list)))
    //       // 获取首页图片
    //       this.imageList = this.fileList.filter(item => item.fileType === 1)
    //       // 关闭动画
    //       this.showLoading = false
    //       this.sortFileList = this.fileList.sort(this.compare('isDir', -1))
    //       this.$store.commit('updateFileList', this.fileList)
    //       this.selectedFile = new Array(this.fileList.length).fill(false)
    //     } else {
    //       this.showLoading = false
    //       if (res.code === 401) {
    //         this.$toast.error(res.msg)
    //         this.$router.push('/login')
    //       }
    //     }
    //   })
    // },
    // 获取文件列表(通过文件分类)
    async getFileListByType (type) {
      const data = {
        fileType: this.$route.query.category,
        currentPage: this.$store.state.currentPage,
        pageCount: this.$store.state.pageCount
      }
      getFileListByType(data).then((res) => {
        console.log(res)
        if (res.code === 0) {
          this.fileList.length = 0
          this.sortFileList = 0
          this.fileList = res.data.list
          this.sortFileList = res.data.list
          this.$store.commit('updateFileList', this.fileList)
          this.selectedFile = new Array(this.fileList.length).fill(false)
          // this.pageData.total = res.data.total
          // this.loading = false
          // 计算总页数
          // 关闭动画
          this.showLoading = false
          if (this.total === 0) {
            this.total = res.data.total
            this.pageCount = Math.ceil(this.total / this.$store.state.pageSize)
            console.log('总页数' + this.pageCount)
          }
        } else {
          this.$toast.error(res.msg)
          this.showLoading = false
          this.$toast.error(res.msg)
        }
      })
    },
    // 创建文件夹
    createFolder: function() {
      this.showCreateFolder = true
      this.createFolderName = ''
      this.$nextTick(function() {
        this.$refs.createFolderInput.focus()
      })
    },
    // 创建在线文档
    createDocument: function() {
      console.log('创建在线文档')
      this.$router.push({
        path: '/excel',
        query: {
          create: 'sheet',
          type: 2
        }
      })

      // Vue.prototype.$previewExcel({ fileInfo: 0 })
    },
    // 离线下载
    offlineDownload: function() {
      const _this = this
      this.$confirmBox({
        title: '创建离线下载',
        showType: 3,
        operation: 'offlineDownload',
        yesBtnText: '创建下载任务'
      })
        .then((p) => {
          console.log(p.url)
          if (!this.checkUrl(p.url)) {
            this.$toast.error('请输入正确的下载链接')
            return
          }
          _this.remoteTask = new Date().getTime()
          this.$toast.success('离线下载任务开始...', -1)
          // 创建离线下载进度更新定时器
          offlineTimer = setInterval(function() {
            // 每5秒刷新一次
            const data = {
              type: 'remote',
              url: p.url,
              t: _this.remoteTask
            }
            getProgress(data).then((res) => {
              if (_this.offlineFile.fileName !== undefined) {
                Bus.$emit(
                  'toastMsg',
                  _this.offlineFile.fileName + ' 下载进度: ' + res.data.progress + '%'
                )
              }
              // Bus.$emit('updateLoadingText', res.data.progress >= 100 ? '下载完成' : '下载进度: ' + res.data.progress + '%')
              if (res.data.progress >= 100) {
                Bus.$emit('toastMsg', _this.offlineFile.fileName + ' 下载完成')
                clearInterval(offlineTimer)
                _this.getFileList(this.fullPath)
              } else if (res.code !== 0) {
                clearInterval(offlineTimer)
              }
            })
          }, 3000)
          const data = {
            url: p.url,
            t: _this.remoteTask,
            type: 'remote'
          }
          // 创建离线下载任务
          createOffline(data).then((res) => {
            console.log(res)
            if (res.code === 0) {
              // this.$toast.success(res.msg)
              this.offlineFile = res.data
              Bus.$emit('toastMsg', '下载任务: ' + this.offlineFile.fileName + ' 创建成功')
            } else {
              this.$toast.error(res.msg)
            }
          })
        })
        .catch(() => {
        })
    },
    createFolderAction () {
      // var flag = new RegExp('[`~!@#$^&*()=|{}\':;\',\\[\\].<><>/?~!@#￥……&*()_|{}【】';:""\'.,、? ]')
      // var flag = new RegExp('[`~!@#$^&*()=|{}\':;\',\\[\\].<><>/?~!@#￥……&*()_|{}【】';:""\'.,、? ]')
      var flag = new RegExp(
        '[`~!@#$^&*()=|{}\':;\',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？ ]'
      )
      // 判断文件名是否包含特殊字符
      if (flag.test(this.createFolderName)) {
        this.$toast.error('文件夹名称不能包含特殊字符')
        return
      }
      this.fileName = this.trim(this.createFolderName, 'g')
      if (this.fileName !== '') {
        const data = {
          filePath: this.$store.state.fullPath,
          fileName: this.$refs.createFolderInput.value,
          parentPathId: this.currentFile.id
        }
        createFolder(data).then((res) => {
          console.log(res)
          if (res.code === 0) {
            this.$toast.success('新建文件夹成功')
            this.showCreateFolder = false
            this.getFileList(this.fullPath, true)
          } else {
            this.$toast.error(res.msg)
          }
        })
      } else {
        this.$toast.error('文件夹名称不能为空,请输入文件名称')
      }
    },
    uploadMouseover: function() {
      document.querySelector('.dropdown-list').style.display = ''
    },
    uploadMouseout: function() {
      this.$refs.dropdown.style = 'display:none'
      // document.querySelector('.dropdown-list').style.display = 'none'
    }
  }
}
</script>

<style lang="less" scoped></style>
