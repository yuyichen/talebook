<template>
  <footer class="app-footer">
    <n-divider class="divider" />
    <p class="footer-text" v-html="footerText"></p>
    <div class="footer-links">
      <n-button text size="small" tag="a" href="https://github.com/talebook/talebook" target="_blank">
        Github
      </n-button>
      | 
      <n-button text size="small" tag="a" href="https://hub.docker.com/r/talebook/talebook" target="_blank">
        Docker
      </n-button>
      | 
      <n-button text size="small" tag="a" href="http://talebook.org" target="_blank">
        Project
      </n-button>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useMainStore } from '~/store'

const mainStore = useMainStore()

const footerText = computed(() => {
  if (mainStore.sys.footer !== undefined) {
    return mainStore.sys.footer
  }
  return "本站基于Calibre构建，感谢开源界的力量。所有资源搜集于互联网，如有侵权请邮件联系。"
})
</script>

<style scoped>
.app-footer {
  padding: 16px 0;
  text-align: center;
  margin-top: 24px;
}

.divider {
  margin: 24px 0 12px;
}

.footer-text {
  margin: 0 0 12px;
  color: var(--text-color-2);
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
</style>