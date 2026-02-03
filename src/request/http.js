import axios from 'axios'
import config from '@/config/index.js'
// import router from '@/router'

// 登录提醒
// const loginTip = function () {
//   MessageBox.alert('您尚未登录,请先登录', '操作提示', {
//     confirmButtonText: '确定',
//     callback: () => {
//       router.push({
//         path: '/login',
//         query: { redirect: router.currentRoute.fullPath } //  将当前页面的url传递给login页面进行操作
//       })
//     }
//   })
// }

// 请求超时时间
axios.defaults.timeout = 10000 * 5

// 请求基础 URL
axios.defaults.baseURL = config.baseContext

// POST 请求头
axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded'

// 请求携带cookie
axios.defaults.withCredentials = true

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    if (localStorage.getItem('token') !== null) {
      if (
        config.url.indexOf('login') === -1 ||
        config.url.indexOf('register') === -1
      ) {
        // const token = this.getCookies('token')
        // if (token) {
        //   config.headers.Authorization = 'Bearer ' + token
        // } else {
        //   this.$toast.warn('登录失效，请重新登录')
        //   // eslint-disable-next-line prefer-promise-reject-errors
        //   return Promise.reject('登录失效，请重新登录')
        // }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return Promise.resolve(response)
    }
  },
  // 服务器状态码不是200的情况
  (error) => {
    if (error.response.status) {
      switch (error.response.status) {
        case 404:
          return Promise.reject(error.response)
        case 401:
          // loginTip()
          this.$toast.warning('您尚未登录,请先登录')
          return Promise.reject(error.response)
        case 500:
          return Promise.reject(error.response)
        // break
        case 502:
          this.$toast.error('服务异常,请稍后刷新重试或联系管理员')
          return Promise.reject(error.response)
        default:
          return Promise.reject(error.response)
      }
    }
  }
)

/**
 * 封装 get方法 对应 GET 请求
 * @param {string} url 请求url
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function get (url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: params
      })
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.data)
      })
  })
}

/**
 * 封装 post 方法,对应 POST 请求
 * @param {string} url 请求url
 * @param {object} data 请求体
 * @param {boolean | undefined} info 请求体是否为 FormData 格式
 * @returns {Promise}
 */
export function post (url, data = {}, info) {
  return new Promise((resolve, reject) => {
    let newData = data
    if (info) {
      //  转formData格式
      newData = new FormData()
      for (const i in data) {
        newData.append(i, data[i])
      }
    }
    axios
      .post(url, newData)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.data)
      })
  })
}

/**
 * 封装 put 方法,对应 PUT 请求
 * @param {string} url 请求url
 * @param {object} params 请求体
 * @returns {Promise}
 */
export function put (url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.put(url, params).then(
      (res) => {
        resolve(res.data)
      },
      (err) => {
        reject(err.data)
      }
    )
  })
}

/**
 * 封装 axiosDelete 方法,对应 DELETE 请求
 * @param {string} url 请求url
 * @param {object} params 请求体
 * @returns {Promise}
 */
export function axiosDelete (url, params = {}) {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, params)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.data)
      })
  })
}
