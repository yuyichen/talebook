// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  // 应用元数据
  app: {
    head: {
      title: "talebook",
      titleTemplate: "%s | talebook",
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        { charset: "utf-8" },
        { name: "format-detection", content: "telephone=no" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui",
        },
        {
          name: "keywords",
          content: "在线阅读 电子书 下载 推送 kindle epub mobi",
        },
        {
          hid: "description",
          name: "description",
          content:
            "这是个安静读书的地方。在线阅读Epub/Mobi/Pdf/Azw3等格式的电子书，也支持下载或推送到Kindle设备里",
        },
      ],
      link: [
        { rel: "shortcut icon", type: "image/x-icon", href: "/logo/favicon.ico" },
      ],
    },
  },

  // CSS配置
  css: [
    '@/assets/css/naive-ui.css' // 引入 Naive UI CSS 变量覆盖文件
  ],

  // 插件配置
  plugins: [
    { src: "~/plugins/pinia.js", mode: "all" },
    { src: "~/plugins/talebook.js", mode: "all" },
    { src: "~/plugins/load-plugins.js", mode: "all" },
    { src: "~/plugins/naive-ui.js", mode: "all" },
    { src: "~/plugins/theme-provider.js", mode: "all" },
  ],

  // 模块配置
  modules: [
    "@nuxtjs/google-fonts",
    // "@nuxtjs/google-analytics", // 暂时注释掉，因为可能与 Nuxt 3 不兼容
    "nuxt-icon",
  ],

  // 构建配置
  build: {
    transpile: ["naive-ui", "vueuc"],
  },

  // Google字体配置
  googleFonts: {
    download: true,
  },

  // 运行时配置
  runtimeConfig: {
    public: {
      head: {
        title: process.env.TITLE || "talebook",
        titleTemplate: process.env.TITLE_TEMPLATE || " %s | talebook",
      },
      // api_url: process.env.API_URL || "http://127.0.0.1:8000",
      apiBase: "http://localhost:1000"
    },
  },

  // 服务器配置
  server: {
    port: 9000, // default: 3000
    host: "0.0.0.0", // default: localhost
  },

  // Vite配置
  vite: {
    plugins: [],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/variables.scss" as *;'
        }
      }
    },
    build: {
      cssCodeSplit: false
    },
    // 添加别名配置
    resolve: {
      alias: {
        'plugins': fileURLToPath(new URL('./plugins', import.meta.url))
      }
    }
  },

  // 引入 unplugins 配置
  extends: ['./unplugins.config.js'],

  // 自动导入组件
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  // 设置页面目录
  // Nuxt 3.x 会自动扫描以下目录中的页面文件
  // 我们可以使用 srcDir 配置来指定源代码目录
  srcDir: "src/",

  // 自动导入API
  imports: {
    dirs: ["stores"],
  },

  // 开发工具
  devtools: { enabled: true },
});
