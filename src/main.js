import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import uploader from 'vue-simple-uploader'
import globalFunction from '@/libs/globalFunction.js'
import '@/router/before.js'
import * as filters from '@/filter/index.js'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'vidstack/player/styles/default/theme.css'

import { request } from './request/request.js'
// 确认框
import confirmBox from '@/components/common/confirm/confirm.js'
// 文件目录选择框
import fileSelector from '@/components/common/fileSelector/index.js'
import '@/assets/styles/reset.css'
import '@/assets/styles/iconfont.css'
import '@/assets/styles/home.css'
import '@/assets/styles/confirm.css'
import '@/assets/styles/homemain.less'
import '@/assets/styles/index.less'
import '@/assets/styles/global.css'
/**
 * 配置cdn引入的包
 */
import Cookie from 'js-cookie' // 挂载全局
// dayjs
import * as dayjs from 'dayjs'
import * as isLeapYear from 'dayjs/plugin/isLeapYear' // 导入插件
import 'dayjs/locale/zh-cn' // 导入本地化语言
// 右键菜单
import contextMenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'

// 代码编辑器
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

// Markdown编辑器
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

// 全局配置
import config from '@/config/index.js'
// 引入挂载移动文件等插件
import operateElement from '@/libs/fileOperationPlugins.js' // 引入
// 消息提示
import Toast from '@/components/common/message/index.js'

dayjs.extend(isLeapYear) // 使用插件
dayjs.locale('zh-cn') // 使用本地化语言

Vue.use(dayjs)
Vue.use(ElementUI)
Vue.use(Toast)

Vue.prototype.$cookie = Cookie

for (const key in globalFunction) {
  Vue.prototype[key] = globalFunction[key]
}

Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key])
})

Vue.use(contextMenu)
Vue.use(uploader)
Vue.use(VueCodemirror)
Vue.use(mavonEditor)
Vue.use(operateElement) //  挂载自定义插件
Vue.prototype.$config = config
Vue.prototype.$confirmBox = confirmBox
Vue.prototype.$fileSelector = fileSelector
Vue.config.productionTip = false

Vue.prototype.$request = request
Vue.config.ignoredElements = ['media-player', 'media-plyr-layout', 'media-provider', 'media-video-layout', 'media-controller', 'media-play-button']
new Vue({
  beforeCreate () {
    Vue.prototype.$bus = this // 安装全局事件总线,$bus就是当前应用的vm
  },
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
