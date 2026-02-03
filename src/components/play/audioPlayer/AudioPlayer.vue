<template>
  <div class="audio-main float"
       v-show="visible"
       v-bind:id="id"
       :class="[floatSize ==='default' ? 'default-size': 'min-size']"
  >
    <!--标题-->
    <!--@mousedown="mousedown"-->

    <!--@mousedown="down" @touchstart.stop="down"-->
    <!--@mousemove="move" @touchmove.stop="move"-->
    <div class="audio-song-title"
         @dblclick="changeFloatSize"
         @mousedown="mousedown"
         @touchmove.stop="mousedown"
    >
      <span class="title-text">{{ songTitle }}</span>
      <span class="title-right">
        <i class="iconfont operate min cursor-p icon-2zuixiaohua-2" title="最小化"
           v-show="floatSize==='default'"
           @click="changeFloatSize()"></i>
        <i class="iconfont operate min cursor-p icon-zuidahua" title="最大化"
           v-show="floatSize==='min'"
           @click="changeFloatSize()"></i>
        <i class="iconfont operate bold cursor-p icon-guanbi" @click="closeFloatWindow()" title="关闭浮窗"></i>
      </span>

    </div>
    <!--播放器-->
    <div class="play-box">
      <media-player :title="songTitle"
                    view-type="audio"
                    ref="audioPlayer"
                    :volume="currentVolume"
                    @can-play="onCanPlay"
                    @ended="onEnded"
                    @volume-change="onVolumeChange"
                    crossOrigin
                    @provider-change="onProviderChange"
      >
        <media-provider v-if="src">
          <source :src="src" :data-src="src" type="audio/mp3" :key="src" />
        </media-provider>
        <!--thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"-->
        <media-audio-layout></media-audio-layout>
        <!--<media-plyr-layout style="width: 100%">-->

        <!--</media-plyr-layout>-->
      </media-player>
      <!--<vue-plyr :options="options"-->
      <!--          :type="mode"-->
      <!--          :invertTime="false"-->
      <!--          :autoplay="true"-->
      <!--          v-show="floatSize !== 'min'" ref="plyr"-->
      <!--          :class="{'default':mode==='default'}">-->
      <!--  <audio id="player" :controls="controls"-->
      <!--         ref="=audioPlayer"-->
      <!--  >-->
      <!--    <source :src="audioSrc" type="audio/mp3" :data-src="audioSrc"-->
      <!--            ref="audioPlayer" />-->
      <!--  </audio>-->

      <!--</vue-plyr>-->
      <i class="iconfont icon-xuanfuchuang" v-show="mode==='default'" @click="changeMode()"></i>
    </div>

    <!--播放列表-->
    <div class="audio-song-list" v-show="mode==='float' && floatSize === 'default'">
      <ul class="list">
        <li class="item" v-for="(item, index) in songList" :key="index"
            @click="play(index)"
            :class="songTitle===item.fileName?'active': ''">
          <span :title="item.fileName" class="name cursor-p">{{ item.fileName }}</span>
          <span class="operate">
            <i title="从列表删除" class="iconfont icon-tishicuowu cursor-p" v-show="songTitle!==item.fileName"
               @click="deleteSong(index, $event)"></i>
          </span>
        </li>
      </ul>
    </div>


  </div>

</template>

<script>
// Import styles.
import 'vidstack/player/styles/default/theme.css'
import 'vidstack/player/styles/default/layouts/audio.css'

// Register elements.
import 'vidstack/player'
import 'vidstack/player/layouts'
import 'vidstack/player/ui'
import 'vidstack/bundle'
import { isHLSProvider } from 'vidstack'
import { playerConfig } from '@/components/play/player-config.js'

