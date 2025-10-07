<template>
  <div class="list-book-page">
    <div class="page-header">
      <h2>{{ title }}</h2>
      <n-divider />
    </div>

    <div class="book-list">
      <BookCards :books="books" />
    </div>

    <div class="pagination-container">
      <n-pagination
        v-if="pageCnt > 0"
        v-model:page="page"
        :page-count="pageCnt"
        @update:page="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMainStore } from '~/store'
import { useNuxtApp } from '#app'
import BookCards from "../components/BookCards.vue"

const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()
const { $backend } = useNuxtApp()

// 响应式数据
const title = ref('')
const page = ref(1)
const books = ref([])
const total = ref(0)
const pageSize = ref(60)
const pageCnt = ref(0)
const inited = ref(false)

// 计算属性
const getPageTitle = computed(() => {
  switch (route.path) {
    case "/hot":
      return "热门书籍"
    case "/search":
      return "搜索"
    case "/recent":
      return "近期更新"
    default:
      break
  }

  if (route.params.meta !== undefined) {
    const name = decodeURIComponent(route.params.name)
    const titles = {
      tag: `"${name}"标签的书籍`,
      series: `${name}丛书`,
      rating: `${name}星书籍`,
      author: `${name}的著作`,
      publisher: `${name}出版的书籍`,
    }
    const meta = route.path.split("/")[1]
    if (titles[meta] !== undefined) {
      return titles[meta]
    }
  }

  return title.value
})

// 方法
const init = async (currentRoute, next) => {
  try {
    inited.value = true
    mainStore.navbar(true)

    const rsp = await $backend(currentRoute.fullPath)

    if (rsp.err !== 'ok') {
      // 这里可以使用全局的 alert 方法
      console.error(rsp.msg)
      return
    }

    title.value = rsp.title
    books.value = rsp.books
    total.value = rsp.total
    pageCnt.value = Math.max(1, Math.ceil(total.value / pageSize.value))

    if (next) next()
  } catch (error) {
    console.error('Init list book error:', error)
  }
}

const changePage = () => {
  const r = Object.assign({}, route.query)
  if (page.value < 1) {
    page.value = 1
  }
  r.start = (page.value - 1) * pageSize.value
  r.size = pageSize.value
  router.push({ query: r })
}

// 监听路由变化
watch(() => route.fullPath, async (newPath) => {
  await init(route)
})

// 生命周期
onMounted(async () => {
  if (route.query.start !== undefined) {
    page.value = 1 + parseInt(route.query.start / pageSize.value)
  }

  if (!inited.value) {
    await init(route)
  }

  pageCnt.value = Math.max(1, Math.ceil(total.value / pageSize.value))
})

// 设置页面标题
useHead({
  title: getPageTitle
})
</script>

<style scoped>
.list-book-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.book-list {
  margin-bottom: 32px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>