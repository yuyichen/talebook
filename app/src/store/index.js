import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    nav: true,
    loading: true,
    count: 0,
    user: {
      is_admin: false,
      is_login: false,
      nickname: "",
      kindle_email: "",
      avatar: "",
    },
    alert: {
      to: "",
      msg: "",
      type: "",
      show: false,
    },
    sys: {
      socials: [],
      allow: {},
    },
    site_title: "首页",
    site_title_template: "%s | talebook"
  }),

  actions: {
    loading() {
      this.loading = true
    },

    loaded() {
      this.loading = false
    },

    navbar(nav) {
      this.nav = nav
    },

    increment() {
      this.count++
    },

    login(data) {
      if (data !== undefined) {
        this.sys = data.sys
        this.user = data.user
      }
    },

    alert(v) {
      this.alert.to = v.to
      this.alert.type = v.type
      this.alert.msg = v.msg
      this.alert.show = true
    },

    close_alert() {
      this.alert.show = false
    },

    set_title(v) {
      this.site_title_template = ' %s | ' + v
    }
  }
})
