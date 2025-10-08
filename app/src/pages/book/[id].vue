<template>
  <div class="book-detail-page">
    <n-row :gutter="16">
      <n-col :span="24">
        <!-- 推送到Kindle对话框 -->
        <n-modal v-model:show="dialogKindle" preset="card" style="max-width: 400px" :mask-closable="false">
          <template #header>
            <div class="modal-header">推送到Kindle</div>
          </template>

          <div class="modal-content">
            <p>填写Kindle收件人邮箱地址：</p>
            <n-select
              v-model:value="mailTo"
              :options="emailOptions"
              :rules="emailRules"
              placeholder="Email*"
              filterable
              tag
            />
            <small>* 请先将本站邮箱加入到Kindle发件人中:<br/>{{ kindleSender }}</small>
          </div>

          <template #footer>
            <div class="modal-footer">
              <n-button @click="dialogKindle = false">取消</n-button>
              <n-button type="primary" @click="sendToKindle">发送</n-button>
            </div>
          </template>
        </n-modal>

        <!-- 下载对话框 -->
        <n-modal v-model:show="dialogDownload" preset="card" style="max-width: 400px">
          <template #header>
            <div class="modal-header">下载书籍</div>
          </template>

          <div class="modal-content">
            <n-list v-if="book.files.length > 0">
              <n-list-item v-for="file in book.files" :key="'file-' + file.format">
                <template #prefix>
                  <n-avatar color="primary" round>
                    <n-icon><DownloadIcon /></n-icon>
                  </n-avatar>
                </template>
                <n-thing :title="file.format">
                  <template #description>
                    <span v-if="file.size >= 1048576">{{ parseInt(file.size / 1048576) }}MB</span>
                    <span v-else>{{ parseInt(file.size / 1024) }}KB</span>
                  </template>
                </n-thing>
                <template #suffix>
                  <n-button tag="a" :href="file.href" target="_blank" type="primary">
                    下载
                  </n-button>
                </template>
              </n-list-item>
            </n-list>
            <p v-else><br/>本书暂无可供下载的文件格式</p>
          </div>

          <template #footer>
            <div class="modal-footer">
              <n-button @click="dialogDownload = false">关闭</n-button>
            </div>
          </template>
        </n-modal>

        <!-- 从互联网同步书籍信息对话框 -->
        <n-card v-if="dialogRefer">
          <template #header>
            <div class="card-header">
              <span>从互联网同步书籍信息</span>
              <n-button @click="dialogRefer = false">取消</n-button>
            </div>
          </template>

          <div class="card-content">
            <div v-if="referBooksLoading" class="loading-container">
              <n-spin size="large" />
            </div>
            <p v-else-if="referBooks.length === 0" class="empty-message">无匹配的书籍信息</p>
            <template v-else>
              <p>请选择最匹配的记录复制为本书的描述信息</p>
              <BookCards :books="referBooks">
                <template #actions="{ book }">
                  <div class="book-actions">
                    <n-space>
                      <n-tag v-if="book.author_sort" size="small">{{ book.author_sort }}</n-tag>
                      <n-tag v-if="book.publisher" size="small">{{ book.publisher }}</n-tag>
                      <n-tag v-if="book.pubyear" size="small">{{ book.pubyear }}</n-tag>
                    </n-space>
                  </div>
                  <n-divider />
                  <div class="book-actions">
                    <n-tag :color="book.source === '豆瓣' ? 'success' : 'primary'" size="small">
                      {{ book.source }}
                    </n-tag>
                    <n-dropdown
                      :options="getReferOptions(book)"
                      placement="bottom-end"
                      @select="(key) => handleReferSelect(key, book)"
                    >
                      <n-button type="primary" size="small" :loading="referBooksSettingBtnLoading">
                        <template #icon>
                          <n-icon><CheckIcon /></n-icon>
                        </template>
                        设置
                      </n-button>
                    </n-dropdown>
                  </div>
                </template>
              </BookCards>
            </template>
          </div>
        </n-card>

        <!-- 主卡片 -->
        <n-card v-if="!dialogRefer">
          <template #header>
            <div class="card-header">
              <n-button-group size="small">
                <n-button @click="dialogDownload = true">
                  <template #icon>
                    <n-icon><DownloadIcon /></n-icon>
                  </template>
                </n-button>
                <n-button class="d-none">
                  <template #icon>
                    <n-icon><ThumbUpIcon /></n-icon>
                  </template>
                </n-button>
                <n-button class="d-none">
                  <template #icon>
                    <n-icon><ShareIcon /></n-icon>
                  </template>
                </n-button>
              </n-button-group>

              <div class="spacer"></div>

              <n-button type="primary" @click="dialogKindle = !dialogKindle" class="action-button">
                <template #icon>
                  <n-icon><EmailIcon /></n-icon>
                </template>
                推送
              </n-button>

              <a v-if="isTxt" :to="`/book/${book.id}/readtxt`" target="_blank" class="action-button">
                <n-button type="primary">
                  <template #icon>
                    <n-icon><ReadIcon /></n-icon>
                  </template>
                  阅读(TXT)
                </n-button>
              </a>
              <a v-else :href="`/read/${book.id}`" target="_blank" class="action-button">
                <n-button type="primary">
                  <template #icon>
                    <n-icon><ReadIcon /></n-icon>
                  </template>
                  阅读
                </n-button>
              </a>

              <template v-if="book.is_owner">
                <n-dropdown
                  :options="getAdminOptions()"
                  placement="bottom-end"
                  @select="handleAdminSelect"
                >
                  <n-button type="primary" class="admin-button">
                    管理
                    <template #icon>
                      <n-icon><MoreIcon /></n-icon>
                    </template>
                  </n-button>
                </n-dropdown>
              </template>
            </div>
          </template>

          <n-row :gutter="24">
            <n-col :span="24" :md="8">
              <div class="book-cover-container">
                <n-image :src="book.img" class="book-cover" :preview-src="book.img" />
              </div>
            </n-col>

            <n-col :span="24" :md="16">
              <div class="book-info">
                <h2 class="book-title">{{ book.title }}</h2>
                <p class="book-meta">{{ book.author }}著，{{ pubYear }}年版</p>

                <div v-if='book.files.length>0 && book.files[0].format==="PDF"' class="file-info">
                  <span v-if="book.files[0].size >= 1048576" class="file-size">
                    [文件格式: PDF - {{ parseInt(book.files[0].size / 1048576) }}MB]
                  </span>
                  <span v-else class="file-size">
                    [文件格式: PDF - {{ parseInt(book.files[0].size / 1024) }}KB]
                  </span>
                </div>

                <div class="book-rating">
                  <n-rate :value="book.rating" :max="10" readonly />
                </div>

                <div class="book-tags">
                  <template v-for="author in book.authors" :key="'author-' + author">
                    <n-tag :bordered="false" type="primary" round @click="$router.push('/author/' + encodeURIComponent(author))">
                      <template #icon>
                        <n-icon><PersonIcon /></n-icon>
                      </template>
                      {{ author }}
                    </n-tag>
                  </template>

                  <n-tag :bordered="false" type="primary" round @click="$router.push('/publisher/' + encodeURIComponent(book.publisher))">
                    <template #icon>
                      <n-icon><GroupIcon /></n-icon>
                    </template>
                    出版：{{ book.publisher }}
                  </n-tag>

                  <n-tag
                    v-if="book.series"
                    :bordered="false"
                    type="primary"
                    round
                    @click="$router.push('/series/' + encodeURIComponent(book.series))"
                  >
                    <template #icon>
                      <n-icon><ExploreIcon /></n-icon>
                    </template>
                    丛书: {{ book.series }}
                  </n-tag>

                  <n-tag v-if="book.isbn" :bordered="false" type="default" round>
                    <template #icon>
                      <n-icon><ExploreIcon /></n-icon>
                    </template>
                    ISBN：{{ book.isbn }}
                  </n-tag>

                  <template v-for="tag in book.tags" :key="'tag-' + tag">
                    <n-tag
                      v-if="tag"
                      :bordered="false"
                      type="default"
                      round
                      @click="$router.push('/tag/' + encodeURIComponent(tag))"
                    >
                      <template #icon>
                        <n-icon><TagIcon /></n-icon>
                      </template>
                      {{ tag }}
                    </n-tag>
                  </template>
                </div>
              </div>

              <div class="book-description">
                <div v-if="book.comments" v-html="book.comments"></div>
                <p v-else>点击浏览详情</p>
              </div>
            </n-col>
          </n-row>

          <template #footer>
            <div class="book-footer">
              <span class="book-meta"> {{ book.collector }} @ {{ book.timestamp }} </span>
            </div>
          </template>
        </n-card>
      </n-col>

      <n-col :span="24" :sm="isTxt ? 12 : 10" :md="isTxt ? 6 : 8">
        <n-card>
          <n-list>
            <n-list-item>
              <template #prefix>
                <n-avatar color="primary" round>
                  <n-icon><ReadIcon /></n-icon>
                </n-avatar>
              </template>
              <a v-if="isTxt" :to="`/book/${book.id}/readtxt`" target="_blank" style="text-decoration: none; color: inherit;">
                <n-thing title="在线阅读(TXT)" />
              </a>
              <a v-else :href="`/read/${book.id}`" target="_blank" style="text-decoration: none; color: inherit;">
                <n-thing title="在线阅读" />
              </a>
              <template #suffix>
                <n-icon><ArrowRightIcon /></n-icon>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </n-col>

      <n-col v-show="isTxt" :span="24" :sm="12" :md="6">
        <n-card>
          <n-list>
            <n-list-item>
              <template #prefix>
                <n-avatar color="primary" round>
                  <n-icon><ReadIcon /></n-icon>
                </n-avatar>
              </template>
              <n-thing :title="`Txt在线阅读(${txtParseInited ? '已解析' : '未解析'})`" />
              <template #suffix>
                <n-icon><ArrowRightIcon /></n-icon>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </n-col>

      <n-col :span="24" :sm="isTxt ? 12 : 10" :md="isTxt ? 6 : 8">
        <n-card>
          <n-list>
            <n-list-item @click="dialogDownload = !dialogDownload">
              <template #prefix>
                <n-avatar color="primary" round>
                  <n-icon><DownloadIcon /></n-icon>
                </n-avatar>
              </template>
              <n-thing title="下载" />
              <template #suffix>
                <n-icon><ArrowRightIcon /></n-icon>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </n-col>

      <n-col :span="24" :sm="isTxt ? 12 : 10" :md="isTxt ? 6 : 8">
        <n-card>
          <n-list>
            <n-list-item @click="dialogKindle = !dialogKindle">
              <template #prefix>
                <n-avatar color="primary" round>
                  <n-icon><EmailIcon /></n-icon>
                </n-avatar>
              </template>
              <n-thing title="推送至Kindle" />
              <template #suffix>
                <n-icon><ArrowRightIcon /></n-icon>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </n-col>
    </n-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { 
  Download as DownloadIcon, 
  ThumbsUp as ThumbUpIcon, 
  Share as ShareIcon,
  Mail as EmailIcon,
  Book as ReadIcon,
  EllipsisVertical as MoreIcon,
  Checkmark as CheckIcon,
  ArrowForward as ArrowRightIcon,
  Person as PersonIcon,
  People as GroupIcon,
  Compass as ExploreIcon,
  Bookmark as TagIcon
} from '@vicons/ionicons5'
import { useMainStore } from '~/store'
import BookCards from "~/components/BookCards.vue"
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();

