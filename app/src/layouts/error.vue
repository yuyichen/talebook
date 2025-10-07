<template>
  <div class="error-layout">
    <n-result
      :status="error.statusCode === 404 ? '404' : 'error'"
      :title="error.statusCode === 404 ? pageNotFound : otherError"
      :description="error.message"
    >
      <template #footer>
        <n-button type="primary" @click="$router.push('/')">
          返回首页
        </n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  error: {
    type: Object,
    default: null,
  },
})

const pageNotFound = "404 Not Found"
const otherError = "An error occurred"

// 设置页面标题
useHead({
  title: computed(() => props.error.statusCode === 404 ? pageNotFound : otherError)
})

// 设置页面布局
definePageMeta({
  layout: false
})
</script>

<style scoped>
.error-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
}
</style>

