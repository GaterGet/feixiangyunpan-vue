import { defineConfig } from '@rsbuild/core'
import { rspack } from '@rspack/core'
import { createRequire } from 'module'
import { pluginVue2 } from '@rsbuild/plugin-vue2'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { pluginLess } from '@rsbuild/plugin-less'
import { pluginCssMinimizer } from '@rsbuild/plugin-css-minimizer'

const require = createRequire(import.meta.url)

const isProd = process.env.NODE_ENV === 'production'
export default defineConfig(({ command }) => {
  const isProd = command === 'build' // 区分是不是打包阶段
  console.log('isProd', isProd)

  // CDN 配置
  const cdn = {
    css: [
      'https://cdn.jsdelivr.net/npm/element-ui@2.15.14/lib/theme-chalk/index.min.css'
    ],
    js: [
      'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js',
      'https://cdn.jsdelivr.net/npm/vue-router@3.5.3/dist/vue-router.min.js',
      'https://cdn.jsdelivr.net/npm/vuex@3.6.2/dist/vuex.min.js',
      'https://cdn.jsdelivr.net/npm/axios@0.27.2/dist/axios.min.js',
      'https://cdn.jsdelivr.net/npm/element-ui@2.15.14/lib/index.min.js'
    ]
  }

  return {
    html: {
      template: './public/index.html',
      templateParameters: {
        htmlWebpackPlugin: {
          options: {
            title: '飞享云盘',
            cdn: isProd ? cdn : {
              css: [],
              js: []
            }
          }
        }
      }
    },
    plugins: [pluginVue2(), pluginLess(), pluginCssMinimizer()],
    dev: {
      // client: {
      //   port: 8082
      // }

    },
    resolve: {
      alias: {
        '@': './src'
      }
    },
    devServer: {
      devMiddleware: {
        index: false // 启用根代理
      }
    },
    server: {
      base: '/',
      proxy: {
        // http://localhost:3000/api -> http://localhost:3000/api
        // http://localhost:3000/api/foo -> http://localhost:3000/api/foo
        '/api': 'http://localhost:8080'
      }
    },
    source: {
      // 指定入口文件
      entry: {
        index: './src/main.js'
      },
      define: {
        // PRODUCTION: JSON.stringify(false),
        // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    },
    output: {
      assetPrefix: './',
      externals: isProd
        ? { // 只有打包时用 externals
          vue: 'Vue',
          axios: 'axios',
          'element-ui': 'ELEMENT',
          'vue-router': 'VueRouter',
          vuex: 'Vuex'
        }
        : {}, // 开发时不要 external，直接正常打包
      minify: {
        jsOptions: {
          // exclude: /foo\/bar/
        }
      }
    },
    tools: {
      lightningcssLoader: false,
      rspack: {
        resolveLoader: {
          alias: {
            // 修改内联 loader 中 worker-loader 的指向，如 `worker-loader!pdfjs-dist/es5/build/pdf.worker.js`
            'worker-loader': require.resolve('worker-rspack-loader')
          }
        },
        module: {
          rules: [
            {
              test: /\.worker\.js$/,
              loader: 'worker-rspack-loader'
            }
          ]
        },
        plugins: [
          codeInspectorPlugin({
            bundler: 'rspack'
          }),
          new rspack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.VUE_ENV': JSON.stringify(isProd ? 'production' : 'server')
          })

        ]
      },
      bundlerChain: (config, {
        env,
        isDev,
        isProd,
        target,
        isServer,
        isWebWorker,
        CHAIN_ID
      }) => {
        // 移除 prefetch 插件
        // config.plugins.delete('prefetch')
        // config.module
        //   .rule(CHAIN_ID.RULE.VUE)
        //   .use(CHAIN_ID.USE.VUE)
        //   .tap((options) => ({
        //     ...options,
        //     compilerOptions: {
        //       // 只针对特定的标签进行自定义元素处理
        //       isCustomElement: (tag) => {
        //         const customTags = ['media-player', 'media-provider', 'media-controller'] // 列出所有需要的自定义标签
        //         return customTags.includes(tag)
        //       }
        //     }
        //   }))
        // .after(CHAIN_ID.USE.SWC)
        // .options({
        //   compilerOptions: {
        //     isCustomElement: (tag) => tag.startsWith('media-')
        //   }
        // })
        // .tap((options) => {
        //   if (options && options.compilerOptions !== undefined) {
        //     return {
        //       ...options,
        //       compilerOptions: {
        //         ...options.compilerOptions,
        //         isCustomElement: (tag) => tag.startsWith('media-')
        //       }
        //     }
        //   }
        //   return options
        // })
        // 注意：一定要把 vue-loader 插件挂上
        // config.plugin('vue-loader-plugin').use(pluginVue2)
      }
    }
  }
})