export default {
  name: 'AudioPlayer',
  props: {
    show: {
      type: Boolean
    },
    file: {
      type: Object
    },
    playList: {
      type: Array
    }
  },
  components: {},
  data () {
    return {
      src: '',
      // 播放器实例
      // player: Object,
      // 音频预览组件是否可见
      visible: false,
      // 当前音量（0-1）
      currentVolume: 0.5,
      // 歌曲播放标题
      songTitle: '',
      // plyr播放器显示控制器
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
      id: 'audio-main',
      // 播放器样式 default:默认贴底, float:浮窗  !!! 已弃用此设置,采用浮窗,可调节大小!!!
      mode: 'float',
      floatWidth: (window.innerWidth - 500) + 'px',
      // 浮窗大小 default:默认 ,min:最小化
      // 浮窗大小
      floatSize: 'default',
      // 当前播放歌曲索引
      playIndex: 0,
      audioSrc: '',
      // 播放列表
      songList: [],
      // plyr配置
      options: {
        // 国际化配置
        i18n: {
          speed: '速度',
          normal: '正常',
          restart: '重新开始',
          rewind: 'Rewind {seektime}s',
          play: '播放',
          pause: '暂停',
          fastForward: 'Forward {seektime}s',
          seek: 'Seek',
          seekLabel: '{currentTime} of {duration}',
          played: '播放中',
          buffered: '缓冲中',
          currentTime: '当前时间',
          duration: '时长',
          volume: '音量',
          mute: '静音',
          unmute: '取消静音',
          enableCaptions: '启用标题',
          disableCaptions: '禁用标题',
          download: '下载',
          enterFullscreen: '全屏',
          exitFullscreen: '退出全屏',
          frameTitle: 'Player for {title}',
          captions: '字幕',
          settings: '设置',
          pip: 'PIP',
          menuBack: 'Go back to previous menu',
          quality: '质量',
          loop: '循环',
          start: '开始',
          end: '结束',
          all: '所有',
          reset: '重置',
          disabled: '不可用',
          enabled: '可用',
          advertisement: '广告',
          qualityBadge: {
            2160: '4K',
            1440: 'HD',
            1080: 'HD',
            720: 'HD',
            576: 'SD',
            480: 'SD'
          }
        },
        // 播放完成重置
        resetOnEnd: true,
        // 初始音量
        volume: 0.5,
        // 使用反转时间计时
        invertTime: false,
        global: true,
        tooltips: {
          controls: true,
          seek: true
        },
        // 开启plyr全局快捷键
        keyboard: {
          focused: true,
          global: true
        }
      },
      position: {
        x: 320,
        y: 60
      },
      flags: false,
      i18n: playerConfig.i18n
    }
  },
  watch: {
    src (newSrc, oldSrc) {
      if (newSrc && newSrc !== oldSrc) {
        console.log('音频源已更新:', newSrc)
      }
    }
  },
  computed: {
    // 获得当前plyr对象
    getPlayer () {
      return this.$refs['audioPlayer']
    },
    // 音频列表
    audioList () {
      return this.playList || []
    },
    // 默认播放索引
    defaultIndex () {
      if (this.file && this.audioList.length > 0) {
        const index = this.audioList.findIndex(item => item.fileName === this.file.fileName)
        return index >= 0 ? index : 0
      }
      return 0
    }
  },
  created () {
    this.mode = 'float'
  },
  mounted () {
    this.$nextTick(() => {
      // 初始化国际化
      setTimeout(() => {
        this.initI18n()
      }, 100)

      // 初始化播放列表（创建副本，以便可以独立修改）
      this.songList = [...this.audioList]
      this.playIndex = this.defaultIndex

      if (this.songList && this.songList.length > 0) {
        this.src = this.getMediaStreamPath(this.songList[this.defaultIndex])
        this.songTitle = this.songList[this.playIndex].fileName
        this.visible = true
        console.log('音频播放器初始化完成，歌曲数:', this.songList.length)
      }
    })
  },
  methods: {
    initI18n () {
      let layout = document.querySelector('media-plyr-layout')
      if (!layout) {
        layout = document.querySelector('media-audio-layout')
      }
      if (layout && this.i18n) {
        layout.translations = this.i18n
      }
    },
    // 暂停事件
    pauseAction () {
    },
    // 播放结束事件
    endedAction (index) {
      // 列表还有歌曲继续播放
      if (index < this.songList.length) {
        this.play(this.playIndex + 1)
      }
    },
    // 播放
    async play (index) {
      console.log('播放index', index)
      const player = this.getPlayer
      if (!player) {
        console.error('播放器未初始化')
        return
      }

      // 检查索引是否有效
      if (index < 0 || index >= this.songList.length) {
        console.error('无效的播放索引:', index)
        return
      }

      // 当点击列表时点击和当前播放歌曲相同则暂停,暂停时则播放
      if (index === this.playIndex) {
        if (player.playing) {
          player.pause()
        } else {
          try {
            await player.play()
          } catch (err) {
            console.error('播放失败:', err)
          }
        }
      } else {
        // 切换歌曲
        try {
          console.log('=== 开始切换歌曲 ===')

          // 1. 暂停当前播放
          player.pause()

          // 2. 更新索引和标题
          this.playIndex = index
          this.songTitle = this.songList[index].fileName
          console.log('新歌曲标题:', this.songTitle)

          // 3. 先清空 src，这会移除 media-provider（因为 v-if="src"）
          this.src = ''
          console.log('清空 src，等待 DOM 更新...')
          await this.$nextTick()

          // 4. 短暂延迟，确保 vidstack 完全卸载
          await new Promise(resolve => setTimeout(resolve, 50))

          // 5. 设置新的音频地址
          const newSrc = this.getMediaStreamPath(this.songList[index])
          console.log('设置新歌曲地址:', newSrc)
          this.src = newSrc

          // 6. 等待 Vue 重新创建 media-provider，vidstack 会自动加载并触发 can-play 事件
          await this.$nextTick()
          console.log('=== 歌曲切换完成，等待加载 ===')
        } catch (err) {
          console.error('切换歌曲失败:', err)
        }
      }
    },
    onCanPlay (event) {
      console.log('=== onCanPlay 事件触发 ===')
      console.log('当前歌曲:', this.songTitle)
      console.log('当前 src:', this.src)
      const player = this.getPlayer
      if (player) {
        console.log('播放器状态 - playing:', player.playing, 'paused:', player.paused)
        // 自动播放新加载的音频
        player.play().then(() => {
          console.log('播放成功')
        }).catch(err => {
          console.error('自动播放失败:', err)
        })
      } else {
        console.error('播放器未找到')
      }
    },
    onEnded () {
      console.log('当前歌曲播放结束')
      // 自动播放下一首
      this.endedAction(this.playIndex)
    },
    onVolumeChange (event) {
      // 当用户调整音量时，保存音量设置
      const newVolume = event.detail
      console.log('音量变化:', newVolume)
      this.currentVolume = newVolume
    },
    onProviderChange (event) {
      const provider = event.detail
      // We can configure provider's here.
      if (isHLSProvider(provider)) {
        provider.config = {}
      }
    },

    // 关闭播放窗口
    closeFloatWindow () {
      console.log('关闭播放窗口')
      const player = this.getPlayer
      if (player) {
        try {
          player.pause()
          // 清空播放源
          player.src = ''
        } catch (err) {
          console.error('停止播放失败:', err)
        }
      }
      this.src = ''
      this.options.keyboard.global = false
      this.visible = false

      // 调用回调函数通知外部组件
      if (typeof this.callback === 'function') {
        this.callback('cancel')
      }
    },
    // 修改窗口模式    !已弃用!
    changeMode (mode) {
      if (this.mode === 'default') {
        this.mode = 'float'
      } else {
        this.mode = 'default'
      }
    },
    // 修改窗口大小
    changeFloatSize () {
      if (this.floatSize === 'default') {
        this.floatSize = 'min'
      } else {
        this.floatSize = 'default'
      }
    },
    // 删除播放列表歌曲
    deleteSong (index, event) {
      // 阻止事件冒泡，避免触发 play
      if (event) {
        event.stopPropagation()
      }

      // 从 songList 中删除
      this.songList.splice(index, 1)

      // 如果删除的是当前播放的歌曲之前的歌曲，需要调整 playIndex
      if (index < this.playIndex) {
        this.playIndex--
      } else if (index === this.playIndex) {
        // 如果删除的是当前播放的歌曲，停止播放
        const player = this.getPlayer
        if (player) {
          player.pause()
        }
        // 如果还有歌曲，播放下一首
        if (this.songList.length > 0) {
          this.playIndex = Math.min(this.playIndex, this.songList.length - 1)
          this.play(this.playIndex)
        } else {
          // 没有歌曲了，关闭播放器
          this.closeFloatWindow()
        }
      }
    },
    // 拖动浮窗事件
    mousedown (event) {
      this.selectElement = document.getElementById(this.id)
      const div1 = this.selectElement
      this.selectElement.style.cursor = 'move'
      const distanceX = event.clientX - this.selectElement.offsetLeft
      const distanceY = event.clientY - this.selectElement.offsetTop
      document.onmousemove = function(ev) {
        const oevent = ev || event
        if (oevent.clientX - distanceX < 0 || oevent.clientY - distanceY < 0 || oevent.clientX - distanceX > document.body.offsetWidth - 200 || oevent.clientY - distanceY > document.body.offsetHeight - 40) {
          div1.style.cursor = 'default'
          document.onmousemove = null
          return
        }
        div1.style.left = oevent.clientX - distanceX + 'px'
        div1.style.top = oevent.clientY - distanceY + 'px'
      }
      document.onmouseup = function() {
        document.onmousemove = null
        document.onmouseup = null
        div1.style.cursor = 'default'
      }
    }
  }
}
</script>

