<template>
  <div class="install-page">
    <n-card class="install-card">
      <template #header>
        <h3>安装 TaleBook</h3>
      </template>

      <n-form ref="formRef" :model="formValue" :rules="rules" @submit.prevent="doInstall">
        <n-form-item label="网站标题" path="title">
          <n-input
            v-model:value="formValue.title"
            placeholder="请输入网站标题"
          >
            <template #prefix>
              <n-icon><HomeIcon /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item label="管理员用户名" path="username">
          <n-input
            v-model:value="formValue.username"
            placeholder="请输入管理员用户名"
          >
            <template #prefix>
              <n-icon><PersonIcon /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item label="管理员登录密码" path="password">
          <n-input
            v-model:value="formValue.password"
            type="password"
            placeholder="请输入管理员登录密码"
            show-password-on="mousedown"
          >
            <template #prefix>
              <n-icon><LockIcon /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item label="管理员Email" path="email">
          <n-input
            v-model:value="formValue.email"
            placeholder="请输入管理员Email"
          >
            <template #prefix>
              <n-icon><EmailIcon /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item>
          <n-checkbox v-model:checked="formValue.invite">
            开启私人图书馆模式
          </n-checkbox>
        </n-form-item>

        <template v-if="formValue.invite">
          <n-form-item label="访问码" path="code">
            <n-input
              v-model:value="formValue.code"
              placeholder="请输入访问码"
            >
              <template #prefix>
                <n-icon><LockIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>
        </template>
      </n-form>

      <n-alert v-if="tips" type="info" :show-icon="false">
        <div v-html="tips"></div>
      </n-alert>

      <template #footer>
        <div class="card-footer">
          <n-button type="primary" @click="doInstall">
            完成设置
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { Home as HomeIcon, Person as PersonIcon, LockClosed as LockIcon, Mail as EmailIcon } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import { useMainStore } from '~/store'
import { useNuxtApp } from '#app'

const { $backend } = useNuxtApp();
const message = useMessage()
const router = useRouter()
const mainStore = useMainStore()

// 响应式数据
const formRef = ref(null)
const tips = ref('')
const retry = ref(20)
const formValue = reactive({
  username: 'admin',
  password: '',
  email: '',
  code: '',
  invite: false,
  title: 'TaleBook'
})

// 验证规则
const rules = {
  title: {
    required: { message: '请输入网站标题', trigger: 'blur' }
  },
  username: {
    required: { message: '请输入管理员用户名', trigger: 'blur' },
    min: 5,
    max: 20,
    message: '用户名长度应在5-20个字符之间',
    trigger: 'blur'
  },
  password: {
    required: { message: '请输入管理员登录密码', trigger: 'blur' },
    min: 8,
    max: 20,
    message: '密码长度应在8-20个字符之间',
    trigger: 'blur'
  },
  email: {
    required: { message: '请输入管理员Email', trigger: 'blur' },
    validator: (rule, value) => {
      if (!value) {
        return new Error('请输入管理员Email')
      }
      const re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!re.test(value)) {
        return new Error('邮箱格式不正确')
      }
      return true
    },
    trigger: 'blur'
  },
  code: {
    required: { message: '请输入访问码', trigger: 'blur' },
    trigger: 'blur'
  }
}

// 方法
const checkInstall = () => {
  fetch('/api/index')
    .then(rsp => {
      if (rsp.status === 200) {
        tips.value += 'API服务正常<br/>安装成功，跳转到主页'

        // force refresh index.html
        fetch('/?r=' + Math.random())
          .then(rsp => rsp.text())
          .then(() => {
            mainStore.navbar(true)
            router.push('/')
          })
      } else {
        retry.value -= 1
        if (retry.value > 0) {
          setTimeout(() => {
            checkInstall()
          }, 1000)
        } else {
          tips.value += '超时，请刷新重试'
        }
      }
    })
    .catch(error => {
      console.error('Check install error:', error)
      retry.value -= 1
      if (retry.value > 0) {
        setTimeout(() => {
          checkInstall()
        }, 1000)
      } else {
        tips.value += '超时，请刷新重试'
      }
    })
}

const doInstall = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    const data = new URLSearchParams()
    data.append('username', formValue.username)
    data.append('password', formValue.password)
    data.append('email', formValue.email)
    data.append('code', formValue.code)
    data.append('invite', formValue.invite)
    data.append('title', formValue.title)

    tips.value = '正在写入配置文件...'

    const rsp = await $backend('/admin/install', {
      method: 'POST',
      body: data
    })

    if (rsp.err !== 'ok') {
      message.error(rsp.msg)
    } else {
      tips.value += '配置写入成功！<br/>正在检测服务器...'
      setTimeout(() => {
        checkInstall()
      }, 5000)
    }
  } catch (error) {
    console.error('Install error:', error)
    message.error('安装失败，请稍后再试')
  }
}

// 生命周期
onMounted(() => {
  mainStore.navbar(false)
})

// 设置页面标题和布局
useHead({
  title: '安装 TaleBook'
})

definePageMeta({
  layout: false
})
</script>

<style scoped>
.install-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--body-color);
  padding: 24px;
}

.install-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.install-card h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.card-footer {
  display: flex;
  justify-content: center;
}
</style>