<template>
  <n-layout>
    <!-- 顶部导航栏 -->
    <n-layout-header class="header">
      <div class="header-content">
        <div class="header-left">
          <n-button quaternary circle @click="sidebar = !sidebar">
            <template #icon>
              <n-icon><MenuIcon /></n-icon>
            </template>
          </n-button>
          <div class="site-title" @click="router.push('/')">
            {{ sys.title }}
          </div>
        </div>

        <div class="header-right">
          <!-- 搜索框 - PC端 -->
          <div v-if="!isMobile" class="search-box">
            <n-input
              v-model:value="search"
              placeholder="搜索"
              @keyup.enter="doSearch"
            >
              <template #prefix>
                <n-icon><SearchIcon /></n-icon>
              </template>
            </n-input>
          </div>

          <!-- 搜索按钮 - 移动端 -->
          <n-button v-else quaternary circle @click="btnSearch = !btnSearch">
            <template #icon>
              <n-icon><SearchIcon /></n-icon>
            </template>
          </n-button>

          <!-- 用户菜单 -->
          <template v-if="err === 'ok'">
            <template v-if="user.is_login">
              <!-- 通知菜单 -->
              <n-dropdown
                v-if="messages.length > 0"
                :options="messageOptions"
                @select="handleMessageSelect"
              >
                <n-badge :value="messages.length" :max="99">
                  <n-button quaternary circle>
                    <template #icon>
                      <n-icon><BellIcon /></n-icon>
                    </template>
                  </n-button>
                </n-badge>
              </n-dropdown>

              <!-- 用户菜单 -->
              <n-dropdown
                :options="userMenuOptions"
                @select="handleUserMenuSelect"
              >
                <n-avatar
                  round
                  :size="32"
                  :src="user.avatar"
                  class="user-avatar"
                />
              </n-dropdown>
            </template>

            <!-- 登录按钮 -->
            <n-button v-else type="primary" @click="router.push('/login')">
              <template #icon>
                <n-icon><UserIcon /></n-icon>
              </template>
              请登录
            </n-button>
          </template>
        </div>
      </div>

      <!-- 移动端搜索框 -->
      <div v-if="isMobile && btnSearch" class="mobile-search">
        <n-input
          v-model:value="search"
          placeholder="搜索"
          @keyup.enter="doMobileSearch"
          ref="mobileSearchRef"
        >
          <template #prefix>
            <n-icon><SearchIcon /></n-icon>
          </template>
        </n-input>
        <n-button type="primary" @click="doMobileSearch"> 搜索 </n-button>
      </div>
    </n-layout-header>
    <n-layout has-sider>
      <!-- 侧边栏 -->
      <n-layout-sider
        v-model:collapsed="sidebar"
        :width="240"
        :collapsed-width="64"
        collapse-mode="width"
        show-trigger
        content-style="padding: 24px;"
      >
        <n-menu
          :options="menuOptions"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :accordion="true"
          :indent="18"
          @update:value="handleMenuClick"
        />
      </n-layout-sider>
      <!-- 内容区域 -->
      <n-layout-content>
        <slot />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { ref, computed, onMounted, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMessage, useDialog } from "naive-ui";
import { useNuxtApp } from '#app';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as BellIcon,
  Person as UserIcon,
  Settings as SettingsIcon,
  People as ContactsIcon,
  Time as HistoryIcon,
  Chatbubbles as ChatbubblesIcon,
  LogOut as LogOutIcon,
  Library as LibraryIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Bookmark as TagIcon,
  Bookmark as BookmarkIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Information as InformationIcon,
} from "@vicons/ionicons5";
import { useMainStore } from "~/store";

const message = useMessage();
const dialog = useDialog();
const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();
const { $backend } = useNuxtApp();

// 响应式数据
const btnSearch = ref(false);
const search = ref("");
const err = ref("ok");
const user = ref({});
const sys = ref({
  books: 0,
  tags: 0,
  authors: 0,
  publishers: 0,
  series: 0,
  users: 0,
  active: 0,
  version: "",
  mtime: "",
  title: "",
  footer: "",
  socials: [],
  friends: [],
  allow: {
    register: true,
    download: true,
    push: true,
    read: true,
  },
});
const messages = ref([]);
const mobileSearchRef = ref(null);

// 计算属性
const isMobile = computed(() => {
  return typeof window !== "undefined" && window.innerWidth < 768;
});

// 侧边栏状态
const sidebar = ref(false);

