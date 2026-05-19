# Glim

> 一款强大的浏览器扩展，可快速分析网站信息。

<p align="center">
  <img src="public/icon/128.png" alt="Glim Logo" width="128" height="128">
</p>

<p align="center">
  <a href="README.md">English</a> | 中文
</p>

## ✨ 功能特点

Glim 是一款浏览器扩展，可直接从工具栏获取网站的详细分析信息。只需点击一次，即可查看所访问网站的完整信息。

### 核心功能

- **🔍 基本信息**：标题、描述、关键词、字符编码、网站图标
- **🌐 IP 与地理定位**：IP 地址可视化地图展示
- **📡 服务器位置**：服务器位置地图与 ISP 信息
- **🔒 安全头信息**：检测 HTTP 安全头（HSTS、CSP、X-Frame 等）
- **🏷️ 社交元标签**：Open Graph、Twitter Cards、规范链接
- **📋 响应头信息**：完整的 HTTP 响应头列表
- **⚡ 技术栈检测**：识别前端框架、UI 库、CDN、构建工具等
- **⚡ 实时分析**：打开弹窗时自动获取数据

### 界面设计

- **赛博朋克美学**：高对比度暗色主题，锐利几何设计
- **等宽字体排版**：JetBrains Mono 清晰数据显示
- **直角设计**：无圆角，野兽派风格界面
- **交互动画**：
  - 扫描线效果与发光文字
  - 逐字符文字扰动动画
  - 悬停触发高亮效果
- **响应式布局**：专为弹窗界面优化

### 技术栈检测

通过以下方式识别网站使用的技术：

- **前端框架**：React、Vue、Angular、Svelte、Next.js、Nuxt 等
- **UI/CSS 框架**：Tailwind CSS、Bootstrap、Bulma 等
- **JavaScript 库**：jQuery、Preact、Lit、Alpine.js 等
- **构建工具与运行时**：Webpack、Vite、Babel、Node.js
- **CDN 提供商**：Cloudflare、jsDelivr、unpkg 等
- **后端提示**：通过 HTTP 头检测服务器软件
- **置信度级别**：高/中/低，带可视化指示器

## 🚀 安装

### 开发

```bash
# 克隆仓库
git clone https://github.com/nmsn/glim.git
cd glim

# 安装依赖
pnpm install

# 启动开发服务器（Chrome）
pnpm dev

# 启动开发服务器（Firefox）
pnpm dev:firefox
```

### 构建

```bash
# 构建 Chrome 版本
pnpm build

# 构建 Firefox 版本
pnpm build:firefox

# 创建分发 zip 包
pnpm zip
```

### 类型检查

```bash
pnpm compile
```

## 🛠️ 技术栈

- **[WXT](https://wxt.dev/)** - 新一代 Web 扩展框架
- **React 19** - UI 库与 Hooks
- **TypeScript** - 类型安全开发
- **Tailwind CSS v4** - 实用优先样式（通过 `@tailwindcss/vite`）
- **react-simple-maps** - 交互式地图可视化
- **react-i18next** - 国际化支持（en、zh-CN）
- **浏览器 API**：
  - `webRequest` - 捕获响应头
  - `dns` - DNS 解析
  - `tabs` - 访问当前标签页信息
  - Content Scripts - 提取页面元数据

## 📁 项目结构

```
entrypoints/
├── popup/              # 弹窗 UI（React）
│   ├── App.tsx         # 主组件
│   ├── style.css       # 全局样式与 CSS 变量
│   ├── components/     # UI 组件
│   │   ├── GlowCard.tsx        # 发光边框动画卡片
│   │   ├── KeyValueCard.tsx    # 键值显示卡片
│   │   ├── ServerLocationCard.tsx  # IP + 地图可视化
│   │   ├── PageInfoCard.tsx    # 基本页面信息
│   │   ├── SecurityCard.tsx    # 安全头信息显示
│   │   ├── SocialTagsCard.tsx  # 社交元标签
│   │   ├── HeadersCard.tsx     # 响应头信息
│   │   ├── TechStackCard.tsx   # 技术栈检测
│   │   └── MapChart.tsx       # 地图组件（懒加载）
│   └── locales/        # i18n 翻译（en、zh-CN）
├── background.ts       # Service Worker
│                      # - HTTP 头缓存
│                      # - IP 地理定位查询
│                      # - 消息传递
├── content.ts         # Content Script
│                      # - 页面数据收集
│                      # - 社交元标签提取
│                      # - 网站图标检测
└── utils/             # 工具函数
    ├── tech-stack/     # 技术栈检测
    │   ├── rule-loader.ts      # 规则文件加载
    │   ├── page-detector.ts    # 基于页面的检测
    │   ├── header-detector.ts  # 基于头信息的检测
    │   ├── merge.ts            # 结果合并
    │   └── types.ts            # TypeScript 类型定义
    ├── page-info.ts    # 页面元数据提取
    ├── headers.ts      # 响应头获取
    ├── http-security.ts    # 安全头检查
    ├── social-tag.ts   # 社交元标签
    ├── server-location.ts  # IP 地理定位
    └── get-ip.ts       # DNS 解析

public/
└── rules/              # 技术栈检测规则
    ├── index.json      # 规则索引
    ├── page/           # 基于页面的检测规则
    └── headers/        # 基于头信息的检测规则
```

## 🎨 设计系统

详见 [UI-DESIGN-SPEC.md](./UI-DESIGN-SPEC.md)。

### 颜色方案

| 变量 | 值 | 用途 |
|------|-----|------|
| `--color-bg` | `#0d0d0d` | 背景色 |
| `--color-fg` | `#e0e0e0` | 文字色 |
| `--color-accent` | `#ffffff` | 高亮、发光效果 |
| `--color-border` | `#333333` | 边框 |
| `--color-muted` | `#777777` | 次要文字 |
| `--color-hover` | `#1a1a1a` | 悬停背景 |

### 字体

- **Display**：Orbitron - 标题与标签
- **Mono**：JetBrains Mono / Share Tech Mono - 数据与数值

### 主题

- **暗色**（默认）：高对比度暗色主题
- **亮色**：亮色主题变体（`.light-theme` 类）
- **跟随系统**：遵循 `prefers-color-scheme`

## 🔒 权限

- `dns` - IP 检测的 DNS 解析
- `webRequest` - 用于安全分析捕获 HTTP 头
- `activeTab` - 访问当前标签页信息
- `host_permissions: <all_urls>` - 分析任意网站

## 📄 许可证

[MIT](./LICENSE)

## 🙏 致谢

灵感来自 [web-check](https://github.com/Lissy93/web-check) by Lissy93，一款优秀的网站 OSINT 工具。

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

---

<p align="center">
  由 ❤️ 为 <a href="https://github.com/nmsn">nmsn</a> 制作
</p>