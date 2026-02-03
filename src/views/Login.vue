<template>
  <div class="login">
    <div class="main">
      <div class="logoContainer">
        <div class="logo"><img src="@/assets/logo.png" alt="" /></div>
        <div class="name">飞享云盘</div>
      </div>

      <div
        class="mainBox"
        :class="[
          { mainBoxRegistered: activeName === 'login' },
          { 'enable-captcha': enableCaptcha === true && activeName == 'login' }
        ]"
      >
        <!--注册登录-->
        <el-tabs v-model="activeName" type="card" stretch>
          <el-tab-pane label="登录" name="login">
            <div class="loginInput">
              <el-form ref="form" :model="login" label-width="80px">
                <el-form-item>
                  <el-input v-model="login.userName" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item>
                  <div class="el-input">
                    <input
                      ref="passwordInput"
                      class="el-input__inner loginInput"
                      v-model="login.password"
                      type="password"
                      placeholder="请输入密码"
                    />
                    <i
                      class="iconfont"
                      :class="showPassword ? 'icon-yincang' : 'icon-icon_yulan'"
                      style="position: absolute; right: 10px; top: 24px; cursor: pointer"
                      @click="switchPasswod"
                    ></i>
                  </div>
                </el-form-item>
                <el-form-item v-if="enableCaptchas" class="image-captcha">
                  <el-input
                    v-model="login.captcha"
                    type="text"
                    ref="captcha"
                    placeholder="请输入验证码"
                  ></el-input>
                  <el-image
                    @click="getImageCaptcha"
                    :src="captchaSrc"
                    style="width: 80px"
                  ></el-image>
                </el-form-item>
                <!--<el-form-item>-->
                <!--// 记住我-->
                <el-checkbox
                  v-model="rememberMe"
                  style="float: left; margin-left: 20px; height: 20px"
                >记住我
                </el-checkbox>
                <!--</el-form-item>-->
                <el-form-item>
                  <el-button type="primary" @click="onSubmit">登录</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="注册" name="register">
            <div class="registeredInput">
              <el-form ref="form" :model="login" label-width="80px">
                <el-form-item>
                  <el-input v-model="registered.userName" placeholder="请输入用户名"></el-input>
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
                  <el-button type="primary" @click="clickRegistered">注册</el-button>
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
import { userLogin, userRegister } from '@/request/user'
import Config from '@/config'

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
      },
      showPassword: false,
      activeName: 'login',
      // 倒计时秒数
      countDownSecond: 60,
      orginUrl: '',
      rememberMe: false,
      // 是否启用验证码
      enableCaptcha: false,
      imageCaptcha: '',
      captchaSrc: '',
      t: ''
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
        }
    },
    enableCaptchas () {
      return this.enableCaptcha
    }
  },
  watch: {},
  created () {
    this.removeCookies('token')
    // this.enableCaptcha = JSON.parse(localStorage.getItem('systemConfig')).enableCaptcha === '1'
    this.activeName = this.$route.query.action || 'login'
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userStorage')
    if (this.$route.query.redirect) {
      this.orginUrl = this.$route.query.redirect
      sessionStorage.setItem('redirect', this.$route.query.redirect)
    }
  },
  mounted () {
    if (this.enableCaptcha) {
      this.getImageCaptcha()
    }

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
    switchPasswod () {
      this.showPassword = !this.showPassword
      if (this.showPassword) {
        this.$refs.passwordInput.type = 'text'
      } else {
        this.$refs.passwordInput.type = 'password'
      }
    },
    //   点击登录的回调
    async onSubmit () {
      if (this.enableCaptcha && !this.captcha.length < 4) {
        this.$toast.success('请输入4位的验证码')
        return
      }
      this.orginUrl = this.$route.query.redirect || '/'
      // 判断用户名和密码是否为空
      if (!this.login.userName || !this.login.password) {
        this.$toast.error('用户名或密码不能为空')
        return
      }
      userLogin(this.login)
        .then((res) => {
          if (res.code === 0) {
            this.$toast.success('登录成功')
            // 登陆成功
            // this.setCookies('token', localStorage.getItem('token'), { expires: 7 })
            if (this.rememberMe) {
              this.setCookies('remember', this.rememberMe, { expires: 7 })
              this.setCookies(this.$config.tokenKeyName, res.data.token, { expires: 7 })
            } else {
              this.setCookies(this.$config.tokenKeyName, res.data.token)
            }
            this.setCookies('username', res.data.userInfo.userName, { expires: 7 }) // 存储用户信息
            this.setCookies('uid', res.data.userInfo.id, { expires: 7 })
            this.setCookies('nick', res.data.userInfo.nickName, { expires: 7 })
            this.setCookies('avatar', res.data.userInfo.avatar, { expires: 7 })
            this.setCookies('role', res.data.userInfo.role, { expires: 7 })
            this.setCookies('lastLoginType', 'username', { expires: 7 })
            // 将返回的用户信息保存至localstorage中
            window.localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
            // 将token存入本地
            window.localStorage.setItem('token', res.data.token)
            if (sessionStorage.getItem('redirect')) {
              location.href = sessionStorage.getItem('redirect')
              sessionStorage.removeItem('redirect')
            } else {
              this.$router.replace({
                path: 'index',
                query: {
                  category: 'all'
                }
              })
            }
            this.$store.commit('updateIsLogin', true)
            this.$store.commit('updateUserInfo', res.data.userInfo)
          } else if (res.code === 500) {
            if (this.enableCaptcha) {
              if (res.msg === '验证码错误') {
                this.$toast.error('验证码错误')
                this.getImageCaptcha()
                return
              }
            }
            this.$store.commit('updateIsLogin', false)
            this.$store.commit('updateUserInfo', {})
            this.$toast.error(res.msg)
          }
        })
        .catch((err) => {
          if (err.msg === 'Bad credentials') {
            this.$toast.error('用户名或密码错误')
          } else {
            this.$toast.error(err.msg)
          }
        })
    },

    getImageCaptcha () {
      this.t = new Date().getTime()
      this.login.ts = this.t
      this.captchaSrc = this.getHost() + Config.baseContext + '/user/captcha?t=' + this.t
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
    // 注册
    async clickRegistered () {
      if (!this.registered.userName || !this.registered.password) {
        this.$toast.error('用户名或密码不能为空')
        return
      }
      userRegister(this.registered).then((res) => {
        // 如果注册成功,清空所有数据并跳转至登录界面,自动填写手机号码
        if (res.code === 0) {
          this.$toast.success('注册成功!')
          this.login.userName = this.registered.userName
          this.activeName = 'login'
          this.registered = {
            userName: '',
            password: ''
          }
        } else {
          this.$toast.error('注册失败,请稍后重试!')
        }
      })
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

.enable-captcha {
  height: 380px !important;
}

.mainBoxRegistered {
  height: 330px;
}

.el-form :deep(.el-form-item__content ) {
  margin: 0 !important;
  padding: 0 20px;
}

.el-input :deep(input) {
  border-radius: 10px;
}

.loginInput {
  margin-top: 20px;
}

.registeredInput {
  margin-top: 20px;
}

.el-tabs :deep(.is-active),
.el-tabs :deep(div:hover) {
  color: #06a7ff;
}

.el-tabs :deep(.is-active ) {
  background-color: #fff;
}

.el-tabs :deep(.el-tabs__item ) {
  border: none !important;
  font-size: 18px;
  height: 50px;
  line-height: 50px;
}

.el-tabs :deep(.el-tabs__nav ) {
  border: none;
}

.el-tabs :deep(.el-tabs__nav-scroll ) {
  background-color: #f5f5f6;
}

.el-input :deep(.el-input__inner ) {
  height: 48px;
  font-size: 15px;
}

.el-form-item__content {
  width: 65%;
}

.el-image {
  /*width: 30%;*/
}

.image-captcha .el-input {
  display: inline-block;
  width: 60%;
  float: left;
}

.el-button {
  width: 100%;
  background-color: #06a7ff;
  border: none;
  border-radius: 10px;
  margin-top: 10px;
  height: 45px;
  font-size: 15px;
}

.el-button:hover {
  background-color: #06a7ff;
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
  background-color: #06a7ff;
  color: white;
  height: 35px;
  margin: 0;
}

.countDown {
  color: rgb(141, 141, 141);
}
</style>
