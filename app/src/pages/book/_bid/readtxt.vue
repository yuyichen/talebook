<template>
  <div class="txt-reader-page">
    <!-- 侧边栏 -->
    <n-drawer
      v-model:show="sidebar"
      :width="240"
      placement="left"
      display-directive="show"
    >
      <div class="drawer-header">
        <h3>{{ name }}</h3>
      </div>
      <div class="drawer-content">
        <n-virtual-list
          :items="content"
          :item-size="40"
          :item-resizable="true"
          style="height: calc(100% - 48px)"
        >
          <template #default="{ item, index }">
            <n-list-item
              :key="item.title"
              @click="getNovelContent(index)"
              :class="{ 'selected-item': selected === index }"
            >
              <n-thing :title="item.title" />
            </n-list-item>
          </template>
        </n-virtual-list>
      </div>
    </n-drawer>

    <!-- 顶部导航栏 -->
    <n-layout-header class="header">
      <div class="header-content">
        <n-button
          quaternary
          circle
          @click="sidebar = !sidebar"
        >
          <template #icon>
            <n-icon><MenuIcon /></n-icon>
          </template>
        </n-button>
        <div class="site-title" @click="$router.push('/')">
          {{ name }}
        </div>
      </div>
    </n-layout-header>

    <!-- 主要内容区 -->
    <div class="main-content">
      <n-card v-if="!inited" class="tip-card" :bordered="false">
        <template #header>
          {{ tip.title }}
        </template>
        {{ tip.content }}
      </n-card>

      <div v-else>
        <div v-if="loading" class="loading-container">
          <n-spin size="large" />
          <span>加载中...</span>
        </div>
        <div v-else>
          <div class="novel-content" v-html="novelContent" v-show="!loading"></div>
          <div v-show="novelContent && !loading" class="navigation-buttons">
            <n-button
              type="info"
              :disabled="selected === 0"
              @click="getNovelContent(selected - 1)"
            >
              上一章
            </n-button>
            <n-button
              outlined
              @click="sidebar = true"
              v-show="!sidebar"
            >
              目录
            </n-button>
            <n-button
              type="primary"
              :disabled="selected === content.length - 1"
              @click="getNovelContent(selected + 1)"
            >
              下一章
            </n-button>
          </div>
        </div>
      </div>

      <AppFooter v-if="mainStore.navbar" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMainStore } from '~/store'
import AppFooter from "~/components/AppFooter.vue"
import { Menu as MenuIcon } from '@vicons/ionicons5'
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();

const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()

// 响应式数据
const sidebar = ref(false)
const bookid = ref(null)
const items = ref(["1", "2", "3"])
const content = ref([])
const inited = ref(false)
const wait = ref(0)
const name = ref(null)
const novelContent = ref('')
const selected = ref(-1)
const loading = ref(true)
const tip = reactive({
  title: '正在解析',
  content: '正在解析目录，请稍后...'
})

// 方法
const init = async () => {
  try {
    loading.value = true
    bookid.value = route.params.bid
    mainStore.navbar(false)

    const rsp = await $backend(`/book/txt/init?id=${bookid.value}&test=0`)

    if (rsp.err !== "ok") {
      tip.title = "错误"
      tip.content = rsp.msg
      return
    }

    if (rsp.msg === "已解析") {
      inited.value = true
      content.value = rsp.data.content
      name.value = rsp.data.name
      getNovelContent(0)
    } else {
      wait.value = parseInt(rsp.data.wait)
      let queLen = parseInt(rsp.data.que)
      name.value = rsp.data.name

      if (queLen > 0) {
        tip.title = "队列中"
        tip.content = "前方等待" + queLen + "个转换待完成，已步入后台队列"
        return
      }

      let intvl = setInterval(() => {
        wait.value--
        tip.content = "首次阅读，正在解析目录，请稍后... " + wait.value

        if (wait.value <= 0) {
          clearInterval(intvl)
          tip.content = "超时未完成，可继续等待稍后刷新尝试"
          tip.title = "解析超时"
          return
        }

        if (wait.value % 5 !== 0) return

        $backend(`/book/txt/init?id=${bookid.value}&test=1`)
          .then(res => {
            if (res.err === "ok" && res.msg === "已解析") {
              inited.value = true
              content.value = res.data.content
              name.value = res.data.name
              getNovelContent(0)
              clearInterval(intvl)
            }
          })
      }, 1000)
    }
  } catch (error) {
    console.error('Init txt reader error:', error)
    tip.title = "错误"
    tip.content = "初始化失败"
  } finally {
    loading.value = false
  }
}

const getNovelContent = async (i) => {
  if (selected.value === i) return

  selected.value = i
  const { title, start, end } = { ...content.value[i] }
  loading.value = true

  try {
    const res = await $backend(`/read/txt?id=${bookid.value}&start=${start}&end=${end}`)

    if (res.err !== "ok") {
      novelContent.value = "获取正文失败！" + res.msg
      return
    }

    novelContent.value = title + "<br>" + res.content

    // 滚动到顶部
    await nextTick()
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  } catch (error) {
    console.error('Get novel content error:', error)
    novelContent.value = "获取正文失败！"
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  init()
})

// 设置页面标题
useHead({
  title: 'TXT阅读器'
})
</script>

<style scoped>
.txt-reader-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: var(--primary-color);
  color: white;
  padding: 0 16px;
  height: 64px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.site-title {
  margin-left: 12px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
}

.drawer-header {
  padding: 16px;
  border-bottom: 1px solid var(--divider-color);
}

.drawer-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.drawer-content {
  height: calc(100% - 48px);
}

.selected-item {
  background-color: var(--primary-color-hover);
  color: var(--primary-color);
}

.main-content {
  flex: 1;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.tip-card {
  max-width: 400px;
  margin: 40px auto;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
  gap: 16px;
}

.novel-content {
  line-height: 1.8;
  margin-bottom: 24px;
  white-space: pre-wrap;
}

.novel-content >>> p {
  margin-bottom: 16px;
  text-indent: 2em;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}
</style>