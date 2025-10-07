<template>
  <div>
    <n-button @click="dialog = true">
      <template #icon>
        <n-icon><UploadIcon /></n-icon>
      </template>
      更新SSL证书
    </n-button>

    <n-modal
      v-model:show="dialog"
      preset="card"
      style="max-width: 400px"
      title="上传SSL证书"
      :mask-closable="false"
    >
      <template #header-extra>
        <n-button quaternary circle @click="dialog = false">
          <template #icon>
            <n-icon><CloseIcon /></n-icon>
          </template>
        </n-button>
      </template>

      <div class="ssl-form">
        <p>说明文字</p>
        <n-form ref="formRef" :model="formValue" :rules="rules">
          <n-form-item label="请选择要上传的证书文件（.crt）" path="sslCrt">
            <n-upload
              v-model:file-list="formValue.sslCrt"
              :max="1"
              accept=".crt"
              :default-upload="false"
              @change="handleCrtChange"
            >
              <n-button>选择文件</n-button>
            </n-upload>
          </n-form-item>

          <n-form-item label="请选择要上传的证书私钥（.key）" path="sslKey">
            <n-upload
              v-model:file-list="formValue.sslKey"
              :max="1"
              accept=".key"
              :default-upload="false"
              @change="handleKeyChange"
            >
              <n-button>选择文件</n-button>
            </n-upload>
          </n-form-item>
        </n-form>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="dialog = false">取消</n-button>
          <n-button type="primary" :loading="loading" @click="uploadSsl">
            上传SSL证书
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMessage } from 'naive-ui'
import { useNuxtApp } from '#app'
import { CloudUpload as UploadIcon, Close as CloseIcon } from '@vicons/ionicons5'

const message = useMessage()
const { $backend } = useNuxtApp()

// 响应式数据
const loading = ref(false)
const dialog = ref(false)
const formRef = ref(null)
const sslCrtFile = ref(null)
const sslKeyFile = ref(null)

// 表单数据
const formValue = reactive({
  sslCrt: [],
  sslKey: []
})

// 表单验证规则
const rules = {
  sslCrt: {
    required: { message: '请选择证书文件', trigger: 'change' }
  },
  sslKey: {
    required: { message: '请选择私钥文件', trigger: 'change' }
  }
}

// 方法
const handleCrtChange = (options) => {
  if (options.fileList.length > 0) {
    sslCrtFile.value = options.fileList[0].file
  } else {
    sslCrtFile.value = null
  }
}

const handleKeyChange = (options) => {
  if (options.fileList.length > 0) {
    sslKeyFile.value = options.fileList[0].file
  } else {
    sslKeyFile.value = null
  }
}

const checkCerts = async () => {
  const re = {
    crt: /-----BEGIN CERTIFICATE-----[^ ]*-----END CERTIFICATE-----/gm,
    key: /-----BEGIN [A-Z]* PRIVATE KEY-----[^ ]*-----END [A-Z]* PRIVATE KEY-----/gm,
  }

  if (!sslCrtFile.value) {
    message.error('请选择证书文件')
    return false
  }

  const crtContent = await sslCrtFile.value.text()
  if (!re.crt.test(crtContent)) {
    message.error('证书文件(.crt)异常，文件内容不是PEM格式')
    return false
  }

  if (!sslKeyFile.value) {
    message.error('请选择私钥文件')
    return false
  }

  const keyContent = await sslKeyFile.value.text()
  if (!re.key.test(keyContent)) {
    message.error('私钥文件(.key)异常，文件内容不是PEM格式')
    return false
  }

  return true
}

const uploadSsl = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    loading.value = true
    const ok = await checkCerts()

    if (!ok) {
      loading.value = false
      return
    }

    const data = new FormData()
    data.append("ssl_crt", sslCrtFile.value)
    data.append("ssl_key", sslKeyFile.value)

    const rsp = await $backend('/admin/ssl', {
      method: 'POST',
      body: data,
    })

    dialog.value = false
    if (rsp.err === 'ok') {
      message.success('上传成功！')
    } else {
      message.error(rsp.msg)
    }
  } catch (error) {
    console.error('Upload SSL error:', error)
    message.error('上传失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ssl-form {
  margin: 16px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>