// 菜单选项
const menuOptions = computed(() => {
  const homeLinks = [
    {
      label: "首页",
      key: "home",
      icon: () => h("span", { class: "menu-icon" }, [h(HomeIcon)]),
      path: "/",
    },
  ];

  const adminLinks = user.value.is_admin
    ? [
        {
          label: "管理",
          key: "admin",
          icon: () => h("span", { class: "menu-icon" }, [h(SettingsIcon)]),
          children: [
            {
              label: "系统设置",
              key: "admin-settings",
              icon: () => h("span", { class: "menu-icon" }, [h(SettingsIcon)]),
              path: "/admin/settings",
            },
            {
              label: "用户管理",
              key: "admin-users",
              icon: () => h("span", { class: "menu-icon" }, [h(PeopleIcon)]),
              path: "/admin/users",
            },
            {
              label: "图书管理",
              key: "admin-books",
              icon: () => h("span", { class: "menu-icon" }, [h(LibraryIcon)]),
              path: "/admin/books",
            },
            {
              label: "导入图书",
              key: "admin-imports",
              icon: () => h("span", { class: "menu-icon" }, [h(BookmarkIcon)]),
              path: "/admin/imports",
            },
          ],
        },
      ]
    : [];

  const navLinks = [
    {
      label: "分类浏览",
      key: "nav-category",
      type: "group",
      children: [
        {
          label: "分类导览",
          key: "nav",
          icon: () => h("span", { class: "menu-icon" }, [h(HomeIcon)]),
          path: "/nav",
          extra: sys.value.books > 0 ? sys.value.books.toString() : undefined,
        },
        {
          label: "出版社",
          key: "publisher",
          icon: () => h("span", { class: "menu-icon" }, [h(BusinessIcon)]),
          path: "/publisher",
          extra:
            sys.value.publishers > 0
              ? sys.value.publishers.toString()
              : undefined,
        },
        {
          label: "作者",
          key: "author",
          icon: () => h("span", { class: "menu-icon" }, [h(PeopleIcon)]),
          path: "/author",
          extra:
            sys.value.authors > 0 ? sys.value.authors.toString() : undefined,
        },
        {
          label: "标签",
          key: "tag",
          icon: () => h("span", { class: "menu-icon" }, [h(TagIcon)]),
          path: "/tag",
          extra: sys.value.tags > 0 ? sys.value.tags.toString() : undefined,
        },
        {
          label: "丛书",
          key: "series",
          icon: () => h("span", { class: "menu-icon" }, [h(BookmarkIcon)]),
          path: "/series",
          extra: sys.value.series > 0 ? sys.value.series.toString() : undefined,
        },
        {
          label: "评分",
          key: "rating",
          icon: () => h("span", { class: "menu-icon" }, [h(StarIcon)]),
          path: "/rating",
        },
        {
          label: "热度榜单",
          key: "hot",
          icon: () => h("span", { class: "menu-icon" }, [h(TrendingUpIcon)]),
          path: "/hot",
        },
        {
          label: "所有书籍",
          key: "recent",
          icon: () => h("span", { class: "menu-icon" }, [h(HistoryIcon)]),
          path: "/recent",
        },
      ],
    },
  ];

  const friendLinks =
    sys.value.friends.length > 0
      ? [
          {
            label: "友情链接",
            key: "nav-friends",
            type: "group",
            children: sys.value.friends.map((friend) => ({
              label: friend.text,
              key: `friend-${friend.href}`,
              icon: friend.icon
                ? () =>
                    h("span", { class: "menu-icon" }, [
                      h("i", { class: friend.icon }),
                    ])
                : undefined,
              path: friend.href,
              external: true,
            })),
          },
        ]
      : [];

  const sysLinks = [
    {
      label: "系统",
      key: "nav-system",
      type: "group",
      children: [
        {
          label: "系统版本",
          key: "version",
          icon: () => h("span", { class: "menu-icon" }, [h(InformationIcon)]),
          extra: sys.value.version ? sys.value.version.toString() : undefined,
        },
        {
          label: "用户数",
          key: "users",
          icon: () => h("span", { class: "menu-icon" }, [h(PeopleIcon)]),
          extra: sys.value.users > 0 ? sys.value.users.toString() : undefined,
        },
      ],
    },
  ];

  return [
    ...homeLinks,
    ...adminLinks,
    ...navLinks,
    ...friendLinks,
    ...sysLinks,
  ];
});

