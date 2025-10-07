<template>
  <div class="book-edit-page">
    <n-card>
      <template #header>
        <div class="card-header">
          <h3>编辑书籍信息</h3>
          <div class="header-actions">
            <n-button :to="'/book/' + book.id" type="error">取消</n-button>
            <n-button type="success" @click="saveBook">保存</n-button>
          </div>
        </div>
      </template>

      <n-form>
        <n-grid x-gap="24" y-gap="24" cols="1 s:2">
          <n-grid-item :span="1">
            <n-form-item label="书名">
              <n-input v-model:value="book.title" placeholder="请输入书名" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="1">
            <n-form-item label="评分">
              <n-rate v-model:value="book.rating" :max="10" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="1">
            <n-form-item label="作者">
              <n-dynamic-tags v-model:value="book.authors" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="1">
            <n-form-item label="丛书名称">
              <n-input v-model:value="book.series" placeholder="请输入丛书名称" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="1">
            <n-form-item label="出版社">
              <n-input v-model:value="book.publisher" placeholder="请输入出版社" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="1">
            <n-form-item label="出版日期">
              <n-input v-model:value="book.pubdate" placeholder="请输入出版日期" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="1">
            <n-form-item label="ISBN编号">
              <n-input v-model:value="book.isbn" placeholder="请输入ISBN编号" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="1">
            <n-form-item label="语言">
              <n-input v-model:value="book.language" placeholder="请输入语言" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="2">
            <n-form-item label="标签列表">
              <n-dynamic-tags v-model:value="book.tags" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="2">
            <n-form-item label="内容简介">
              <n-input
                v-model:value="book.comments"
                type="textarea"
                placeholder="请输入内容简介"
                :autosize="{ minRows: 15 }"
              />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="2">
            <n-divider />
            <div class="save-button-container">
              <n-button type="success" @click="saveBook" size="large">
                保存
              </n-button>
            </div>
          </n-grid-item>
        </n-grid>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useMainStore } from '~/store'
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();

const message = useMessage()
const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()

// 响应式数据
const bookid = ref(0)
const book = reactive({
  id: 0,
  files: [],
  tags: [],
  pubdate: ''
})

// 计算属性
const pubYear = computed(() => {
  if (!book || !book.pubdate) {
    return ""
  }
  return book.pubdate.split("-")[0]
})

// 方法
const init = async (currentRoute) => {
  try {
    bookid.value = currentRoute.params.bid
    const rsp = await $backend('/book/' + bookid.value)
    Object.assign(book, rsp.book)
  } catch (error) {
    console.error('Init book edit error:', error)
    message.error('获取书籍信息失败')
  }
}

const saveBook = async () => {
  try {
    const rsp = await $backend('/book/' + book.id + '/edit', {
      method: 'POST',
      body: JSON.stringify(book),
    })

    if (rsp.err === 'ok') {
      message.success('保存成功！')
      router.push('/book/' + book.id)
    } else {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Save book error:', error)
    message.error('保存失败')
  }
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
  title: '编辑 ' + book.title
})
</script>

<style scoped>
.book-edit-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.save-button-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>