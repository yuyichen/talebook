<template>
  <div class="book-cards-container">
    <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:3">
      <n-grid-item v-for="(book, idx) in renderBooks" :key="idx + '-books-' + book.id" class="book-list-card">
        <n-card :bordered="true" class="book-card" clickable @click="$router.push(book.href)">
          <div class="book-content">
            <div class="col-book-img">
              <n-image :src="book.img" :alt="book.title" class="book-image" />
            </div>
            <div class="col-book-info">
              <div class="book-title">{{ book.title }}</div>
              <slot name="introduce" :book="book"></slot>
              <div class="book-comments">
                <p v-if="book.comments" v-html="book.comments"></p>
                <p v-else>点击浏览详情</p>
              </div>
            </div>
          </div>
          <template #footer v-if="$slots.actions">
            <slot name="actions" :book="book"></slot>
          </template>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  books: {
    type: Array,
    default: () => []
  }
})

const renderBooks = computed(() => {
  return props.books.map(book => {
    if (book['href'] === undefined) {
      book['href'] = "/book/" + book.id
    }
    return book
  })
})
</script>

<style scoped>
.book-cards-container {
  margin-bottom: 16px;
}

.book-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-content {
  display: flex;
  gap: 12px;
}

.col-book-img {
  flex: 0 0 25%;
}

.col-book-info {
  flex: 1;
}

.book-image {
  width: 100%;
  aspect-ratio: 11/15;
  object-fit: cover;
  border-radius: 4px;
}

.book-title {
  display: block;
  overflow-y: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  text-overflow: clip;
  text-align: left;
  font-weight: bold;
  margin-bottom: 8px;
}

.book-comments {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: clip;
  margin-top: 6px;
  text-align: left;
}

.book-comments p {
  font-size: small;
  margin-bottom: 0px;
}

.page-title {
  font-weight: bold;
  text-align: left;
}

.new-legend {
  margin-top: 30px;
  margin-bottom: 20px;
}
</style>
