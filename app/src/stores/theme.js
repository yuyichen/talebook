import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'auto' // 'light', 'dark', 'auto'
  }),
  actions: {
    setTheme(theme) {
      this.theme = theme
      // 保存到本地存储
      localStorage.setItem('theme', theme)
    },
    loadTheme() {
      // 从本地存储加载主题
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.theme = savedTheme
      }
    }
  }
})
