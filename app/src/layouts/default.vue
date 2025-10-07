<template>
  <n-message-provider>
    <n-notification-provider>
      <n-dialog-provider>
        <n-loading-bar-provider>
            <div>
              <loading />
              <ClientOnly>
                <app-header v-if="mainStore.nav">
                <main class="main-content">
                  <div class="container">
                    <app-press v-if="mainStore.nav" />
                    <slot />
                    <app-footer v-if="mainStore.nav" />
                  </div>

                  <ClientOnly>
                    <n-modal
                      :show="mainStore.alert && mainStore.alert.show !== undefined ? mainStore.alert.show : false"
                      :mask-closable="false"
                      preset="card"
                      :style="{ maxWidth: '600px' }"
                      :title="
                        mainStore.alert && mainStore.alert.type === 'success'
                          ? '成功'
                          : mainStore.alert && mainStore.alert.type === 'error'
                          ? '错误'
                          : '提示'
                      "
                    >
                      <n-alert :type="mainStore.alert && mainStore.alert.type || 'default'" :show-icon="false">
                        <div v-html="mainStore.alert && mainStore.alert.msg || ''"></div>
                      </n-alert>
                      <template #footer>
                        <div
                          v-if="
                            mainStore.alert.type !== 'success' ||
                            mainStore.alert.to
                          "
                          class="modal-footer"
                        >
                          <n-button
                            v-if="mainStore.alert.to"
                            type="primary"
                            @click="
                              router.push(mainStore.alert.to);
                              mainStore.close_alert();
                            "
                          >
                            好的
                          </n-button>
                          <n-button
                            v-else
                            type="primary"
                            @click="mainStore.close_alert()"
                          >
                            关闭
                          </n-button>
                        </div>
                      </template>
                    </n-modal>
                  </ClientOnly>
                </main>
              </app-header>
              </ClientOnly>
              <ClientOnly>
                <upload v-if="mainStore.nav" />
              </ClientOnly>
            </div>
          </n-loading-bar-provider>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
</template>

<script setup>
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import AppPress from "~/components/AppPress.vue";
import Loading from "~/components/Loading.vue";
import Upload from "~/components/Upload.vue";
import { zhCN, dateZhCN } from "naive-ui";
import { useMainStore } from "~/store";
import { useRouter } from "vue-router";

const mainStore = useMainStore();
const router = useRouter();

// 设置页面标题
useHead({
  title: mainStore.site_title,
  titleTemplate: mainStore.site_title_template,
});

// 加载完成后调用
onMounted(() => {
  mainStore.loaded();
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
