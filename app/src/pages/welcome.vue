<template>
  <div class="welcome-page">
    <n-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <h3>请输入访问密码</h3>
        </div>
      </template>

      <div class="welcome-text">
        <p>{{ welcome }}</p>
      </div>

      <n-form @submit.prevent="welcomeLogin">
        <n-form-item :show-require-mark="true" :validation-status="isErr ? 'error' : undefined" :feedback="msg">
          <n-input
            v-model:value="inviteCode"
            type="password"
            placeholder="请输入访问密码"
            :loading="loading"
            @keyup.enter="welcomeLogin"
          >
            <template #prefix>
              <n-icon><LockIcon /></n-icon>
            </template>
          </n-input>
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="card-footer">
          <n-button type="primary" @click="welcomeLogin" :loading="loading">
            登录
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { LockClosed as LockIcon } from '@vicons/ionicons5'
import { useRoute, useRouter } from 'vue-router'
import { useMainStore } from '~/store'

const message = useMessage()
const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()

// 响应式数据
const valid = ref(true)
const isErr = ref(false)
const err = ref('ok')
const msg = ref('')
const welcome = ref('本站为私人图书馆，需输入密码才可进行访问')
const loading = ref(false)
const inviteCode = ref('')

// 方法
const welcomeLogin = async () => {
  try {
    loading.value = true
    const data = new URLSearchParams()
    data.append('invite_code', inviteCode.value)

    const rsp = await $fetch('/api/welcome', {
      method: 'POST',
      body: data
    })

    loading.value = false

    if (rsp.err !== 'ok') {
      isErr.value = true
      msg.value = rsp.msg
    } else {
      isErr.value = false
      // 重新加载页面以更新登录状态
      location.reload()
    }
  } catch (error) {
    console.error('Welcome login error:', error)
    loading.value = false
    isErr.value = true
    msg.value = '登录失败，请稍后再试'
  }
}

// 生命周期
onMounted(async () => {
  try {
    mainStore.navbar(false)

    const rsp = await $fetch('/api/welcome')
    err.value = rsp.err

    if (err.value === 'free') {
      router.push(route.query.next || '/')
    } else if (err.value === 'not_installed') {
      router.push('/install')
    }
  } catch (error) {
    console.error('Welcome page init error:', error)
  }
})

// 设置页面标题和布局
useHead({
  title: '私人图书馆'
})

definePageMeta({
  layout: false
})
</script>

<style scoped>
.welcome-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--body-color);
  padding: 24px;
}

.welcome-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.welcome-text {
  text-align: center;
  padding: 16px 0;
}

.card-footer {
  display: flex;
  justify-content: center;
}
</style>