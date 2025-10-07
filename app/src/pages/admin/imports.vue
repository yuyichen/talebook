<template>
  <div class="admin-imports-page">
    <n-card>
      <template #header>
        <div class="card-header">
          <h3>导入图书</h3>
          <n-tag size="small" type="info">Beta</n-tag>
        </div>
      </template>

      <div class="card-description">
        请将需要导入的书籍放入{{ scanDir }}目录中。 支持的格式为 azw/azw3/epub/mobi/pdf/txt 。<br/>
        请注意：此功能为后台异步执行，不必重复点击，启动后可关闭浏览器，或刷新关注表格状态进展。已导入成功的记录请不要删除，以免书籍被再次导入。<br/>
        另外，还可以使用<a target="_blank" href="https://calibre-ebook.com/">PC版Calibre软件</a>管理书籍，但是请注意：使用完PC版后，需重启Web版方可生效。
      </div>

      <div class="card-actions">
        <n-button :disabled="loading" @click="getDataFromApi">
          <template #icon>
            <n-icon><RefreshIcon /></n-icon>
          </template>
          刷新
        </n-button>
        <n-button :disabled="loading" type="primary" @click="scanBooks">
          <template #icon>
            <n-icon><SearchIcon /></n-icon>
          </template>
          扫描书籍
        </n-button>

        <template v-if="selected.length > 0">
          <n-button :disabled="loading" type="secondary" @click="importBooks">
            <template #icon>
              <n-icon><ImportIcon /></n-icon>
            </template>
            导入选中书籍
          </n-button>
          <n-button :disabled="loading" @click="deleteRecord">
            <template #icon>
              <n-icon><DeleteIcon /></n-icon>
            </template>
            删除
          </n-button>
        </template>
        <template v-else>
          <n-button :disabled="loading" type="warning" @click="importBooks">
            <template #icon>
              <n-icon><ImportIcon /></n-icon>
            </template>
            导入全部书籍
          </n-button>
        </template>
      </div>

      <div class="selection-info">
        <div v-if="selected.length === 0">请勾选需要处理的文件（默认情况下导入全部书籍即可。已存在的书籍，即使勾选了也不会重复导入）</div>
        <div v-else>共选择了{{ selected.length }}个</div>
      </div>

      <n-tabs v-model:value="filterType" @update:value="getDataFromApi">
        <n-tab-pane name="todo" :tab="`待处理 (${countTodo})`" />
        <n-tab-pane name="done" :tab="`已导入 (${countDone})`" />
      </n-tabs>

      <n-data-table
        :columns="columns"
        :data="items"
        :pagination="pagination"
        :loading="loading"
        :bordered="false"
        :checked-row-keys="selected"
        @update:checked-row-keys="handleCheck"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        @update:sorter="handleSorterChange"
      >
        <template #status="{ row }">
          <n-tag v-if="row.status === 'ready'" type="success" size="small">可导入</n-tag>
          <n-tag v-else-if="row.status === 'exist'" type="default" size="small">已存在</n-tag>
          <n-tag v-else-if="row.status === 'imported'" type="primary" size="small">导入成功</n-tag>
          <n-tag v-else-if="row.status === 'new'" type="default" size="small">待扫描</n-tag>
          <n-tag v-else type="info" size="small">{{ row.status }}</n-tag>
        </template>

        <template #title="{ row }">
          <div class="book-info">
            <div>书名：
              <span v-if="row.book_id === 0"> {{ row.title }} </span>
              <a v-else target="_blank" :href="`/book/${row.book_id}`">{{ row.title }}</a>
            </div>
            <div>作者：{{ row.author }}</div>
          </div>
        </template>
      </n-data-table>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  Refresh as RefreshIcon, 
  Search as SearchIcon,
  Import as ImportIcon,
  Delete as DeleteIcon
} from '@vicons/ionicons5'
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();

const message = useMessage()

// 响应式数据
const filterType = ref('todo')
const selected = ref([])
const scanDir = ref('/data/books/imports/')
const search = ref('')
const page = ref(1)
const items = ref([])
const total = ref(0)
const loading = ref(false)
const sortKey = ref('create_time')
const sortOrder = ref('descend')
const countTodo = ref(0)
const countDone = ref(0)

// 表格列配置
const columns = [
  { title: "ID", key: "id", sorter: true },
  { title: "状态", key: "status", sorter: true },
  { title: "路径", key: "path", sorter: true },
  { title: "扫描信息", key: "title", sorter: false },
  { title: "时间", key: "create_time", width: 200, sorter: true }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 100,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 50, 100, 1000, 5000, 10000],
  onChange: (page) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  }
})

// 进度信息
const progress = reactive({
  done: 0,
  total: 0,
  status: "finish",
})

// 计算属性
const pageCount = computed(() => {
  return Math.ceil(total.value / 20)
})

// 方法
const handleCheck = (keys) => {
  selected.value = keys
}

const handlePageChange = (newPage) => {
  page.value = newPage
  getDataFromApi()
}

