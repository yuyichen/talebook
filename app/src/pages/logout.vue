<template>
  <div class="logout-page">
    <n-card class="logout-card">
      <template #header>
        <div class="card-header"></div>
      </template>

      <div class="logout-content">
        <n-result status="success" title="您已退出登录">
          <template #footer>
            <n-button type="primary" @click="$router.push('/')">
              返回首页
            </n-button>
          </template>
        </n-result>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMainStore } from '~/store'
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();
const mainStore = useMainStore()

// 响应式数据
const msg = ref('您已退出登录。')

// 方法
const logout = async () => {
  try {
    const rsp = await $backend('/user/sign_out')
    msg.value = rsp.msg
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// 生命周期
onMounted(() => {
  mainStore.navbar(false)
  logout()
})

// 设置页面标题和布局
useHead({
  title: '已退出登录'
})

definePageMeta({
  layout: false
})
</script>

<style scoped>
.logout-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--body-color);
  padding: 24px;
}

.logout-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  height: 8px;
  background-color: var(--primary-color);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.logout-content {
  padding: 16px 0;
}
</style>