const route = useRoute()
const router = useRouter()
const message = useMessage()
const mainStore = useMainStore()

// 响应式数据
const err = ref('')
const msg = ref('')
const book = ref({id: 0, title: "", files: [], tags: [], pubdate: ""})
const debug = ref(false)
const mailTo = ref('')
const kindleSender = ref('')
const txtParseInited = ref(false)
const dialogDownload = ref(false)
const dialogKindle = ref(false)
const dialogRefer = ref(false)
const dialogMsg = ref(false)
const referBooksLoading = ref(false)
const referBooksSettingBtnLoading = ref(false)
const referBooks = ref([])

// 计算属性
const isTxt = computed(() => {
  if (!book.value) return false
  const formats = book.value.files.map(x => x.format.toLowerCase())
  return formats.includes("txt")
})

const pubYear = computed(() => {
  if (book.value === null || book.value.pubdate == null) {
    return "N/A"
  }
  return book.value.pubdate.split("-")[0]
})

const emailOptions = computed(() => {
  const emails = [mainStore.user.kindle_email]
  // 在 Naive UI 中，可以使用 useCookie 来获取 cookies
  return emails.filter(value => value !== "" && value !== undefined && value !== null)
})

const emailRules = [
  {
    required: true,
    message: '请输入邮箱地址',
    trigger: 'blur'
  },
  {
    validator: (rule, value) => {
      if (value === kindleSender.value) {
        return new Error('发件邮件不可作为收件人')
      }
      const re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!re.test(value)) {
        return new Error('Email格式错误')
      }
      return true
    },
    trigger: 'blur'
  }
]

