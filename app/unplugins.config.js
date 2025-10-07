import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default {
  vite: {
    plugins: [
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar'
            ]
          }
        ],
        dts: true
      }),
      Components({
        resolvers: [NaiveUiResolver({
          importStyle: false // 完全禁用样式导入
        })]
      })
    ]
  }
}