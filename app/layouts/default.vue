<template>
  <div class="default-layout">
    <header class="header">
      <!-- 这里可以添加页眉内容 -->
      <h1>Talebook</h1>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <footer class="footer">
      <!-- 这里可以添加页脚内容 -->
      <p>&copy; {{ new Date().getFullYear() }} Talebook. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
// 在这里可以添加布局的逻辑
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

.footer {
  padding: 1rem;
  background-color: #f5f5f5;
  text-align: center;
}
</style>
