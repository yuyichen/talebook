<template>
  <div class="admin-settings-page">
    <n-card v-for="card in cards" :key="card.title" class="settings-card">
      <template #header>
        <div class="card-header" @click="card.show = !card.show">
          <n-button text @click.stop="card.show = !card.show">
            <template #icon>
              <n-icon>
                <component :is="card.show ? ChevronDownIcon : ChevronUpIcon" />
              </n-icon>
            </template>
          </n-button>
          <span>{{ card.title }}</span>
        </div>
      </template>

      <n-collapse-transition :show="card.show">
        <div class="card-content">
          <p v-if="card.subtitle" class="card-subtitle">{{ card.subtitle }}</p>

          <template v-if="card.tips">
            <div v-for="t in card.tips" :key="t.text" class="tip-item">
              <p>{{ t.text }}
                <n-button v-if="t.link" text tag="a" :href="t.link" target="_blank">
                  链接
                </n-button>
              </p>
            </div>
          </template>

          <div v-for="f in card.fields" :key="f.key" class="field-item">
            <n-checkbox v-if="f.type === 'checkbox'" v-model:checked="settings[f.key]">
              <template #icon>
                <n-icon v-if="f.icon">
                  <component :is="getIconComponent(f.icon)" />
                </n-icon>
              </template>
              {{ f.label }}
            </n-checkbox>

            <n-input v-else-if="f.type === 'textarea'" v-model:value="settings[f.key]" type="textarea">
              <template #prefix>
                <n-icon v-if="f.icon">
                  <component :is="getIconComponent(f.icon)" />
                </n-icon>
              </template>
              {{ f.label }}
            </n-input>

            <n-select v-else-if="f.type === 'select'" v-model:value="settings[f.key]" :options="f.items">
              <template #prefix>
                <n-icon v-if="f.icon">
                  <component :is="getIconComponent(f.icon)" />
                </n-icon>
              </template>
              {{ f.label }}
            </n-select>

            <n-input v-else v-model:value="settings[f.key]">
              <template #prefix>
                <n-icon v-if="f.icon">
                  <component :is="getIconComponent(f.icon)" />
                </n-icon>
              </template>
              {{ f.label }}
            </n-input>
          </div>

          <div v-for="b in card.buttons" :key="b.label" class="button-item">
            <n-button type="primary" @click="run(b.action)">
              <template #icon>
                <n-icon>
                  <component :is="getIconComponent(b.icon)" />
                </n-icon>
              </template>
              {{ b.label }}
            </n-button>
          </div>

          <div v-for="g in card.groups" :key="g.key" class="group-item">
            <n-checkbox v-model:checked="settings[g.key]">
              {{ g.label }}
            </n-checkbox>

            <div v-if="settings[g.key]" class="group-fields">
              <div v-for="f in g.fields" :key="f.key" class="field-item">
                <n-input v-if="f.type === 'textarea'" v-model:value="settings[f.key]" type="textarea">
                  <template #prefix>
                    <n-icon v-if="f.icon">
                      <component :is="getIconComponent(f.icon)" />
                    </n-icon>
                  </template>
                  {{ f.label }}
                </n-input>

                <n-input v-else v-model:value="settings[f.key]">
                  <template #prefix>
                    <n-icon v-if="f.icon">
                      <component :is="getIconComponent(f.icon)" />
                    </n-icon>
                  </template>
                  {{ f.label }}
                </n-input>
              </div>
            </div>
          </div>

          <div v-if="card.show_friends" class="friends-section">
            <n-grid x-gap="12" y-gap="12" cols="1">
              <n-grid-item v-for="(friend, idx) in settings.FRIENDS" :key="'friend-' + friend.href">
                <n-grid x-gap="8" cols="1 s:12">
                  <n-grid-item :span="6">
                    <n-input v-model:value="friend.text" placeholder="名称" />
                  </n-grid-item>
                  <n-grid-item :span="6">
                    <n-input v-model:value="friend.href" placeholder="链接">
                      <template #suffix>
                        <n-button text @click="settings.FRIENDS.splice(idx, 1)">
                          <template #icon>
                            <n-icon><DeleteIcon /></n-icon>
                          </template>
                        </n-button>
                      </template>
                    </n-input>
                  </n-grid-item>
                </n-grid>
              </n-grid-item>
            </n-grid>

            <div class="add-friend-button">
              <n-button type="primary" @click="settings.FRIENDS.push({text: '', href: ''})">
                <template #icon>
                  <n-icon><AddIcon /></n-icon>
                </template>
                添加
              </n-button>
            </div>
          </div>

          <div v-if="card.show_socials" class="socials-section">
            <p>所启用的社交网络将会在登录页面自动显示按钮。</p>
            <n-select
              v-model:value="settings.SOCIALS"
              :options="snsItems"
              multiple
              tag
              placeholder="选择要启用的社交网络账号"
            />

            <div v-for="s in settings.SOCIALS" :key="'social-' + s.value" class="social-item">
              <n-grid x-gap="12" y-gap="12" cols="1 s:12">
                <n-grid-item :span="2">
                  <div class="social-label">
                    {{ s.text }} 
                    <n-button text @click="showSnsConfig(s)">
                      说明
                    </n-button>
                  </div>
                </n-grid-item>
                <n-grid-item :span="3">
                  <n-input v-model:value="settings['SOCIAL_AUTH_' + s.value.toUpperCase() + '_KEY']" placeholder="Key" />
                </n-grid-item>
                <n-grid-item :span="7">
                  <n-input v-model:value="settings['SOCIAL_AUTH_' + s.value.toUpperCase() + '_SECRET']" placeholder="Secret" />
                </n-grid-item>
              </n-grid>
            </div>
          </div>

          <div v-if="card.show_ssl" class="ssl-section">
            <SSLManager />
          </div>
        </div>
      </n-collapse-transition>
    </n-card>

    <div class="save-button-container">
      <n-button type="primary" size="large" @click="saveSettings">
        保存
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  Home as HomeIcon, 
  DocumentText as CopyrightIcon, 
  LockClosed as LockIcon, 
  PersonCircle as PersonIcon, 
  InformationCircle as InfoIcon,
  Mail as EmailIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Trash as DeleteIcon,
  Add as AddIcon
} from '@vicons/ionicons5'
import SSLManager from "~/components/SSLManager.vue"
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();

