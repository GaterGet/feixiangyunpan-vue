// 用户信息相关接口
import { get, post } from './http'

/**
 * 以登录接口为例
 * export const userLogin = p => post('/user/login', p);
 *
 * login ---------- 接口名称
 * p -------------- 传参，若需要在url中拼接其他信息，传参可以改为(p, other)
 * post ------------ 接口调用的方法，来自 http.js 中封装好的四个axios方法 get/post/put/axiosDelete
 * '/user/login' -- 接口url，若需要在url中拼接其他信息：
 *                  首先需要在传参处改为(p, other1, other2)
 *                  然后将url改为`/user/${other1}/login/${other2}`
 * p -------------- 传递给 get/post/put/axiosDelete 中的查询参数/请求体
 *
 *
 *
 * 除此之外，POST 请求支持请求体格式为 FormData，那么就需要多传递一个参数，true，如下示例：
 * export const example = p => post('/test/example', p, true);
 */

// 用户登录
export const userLogin = (p) => post('/user/login', p, true)
// 获取登录状态及用户信息
export const getUserInfo = (p) => get('/user/userinfo', p)
// 获取登录状态及用户信息
export const getShareUserInfo = (p) => get('/user/shareuser', p)
// 用户注册
export const userRegister = (p) => post('/user/register', p)
// 上传头像
export const uploadAvatar = (p) => post('/user//upload/avatar', p)
// 修改用户信息
export const updateUserInfo = (p) => post('/user/update', p)
// 退出登录
export const logout = (p) => post('/user/logout', p)
// 修改密码
export const updatePassword = (p, info) =>
  post('/user/update/password', p, true)
// 获取图片验证码
export const getCaptcha = (p) => get('/user/captcha', p)
