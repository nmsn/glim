import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";
// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
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