const message = useMessage()

// 响应式数据
const comboInput = ref('')
const sns = ref({})
const snsItems = ref([])
const settings = reactive({})
const siteUrl = ref('')

const cards = ref([
  {
    show: false,
    title: "基础信息",
    fields: [
      { icon: "home", key: "site_title", label: "网站标题" },
      { icon: "mdi-copyright", key: "HEADER", label: "网站公告", type: 'textarea' },
      { icon: "mdi-copyright", key: "FOOTER", label: "网站脚注", type: 'textarea' },
    ],
    groups: [
      {
        key: "INVITE_MODE",
        label: "开启私人图书馆模式",
        fields: [
          { icon: "lock", key: "INVITE_CODE", label: "访问码" },
          { icon: "person", key: "INVITE_MESSAGE", type: 'textarea', label: "提示语" },
        ],
      },
    ],
  },
  {
    show: false,
    title: "用户设置",
    fields: [
      { icon: "", key: "ALLOW_GUEST_READ", label: "允许访客在线阅读（无需注册和登录）", type: 'checkbox' },
      { icon: "", key: "ALLOW_GUEST_DOWNLOAD", label: "允许任意下载（访客无需注册和登录）", type: 'checkbox' },
      { icon: "", key: "ALLOW_GUEST_PUSH", label: "允许任意推送Kindle（访客无需注册和登录）", type: 'checkbox' },
    ],
    groups: [
      {
        key: "ALLOW_REGISTER",
        label: "允许访客以邮箱注册账号",
        fields: [
          { icon: "info", key: "SIGNUP_MAIL_TITLE", label: "激活邮件标题" },
          { icon: "info", key: "SIGNUP_MAIL_CONTENT", label: "激活邮件正文", type: 'textarea' },
          { icon: "info", key: "RESET_MAIL_TITLE", label: "重置密码邮件标题" },
          { icon: "info", key: "RESET_MAIL_CONTENT", label: "重置密码邮件正文", type: 'textarea' },
        ],
      },
    ],
  },
  {
    show: false,
    title: '社交网络登录',
    fields: [],
    show_socials: true,
  },
  {
    show: false,
    title: "邮件服务",
    subtitle: '邮箱注册、推送Kindle依赖此配置(SMTP服务器地址可带端口，或者不带端口，默认为465号)',
    fields: [
      { icon: "email", key: "smtp_server", label: "SMTP服务器（例如 smtp-mail.outlook.com:587）" },
      { icon: "person", key: "smtp_username", label: "SMTP用户名（例如 user@gmail.com）" },
      { icon: "lock", key: "smtp_password", label: "SMTP密码" },
      { icon: "info", key: "smtp_encryption", label: "SMTP安全性", type: 'select',
        items: [{text: "SSL", value: "SSL"}, {text: "TLS(多数邮箱为此选项)", value: "TLS"} ]
      },
    ],
    buttons: [
      { icon: "email", label: "测试邮件", action: "testEmail" },
    ],
  },
  {
    show: false,
    title: "书籍标签分类",
    subtitle: '配置「分类导航」页面里预设的分类。添加书籍时，若书名或者作者名称出现以下分类，则自动添加对应的标签。',
    fields: [
      { icon: "person", key: "BOOK_NAV", type: 'textarea', label: "分类" },
    ],
  },
  {
    show: false,
    title: '友情链接',
    fields: [],
    show_friends: true,
  },
  {
    show: false,
    title: "互联网书籍信息源",
    fields: [
      { icon: "", key: "auto_fill_meta", label: "自动从互联网拉取新书的书籍信息", type: 'checkbox' },
      { icon: "info", key: "douban_baseurl", label: "豆瓣插件API地址(例如 http://10.0.0.1:8080 )" },
      { icon: "info", key: "douban_max_count", label: "豆瓣插件API查询结果数量" },
    ],
    tips: [
      {
        text: "若需要启用豆瓣插件，请参阅安装文档的说明。若出现失败，可尝试更换镜像，例如 talebook/douban-api-rs ",
        link: "https://github.com/talebook/talebook/blob/master/document/README.zh_CN.md#%E5%A6%82%E6%9E%9C%E9%85%8D%E7%BD%AE%E8%B1%86%E7%93%A3%E6%8F%92%E4%BB%B6",
      }
    ],
  },
  {
    show: false,
    title: "高级配置项",
    fields: [
      { icon: "home", key: "static_host", label: "CDN域名" },
      { icon: "info", key: "BOOK_NAMES_FORMAT", label: "目录和文件名模式", type: 'select',
        items: [{text: "使用拼音字母目录名 (兼容性高)", value: "en"}, {text: "使用中文目录名 (UTF8编码，更美观)", value: "utf8"} ]
      },
      { icon: "info", key: "EPUB_VIEWER", label: "EPUB阅读器", type: 'select',
        items: [{text: "Epub Reader（旧版）", value: "epubjs.html"}, {text: "Candle Reader（Beta版，支持章评功能）", value: "creader.html"} ]
      },
      { icon: "info", key: "avatar_service", label: "可使用www.gravatar.com或cravatar.cn头像服务" },
      { icon: "info", key: "MAX_UPLOAD_SIZE", label: "文件上传字节数限制(例如100MB或100KB）" },
      { icon: "lock", key: "cookie_secret", label: "COOKIE随机密钥" },
      { icon: "info", key: "scan_upload_path", label: "批量导入扫描目录" },
      { icon: "info", key: "push_title", label: "邮件推送的标题" },
      { icon: "info", key: "push_content", label: "邮件推送的内容" },
      { icon: "info", key: "convert_timeout", label: "书籍转换格式的最大超时时间（秒）" },
      { icon: "", key: "autoreload", label: "更新配置后自动重启服务器(首次开启需人工重启)", type: 'checkbox' },
    ],
    tips: [
      {
        text: "若需要调整Logo，请参阅安装文档的说明。",
        link: "https://github.com/talebook/talebook/blob/master/document/README.zh_CN.md#logo",
      }
    ],
  },
  {
    show: false,
    title: "SSL证书管理",
    fields: [],
    show_ssl: true,
  },
])