// 方法
const getReferOptions = (book) => {
  return [
    {
      label: '设置书籍信息及图片',
      key: 'all'
    },
    {
      label: '仅设置书籍信息',
      key: 'meta'
    },
    {
      label: '仅设置书籍图片',
      key: 'cover'
    }
  ]
}

const handleReferSelect = (key, book) => {
  if (key === 'all') {
    setRefer(book.provider_key, book.provider_value)
  } else if (key === 'meta') {
    setRefer(book.provider_key, book.provider_value, { only_meta: 'yes' })
  } else if (key === 'cover') {
    setRefer(book.provider_key, book.provider_value, { only_cover: 'yes' })
  }
}

const getAdminOptions = () => {
  return [
    {
      label: '编辑书籍信息',
      key: 'edit'
    },
    {
      label: '从互联网更新信息',
      key: 'refer'
    },
    {
      type: 'divider',
      key: 'd1'
    },
    {
      label: '删除此书',
      key: 'delete'
    }
  ]
}

const handleAdminSelect = (key) => {
  if (key === 'edit') {
    router.push('/book/' + book.value.id + '/edit')
  } else if (key === 'refer') {
    getRefer()
  } else if (key === 'delete') {
    deleteBook()
  }
}

const init = async (currentRoute) => {
  try {
    mainStore.navbar(true)
    const rsp = await $backend('/book/' + currentRoute.params.id)

    if (rsp.err !== "ok") {
      message.error(rsp.msg)
      router.push('/')
      return
    }

    book.value = rsp.book
  } catch (error) {
    console.error('Init book detail error:', error)
    message.error('获取书籍信息失败')
  }
}

