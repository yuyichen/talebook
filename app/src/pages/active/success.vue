<template>
  <div class="active-success-page">
    <n-card class="success-card">
      <template #header>
        <h3>激活成功</h3>
      </template>

      <div class="success-content">
        <n-result status="success" title="账号激活成功" description="你已成功激活账号，请前往首页浏览吧！">
          <template #footer>
            <n-button type="primary" @click="$router.push('/')">
              前往首页
            </n-button>
          </template>
        </n-result>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMainStore } from '~/store'

const mainStore = useMainStore()

// 生命周期
onMounted(() => {
  mainStore.navbar(false)
})

// 设置页面标题和布局
useHead({
  title: '激活成功'
})

definePageMeta({
  layout: false
})
</script>

<style scoped>
.active-success-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--body-color);
  padding: 24px;
}

.success-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.success-card h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.success-content {
  padding: 16px 0;
}
</style>