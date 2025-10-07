<template>
  <div class="signup-page">
    <div class="signup-container">
      <n-card class="signup-card">
        <template #header>
          <h3>填写注册信息</h3>
        </template>

        <n-form ref="formRef" :model="formValue" :rules="rules" @submit.prevent="signup">
          <n-form-item label="用户名" path="username">
            <n-input
              v-model:value="formValue.username"
              placeholder="请输入用户名"
              @keyup.enter="signup"
            >
              <template #prefix>
                <n-icon><PersonIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="formValue.password"
              type="password"
              placeholder="请输入密码"
              show-password-on="mousedown"
              @keyup.enter="signup"
            >
              <template #prefix>
                <n-icon><LockIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="确认密码" path="password2">
            <n-input
              v-model:value="formValue.password2"
              type="password"
              placeholder="请再次输入密码"
              show-password-on="mousedown"
              @keyup.enter="signup"
            >
              <template #prefix>
                <n-icon><LockIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="昵称" path="nickname">
            <n-input
              v-model:value="formValue.nickname"
              placeholder="请输入昵称"
              @keyup.enter="signup"
            >
              <template #prefix>
                <n-icon><FaceIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="Email" path="email">
            <n-input
              v-model:value="formValue.email"
              placeholder="请输入Email"
              @keyup.enter="signup"
            >
              <template #prefix>
                <n-icon><EmailIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>
        </n-form>

        <div class="signup-button">
          <n-button type="primary" size="large" block @click="signup">
            注册
          </n-button>
        </div>

        <n-alert v-if="failMsg" type="error" :show-icon="false">
          {{ failMsg }}
        </n-alert>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { Person as PersonIcon, LockClosed as LockIcon, Happy as FaceIcon, Mail as EmailIcon } from '@vicons/ionicons5'
import { useMainStore } from '~/store'

const message = useMessage()
const router = useRouter()
const mainStore = useMainStore()

// 响应式数据
const formRef = ref(null)
const failMsg = ref('')
const formValue = reactive({
  username: '',
  password: '',
  password2: '',
  nickname: '',
  email: ''
})

// 验证规则
const rules = {
  username: {
    required: { message: '请输入用户名', trigger: 'blur' },
    min: 5,
    max: 20,
    message: '用户名长度应在5-20个字符之间',
    trigger: 'blur'
  },
  password: {
    required: { message: '请输入密码', trigger: 'blur' },
    min: 8,
    max: 20,
    message: '密码长度应在8-20个字符之间',
    trigger: 'blur'
  },
  password2: {
    required: { message: '请确认密码', trigger: 'blur' },
    validator: (rule, value) => {
      if (!value) {
        return new Error('请再次输入密码')
      } else if (value !== formValue.password) {
        return new Error('两次输入的密码不一致')
      }
      return true
    },
    trigger: 'blur'
  },
  nickname: {
    required: { message: '请输入昵称', trigger: 'blur' },
    min: 2,
    message: '昵称至少需要2个字符',
    trigger: 'blur'
  },
  email: {
    required: { message: '请输入邮箱', trigger: 'blur' },
    validator: (rule, value) => {
      if (!value) {
        return new Error('请输入邮箱')
      }
      const re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!re.test(value)) {
        return new Error('邮箱格式不正确')
      }
      return true
    },
    trigger: 'blur'
  }
}

// 方法
const signup = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    const data = new URLSearchParams()
    data.append('username', formValue.username)
    data.append('password', formValue.password)
    data.append('nickname', formValue.nickname)
    data.append('email', formValue.email)

    const rsp = await $fetch('/api/user/sign_up', {
      method: 'POST',
      body: data,
    })

    if (rsp.err !== 'ok') {
      failMsg.value = rsp.msg
    } else {
      mainStore.navbar(true)
      router.push('/')
    }
  } catch (error) {
    console.error('Signup error:', error)
    failMsg.value = '注册失败，请稍后再试'
  }
}

// 生命周期
onMounted(() => {
  mainStore.navbar(false)
})

// 设置页面标题和布局
useHead({
  title: '注册'
})

definePageMeta({
  layout: false
})
</script>

<style scoped>
.signup-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--body-color);
  padding: 24px;
}

.signup-container {
  width: 100%;
  max-width: 400px;
}

.signup-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.signup-card h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.signup-button {
  margin-top: 16px;
}
</style>