const sendToKindle = async () => {
  try {
    // 在 Naive UI 中，可以使用 useCookie 来设置 cookies
    // cookies.set("last_mailto", mailTo.value)

    const rsp = await $backend('/book/' + book.value.id + '/push', {
      method: "POST",
      body: "mail_to=" + mailTo.value,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    dialogKindle.value = false
    if (rsp.err === "ok") {
      message.success(rsp.msg)
    } else {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Send to Kindle error:', error)
    message.error('推送失败')
  }
}

const getTxtParseStatus = async () => {
  try {
    const res = await $backend(`/book/txt/init?id=${book.value.id}&test=1`)
    if (res.err === "ok" && res.msg === "已解析") {
      txtParseInited.value = true
    }
  } catch (error) {
    console.error('Get txt parse status error:', error)
  }
}

const getRefer = async () => {
  try {
    dialogRefer.value = true
    referBooksLoading.value = true

    const rsp = await $backend("/book/" + book.value.id + "/refer")

    referBooks.value = rsp.books.map((b) => {
      b.href = ""
      b.img = "/get/pcover?url=" + encodeURIComponent(b.cover_url)
      return b
    })
  } catch (error) {
    console.error('Get refer error:', error)
    message.error('获取参考信息失败')
  } finally {
    referBooksLoading.value = false
  }
}

const setRefer = async (provider_key, provider_value, opt = {}) => {
  // 防止多次重复点击
  if (referBooksSettingBtnLoading.value) return

  // 显示加载条提示
  referBooksSettingBtnLoading.value = true

  try {
    const data = new URLSearchParams(opt)
    data.append("provider_key", provider_key)
    data.append("provider_value", provider_value)

    const rsp = await $backend("/book/" + book.value.id + "/refer", {
      method: "POST",
      body: data,
    })

    dialogRefer.value = false
    if (rsp.err === "ok") {
      message.success("设置成功！")
      await init(route)
      // 刷新页面
      location.reload()
    } else {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Set refer error:', error)
    message.error('设置失败')
  } finally {
    // 关闭加载条提示
    referBooksSettingBtnLoading.value = false
  }
}

const deleteBook = async () => {
  try {
    const rsp = await $backend("/book/" + book.value.id + "/delete", {
      method: "POST",
    })

    if (rsp.err === "ok") {
      message.success("删除成功")
      router.push("/")
    } else {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Delete book error:', error)
    message.error('删除失败')
  }
}

// 监听路由变化
watch(() => route.fullPath, async () => {
  await init(route)
})

// 生命周期
onMounted(async () => {
  await init(route)
  mailTo.value = mainStore.user.kindle_email
  await getTxtParseStatus()

  // 在 Naive UI 中，可以使用 useCookie 来获取 cookies
  // const lastMailTo = cookies.get("last_mailto")
  // if (lastMailTo) {
  //   mailTo.value = lastMailTo
  // }
})

// 设置页面标题
useHead({
  title: book.value.title
})
</script>

<style scoped>
.book-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spacer {
  flex-grow: 1;
}

.action-button {
  margin-left: 8px;
}

.admin-button {
  margin-left: 8px;
}

.book-cover-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.book-cover {
  max-height: 500px;
  object-fit: contain;
  border-radius: 4px;
}

.book-info {
  margin-bottom: 16px;
}

.book-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.book-meta {
  color: var(--text-color-3);
  margin-bottom: 16px;
}

.file-info {
  margin-bottom: 16px;
}

.file-size {
  font-weight: bold;
  color: var(--text-color-3);
}

.book-rating {
  margin-bottom: 16px;
}

.book-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.book-description {
  margin-top: 16px;
}

.book-footer {
  text-align: right;
  padding-top: 0;
  padding-bottom: 8px;
  color: var(--text-color-3);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.empty-message {
  text-align: center;
  padding: 40px 0;
  color: var(--text-color-3);
}

.book-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>