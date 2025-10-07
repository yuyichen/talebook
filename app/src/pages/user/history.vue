<template>
  <div class="history-page">
    <div v-if="history.length === 0" class="empty-history">
      <n-result status="info" title="暂无阅读历史">
        <template #footer>
          <n-button type="primary" @click="$router.push('/')">
            畅游书籍的海洋
          </n-button>
        </template>
      </n-result>
    </div>

    <div v-else>
      <div v-for="item in history" :key="item.name" class="history-section">
        <n-divider>
          <h3>{{ item.name }}</h3>
        </n-divider>

        <div v-if="item.books.length === 0" class="no-records">
          <n-text depth="3">无记录</n-text>
        </div>

        <n-grid v-else x-gap="12" y-gap="12" cols="2 s:3 m:4 l:6">
          <n-grid-item v-for="book in item.books" :key="item.name + book.id">
            <n-card :bordered="true" class="book-card" clickable @click="$router.push(book.href)">
              <n-image :src="book.img" :alt="book.title" class="book-image" />
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMainStore } from '~/store'

const mainStore = useMainStore()

// 响应式数据
const user = ref({})

// 计算属性
const history = computed(() => {
  if (user.value.extra === undefined) { 
    return [] 
  }

  return [
    { 
      name: '在线阅读', 
      books: getHistory(user.value.extra.read_history) 
    },
    { 
      name: '推送过的书', 
      books: getHistory(user.value.extra.push_history) 
    },
    { 
      name: '浏览记录', 
      books: getHistory(user.value.extra.visit_history) 
    },
  ]
})

// 方法
const getHistory = (his) => {
  if (!his) { 
    return [] 
  }

  return his.map(book => {
    book.href = '/book/' + book.id
    return book
  })
}

const init = async () => {
  try {
    mainStore.navbar(true)
    const rsp = await $fetch('/api/user/info?detail=1')
    user.value = rsp.user
  } catch (error) {
    console.error('Init user history error:', error)
  }
}

// 生命周期
onMounted(() => {
  init()
})

// 设置页面标题
useHead({
  title: '阅读记录'
})
</script>

<style scoped>
.history-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.empty-history {
  padding: 40px 0;
}

.history-section {
  margin-bottom: 32px;
}

.history-section h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.no-records {
  padding: 16px 0;
  text-align: center;
}

.book-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-image {
  width: 100%;
  aspect-ratio: 11/15;
  object-fit: cover;
  border-radius: 4px;
}
</style>