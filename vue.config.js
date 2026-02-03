// const { env } = require('.eslintrc')
// const BASE_URL = process.env.NODE_ENV === 'production' ? '/pan' : '/'

const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
//  TODO 打包时把以下代码注释取消
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
const { codeInspectorPlugin } = require('code-inspector-plugin')

const nodeVersion = process.env.NODE_VERSION
console.log(nodeVersion)

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/pan' : '/', // 打包配置
  assetsDir: 'static', // 静态资源保存路径
  devServer: {
    // open: true,
    port: 8082,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        ws: true
        // pathRewrite: {
        //   '^/api': ''
        // }
      }
    }
  },
  chainWebpack: (config) => {
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')

    if (process.env.NODE_ENV === 'production') {
      // 排除HardSource缓存
      config.plugins.delete('prefetch')
      // #region 忽略生成环境打包的文件
      var externals = {
        vue: 'Vue',
        axios: 'axios',
        'element-ui': 'ELEMENT',
        'vue-router': 'VueRouter',
        vuex: 'Vuex'
      }
      config.externals(externals)

      // 在html文件中引入相关CDN
      const cdn = {
        css: [
          // element-ui css
          // 'https://cdn.bootcss.com/element-ui/2.15.6/theme-chalk/index.css'
        ],
        js: [
          // // vue
          'https://cdn.staticfile.org/vue/2.6.11/vue.min.js',
          // // vue-router
          'https://cdn.staticfile.org/vue-router/3.2.0/vue-router.min.js',
          // // vuex
          'https://cdn.staticfile.org/vuex/3.5.1/vuex.min.js',
          // // axios
          'https://cdn.staticfile.org/axios/0.26.0/axios.min.js',
          // // element-ui js
          'https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.8/index.min.js'

          // 'https://cdn.bootcdn.net/ajax/libs/exceljs/4.3.0/exceljs.min.js',
          // 'https://cdn.bootcdn.net/ajax/libs/exceljs/4.3.0/exceljs.bare.min.js'
          // // plyr
          // 'https://cdn.jsdelivr.net/npm/vue-plyr@7.0.0/dist/vue-plyr.ssr.min.js',
          // 'https://cdn.jsdelivr.net/npm/vue-codemirror@4.0.6/dist/vue-codemirror.min.js',
          // 'https://cdn.jsdelivr.net/npm/mavon-editor@2.10.4/dist/mavon-editor.min.js',
          // 'https://cdn.jsdelivr.net/npm/vue-pdf@4.2.0/src/vuePdfNoSss.vue',
          // 'https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js',
          // 'https://cdn.jsdelivr.net/npm/@bundled-es-modules/pdfjs-dist@2.5.207-rc1/build/pdf.min.js',
          // 'https://cdn.jsdelivr.net/npm/qs@6.10.3/lib/index.min.js',
          // 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js',
          // 'https://cdn.jsdelivr.net/npm/v-viewer@1.6.4/dist/v-viewer.min.js',
          // 'https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js',
          // 'https://cdn.jsdelivr.net/npm/v-contextmenu@2.9.0/dist/index.common.min.js',
          // 'https://cdn.jsdelivr.net/npm/sockjs-client@1.4.0/dist/sockjs.min.js',
          // 'https://cdn.jsdelivr.net/npm/stompjs@2.3.3/index.js',
          // 'https://cdn.jsdelivr.net/npm/vue-stomp@0.0.5/dist/vue-stomp.min.js'
        ]
      }
      config.plugin('html').tap((args) => {
        args[0].cdn = cdn
        return args
      })
      // 开启gzip压缩    使用plugin的方式=========>
      // config.plugin('compression').use(CompressionPlugin, {
      //   test: /\.js$|\.html$|\.css/, // 匹配文件名
      //   threshold: 10240, // 对超过10k的数据压缩
      //   deleteOriginalAssets: false // 不删除源文件
      // })

      // 删除调试信息
      config.optimization.minimizer('terser').tap((args) => {
        args[0].terserOptions.compress.drop_console = true
        args[0].terserOptions.compress.drop_debugger = true
        args[0].terserOptions.compress.pure_funcs = ['console.log']
        args[0].terserOptions.compress.warnings = false
        // 开启缓存
        args[0].cache = true
        // 开启多线程
        args[0].parallel = true
        // 关闭sourceMap
        args[0].sourceMap = false
        return args
      })
    }
  },
  configureWebpack: {
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log'] // 移除console
            },
            cache: true, // 是否缓存
            parallel: 4 // 是否并行打包,多线程
          }
        })
      ]
    },
    plugins: [
      // 缓存提供启动速度
      new HardSourceWebpackPlugin({
        // cacheDirectory 默认情况下将缓存存储在 node_modules 下的目录中，因此如果清除了node_modules，则缓存也是如此
        cacheDirectory: '../cache/node_modules/.cache/hard-source/[confighash]',
        recordsPath:
          '../cache/node_modules/.cache/hard-source/[confighash]/records.json',
        // configHash 在启动 webpack 实例时转换 webpack 配置，并用于cacheDirectory 为不同的 webpack 配置构建不同的缓存
        configHash: function(webpackConfig) {
          return require('node-object-hash')({ sort: false }).hash(
            webpackConfig
          )
        },
        // 当加载器、插件、其他构建时脚本或其他动态依赖项发生更改时，hard-source 需要替换缓存以确保输出正确。
        // environmentHash 被用来确定这一点。如果散列与先前的构建不同，则将使用新的缓存
        environmentHash: {
          root: process.cwd(),
          directories: [],
          files: ['package-lock1.json', 'yarn.lock']
        }
      }),
      // 分析插件
      // new BundleAnalyzerPlugin({
      //   analyzerMode: 'server',
      //   analyzerHost: '127.0.0.1',
      //   analyzerPort: 8888, // 运行后的端口号
      //   reportFilename: 'report.html',
      //   defaultSizes: 'parsed',
      //   openAnalyzer: true,
      //   generateStatsFile: false,
      //   statsFilename: 'stats.json',
      //   statsOptions: null,
      //   logLevel: 'info'
      // }),
      //  TODO 打包时把以下代码注释取消
      // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      // 压缩成 .gz 文件
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.8
      }),
      // eslint-disable-next-line new-cap
      new codeInspectorPlugin({
        bundler: 'webpack'
      })
    ]
  }
}
