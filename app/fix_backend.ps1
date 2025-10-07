# 获取所有使用 $backend 的文件
$files = @(
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
)

# 为每个文件添加 useNuxtApp 导入和 $backend 解构
foreach ($file in $files) {
    $filePath = Join-Path -Path 'd:/Project/talebook/app/src' -ChildPath $file

    if (Test-Path $filePath) {
        $content = Get-Content -Path $filePath -Raw

        # 检查是否已经添加了 useNuxtApp
        if ($content -notlike '*import { useNuxtApp } from ''#app''*') {
            # 查找 import 语句的位置
            $importMatch = [regex]::Match($content, "(import.*from.*
)")
            if ($importMatch.Success) {
                $importIndex = $importMatch.Index + $importMatch.Length
                $content = $content.Substring(0, $importIndex) + "import { useNuxtApp } from '#app';`n" + $content.Substring($importIndex)
            }
        }

        # 检查是否已经添加了 $backend 解构
        if ($content -notlike '*const { `$backend } = useNuxtApp()*') {
            # 查找 const mainStore = useMainStore() 的位置
            $mainStoreMatch = [regex]::Match($content, "(const mainStore = useMainStore\(\))")
            if ($mainStoreMatch.Success) {
                $mainStoreIndex = $mainStoreMatch.Index + $mainStoreMatch.Length
                $content = $content.Substring(0, $mainStoreIndex) + "`nconst { `$backend } = useNuxtApp();" + $content.Substring($mainStoreIndex)
            }
        }

        # 写回文件
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "已修改文件: $file"
    } else {
        Write-Host "文件不存在: $filePath"
    }
}

Write-Host "批量修改完成"
