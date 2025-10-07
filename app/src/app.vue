<template>
  <div class="app-container">
    <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <n-loading-bar-provider>
            <NuxtLayout>
              <NuxtPage />
            </NuxtLayout>
          </n-loading-bar-provider>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { darkTheme, zhCN, dateZhCN } from 'naive-ui'
import { useThemeStore } from '~/stores/theme'

// 获取主题覆盖
const { $themeOverrides } = useNuxtApp()

// 主题状态
const isDark = ref(false)

// 获取主题存储
const themeStore = useThemeStore()

// 计算主题覆盖
const themeOverrides = computed(() => {
  return isDark.value ? $themeOverrides.dark : $themeOverrides.common
})

// 加载保存的主题
onMounted(() => {
  themeStore.loadTheme()
  updateTheme()
})

// 监听主题变化
watch(() => themeStore.theme, updateTheme)

// 更新主题
function updateTheme() {
  // 检查系统是否偏好暗色主题
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = themeStore.theme === 'dark' || (themeStore.theme === 'auto' && prefersDark)

  // 更新 HTML 类
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 监听系统主题变化
onMounted(() => {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (themeStore.theme === 'auto') {
      isDark.value = e.matches
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  })
})
</script>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* 暗色主题 */
.dark {
  color-scheme: dark;
}
</style>
