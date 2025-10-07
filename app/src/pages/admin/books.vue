<template>
  <div class="admin-books-page">
    <n-card>
      <template #header>
        <div class="card-header">
          <h3>图书管理</h3>
          <n-tag size="small" type="info">Beta</n-tag>
        </div>
      </template>

      <div class="card-description">
        此表格仅展示图书的部分字段，点击即可快捷修改。完整图书信息请点击链接查看书籍详情页面
      </div>

      <div class="card-actions">
        <n-button :disabled="loading" @click="getDataFromApi">
          <template #icon>
            <n-icon><RefreshIcon /></n-icon>
          </template>
          刷新
        </n-button>
        <n-button :disabled="loading" @click="showDialogAutoFile" type="info">
          <template #icon>
            <n-icon><InfoIcon /></n-icon>
          </template>
          自动更新图书信息...
        </n-button>
        <div class="spacer"></div>
        <n-input v-model:value="search" placeholder="搜索">
          <template #prefix>
            <n-icon><SearchIcon /></n-icon>
          </template>
        </n-input>
      </div>

      <n-data-table
        :columns="columns"
        :data="items"
        :pagination="pagination"
        :loading="loading"
        :bordered="false"
        :checked-row-keys="booksSelected"
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

        <template #img="{ row }">
          <a target="_blank" :href="row.img">
            <n-image :src="row.thumb" class="book-cover" :preview-src="row.img" />
          </a>
        </template>

        <template #id="{ row }">
          <a target="_blank" :href="`/book/${row.id}`">{{ row.id }}</a>
        </template>

        <template #title="{ row }">
          <n-popconfirm
            @positive-click="save(row, 'title')"
            positive-text="保存"
            negative-text="取消"
          >
            <template #trigger>
              <div class="editable-field three-lines">{{ row.title }}</div>
            </template>
            <template #action>
              <n-input
                v-model:value="row.title"
                type="textarea"
                placeholder="书名"
                :autosize="{ minRows: 2 }"
              />
            </template>
          </n-popconfirm>
        </template>

        <template #author="{ row }">
          <n-popconfirm
            @positive-click="save(row, 'authors')"
            positive-text="保存"
            negative-text="取消"
          >
            <template #trigger>
              <div v-if="row.authors && row.authors.length" class="editable-field three-lines">
                {{ row.authors.join("/") }}
              </div>
              <div v-else class="editable-field">-</div>
            </template>
            <template #action>
              <n-dynamic-tags v-model:value="row.authors" />
            </template>
          </n-popconfirm>
        </template>

        <template #rating="{ row }">
          <n-popconfirm
            @positive-click="save(row, 'rating')"
            positive-text="保存"
            negative-text="取消"
          >
            <template #trigger>
              <div v-if="row.rating !== null" class="editable-field">{{ row.rating }} 星</div>
              <div v-else class="editable-field">-</div>
            </template>
            <template #action>
              <n-rate v-model:value="row.rating" :max="10" />
            </template>
          </n-popconfirm>
        </template>

        <template #publisher="{ row }">
          <n-popconfirm
            @positive-click="save(row, 'publisher')"
            positive-text="保存"
            negative-text="取消"
          >
            <template #trigger>
              <div class="editable-field">{{ row.publisher }}</div>
            </template>
            <template #action>
              <n-input v-model:value="row.publisher" placeholder="出版社" />
            </template>
          </n-popconfirm>
        </template>

        <template #tags="{ row }">
          <n-popconfirm
            @positive-click="save(row, 'tags')"
            positive-text="保存"
            negative-text="取消"
          >
            <template #trigger>
              <div v-if="row.tags && row.tags.length" class="editable-field three-lines">
                {{ row.tags.join("/") }}
              </div>
              <div v-else class="editable-field">-</div>
            </template>
            <template #action>
              <n-dynamic-tags v-model:value="row.tags" />
            </template>
          </n-popconfirm>
        </template>

        <template #comments="{ row }">
          <n-popconfirm
            @positive-click="save(row, 'comments')"
            positive-text="保存"
            negative-text="取消"
          >
            <template #trigger>
              <div :title="row.comments" class="editable-field three-lines">
                {{ row.comments.substr(0, 80) }}
              </div>
            </template>
            <template #action>
              <n-input
                v-model:value="row.comments"
                type="textarea"
                placeholder="简介"
                :autosize="{ minRows: 3 }"
              />
            </template>
          </n-popconfirm>
        </template>

        <template #actions="{ row }">
          <n-dropdown
            :options="getBookMenuOptions(row)"
            placement="bottom-end"
            @select="(key) => handleBookMenuSelect(key, row)"
          >
            <n-button size="small" type="primary">
              操作
              <template #icon>
                <n-icon><MoreIcon /></n-icon>
              </template>
            </n-button>
          </n-dropdown>
        </template>
      </n-data-table>
    </n-card>

    <!-- 提醒拉取图书的规则说明 -->
    <n-modal v-model:show="metaDialog" preset="card" style="max-width: 500px" :mask-closable="false">
      <template #header>
        <div class="modal-header">提醒</div>
      </template>

      <div class="modal-content">
        <p>即将从互联网拉取所有图书的书籍信息，请了解以下功能限制：</p>
        <p>1. 请在「系统设置」中配置好「互联网书籍信息源」，启用豆瓣插件；</p>
        <p>2. 本操作只更新「没有封面」或「没有简介」的图书；</p>
        <p>3. 受限于豆瓣等服务的限制，每秒钟仅更新1本书;</p>
        <br />

        <template v-if="progress.total > 0">
          <p>当前进展：
            <n-button text @click="refreshProgress">刷新</n-button>
          </p>
          <p>总共 {{ progress.total }} 本书籍，已更新 {{ progress.done }} 本，更新失败 {{ progress.fail }} 本，无需处理 {{ progress.skip }} 本。</p>
        </template>
        <p v-else>预计需要运行 {{ autoFillMins }} 分钟，在此期间请不要停止程序</p>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="metaDialog = false">取消</n-button>
          <n-button type="primary" @click="autoFill">开始执行！</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 消息提示 -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, h } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  Refresh as RefreshIcon, 
  InformationCircle as InfoIcon, 
  Search as SearchIcon,
  EllipsisVertical as MoreIcon,
  Trash as DeleteIcon
} from '@vicons/ionicons5'
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();

