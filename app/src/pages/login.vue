<template>
  <div class="login-page">
    <div class="login-container">
      <n-card v-if="showLogin" class="login-card">
        <template #header>
          <div class="card-header">
            <h3>欢迎访问</h3>
            <n-button
              v-if="mainStore.sys.allow.register"
              type="success"
              @click="$router.push('/signup')"
            >
              注册
            </n-button>
          </div>
        </template>

        <n-form @submit.prevent="doLogin">
          <n-form-item label="用户名">
            <n-input
              v-model:value="username"
              placeholder="请输入用户名"
              @keyup.enter="doLogin"
            >
              <template #prefix>
                <n-icon><PersonIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="密码">
            <n-input
              v-model:value="password"
              type="password"
              placeholder="请输入密码"
              show-password-on="mousedown"
              @keyup.enter="doLogin"
            >
              <template #prefix>
                <n-icon><LockIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <div class="forgot-password">
            <a @click="showLogin = !showLogin">忘记密码?</a>
          </div>

          <div class="login-button">
            <n-button type="primary" size="large" block @click="doLogin">
              登录
            </n-button>
          </div>
        </n-form>

        <template v-if="socials.length > 0">
          <n-divider />
          <div class="social-login">
            <p>使用社交网络账号登录</p>
            <div class="social-buttons">
              <n-button
                v-for="s in socials"
                :key="s.text"
                dashed
                @click="$router.push('/auth/login/' + s.value)"
              >
                {{ s.text }}
              </n-button>
            </div>
          </div>
        </template>

        <n-alert v-if="alert.msg" :type="alert.type" :show-icon="false">
          {{ alert.msg }}
        </n-alert>
      </n-card>
      <n-card v-else class="login-card">
        <template #header>
          <h3>重置密码</h3>
        </template>

        <n-form @submit.prevent="doReset">
          <n-form-item label="用户名">
            <n-input v-model:value="username" placeholder="请输入用户名">
              <template #prefix>
                <n-icon><PersonIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="注册邮箱">
            <n-input v-model:value="email" placeholder="请输入注册邮箱">
              <template #prefix>
                <n-icon><EmailIcon /></n-icon>
              </template>
            </n-input>
          </n-form-item>
        </n-form>

        <div class="reset-buttons">
          <n-button @click="showLogin = !showLogin">返回</n-button>
          <n-button type="error" @click="doReset">重置密码</n-button>
        </div>

        <n-alert v-if="alert.msg" :type="alert.type" :show-icon="false">
          {{ alert.msg }}
        </n-alert>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useMessage } from "naive-ui";
import { useRouter } from "vue-router";
import {
  Person as PersonIcon,
  LockClosed as LockIcon,
  Mail as EmailIcon,
} from "@vicons/ionicons5";
import { useMainStore } from "~/store";
import { useNuxtApp } from '#app';

const message = useMessage();
const router = useRouter();
const mainStore = useMainStore();
const { $backend } = useNuxtApp();

// 响应式数据
const username = ref("");
const password = ref("");
const email = ref("");
const showLogin = ref(true);
const alert = ref({
  type: "error",
  msg: "",
});

// 计算属性
const socials = computed(() => {
  return mainStore.sys.socials;
});

// 方法
const doLogin = async () => {
  try {
    const data = new URLSearchParams();
    data.append("username", username.value);
    data.append("password", password.value);

    const rsp = await $backend("/user/sign_in", {
      method: "POST",
      body: data,
    });

    if (rsp.err !== "ok") {
      alert.value.type = "error";
      alert.value.msg = rsp.msg;
    } else {
      mainStore.navbar(true);
      router.push("/");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert.value.type = "error";
    alert.value.msg = "登录失败，请稍后再试";
  }
};

const doReset = async () => {
  try {
    const data = new URLSearchParams();
    data.append("username", username.value);
    data.append("email", email.value);

    const rsp = await $backend("/user/reset", {
      method: "POST",
      body: data,
    });

    if (rsp.err === "ok") {
      alert.value.type = "success";
      alert.value.msg = "重置成功！请查阅密码通知邮件。";
    } else {
      alert.value.type = "error";
      alert.value.msg = rsp.msg;
    }
  } catch (error) {
    console.error("Reset password error:", error);
    alert.value.type = "error";
    alert.value.msg = "重置失败，请稍后再试";
  }
};

// 生命周期
onMounted(() => {
  mainStore.navbar(false);

  // 获取用户信息
  $backend("/user/info")
    .then((rsp) => {
      mainStore.login(rsp);
    })
    .catch((error) => {
      console.error("Failed to fetch user info:", error);
    });
});

// 设置页面标题和布局
useHead({
  title: "登录",
});

definePageMeta({
  layout: false,
});
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--body-color);
  padding: 24px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.forgot-password {
  text-align: right;
  margin-bottom: 16px;
}

.forgot-password a {
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

.login-button {
  margin-top: 16px;
}

.social-login {
  text-align: center;
  padding: 16px 0;
}

.social-login p {
  margin: 0 0 12px;
  color: var(--text-color-3);
  font-size: 0.9rem;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.reset-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
</style>