// 消息选项
const messageOptions = computed(() => {
  return messages.value.map((msg) => ({
    label: () =>
      h("div", { class: "message-item" }, [
        h("div", { class: "message-content" }, [
          h("div", { class: "message-text" }, msg.data.message),
          h("div", { class: "message-time" }, msg.create_time),
        ]),
      ]),
    key: msg.id,
  }));
});

// 用户菜单选项
const userMenuOptions = computed(() => {
  return [
    {
      label: "用户中心",
      key: "user-detail",
      icon: () => h("span", { class: "menu-icon" }, [h(ContactsIcon)]),
      path: "/user/detail",
    },
    {
      label: "阅读记录",
      key: "user-history",
      icon: () => h("span", { class: "menu-icon" }, [h(HistoryIcon)]),
      path: "/user/history",
    },
    {
      label: "反馈",
      key: "feedback",
      icon: () => h("span", { class: "menu-icon" }, [h(ChatbubblesIcon)]),
      path: "https://github.com/talebook/talebook/issues",
      external: true,
    },
    ...(user.value.is_admin
      ? [
          {
            type: "divider",
            key: "d1",
          },
          {
            label: "管理员入口",
            key: "admin-settings",
            icon: () =>
              h(
                "span",
                { class: "menu-icon", style: "color: var(--error-color)" },
                [h(SettingsIcon)]
              ),
            path: "/admin/settings",
          },
        ]
      : []),
    {
      type: "divider",
      key: "d2",
    },
    {
      label: "退出",
      key: "logout",
      icon: () => h("span", { class: "menu-icon" }, [h(LogOutIcon)]),
      path: "/logout",
    },
  ];
});

// 方法
const chunk = (arr, len) => {
  const e = arr.length;
  const r = [];
  for (let idx = 0; idx < e; idx += len) {
    const n = Math.min(idx + len, e);
    r.push(arr.slice(idx, n));
  }
  return r;
};

const doSearch = () => {
  if (search.value.trim() !== "") {
    router.push(`/search?name=${search.value.trim()}`);
  }
};

const doMobileSearch = () => {
  if (search.value.trim() !== "") {
    router.push(`/search?name=${search.value.trim()}`);
  } else {
    mobileSearchRef.value?.focus();
  }
};

const handleMessageSelect = (key) => {
  const index = messages.value.findIndex((msg) => msg.id === key);
  if (index !== -1) {
    hideMessage(index, key);
  }
};

const handleUserMenuSelect = (key, option) => {
  if (option.path) {
    if (option.external) {
      window.open(option.path, "_blank");
    } else {
      router.push(option.path);
    }
  }
};

const handleMenuClick = (key) => {
  // 查找菜单项
  const findMenuItem = (items) => {
    for (const item of items) {
      if (item.key === key && item.path) {
        return item;
      }
      if (item.children) {
        const found = findMenuItem(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  // 在所有菜单选项中查找
  const menuItem = findMenuItem(menuOptions.value);
  if (menuItem) {
    router.push(menuItem.path);
  }
};

const hideMessage = async (index, msgId) => {
  try {
    const rsp = await $backend("/user/messages", {
      method: "POST",
      body: JSON.stringify({ id: msgId }),
    });

    if (rsp.err === "ok") {
      messages.value.splice(index, 1);
    } else {
      message.error("操作失败");
    }
  } catch (error) {
    message.error("网络错误");
  }
};

// 生命周期
onMounted(async () => {
  try {
    const rsp = await $backend("/user/info");
    err.value = rsp.err;
    sys.value = rsp.sys;
    user.value = rsp.user;
    mainStore.login(rsp);
    mainStore.set_title(rsp.sys.title);

    // 获取消息
    const msgRsp = await $backend("/user/messages");
    if (msgRsp.err === "ok") {
      messages.value = msgRsp.messages;
    }
  } catch (error) {
    console.error("Failed to fetch user info:", error);
  }

  // 设置初始侧边栏状态
  // sidebar.value = !isMobile.value;
});
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.header {
  background-color: var(--primary-color);
  color: white;
  padding: 0 16px;
  height: 64px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.site-title {
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
}

.search-box {
  width: 200px;
}

.mobile-search {
  padding: 12px 16px;
  background-color: var(--primary-color);
  display: flex;
  gap: 8px;
}

.user-avatar {
  cursor: pointer;
}

.menu-icon {
  font-size: 18px;
}

.message-item {
  padding: 8px 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-text {
  font-weight: 500;
}

.message-time {
  font-size: 0.8rem;
  color: var(--text-color-3);
}
</style>
