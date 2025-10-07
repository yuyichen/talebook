<template>
  <div>
    <n-button
      type="primary"
      circle
      size="large"
      class="upload-button"
      @click="dialog = true"
    >
      <template #icon>
        <n-icon><UploadIcon /></n-icon>
      </template>
    </n-button>

    <n-modal
      v-model:show="dialog"
      preset="card"
      style="max-width: 400px"
      title="上传书籍"
      :mask-closable="false"
    >
      <template #header-extra>
        <n-button quaternary circle @click="dialog = false">
          <template #icon>
            <n-icon><CloseIcon /></n-icon>
          </template>
        </n-button>
      </template>

      <div class="upload-form">
        <p>受限于服务器能力，请勿上传100M的大文件书籍。</p>
        <n-upload
          v-model:file-list="fileList"
          :max="1"
          :default-upload="false"
          @change="handleFileChange"
        >
          <n-button>选择电子书文件</n-button>
        </n-upload>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="dialog = false">取消</n-button>
          <n-button type="primary" :loading="loading" @click="doUpload">
            上传
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useNuxtApp } from '#app'
import { CloudUpload as UploadIcon, Close as CloseIcon } from '@vicons/ionicons5'

const message = useMessage()
const { $backend } = useNuxtApp()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const dialog = ref(false)
const fileList = ref([])
const ebookFile = ref(null)

// 方法
const handleFileChange = (options) => {
  if (options.fileList.length > 0) {
    ebookFile.value = options.fileList[0].file
  } else {
    ebookFile.value = null
  }
}

const doUpload = async () => {
  if (!ebookFile.value) {
    message.error('请选择要上传的电子书文件')
    return
  }

  try {
    loading.value = true
    const data = new FormData()
    data.append("ebook", ebookFile.value)

    const rsp = await $backend('/book/upload', {
      method: 'POST',
      body: data,
    })

    dialog.value = false
    if (rsp.err === 'ok') {
      message.success('上传成功！')
      router.push("/book/" + rsp.book_id)
    } else if (rsp.err === 'samebook') {
      message.error(rsp.msg)
      router.push("/book/" + rsp.book_id)
    } else {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Upload error:', error)
    message.error('上传失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.upload-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.upload-form {
  margin: 16px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>