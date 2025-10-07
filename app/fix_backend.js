import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// 获取所有使用 $backend 的文件
const files = [
  'components/AppHeader.vue',
  'components/SSLManager.vue',
  'components/Upload.vue',
  'pages/ListBook.vue',
  'pages/ListMeta.vue',
  'pages/admin/books.vue',
  'pages/admin/imports.vue',
  'pages/admin/settings.vue',
  'pages/admin/users.vue',
  'pages/book/_bid/edit.vue',
  'pages/book/_bid/readtxt.vue',
  'pages/book/_bookid.vue',
  'pages/index.vue',
  'pages/install.vue',
  'pages/login.vue',
  'pages/logout.vue',
  'pages/nav.vue'
];

// 为每个文件添加 useNuxtApp 导入和 $backend 解构
files.forEach(file => {
  const filePath = path.join('d:/Project/talebook/app/src', file);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 检查是否已经添加了 useNuxtApp
    if (!content.includes('import { useNuxtApp } from '#app'')) {
      // 查找 import 语句的位置
      const importMatch = content.match(/import.*from.*\n/);
      if (importMatch) {
        const importIndex = importMatch.index + importMatch[0].length;
        content = content.slice(0, importIndex) + 'import { useNuxtApp } from '#app';\n' + content.slice(importIndex);
      }
    }

    // 检查是否已经添加了 $backend 解构
    if (!content.includes('const { $backend } = useNuxtApp()')) {
      // 查找 const mainStore = useMainStore() 的位置
      const mainStoreMatch = content.match(/const mainStore = useMainStore\(\)/);
      if (mainStoreMatch) {
        const mainStoreIndex = mainStoreMatch.index + mainStoreMatch[0].length;
        content = content.slice(0, mainStoreIndex) + '\nconst { $backend } = useNuxtApp();' + content.slice(mainStoreIndex);
      }
    }

    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`已修改文件: ${file}`);
  } else {
    console.log(`文件不存在: ${filePath}`);
  }
});

console.log('批量修改完成');