const handlePageSizeChange = (newPageSize) => {
  pagination.pageSize = newPageSize
  getDataFromApi()
}

const handleSorterChange = (sorter) => {
  if (sorter && sorter.columnKey) {
    sortKey.value = sorter.columnKey
    sortOrder.value = sorter.order === 'ascend' ? 'ascend' : 'descend'
  }
  getDataFromApi()
}

const getDataFromApi = async () => {
  try {
    loading.value = true

    const data = new URLSearchParams()
    data.append("filter", filterType.value)
    data.append("page", page.value)
    data.append("sort", sortKey.value)
    data.append("desc", sortOrder.value === 'descend')
    data.append("num", pagination.pageSize)

    const rsp = await $backend('/admin/scan/list?' + data.toString())

    if (rsp.err !== "ok") {
      items.value = []
      total.value = 0
      message.error(rsp.msg)
      return false
    }

    items.value = rsp.items
    total.value = rsp.total
    scanDir.value = rsp.scan_dir
    countDone.value = rsp.summary.done
    countTodo.value = rsp.summary.todo
    pagination.itemCount = total.value
  } catch (error) {
    console.error('Get imports error:', error)
    message.error('获取导入列表失败')
  } finally {
    loading.value = false
  }
}

const loopCheckStatus = async (url, callback) => {
  try {
    const rsp = await $backend(url.replace('/api', ''))

    if (rsp.err !== "ok") {
      message.error(rsp.msg)
      return
    }

    if (callback(rsp)) {
      setTimeout(() => {
        loopCheckStatus(url, callback)
      }, 1000)
    } else {
      getDataFromApi()
      message.info('处理完毕！')
    }
  } catch (error) {
    console.error('Check status error:', error)
    message.error('检查状态失败')
  }
}

const scanBooks = async () => {
  try {
    loading.value = true

    const rsp = await $backend('/admin/scan/run', {
      method: "POST",
    })

    if (rsp.err !== "ok") {
      message.error(rsp.msg)
      return
    }

    loopCheckStatus("/api/admin/scan/status", (rsp) => {
      progress.value = rsp.status
      countDone.value = rsp.summary.done
      countTodo.value = rsp.summary.todo

      if (progress.value.new === 0) {
        loading.value = false
        return false
      }

      loading.value = true
      return true
    })
  } catch (error) {
    console.error('Scan books error:', error)
    message.error('扫描失败')
    loading.value = false
  }
}

const importBooks = async () => {
  try {
    loading.value = true

    let hashlist = "all"
    if (selected.value.length > 0) {
      hashlist = selected.value.map(v => v.hash)
    }

    const rsp = await $backend('/admin/import/run', {
      method: "POST",
      body: JSON.stringify({
        hashlist: hashlist,
      }),
    })

    if (rsp.err !== "ok") {
      message.error(rsp.msg)
      return
    }

    loopCheckStatus("/api/admin/import/status", (rsp) => {
      progress.value = rsp.status
      countDone.value = rsp.summary.done
      countTodo.value = rsp.summary.todo

      if (progress.value.ready === 0) {
        loading.value = false
        return false
      }

      loading.value = true
      return true
    })
  } catch (error) {
    console.error('Import books error:', error)
    message.error('导入失败')
    loading.value = false
  }
}

const deleteRecord = async () => {
  try {
    loading.value = true

    const rsp = await $backend('/admin/scan/delete', {
      method: "POST",
      body: JSON.stringify({
        hashlist: selected.value.map(v => v.hash),
      }),
    })

    if (rsp.err !== "ok") {
      message.error(rsp.msg)
      return
    }

    getDataFromApi()
  } catch (error) {
    console.error('Delete record error:', error)
    message.error('删除记录失败')
  } finally {
    loading.value = false
  }
}

const markAs = async (status) => {
  try {
    loading.value = true

    const rsp = await $backend('/admin/scan/mark', {
      method: "POST",
      body: JSON.stringify({ hashlist: selected.value, status: status }),
    })

    if (rsp.err !== "ok") {
      message.error(rsp.msg)
      return
    }

    // 更新本地数据
    items.value.forEach(v => {
      if (selected.value.includes(v.hash)) {
        v.status = status
      }
    })
  } catch (error) {
    console.error('Mark as error:', error)
    message.error('标记失败')
  } finally {
    loading.value = false
  }
}

// 监听分页和排序变化
watch([page, pagination.pageSize, sortKey, sortOrder, filterType], () => {
  getDataFromApi()
})

// 生命周期
onMounted(() => {
  getDataFromApi()
})

// 设置页面标题
useHead({
  title: '导入图书'
})
</script>

<style scoped>
.admin-imports-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header h3 {
  margin: 0;
}

.card-description {
  margin-bottom: 16px;
  color: var(--text-color-3);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.selection-info {
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: var(--text-color-3);
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.book-info a {
  color: var(--primary-color);
  text-decoration: none;
}

.book-info a:hover {
  text-decoration: underline;
}
</style>