# Glim - Codebase Overview

## 项目概览

| 项目 | 内容 |
|------|------|
| 项目名称 | Glim |
| 描述 | 浏览器扩展，一键分析网站信息（IP、地理位置、安全头、社交标签等） |
| 技术栈 | WXT + React 19 + TypeScript + Tailwind CSS v4 |
| 包管理器 | pnpm |
| 代码规模 | ~2,100 行 TypeScript/TSX |
| UI 风格 | 赛博朋克/粗野主义，CRT 扫描线效果，无圆角设计 |

## 目录结构

```
glim/
├── entrypoints/              # WXT 入口点
│   ├── background.ts         # Service Worker（后台脚本）
│   ├── content.ts            # 内容脚本（页面数据提取）
│   └── popup/                # 弹出窗口 UI
│       ├── App.tsx           # 主组件，数据获取编排
│       ├── main.tsx          # React 入口，主题初始化
│       ├── style.css         # 全局样式 + CSS 变量主题系统
│       ├── i18n.ts           # i18next 初始化
│       ├── locales/          # 国际化资源（en, zh-CN）
│       └── components/       # UI 组件
│           ├── GlowCard.tsx          # 基础卡片（悬停发光边框）
│           ├── ServerLocationCard.tsx # IP 列表 + 地图
│           ├── PageInfoCard.tsx      # 页面基本信息
│           ├── SecurityCard.tsx      # 安全头检查
│           ├── SocialTagsCard.tsx    # 社交元标签
│           ├── HeadersCard.tsx       # 响应头列表
│           ├── ScrambleText.tsx      # 文字扰乱动画
│           ├── CharScan.tsx          # 字符扫描动画
│           ├── MapChart.tsx          # 地图可视化
│           ├── FaviconDisplay.tsx    # 网站图标显示
│           ├── KeyValueCard.tsx      # 键值对卡片
│           └── KeyValueRow.tsx       # 键值对行
├── utils/                    # 工具函数
│   ├── get-ip.ts             # DNS-over-HTTPS 解析
│   ├── dns.ts                # DNS 查询辅助
│   ├── server-location.ts    # IP 地理定位（ip-api.com）
│   ├── headers.ts            # 从后台获取响应头
│   ├── http-security.ts      # 安全头检查
│   ├── social-tag.ts         # 社交标签提取（内容脚本）
│   ├── social-tag-popup.ts   # 社交标签（弹窗端）
│   ├── page-info.ts          # 页面元数据提取
│   ├── favicon.ts            # 网站图标获取
│   ├── middleware.ts         # HTTP 请求工具
│   └── getLocation.ts        # 地理位置辅助
├── assets/                   # 静态资源
│   └── map-features.json     # 地图 GeoJSON 数据
├── public/                   # 扩展图标
│   └── icon/                 # 多尺寸图标
├── wxt.config.ts             # WXT 配置（manifest、权限）
├── package.json
└── tsconfig.json
```

## 关键组件

| 组件 | 职责 | 文件 |
|------|------|------|
| Background Service Worker | 缓存 HTTP 响应头，处理服务器位置查询 | `entrypoints/background.ts` |
| Content Script | 提取页面社交标签和网站图标 | `entrypoints/content.ts` |
| App (Popup) | 数据获取编排，并行请求 5 个数据源 | `entrypoints/popup/App.tsx` |
| GlowCard | 带悬停发光动画的基础卡片容器 | `components/GlowCard.tsx` |
| ServerLocationCard | IP 列表展示 + 交互式地图 | `components/ServerLocationCard.tsx` |

## 技术特点

### 浏览器扩展架构
- **WXT 框架**：自动处理 manifest.json、HMR、构建
- **三层架构**：Background（Service Worker）→ Content Script → Popup（React）
- **消息传递**：Popup ↔ Background 通过 `browser.runtime.sendMessage` 通信

### 数据获取策略
- 5 个数据源并行请求（IP、页面信息、响应头、安全头、社交标签）
- 响应头在 Background 中按 URL 缓存，避免重复请求
- DNS 解析使用 Google/Cloudflare DNS-over-HTTPS
- IP 地理定位在 Background 中调用，避免 CORS 限制

### 主题系统
- CSS 变量驱动，支持深色/浅色/跟随系统三种模式
- 状态持久化到 `localStorage`
- 通过 `prefers-color-scheme` 媒体查询检测系统主题

### 国际化
- react-i18next，支持英文和简体中文
- 自动检测浏览器语言，默认回退英文
- 语言偏好持久化到 `localStorage`

## 外部依赖

| 依赖 | 用途 |
|------|------|
| `react-simple-maps` | 地图可视化（ServerLocationCard） |
| `lucide-react` | 图标库 |
| `tailwind-merge` | Tailwind 类名合并 |
| `ip-api.com` | IP 地理定位 API |
| Google/Cloudflare DNS | DNS-over-HTTPS 解析 |

## 组件组合关系

```
App.tsx
├── ScrambleText("GLIM")
├── ServerLocationCard
│   └── GlowCard
│       ├── KeyValueRow (location, coords, IP, ISP)
│       └── MapChart (react-simple-maps)
├── PageInfoCard
│   └── KeyValueCard
│       ├── GlowCard
│       └── KeyValueRow (title, URL, content-type, charset)
│       └── FaviconDisplay
├── SocialTagsCard
│   └── GlowCard
├── SecurityCard
│   └── GlowCard
└── HeadersCard
    └── GlowCard
```

## 入口点分析

### main.tsx → App.tsx

1. `initTheme()` 在 React 挂载前执行，防止主题闪烁
2. `i18n.ts` 导入触发 i18next 初始化
3. `App` 组件 `useEffect` 触发 `fetchAllData()`

### background.ts

- 注册 `webRequest.onHeadersReceived` 监听器（全局，所有 main_frame 请求）
- 注册 `runtime.onMessage` 监听器处理两种消息类型
- 使用 `Map<normalizedUrl, headers>` 缓存响应头

### content.ts

- 注册为 `<all_urls>` 匹配的内容脚本
- 注册 `runtime.onMessage` 监听器处理两种消息类型
- 页面加载时自动执行 `getSocialTags()`（调试代码）

## 构建产物

- Chrome 扩展：`pnpm build` → `.output/`
- Firefox 扩展：`pnpm build:firefox`
- 分发包：`pnpm zip`
