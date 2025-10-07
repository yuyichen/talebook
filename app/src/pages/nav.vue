<template>
  <div class="nav-page">
    <div v-for="nav in navs" :key="nav.legend" class="nav-section">
      <h2>{{ nav.legend }}</h2>
      <div class="tag-container">
        <n-tag
          v-for="item in nav.tags"
          :key="item.name"
          :bordered="true"
          :type="item.count !== 0 ? 'primary' : 'default'"
          @click="$router.push('/tag/' + encodeURIComponent(item.name))"
          class="nav-tag"
        >
          {{ item.name }}
          <span v-if="item.count">&nbsp;({{ item.count }})</span>
        </n-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMainStore } from '~/store'
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();
const mainStore = useMainStore()

// 响应式数据
const navs = ref([])

// 生命周期
onMounted(async () => {
  try {
    mainStore.navbar(true)

    const rsp = await $backend('/book/nav')
    navs.value = rsp.navs || []
  } catch (error) {
    console.error('Fetch nav error:', error)
  }
})

// 设置页面标题
useHead({
  title: '书籍索引'
})
</script>

<style scoped>
.nav-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color-1);
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.nav-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>