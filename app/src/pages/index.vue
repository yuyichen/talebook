<template>
  <div class="index-page">
    <!-- 随机推荐 -->
    <section class="section">
      <h2 class="section-title">随便推荐</h2>
      <div class="random-books">
        <div 
          v-for="(book, idx) in getRandomBooks" 
          :key="'rec' + idx + book.id" 
          class="book-card"
          @click="$router.push(book.href)"
        >
          <n-image :src="book.img" :alt="book.title" class="book-image" />
        </div>
      </div>
    </section>

    <!-- 新书推荐 -->
    <section class="section">
      <n-divider class="divider" />
      <h2 class="section-title">新书推荐</h2>
      <BookCards :books="getRecentBooks" />
    </section>

    <!-- 分类浏览 -->
    <section class="section">
      <n-divider class="divider" />
      <h2 class="section-title">分类浏览</h2>
      <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:3">
        <n-grid-item v-for="nav in navs" :key="nav.text">
          <n-card :bordered="true" class="nav-card" clickable @click="$router.push(nav.href)">
            <div class="nav-item">
              <div class="nav-icon">
                <n-icon size="24">
                  <component :is="nav.iconComponent" />
                </n-icon>
              </div>
              <div class="nav-content">
                <div class="nav-title">{{ nav.text }}</div>
                <div class="nav-subtitle">{{ nav.subtitle }}</div>
              </div>
              <div class="nav-action">
                <n-icon>
                  <ArrowForwardIcon />
                </n-icon>
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { useNuxtApp } from '#app'
import { useMainStore } from '~/store'
import BookCards from "~/components/BookCards.vue"
import { 
  Grid as WidgetsIcon, 
  People as PeopleIcon, 
  Business as BusinessIcon, 
  Bookmark as BookmarkIcon, 
  Time as HistoryIcon, 
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon
} from '@vicons/ionicons5'

const mainStore = useMainStore()
const { $backend } = useNuxtApp()

// 响应式数据
const randomBooks = ref([])
const newBooks = ref([])
const navs = ref([])

// 计算属性
const getRandomBooks = computed(() => {
  return randomBooks.value.map(book => {
    if (book['href'] === undefined) {
      book['href'] = "/book/" + book.id
    }
    return book
  })
})

const getRecentBooks = computed(() => {
  return newBooks.value.map(book => {
    if (book['href'] === undefined) {
      book['href'] = "/book/" + book.id
    }
    return book
  })
})

// 方法
const initNavs = () => {
  navs.value = [
    { 
      icon: 'widgets', 
      iconComponent: markRaw(WidgetsIcon),
      href: '/nav', 
      text: '分类导览', 
      subtitle: `共 ${mainStore.sys.books} 本书籍`
    },
    { 
      icon: 'mdi-human-greeting', 
      iconComponent: markRaw(PeopleIcon),
      href: '/author', 
      text: '作者', 
      subtitle: `共 ${mainStore.sys.authors} 位作者`
    },
    { 
      icon: 'mdi-home-group', 
      iconComponent: markRaw(BusinessIcon),
      href: '/publisher', 
      text: '出版社', 
      subtitle: `共 ${mainStore.sys.publishers} 家出版社`
    },
    { 
      icon: 'mdi-tag-heart', 
      iconComponent: markRaw(BookmarkIcon),
      href: '/tag', 
      text: '标签', 
      subtitle: `共 ${mainStore.sys.tags} 个标签`
    },
    { 
      icon: 'mdi-history', 
      iconComponent: markRaw(HistoryIcon),
      href: '/recent', 
      text: '所有书籍', 
      subtitle: '浏览全部书籍'
    },
    { 
      icon: 'mdi-trending-up', 
      iconComponent: markRaw(TrendingUpIcon),
      href: '/hot', 
      text: '热度榜单', 
      subtitle: '查看热门书籍'
    }
  ]
}

// 生命周期
onMounted(() => {
  mainStore.navbar(true)
  initNavs()

  // 获取首页数据
  $backend('/index?random=12&recent=12')
    .then(data => {
      randomBooks.value = data.random_books || []
      newBooks.value = data.recent_books || []
    })
    .catch(error => {
      console.error('Failed to fetch index data:', error)
    })
})

// 设置页面标题
useHead({
  titleTemplate: "%s"
})
</script>

<style scoped>
.index-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color-1);
}

.divider {
  margin: 24px 0;
}

.random-books {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.book-card {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-image {
  width: 100%;
  aspect-ratio: 11/15;
  object-fit: cover;
  border-radius: 4px;
}

.nav-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
}

.nav-content {
  flex: 1;
}

.nav-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.nav-subtitle {
  font-size: 0.9rem;
  color: var(--text-color-3);
}

.nav-action {
  color: var(--text-color-3);
}
</style>