// 方法
const getIconComponent = (iconName) => {
  const iconMap = {
    'home': HomeIcon,
    'mdi-copyright': CopyrightIcon,
    'lock': LockIcon,
    'person': PersonIcon,
    'info': InfoIcon,
    'email': EmailIcon,
    'delete': DeleteIcon,
    'add': AddIcon,
  }
  return iconMap[iconName] || null
}

const saveSettings = async () => {
  try {
    const rsp = await $backend('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    })

    if (rsp.err !== 'ok') {
      message.error(rsp.msg)
    } else {
      message.success('保存成功！可能需要5~10秒钟生效！')
    }
  } catch (error) {
    console.error('Save settings error:', error)
    message.error('保存失败，请稍后再试')
  }
}

const showSnsConfig = (s) => {
  const msg = `请前往${s.text}的 <a href="${s.link}" target="_blank">配置页面</a> 获取密钥，并设置回调地址（callback URL）为
    <code>${siteUrl.value}/auth/complete/${s.value}.do</code>`
  message.success(msg)
}

const testEmail = async () => {
  try {
    const data = new URLSearchParams()
    data.append('smtp_server', settings['smtp_server'])
    data.append('smtp_username', settings['smtp_username'])
    data.append('smtp_password', settings['smtp_password'])
    data.append('smtp_encryption', settings['smtp_encryption'])

    const rsp = await $backend('/admin/testmail', {
      method: 'POST',
      body: data
    })

    if (rsp.err !== 'ok') {
      message.error(rsp.msg)
    } else {
      message.success(rsp.msg)
    }
  } catch (error) {
    console.error('Test email error:', error)
    message.error('测试失败，请稍后再试')
  }
}

const run = (func) => {
  if (typeof func === 'string') {
    const funcMap = {
      'testEmail': testEmail
    }
    if (funcMap[func]) {
      funcMap[func]()
    }
  }
}

// 生命周期
onMounted(async () => {
  try {
    const rsp = await $backend('/admin/settings')
    snsItems.value = rsp.sns
    Object.assign(settings, rsp.settings)
    siteUrl.value = rsp.site_url

    const m = {}
    rsp.sns.forEach(function(ele) {
      m[ele.value] = ele
    })
    settings.SOCIALS.forEach(function(ele) {
      ele.help = false
      ele.link = m[ele.value].link
    })
  } catch (error) {
    console.error('Fetch admin settings error:', error)
    message.error('获取设置失败，请稍后再试')
  }
})

// 设置页面标题
useHead({
  title: '系统设置'
})
</script>

<style scoped>
.admin-settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.settings-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.card-header span {
  font-weight: 600;
  margin-left: 8px;
}

.card-content {
  padding: 16px 0;
}

.card-subtitle {
  margin-bottom: 16px;
  color: var(--text-color-3);
}

.tip-item {
  margin-bottom: 12px;
}

.field-item {
  margin-bottom: 16px;
}

.button-item {
  margin-bottom: 16px;
}

.group-item {
  margin-bottom: 16px;
}

.group-fields {
  margin-top: 12px;
  padding-left: 24px;
}

.friends-section {
  margin-top: 16px;
}

.add-friend-button {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.socials-section {
  margin-top: 16px;
}

.social-item {
  margin-top: 16px;
}

.social-label {
  display: flex;
  align-items: center;
  height: 34px;
}

.ssl-section {
  margin-top: 16px;
}

.save-button-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>