const message = useMessage()

// 响应式数据
// const snack = ref(false)
// const snackColor = ref('')
// const snackText = ref('')
const metaDialog = ref(false)
const booksSelected = ref([])
const tagInput = ref(null)
const search = ref('')
const page = ref(1)
const items = ref([])
const total = ref(0)
const loading = ref(false)
const sortKey = ref('id')
const sortOrder = ref('descend')

// 表格列配置
const columns = [
  { 
    title: "封面", 
    key: "img", 
    width: 80,
    render(row) {
      return h('a', { 
        target: "_blank", 
        href: row.img 
      }, [
        h('n-image', {
          src: row.thumb,
          class: 'book-cover',
          'preview-src': row.img
        })
      ])
    }
  },
  { title: "ID", key: "id", width: 80, sorter: true },
  { title: "书名", key: "title", sorter: true },
  { title: "作者", key: "author", width: 100, sorter: true },
  { title: "评分", key: "rating", width: 60, sorter: false },
  { title: "出版社", key: "publisher", sorter: false },
  { title: "标签", key: "tags", width: 100, sorter: true },
  { title: "简介", key: "comments", sorter: true },
  { 
    title: "操作", 
    key: "actions", 
    width: 100,
    render(row) {
      return h('div', [
        h('n-dropdown', {
          options: getBookMenuOptions(row),
          placement: 'bottom-end',
          onSelect: (key) => handleBookMenuSelect(key, row)
        }, {
          default: () => h('n-button', {
            size: 'small',
            type: 'primary'
          }, {
            default: () => '操作',
            icon: () => h('n-icon', null, { default: () => h(MoreIcon) })
          })
        })
      ])
    }
  }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 100,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 50, 100],
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
  skip: 0,
  fail: 0,
  done: 0,
  total: 0,
  status: "finish",
})