<style lang="less" scoped>

.player[data-view-type='audio'] {
  --media-tooltip-y-offset: 44px;
  --media-menu-y-offset: 40px;
  --media-slider-chapter-title-color: black;
  --media-border-radius: 4px;
  background-color: #212121;
  border-radius: var(--media-border-radius);
  contain: layout;
}

media-provider audio {
  display: none !important;
}

.icon-xuanfuchuang {
  display: inline-block;
}

.audio-main.default {
  position: absolute !important;
}


.audio-main.float {
  position: absolute;
  z-index: 3999;
  width: 400px;
  left: calc(50% - 200px);
  top: 30%;
  height: 300px;
  box-shadow: 0 0 10px #ccc;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border: 1px solid #dedede;
}

.audio-main.min-size {
  position: fixed !important;
  height: 92px !important;
}

.audio-main {
  z-index: 3000;
  position: absolute;
  width: 400px;
  max-width: 100%;
  min-width: 400px;
  background-color: #fafdff;

  .iconfont {
    cursor: pointer !important;
  }

  .iconfont:hover {
    color: #06a7ff;

  }

  .bold {
    font-weight: 700;
  }

  .play-box {
    width: 100%;
  }

  .audio-song-title {
    padding: 10px;
    background: #f2f7fd;
    position: relative;
    height: 40px;
    text-align: center;
    user-select: none;

    .title-text {
      max-width: 80%;
      min-width: 40%;
      display: inline-block;
      //min-width: 230px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }


    .title-right {
      display: inline-block;
      position: absolute;
      right: 10px;
      text-align: right;
    }

    .operate.min {
      right: 45px;
      margin-right: 10px;
    }

    i:hover {
      color: #06a7ff;
    }


  }

  .audio-song-list {
    background: #fff;
    overflow: hidden;
    position: relative;
    font-size: 12px;
    min-height: 60px;

    .list {
      overflow-x: hidden;
      overflow-y: auto;
      position: relative;
      height: 200px;
      width: 100%;
      min-height: 40px;

      .item:hover {
        background-color: #E7ECF2;;
      }

      .item {
        border-bottom: 1px solid #f2f6fd;
        position: relative;
        padding: 10px 15px;
        height: 40px;

        .name {
          max-width: 80%;
          min-width: 50%;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          position: absolute;
          left: 10px;
        }

        .operate {
          position: absolute;
          right: 10px;
          text-align: right;

          i {
            font-size: 18px;
          }
        }
      }

      .item.active {
        color: #00b3ff;
      }
    }
  }
}
</style>
