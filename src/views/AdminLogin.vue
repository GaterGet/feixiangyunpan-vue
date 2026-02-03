<template>
  <div class="login">
    <div class="main">
      <div class="logoContainer">
        <div class="logo"><img src="@/assets/logo.png" alt="" /></div>
        <div class="name">飞享云盘管理员登录</div>
      </div>
      <div
        class="mainBox"
        :class="activeName == 'first' ? '' : 'mainBoxRegistered'"
      >
        <!--多方式注册登录框-->


        <el-tabs
          v-model="activeName"
          type="card"
          @tab-click="handleClick"
          stretch
        >
          <el-tab-pane label="登录" name="first">
            <div class="loginInput">
              <el-form ref="form" :model="login" label-width="80px">
                <el-form-item>
                  <el-input
                    v-model="login.userName"
                    placeholder="请输入手机号码"
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-input
                    v-model="login.password"
                    type="password"
                    placeholder="请输入密码"
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="onSubmit">登录</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="注册" name="second">
            <div class="registeredInput">
              <el-form ref="form" :model="login" label-width="80px">
                <el-form-item>
                  <el-input
                    v-model="registered.userName"
                    placeholder="请输入用户名"
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-input
                    v-model="registered.password"
                    placeholder="请输入密码"
                    type="password"
                  ></el-input>
                </el-form-item>
                <!--<el-form-item>-->
                <!--  <el-input-->
                <!--    v-model="registered.nickname"-->
                <!--    placeholder="请输入昵称"-->
                <!--  ></el-input>-->
                <!--</el-form-item>-->
                <!--<el-form-item class="codeContainer">-->
                <!--  <el-input-->
                <!--    v-model="registered.code"-->
                <!--    placeholder="请输入验证码"-->
                <!--  ></el-input>-->
                <!--  <div class="codeButtonContainer">-->
                <!--    <el-button-->
                <!--      size="mini"-->
                <!--      class="getcode"-->
                <!--      v-if="!isCountDownShow"-->
                <!--      @click="getCode"-->
                <!--    >获取验证码-->
                <!--    </el-button-->
                <!--    >-->
                <!--    <div class="countDown" v-else>{{ countDownSecond }} s</div>-->
                <!--  </div>-->
                <!--</el-form-item>-->
                <el-form-item>
                  <el-button type="primary" @click="clickRegistered"
                  >注册
                  </el-button
                  >
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
// 倒计时名称

// import { getUserInfo } from '@/request/user'

import config from '@/config'

let timer

