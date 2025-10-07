<template>
  <div class="list-meta-page">
    <div v-if="meta === 'rating'" class="rating-list">
      <n-grid x-gap="8" y-gap="8" cols="2 s:3 m:4 l:6">
        <n-grid-item v-for="item in metaItems" :key="item.name">
          <n-tag :bordered="false" type="primary" @click="$router.push(item.href)" class="rating-tag">
            {{ item.name }}星
            <span v-if="item.count">&nbsp;({{ item.count }})</span>
          </n-tag>
        </n-grid-item>
      </n-grid>
    </div>

    <div v-else class="meta-list">
      <n-space>
        <n-tag
          v-for="item in metaItems"
          :key="item.name"
          :bordered="true"
          type="primary"
          @click="$router.push(item.href)"
          class="meta-tag"
        >
          {{ item.name }}
          <span v-if="item.count">&nbsp;({{ item.count }})</span>
        </n-tag>
      </n-space>

      <n-button
        v-if="total > items.length"
        @click="expand"
        type="primary"
        size="small"
        round
      >
        显示全部...
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMainStore } from '~/store'
import { useNuxtApp } from '#app'

const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()
const { $backend } = useNuxtApp()

// 响应式数据
const meta = ref('')
const page = ref(0)
const items = ref([])
const total = ref(0)
const showAll = ref(false)
const pageSize = ref(20)

// 计算属性
const pageCnt = computed(() => {
  return Math.max(1, Math.ceil(total.value / pageSize.value))
})

const metaItems = computed(() => {
  const prefix = route.path + '/'
  return items.value.map(d => {
    d.href = prefix + encodeURIComponent(d.name)
    return d
  })
})

const getPageTitle = computed(() => {
  const path = route.path
  const titles = {
    tag: '全部标签',
    series: '全部丛书',
    rating: '全部评分',
    author: '全部作者',
    publisher: '全部出版社',
  }
  const metaType = path.split('/')[1]
  if (titles[metaType] !== undefined) {
    return titles[metaType]
  }
  return ''
})

// 方法
const init = async (currentRoute, next) => {
  try {
    mainStore.navbar(true)
    meta.value = currentRoute.path.split('/')[1]

    const rsp = await $backend('/' + meta.value + (showAll.value ? '?show=all' : ''))

    items.value = rsp.items
    total.value = rsp.total

    if (next) next()
  } catch (error) {
    console.error('Init list meta error:', error)
  }
}

const expand = () => {
  showAll.value = !showAll.value
  init(route)
}

// 监听路由变化
watch(() => route.fullPath, async () => {
  await init(route)
})

// 生命周期
onMounted(async () => {
  await init(route)
})

// 设置页面标题
useHead({
  title: getPageTitle
})
</script>

<style scoped>
.list-meta-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.rating-list {
  margin-bottom: 16px;
}

.rating-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.rating-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.meta-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>