// 计算属性
const autoFillMins = computed(() => {
  return Math.floor(total.value / 60) + 1
})

// 方法
const getBookMenuOptions = (book) => {
  return [
    {
      label: '删除此书',
      key: 'delete',
      icon: () => h(DeleteIcon),
      props: {
        style: { color: '#ff4d4f' }
      }
    }
  ]
}

const handleBookMenuSelect = (key, book) => {
  if (key === 'delete') {
    deleteBook(book)
  }
}

const handleCheck = (keys) => {
  booksSelected.value = keys
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
    data.append("page", page.value)
    data.append("sort", sortKey.value)
    data.append("desc", sortOrder.value === 'descend')
    data.append("num", pagination.pageSize)

    if (search.value) {
      data.append("search", search.value)
    }

    const rsp = await $backend('/admin/book/list?' + data.toString())

    if (rsp.err !== "ok") {
      items.value = []
      total.value = 0
      message.error(rsp.msg)
      return false
    }

    items.value = rsp.items
    total.value = rsp.total
    pagination.itemCount = total.value
  } catch (error) {
    console.error('Get books error:', error)
    message.error('获取图书列表失败')
  } finally {
    loading.value = false
  }
}

const refreshProgress = async () => {
  try {
    const rsp = await $backend('/admin/book/fill', {
      method: "GET",
    })
    Object.assign(progress, rsp.status)
  } catch (error) {
    console.error('Refresh progress error:', error)
    message.error('获取进度失败')
  }
}

const showDialogAutoFile = () => {
  metaDialog.value = true
  refreshProgress()
}

const autoFill = async () => {
  try {
    const rsp = await $backend('/admin/book/fill', {
      method: "POST",
      body: JSON.stringify({"idlist": "all"}),
    })

    metaDialog.value = false
    if (rsp.err !== "ok") {
      message.error(rsp.msg)
    } else {
      message.success(rsp.msg)
    }
  } catch (error) {
    console.error('Auto fill error:', error)
    message.error('自动更新失败')
  }
}

const deleteBook = async (book) => {
  try {
    loading.value = true

    const rsp = await $backend('/book/' + book.id + '/delete', {
      method: "POST",
      body: "",
    })

    if (rsp.err !== "ok") {
      message.error(rsp.msg)
    } else {
      message.success(rsp.msg)
      getDataFromApi()
    }
  } catch (error) {
    console.error('Delete book error:', error)
    message.error('删除失败')
  } finally {
    loading.value = false
  }
}

const save = async (book, field) => {
  try {
    const edit = {}
    edit[field] = book[field]

    const rsp = await $backend('/book/' + book.id + '/edit', {
      method: "POST",
      body: JSON.stringify(edit),
    })

    if (rsp.err === "ok") {
      message.success(rsp.msg)
    } else {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Save book error:', error)
    message.error('保存失败')
  }
}

// 监听分页和排序变化
watch([page, pagination.pageSize, sortKey, sortOrder, search], () => {
  getDataFromApi()
})

// 生命周期
onMounted(() => {
  getDataFromApi()
})

// 设置页面标题
useHead({
  title: '图书管理'
})
</script>

<style scoped>
.admin-books-page {
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
}

.spacer {
  flex-grow: 1;
}

.book-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.editable-field {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.editable-field:hover {
  background-color: var(--primary-color-hover);
}

.three-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  white-space: normal;
  max-width: 200px;
  min-width: 120px;
}

.modal-header {
  font-weight: 600;
}

.modal-content {
  margin: 16px 0;
}

.modal-content p {
  margin: 8px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>