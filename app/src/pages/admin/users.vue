<template>
  <div class="admin-users-page">
    <n-card>
      <template #header>
        <h3>用户管理</h3>
      </template>

      <n-data-table
        :columns="columns"
        :data="items"
        :pagination="pagination"
        :loading="loading"
        :bordered="false"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        @update:sorter="handleSorterChange"
      >
        <template #login_ip="{ row }">
          {{ row.extra.login_ip }}
        </template>

        <template #detail="{ row }">
          <div class="user-stats">
            <span v-if="row.extra.visit_history"> 访问{{ row.extra.visit_history.length }}本 </span>
            <span v-if="row.extra.read_history"> 阅读{{ row.extra.read_history.length }}本 </span>
            <span v-if="row.extra.push_history"> 推送{{ row.extra.push_history.length }}本 </span>
            <span v-if="row.extra.download_history"> 下载{{ row.extra.download_history.length }}本 </span>
            <span v-if="row.extra.upload_history"> 上传{{ row.extra.upload_history.length }}本 </span>
          </div>
        </template>

        <template #actions="{ row }">
          <n-dropdown
            :options="getUserMenuOptions(row)"
            placement="bottom-end"
            @select="(key) => handleMenuSelect(key, row)"
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { EllipsisVertical as MoreIcon, Checkmark as CheckIcon, CloseCircle as CloseIcon } from '@vicons/ionicons5'
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();

const message = useMessage()

// 响应式数据
const page = ref(1)
const items = ref([])
const total = ref(0)
const loading = ref(true)
const pageSize = ref(10)
const sortKey = ref('access_time')
const sortOrder = ref('descend')

// 表格列配置
const columns = [
  { title: "ID", key: "id", sorter: true, defaultSortOrder: 'descend' },
  { title: "用户名", key: "username", sorter: true },
  { title: "昵称", key: "name" },
  { title: "Email", key: "email", sorter: true },
  { title: "注册平台", key: "provider" },
  { title: "注册时间", key: "create_time", sorter: true },
  { title: "登录时间", key: "access_time", sorter: true },
  { title: "登录IP", key: "login_ip", render: (row) => row.extra.login_ip },
  { title: "详情", key: "detail", render: (row) => renderUserStats(row) },
  { title: "操作", key: "actions", width: 100 }
]

// 权限配置
const permissions = [
  { code: "l", name: "can_login", text: "登录" },
  { code: "u", name: "can_upload", text: "上传" },
  { code: "s", name: "can_save", text: "下载" },
  { code: "e", name: "can_edit", text: "编辑" },
  { code: "d", name: "can_delete", text: "删除" },
  { code: "p", name: "can_push", text: "推送" },
  { code: "r", name: "can_read", text: "在线阅读" },
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
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

// 计算属性
const pageCount = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

// 方法
const renderUserStats = (row) => {
  const stats = []
  if (row.extra.visit_history) stats.push(`访问${row.extra.visit_history.length}本`)
  if (row.extra.read_history) stats.push(`阅读${row.extra.read_history.length}本`)
  if (row.extra.push_history) stats.push(`推送${row.extra.push_history.length}本`)
  if (row.extra.download_history) stats.push(`下载${row.extra.download_history.length}本`)
  if (row.extra.upload_history) stats.push(`上传${row.extra.upload_history.length}本`)
  return h('div', { class: 'user-stats' }, stats.map(stat => h('span', { key: stat }, stat)))
}

const getUserMenuOptions = (row) => {
  const options = []

  // 权限管理选项
  const permissionOptions = []
  permissions.forEach(perm => {
    if (row[perm.name]) {
      permissionOptions.push({
        label: () => h('div', { class: 'menu-item-with-icon' }, [
          h(CheckIcon, { color: '#52c41a' }),
          h('span', `已允许${perm.text}`)
        ]),
        key: `disable-${perm.name}`,
        children: [
          {
            label: '关闭',
            key: `disable-${perm.name}`,
            props: {
              onClick: () => {
                setUser(row.id, { permission: perm.code.toUpperCase() })
                row[perm.name] = !row[perm.name]
              }
            }
          }
        ]
      })
    } else {
      permissionOptions.push({
        label: () => h('div', { class: 'menu-item-with-icon' }, [
          h(CloseIcon, { color: '#ff4d4f' }),
          h('span', `已禁止${perm.text}`)
        ]),
        key: `enable-${perm.name}`,
        children: [
          {
            label: '开启',
            key: `enable-${perm.name}`,
            props: {
              onClick: () => {
                setUser(row.id, { permission: perm.code.toLowerCase() })
                row[perm.name] = !row[perm.name]
              }
            }
          }
        ]
      })
    }
  })

  options.push({
    type: 'group',
    label: '修改用户权限',
    key: 'permissions',
    children: permissionOptions
  })

  // 账号管理选项
  const accountOptions = []

  if (!row.is_active) {
    accountOptions.push({
      label: '免邮箱认证，直接激活账户',
      key: 'activate',
      props: {
        onClick: () => {
          setUser(row.id, { active: true })
          row.is_active = true
        }
      }
    })
  }

  if (row.is_admin) {
    accountOptions.push({
      label: '取消管理员',
      key: 'remove-admin',
      props: {
        onClick: () => {
          setUser(row.id, { admin: false })
          row.is_admin = !row.is_admin
        }
      }
    })
  } else {
    accountOptions.push({
      label: '设置为管理员',
      key: 'set-admin',
      props: {
        onClick: () => {
          setUser(row.id, { admin: true })
          row.is_admin = !row.is_admin
        }
      }
    })
  }

  accountOptions.push({
    label: '立即删除该用户',
    key: 'delete',
    props: {
      style: { color: '#ff4d4f' },
      onClick: () => {
        setUser(row.id, { delete: row.username })
        getDataFromApi()
      }
    }
  })

  options.push({
    type: 'group',
    label: '账号管理',
    key: 'account',
    children: accountOptions
  })

  return options
}

const handleMenuSelect = (key, row) => {
  // 处理菜单选择，具体操作已在菜单选项的 onClick 中定义
}

const handlePageChange = (newPage) => {
  page.value = newPage
  getDataFromApi()
}

const handlePageSizeChange = (newPageSize) => {
  pageSize.value = newPageSize
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
    data.append("num", pageSize.value)

    const rsp = await $backend('/admin/users?' + data.toString())

    if (rsp.err !== "ok") {
      items.value = []
      total.value = 0
      message.error(rsp.msg)
      return false
    }

    items.value = rsp.users.items
    total.value = rsp.users.total
    pagination.itemCount = total.value
  } catch (error) {
    console.error('Get users error:', error)
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const setUser = async (uid, action) => {
  try {
    action.id = uid

    const rsp = await $backend('/admin/users', {
      method: 'POST',
      body: JSON.stringify(action)
    })

    if (rsp.err !== "ok") {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Set user error:', error)
    message.error('操作失败，请稍后再试')
  }
}

// 监听分页和排序变化
watch([page, pageSize, sortKey, sortOrder], () => {
  getDataFromApi()
})

// 生命周期
onMounted(() => {
  getDataFromApi()
})

// 设置页面标题
useHead({
  title: '用户管理'
})
</script>

<style scoped>
.admin-users-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.user-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-stats span {
  font-size: 0.85rem;
  padding: 2px 6px;
  background-color: var(--primary-color-hover);
  border-radius: 4px;
}

.menu-item-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>