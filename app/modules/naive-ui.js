import { defineNuxtModule } from '@nuxt/kit'
import { resolve } from 'path'

export default defineNuxtModule({
  meta: {
    name: 'naive-ui',
    configKey: 'naiveUi',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  setup(options, nuxt) {
    // 自动导入 Naive UI 组件
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: resolve(__dirname, '../components'),
        prefix: '',
        global: true
      })
    })

    // 不添加 Naive UI 样式，因为该文件不存在
    // nuxt.options.css.push('naive-ui/dist/style.css')
  }
})