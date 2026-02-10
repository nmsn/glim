# Glim

> 一款强大的浏览器扩展，让你一眼洞悉网站信息。

<p align="center">
  <img src="public/icon/128.png" alt="Glim Logo" width="128" height="128">
</p>

<p align="center">
  <a href="README.md">English</a> | 中文
</p>

## ✨ 功能特性

Glim 是一款浏览器扩展，可直接从浏览器工具栏提供全面的网站分析。只需单击一下，即可访问您正在访问的任何网站的详细信息。

### 核心功能

- **🔍 基础信息**：域名、协议、页面标题、字符编码
- **🌐 DNS 解析**：IP 地址及地理位置地图展示
- **📡 服务器位置**：服务器位置的视觉地图显示，包含 ISP 信息
- **🔒 安全检测**：检查 HTTP 安全头（HSTS、CSP、X-Frame 等）
- **🏷️ 社交标签**：Open Graph、Twitter Cards、规范 URL
- **📋 响应头**：完整的 HTTP 响应头列表
- **⚡ 实时分析**：弹出窗口打开时自动获取数据

### 界面设计

- 赛博朋克科技美学，高对比度配色
- 数据展示使用等宽字体
- 直角几何设计
- 动态扫描线和状态指示器
- 针对弹出界面优化的响应式布局

## 🚀 安装

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/nmsn/glim.git
cd glim

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 构建

```bash
# 构建 Chrome 版本
pnpm build

# 构建 Firefox 版本
pnpm build:firefox

# 创建分发压缩包
pnpm zip
```

## 🛠️ 技术栈

- **[WXT](https://wxt.dev/)** - 下一代 Web 扩展框架
- **React 19** - 带 Hooks 的 UI 库
- **TypeScript** - 类型安全开发
- **Tailwind CSS v4** - 实用优先的样式
- **浏览器 API**：
  - `webRequest` - 捕获响应头
  - `dns` - DNS 解析
  - `tabs` - 访问当前标签页信息
  - 内容脚本 - 提取页面元数据

## 📁 项目结构

```
entrypoints/
├── popup/              # 弹出界面
│   ├── App.tsx        # 主组件
│   ├── style.css      # 全局样式
│   └── components/    # UI 组件
├── background.ts      # 后台服务
├── content.ts         # 内容脚本
└── utils/             # 工具函数
    ├── page-info.ts   # 页面元数据提取
    ├── headers.ts     # 响应头
    ├── dns.ts         # DNS 解析
    ├── server-location.ts  # IP 地理位置
    ├── http-security.ts    # 安全头检查
    └── social-tag.ts       # 社交元标签
```

## 🎨 设计系统

详细的 design 规范请参见 [UI-DESIGN-SPEC.md](./UI-DESIGN-SPEC.md)。

### 配色方案

- **主色**：`#f5c518`（黄色）- 强调色
- **辅色**：`#00d084`（绿色）- 成功状态
- **背景**：`#0a0a0b`（深色）- 主背景
- **文字**：`#e8e8e8`（浅色）- 主文字

### 字体

- **展示字体**：Orbitron - 标题
- **等宽字体**：Share Tech Mono - 数据和数值

## 🔒 权限说明

- `dns` - DNS 解析
- `webRequest` - 捕获 HTTP 头
- `activeTab` - 访问当前标签页
- `host_permissions: <all_urls>` - 分析任何网站

## 📄 开源协议

[MIT](./LICENSE)

## 🙏 致谢

本项目灵感来源于 [web-check](https://github.com/Lissy93/web-check)，这是由 Lissy93 开发的一款优秀的网站 OSINT 全能工具。

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nmsn">nmsn</a>
</p>
