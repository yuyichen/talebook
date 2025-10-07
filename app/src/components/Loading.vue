<template>
  <div v-show="mainStore.loading" class="loading-page">
    <n-spin size="large" style="width: 100px;"/>
  </div>
</template>

<script setup>
import { useMainStore } from '~/store'

const mainStore = useMainStore()
</script>

<style scoped>
.loading-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
