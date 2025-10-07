export default defineNuxtPlugin({
  name: 'pinia',
  setup(nuxtApp) {
    const pinia = createPinia()
    nuxtApp.vueApp.use(pinia)
    // 将 pinia 实例添加到 nuxtApp 中，以便其他插件可以使用
    nuxtApp.provide('pinia', pinia)
  }
})