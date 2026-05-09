import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";
// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    icons: {
      "16": "/icon-16.png",
      "32": "/icon-32.png",
      "48": "/icon-48.png",
      "128": "/icon-128.png",
    },
    action: {
      default_icon: {
        "16": "/icon-16.png",
        "32": "/icon-32.png",
        "48": "/icon-48.png",
        "128": "/icon-128.png",
      },
    },
    permissions: ["dns", "webRequest"],
    host_permissions: [
      'https://dns.google/*',
      'https://cloudflare-dns.com/*',
      'http://ip-api.com/*',
      '<all_urls>'
    ],
  },
  // 配置启动时打开的页面
  runner: {
    // Chromium 启动参数，可以指定打开的 URL
    chromiumArgs: ['https://www.baidu.com'],
  },
});
