<template>
  <div class="user-detail-page">
    <n-card title="用户中心">
      <n-form ref="formRef" :model="user" :rules="rules" label-placement="left">
        <n-grid x-gap="12" y-gap="12" cols="1 s:2">
          <!-- 头像 -->
          <n-grid-item :span="1">
            <n-form-item label="头像">
              <div class="avatar-container">
                <n-avatar :size="80" :src="user.avatar" />
                <div class="avatar-tip">
                  <a href="https://cravatar.cn/avatar" target="_blank">点击修改</a>
                </div>
              </div>
            </n-form-item>
          </n-grid-item>

          <!-- 用户名 -->
          <n-grid-item :span="1">
            <n-form-item label="用户名">
              <n-input :value="user.username" readonly />
            </n-form-item>
          </n-grid-item>

          <!-- 邮箱 -->
          <n-grid-item :span="1">
            <n-form-item label="邮箱">
              <div class="email-container">
                <n-input :value="user.email" readonly />
                <a v-if="!user.is_active" href="#" @click.prevent="sendActiveEmail" class="resend-link">
                  重新发送激活邮件
                </a>
              </div>
            </n-form-item>
          </n-grid-item>

          <!-- 密码 -->
          <n-grid-item :span="2">
            <n-form-item label="密码">
              <div class="password-container">
                <a href="#" @click.prevent="showPass = !showPass">点击修改</a>
                <div v-if="showPass" class="password-form">
                  <n-form-item path="password0">
                    <n-input
                      v-model:value="user.password0"
                      type="password"
                      placeholder="当前密码"
                      show-password-on="mousedown"
                    />
                  </n-form-item>
                  <n-form-item path="password1">
                    <n-input
                      v-model:value="user.password1"
                      type="password"
                      placeholder="新密码"
                      show-password-on="mousedown"
                    />
                  </n-form-item>
                  <n-form-item path="password2">
                    <n-input
                      v-model:value="user.password2"
                      type="password"
                      placeholder="确认密码"
                      show-password-on="mousedown"
                    />
                  </n-form-item>
                </div>
              </div>
            </n-form-item>
          </n-grid-item>

          <!-- 昵称 -->
          <n-grid-item :span="1">
            <n-form-item label="昵称" path="nickname">
              <n-input
                v-model:value="user.nickname"
                placeholder="请输入昵称"
              />
            </n-form-item>
          </n-grid-item>

          <!-- Kindle地址 -->
          <n-grid-item :span="1">
            <n-form-item label="Kindle地址" path="kindle_email">
              <n-input
                v-model:value="user.kindle_email"
                placeholder="请输入Kindle邮箱地址"
              />
            </n-form-item>
          </n-grid-item>
        </n-grid>

        <div class="save-button">
          <n-button type="primary" size="large" @click="save">
            保存
          </n-button>
        </div>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useMainStore } from '~/store'

const message = useMessage()
const dialog = useDialog()
const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()

// 响应式数据
const formRef = ref(null)
const showPass = ref(false)
const user = reactive({
  username: '',
  email: '',
  avatar: '',
  is_active: false,
  password0: '',
  password1: '',
  password2: '',
  nickname: '',
  kindle_email: ''
})

// 验证规则
const rules = {
  password0: {
    validator: (rule, value) => {
      if (showPass.value && !value) {
        return new Error('请输入当前密码')
      }
      return true
    },
    trigger: 'blur'
  },
  password1: {
    validator: (rule, value) => {
      if (showPass.value && !value) {
        return new Error('请输入新密码')
      }
      if (showPass.value && value && value.length < 8) {
        return new Error('密码至少需要8个字符')
      }
      return true
    },
    trigger: 'blur'
  },
  password2: {
    validator: (rule, value) => {
      if (showPass.value && !value) {
        return new Error('请确认密码')
      }
      if (showPass.value && value !== user.password1) {
        return new Error('两次输入的密码不一致')
      }
      return true
    },
    trigger: 'blur'
  },
  nickname: {
    validator: (rule, value) => {
      if (value && value.length < 2) {
        return new Error('昵称至少需要2个字符')
      }
      return true
    },
    trigger: 'blur'
  },
  kindle_email: {
    validator: (rule, value) => {
      if (value) {
        const re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!re.test(value)) {
          return new Error('邮箱格式不正确')
        }
      }
      return true
    },
    trigger: 'blur'
  }
}

// 方法
const valid = () => {
  return user.password2 === user.password1 || "两次输入的密码不一致"
}

const save = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    const data = {
      password0: user.password0,
      password1: user.password1,
      password2: user.password2,
      nickname: user.nickname,
      kindle_email: user.kindle_email
    }

    const rsp = await $fetch('/api/user/update', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (rsp.err !== 'ok') {
      message.error(rsp.msg)
    } else {
      message.success('保存成功')
      mainStore.navbar(true)
      router.push('/')
    }
  } catch (error) {
    console.error('Save user detail error:', error)
    message.error('保存失败，请稍后再试')
  }
}

const sendActiveEmail = async () => {
  try {
    const rsp = await $fetch('/api/user/active/send')

    if (rsp.err === 'ok') {
      message.success('激活邮件已发出！')
    } else {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Send active email error:', error)
    message.error('发送激活邮件失败，请稍后再试')
  }
}

const init = async () => {
  try {
    mainStore.navbar(true)
    const rsp = await $fetch('/api/user/info?detail=1')

    rsp.user.password0 = ''
    rsp.user.password1 = ''
    rsp.user.password2 = ''

    // 更新用户数据
    Object.assign(user, rsp.user)
  } catch (error) {
    console.error('Init user detail error:', error)
    message.error('获取用户信息失败')
  }
}

// 生命周期
onMounted(() => {
  init()
})

// 设置页面标题
useHead({
  title: '用户中心'
})
</script>

<style scoped>
.user-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-tip {
  font-size: 0.9rem;
}

.email-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resend-link {
  font-size: 0.9rem;
  color: var(--primary-color);
}

.password-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background-color: var(--card-color-modal);
  border-radius: 4px;
}

.save-button {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>