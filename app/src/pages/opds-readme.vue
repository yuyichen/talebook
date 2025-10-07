<template>
  <div class="opds-page">
    <n-card>
      <template #header>
        <h1>OPDS 介绍</h1>
      </template>

      <n-space vertical size="large">
        <n-card title="OPDS 链接" :bordered="false">
          <p>您的 OPDS 链接为：<n-code>{{ opdsUrl }}</n-code></p>
        </n-card>

        <n-card title="常见 OPDS 阅读软件" :bordered="false">
          <ul>
            <li>
              <strong>KyBook</strong>：支持 iOS 和 macOS 的电子书阅读器 
              <n-button text tag="a" href="https://apps.apple.com/app/kybook/id1049898139" target="_blank" rel="noopener noreferrer">
                [下载]
              </n-button>
            </li>
            <li>
              <strong>静读天下</strong>：Android 平台上功能强大的电子书阅读器 
              <n-button text tag="a" href="https://play.google.com/store/apps/details?id=com.flyersoft.moonreader" target="_blank" rel="noopener noreferrer">
                [下载]
              </n-button>
            </li>
          </ul>
        </n-card>

        <n-card title="配置指南" :bordered="false">
          <n-ol>
            <n-ol-item>在阅读器中添加新的 OPDS 书库</n-ol-item>
            <n-ol-item>输入您的 OPDS 链接</n-ol-item>
            <n-ol-item>根据提示完成认证（如果需要）</n-ol-item>
            <n-ol-item>开始浏览和阅读您的电子书</n-ol-item>
          </n-ol>

          <h3>请注意</h3>
          <p>因为静读天下APP不支持cookie登录，因此需要做如下配置：</p>
          <n-ol>
            <n-ol-item>关闭「私人图书馆」模式。</n-ol-item>
            <n-ol-item>打开「允许任意下载」（访客无需注册或登录）</n-ol-item>
          </n-ol>
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const opdsUrl = ref('')

// 生命周期
onMounted(() => {
  opdsUrl.value = window.location.origin + '/opds/'
})

// 设置页面标题
useHead({
  title: 'OPDS 介绍'
})
</script>

<style scoped>
.opds-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

h3 {
  margin: 16px 0 8px;
  font-size: 1.2rem;
}

ul, ol {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>