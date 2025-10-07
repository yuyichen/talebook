// 导入 useMainStore
import { useMainStore } from '~/store'

export default defineNuxtPlugin({
  name: 'talebook',
  dependsOn: ['pinia'],
  setup(nuxtApp) {
    // 获取运行时配置
    const runtimeConfig = nuxtApp.$config;

    // 提供全局的 alert 方法
    nuxtApp.provide("alert", function (alert_type, alert_msg, alert_to) {
      // 使用 Pinia store 而不是 Vuex
      const pinia = nuxtApp.$pinia;
      if (pinia) {
        const mainStore = useMainStore(pinia);
        mainStore.alert({
          type: alert_type,
          msg: alert_msg,
          to: alert_to,
        });
        if (alert_type === "success") {
          setTimeout(() => {
            mainStore.close_alert();
          }, 1300);
        }
      }
    });

    // 提供全局的 backend 方法
    nuxtApp.provide("backend", function (url, options) {
      if (url === undefined) {
        throw "url is undefined ";
      }

      var args = {
        mode: "cors",
        redirect: "follow",
        credentials: "include",
      };

      var server = "";

      if (process.server) {
        if (nuxtApp.ssrContext?.req !== undefined) {
          // 某些NAS用户会在外面套一层反向代理，docker内无法访问该URL
          // 强制服务器地址为本机；通过 XFH 传递实际访问的域名
          server = runtimeConfig.public.api_url || runtimeConfig.public.apiBase || "http://localhost:1000";
          var headers = nuxtApp.ssrContext.req.headers;
          args.headers = {
            cookie: headers.cookie,
            "X-Forwarded-Host": headers.host,
            "X-Forwarded-For": headers["x-forwarded-for"],
            "X-Forwarded-Proto": headers["x-forwarded-proto"],
            "X-Scheme": headers["x-scheme"],
          };
        }
      } else {
        // server = window.location.origin;
        server = "http://localhost:1000";
      }

      var full_url = server + "/api" + url;

      if (options !== undefined) {
        Object.assign(args, options);
      }

      // 使用全局的 $fetch
      return $fetch(full_url, args)
        .catch((error) => {
          // $fetch 会自动处理 HTTP 错误状态码，这里捕获网络错误或其他异常
          if (error.response) {
            // 如果有响应，但状态码不是 2xx
            const status = error.response.status;
            if (status === 413) {
              var msg =
                "服务器响应了413异常状态码。<br/>可能是上传的文件过大，超过了服务器设置的上传大小。";
              nuxtApp.$alert("error", msg);
              throw msg;
            }

            if (status === 502) {
              var msg = "服务器正在启动中...";
              nuxtApp.$alert("info", msg);
              throw msg;
            }

            if (status !== 200) {
              var msg =
                "服务器异常，状态码: " +
                status +
                "<br/>请查阅服务器日志:<br/>talebook.log";
              nuxtApp.$alert("error", msg);
              throw msg;
            }
          } else {
            // 网络错误或其他异常
            var msg = "网络错误: " + error.message;
            nuxtApp.$alert("error", msg);
            throw msg;
          }
        })
        .then((rsp) => {
          // 使用 nuxtApp 的 router 实例
          const router = nuxtApp.$router;

          if (rsp.err === "not_installed") {
            router.push("/install");
          } else if (rsp.err === "not_invited") {
            var route = nuxtApp.$route;
            var next = route.fullPath;
            next = next ? "?next=" + next : "";
            if (route.path !== "/welcome") {
              router.push("/welcome" + next);
            }
          } else if (rsp.err === "user.need_login") {
            router.push("/login");
          } else if (rsp.err === "exception") {
            // 使用 Pinia store 而不是 Vuex
            const pinia = nuxtApp.$pinia;
            if (pinia) {
              const mainStore = useMainStore(pinia);
              mainStore.alert({
                type: "error",
                msg: rsp.msg,
                to: null,
              });
            }
          }
          return rsp;
        });
    });
  }
});