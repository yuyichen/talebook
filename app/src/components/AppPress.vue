<!-- 网站公告 -->
<template>
  <div v-if="showPress" class="press-container">
    <n-alert type="info" closable @close="close">
      <div v-html="pressMessage"></div>
    </n-alert>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMainStore } from '~/store'
import { useCookies } from 'vue3-cookies'

const mainStore = useMainStore()
const { cookies } = useCookies()

const hasPress = computed(() => {
  return mainStore.sys.header !== undefined
})

const pressMessage = computed(() => {
  if (mainStore.sys.header !== undefined) {
    return mainStore.sys.header
  }
  return ""
})

const showPress = computed(() => {
  if (!hasPress.value) {
    return false
  }
  const msg = pressMessage.value
  const hash = hashCode(msg)
  const cookie = cookies.get('close_press', 'none')

  if (msg === "" || hash === cookie) {
    return false
  }

  return true
})

const hashCode = (s) => {
  let hash = 0
  if (s.length === 0) return hash
  for (let i = 0; i < s.length; i++) {
    const chr = s.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

const close = () => {
  const hash = hashCode(pressMessage.value)
  cookies.set('close_press', hash)
}
</script>

<style scoped>
.press-container {
  margin-bottom: 16px;
}
</style>
