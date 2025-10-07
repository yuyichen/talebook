<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ListBook from '~/pages/ListBook.vue'

const route = useRoute()

// 设置页面标题
const getPageTitle = computed(() => {
  const name = decodeURIComponent(route.params.name)
  const titles = {
    tag: `"${name}"标签的书籍`,
    series: `${name}丛书`,
    rating: `${name}星书籍`,
    author: `${name}的著作`,
    publisher: `${name}出版的书籍`,
  }
  const meta = route.path.split("/")[1]
  if (titles[meta] !== undefined) {
    return titles[meta]
  }
  return ''
})

// 设置页面标题
useHead({
  title: getPageTitle
})
</script>