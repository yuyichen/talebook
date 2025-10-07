import { defineNuxtPlugin } from '#app'
import VueCookies from 'vue-cookies'

export default defineNuxtPlugin((nuxtApp) => {
  // 在 Nuxt 3 中，我们不需要使用 Vue.use()
  // VueCookies 会自动注册为全局插件
})