export default {
  name: 'Login',
  data () {
    return {
      login: {
        userName: '',
        password: ''
      },
      registered: {
        userName: '',
        password: ''
        // code: '',
        // nickname: '',
        // avatar: null
      },
      activeName: 'first',
      // 倒计时秒数
      countDownSecond: 60,
      // 是否显示秒数
      isCountDownShow: false,
      orginUrl: '',
      // 是否启用验证码
      enableCapture: false
    }
  },
  computed: {
    url () {
      // 获取路由前置守卫中 next 函数的参数，即登录后要去的页面
      var _url = this.$route.query.redirect
      return _url
        ? { path: _url }
        : {
          query: {
            fileType: 'all',
            filePath: '/'
          }
        } //  若登录之前有页面，则登录后仍然进入该页面
    }
  },
  watch: {
    // 'this.$route.query.redirect' (val) {
    //   // 监听 url 变化，若有变化则跳转到该页面
    //   this.orginUrl = this.$route.query.redirect
    // }
  },
  created () {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userStorage')
    this.enableCapture = config.captcha
    if (this.$route.query.redirect) {
      this.orginUrl = this.$route.query.redirect
      sessionStorage.setItem('redirect', this.$route.query.redirect)
    }
  },
  mounted () {
    var url = location.href
    if (url.indexOf('redirect') !== -1) {
      // 取出url中的redirect参数
      var decodeUrl = decodeURIComponent(this.$route.fullPath.split('redirect=')[1])
      if (location.href.indexOf('redirect') != -1) {
        sessionStorage.setItem('redirect', decodeUrl)
      }
    }
  },
  methods: {
    //   点击登录的回调
    async onSubmit () {
      this.orginUrl = this.$route.query.redirect || '/'
      const res = await this.$request(
        '/user/login',
        this.login,
        'post',
        'params'
      )
      if (res.code === 0) {
        this.$toast.success('登录成功')
        // 登陆成功
        this.$store.commit('updateUserInfo', res.data.userInfo)
        // 将返回的用户信息保存至localstorage中
        window.localStorage.setItem(
          'userInfo',
          JSON.stringify(res.data.userInfo)
        )
        // 将token存入本地
        window.localStorage.setItem('token', res.data.token)
        if (sessionStorage.getItem('redirect')) {
          location.href = sessionStorage.getItem('redirect')
          sessionStorage.removeItem('redirect')
        } else {
          await this.$router.push({
            path: 'manage/files',
            query: {
              category: 'all'
            }
          })
        }
        sessionStorage.setItem('role', 'admin')

        // if (decodeURIComponent(this.$route.fullPath.split('redirect=')[1])) {
        //   window.location.href = decodeURIComponent(this.$route.fullPath.split('redirect=')[1])
        // } else {
        //   console.log('无重定向跳转')
        //   await this.$router.replace({
        //     path: 'index',
        //     query: {
        //       category: 'all'
        //     }
        //   })
        // }
        // await this.$router.replace(this.url) //  跳转到前一个页面或者网盘主页
        this.$store.commit('updateIsLogin', true)
        this.$store.commit('updateUserInfo', res.data.userInfo)
      } else {
        this.$store.commit('updateIsLogin', false)
        this.$store.commit('updateUserInfo', {})
        this.$toast.error(res.msg)
      }
    },
    handleClick (e) {
    },

    // 获取验证码
    async getCode () {
      this.isCountDownShow = true
      const res = await this.$request(
        `/edumsm/msm/send/${this.registered.mobile}`
      )
      if (res.data.success) {
        this.startCountDown()
      }
    },

    // 倒计时
    startCountDown () {
      this.countDownSecond = 60
      timer = setInterval(() => {
        this.countDownSecond--
        if (this.countDownSecond == 0) {
          clearInterval(timer)
          this.isCountDownShow = false
        }
      }, 1000)
    },
    // 点击注册的回调
    async clickRegistered () {
      const res = await this.$request(
        '/user/register',
        this.registered,
        'post',
        'params'
      )
      // 如果注册成功,清空所有数据并跳转至登录界面,自动填写手机号码
      if (res.code === 0) {
        this.$message.success('注册成功!')
        this.login.userName = this.registered.userName
        this.activeName = 'first'
        this.registered = {
          userName: '',
          password: ''
          // code: '',
          // nickname: '',
          // avatar: null
        }
      } else {
        this.$message.error('注册失败,请稍后重试!')
      }
    }
  }
}
</script>

<style scoped>
.login {
  background-color: #ecefff;
  height: 100vh;
}

.logoContainer {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  justify-content: center;
}

.logo {
  width: 50px;
}

.logo img {
  width: 100%;
}

.name {
  color: #25262b;
  font-size: 20px;
  letter-spacing: 4px;
  font-weight: bold;
  margin-left: 7px;
}

.main {
  width: 350px;
  height: 400px;
  position: absolute;
  right: 10vw;
  top: 15vh;
}

.mainBox {
  width: 350px;
  background-color: #fff;
  height: 330px;
  border-radius: 10px;
  overflow: hidden;
}

.mainBoxRegistered {
  height: 430px;
}

.el-form :deep(.el-form-item__content) {
  margin: 0 !important;
  padding: 0 20px;
}

.el-input :deep(input) {
  border-radius: 10px;
}

.loginInput {
  margin-top: 20px;
}

.el-tabs :deep(.is-active),
.el-tabs :deep(div:hover) {
  color: #595bb3;
}

.el-tabs :deep(.is-active) {
  background-color: #fff;
}

.el-tabs :deep(.el-tabs__item) {
  border: none !important;
  font-size: 18px;
  height: 50px;
  line-height: 50px;
}

.el-tabs :deep(.el-tabs__nav) {
  border: none;
}

.el-tabs :deep(.el-tabs__nav-scroll) {
  background-color: #f5f5f6;
}

.el-input :deep(.el-input__inner) {
  height: 48px;
  font-size: 15px;
}

.el-button {
  width: 100%;
  background-color: #6c6dbb;
  border: none;
  border-radius: 10px;
  margin-top: 10px;
  height: 45px;
  font-size: 15px;
}

.el-button:hover {
  background-color: #595bb3;
}

.codeContainer {
  position: relative;
}

.codeButtonContainer {
  position: absolute;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
}

.getcode {
  background-color: #6c6dbb;
  color: white;
  height: 35px;
  margin: 0;
}

.countDown {
  color: rgb(141, 141, 141);
}
</style>
