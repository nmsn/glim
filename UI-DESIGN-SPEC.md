# WebInfo Pro - 浏览器插件 UI 设计规范

## 设计概述

这是一个面向技术用户群体的浏览器插件界面，设计风格为**赛博朋克科技感**，强调信息的清晰展示和工业美学。

### 设计理念
- **风格定位**：科技感、工业风、赛博朋克
- **核心特征**：直角设计（无圆角）、等宽字体、高对比度配色
- **信息架构**：紧凑的两列网格布局，最大化空间利用率
- **视觉层次**：通过颜色（黄/绿/灰黑）区分信息重要性

---

## 颜色系统

### CSS 变量定义

```css
:root {
  /* 背景色 */
  --bg-primary: #0a0a0b;      /* 最深背景 - 页面底色 */
  --bg-secondary: #141416;    /* 次级背景 - 容器底色 */
  --bg-tertiary: #1c1c1f;     /* 三级背景 - 表头、卡片 */
  
  /* 主题色 */
  --yellow: #f5c518;          /* 主强调色 - 标题、高亮 */
  --yellow-dim: #b3920f;      /* 弱化黄 - 次要高亮 */
  --green: #00d084;           /* 成功/状态色 - 安全指示 */
  --green-dim: #00965f;       /* 弱化绿 - 阴影、背景 */
  
  /* 中性色 */
  --gray-light: #a0a0a0;      /* 次要文字 */
  --gray-medium: #606060;     /* 标签、说明文字 */
  --gray-dark: #2a2a2c;       /* 分割线、边框 */
  
  /* 功能色 */
  --border-color: #333335;    /* 通用边框 */
  --text-primary: #e8e8e8;    /* 主要文字 */
  --text-secondary: #909090;  /* 次要文字 */
}
```

### 颜色使用规范

| 场景 | 颜色 | 用途 |
|------|------|------|
| 页面标题 | --yellow | 品牌标识、主标题 |
| 成功状态 | --green | HTTPS、安全指示 |
| 高亮数据 | --yellow | 域名、关键数值 |
| 标签文字 | --gray-medium | 字段名称、说明 |
| 边框 | --border-color | 所有容器边框 |
| 分割线 | --gray-dark | 区块分隔 |

---

## 字体规范

### 字体家族

```css
/* 标题字体 - 科技感 */
font-family: 'Orbitron', sans-serif;

/* 正文字体 - 等宽 */
font-family: 'Share Tech Mono', monospace;
```

### Google Fonts 引用

```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
```

### 字体大小层级

| 元素 | 字体 | 大小 | 字重 | 字间距 | 转换 |
|------|------|------|------|--------|------|
| 主标题 | Orbitron | 12px | 600 | 1px | uppercase |
| 区块标题 | Orbitron | 10px | 500 | 0.5px | uppercase |
| 数据值 | Share Tech Mono | 10px | 400 | - | - |
| 数据标签 | Share Tech Mono | 8px | 400 | 0.3px | uppercase |
| 位置标签 | Share Tech Mono | 7px | 400 | 0.3px | uppercase |
| 按钮文字 | Orbitron | 9px | 500 | 0.5px | uppercase |
| URL 文字 | Share Tech Mono | 9px | 400 | - | - |
| 坐标文字 | Share Tech Mono | 8px | 400 | - | - |

### 行高

- **全局行高**：1.4
- **数据项内**：label 与 value 间距 2px

---

## 间距系统

### 容器间距

```css
/* 插件容器 */
max-width: 360px;
padding: 8px;  /* body 内边距 */

/* 内容区内边距 */
.content { padding: 8px; }

/* 区块间距 */
.section { margin-bottom: 10px; }
```

### 组件间距

| 元素 | 内边距 | 外边距 |
|------|--------|--------|
| 头部 header | 10px 8px | - |
| 数据项 data-item | 6px 8px | - |
| 位置行 location-row | 4px 8px | - |
| 安全卡片 security-status | 8px | - |
| 底部按钮 footer | 8px | - |
| 按钮 btn | 6px 8px | - |

### Grid 间距

```css
/* 两列网格 */
.two-col-grid {
  gap: 1px;  /* 极窄间隙 */
}

/* 位置+地图网格 */
.location-section {
  grid-template-columns: 100px 1fr;
  gap: 1px;
}
```

---

## 边框规范

### 边框宽度

| 场景 | 宽度 | 颜色 |
|------|------|------|
| 主容器 | 1px | --border-color |
| 数据表格外框 | 1px | --border-color |
| 单元格分割线 | 1px | --border-color |
| 按钮主边框 | 1px | --gray-dark |
| 头部下划线 | 1px | --yellow |
| URL 左侧条 | 2px | --green |
| 区块标题下划线 | 1px | --gray-dark |

### 圆角规则

**所有元素使用直角（0px 圆角）**，包括：
- 容器、卡片
- 按钮
- 输入框（如有）
- 标签、徽章
- 地图标记

### 装饰性边角

容器四角使用伪元素创建装饰边框：

```css
.plugin-container::before,
.plugin-container::after {
  width: 20px;
  height: 20px;
  border: 1px solid var(--yellow);
}
/* 左上角：无边框右下 */
/* 右下角：无边框左上 */
```

---

## 布局系统

### 整体结构

```
plugin-container (360px max)
├── scanline (扫描线动画)
├── header (头部)
│   ├── header-top (状态指示 + 标题)
│   └── current-url (URL 显示)
├── content (内容区)
│   └── section (多个区块)
│       ├── section-header (标题栏)
│       └── 内容区 (两列网格或其他)
└── footer (底部按钮区)
```

### 核心布局模式

#### 1. 两列网格 (.two-col-grid)

```css
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border-color);  /* 间隙颜色 */
  border: 1px solid var(--border-color);
}
```

**适用场景**：基础信息、DNS 解析、响应头

#### 2. 位置+地图组合 (.location-section)

```css
.location-section {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1px;
}
```

**结构**：
- 左侧：4 行位置信息 (100px 宽)
- 右侧：MapChart 地图组件

#### 3. 安全状态卡片 (.security-status)

```css
.security-status {
  display: flex;
  gap: 8px;
  padding: 8px;
}
```

---

## 组件规范

### 数据项组件 (.data-item)

```css
.data-item {
  background: var(--bg-primary);
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
```

**内部结构**：
- .data-item-label：8px，灰色，大写
- .data-item-value：10px，白色，等宽字体

**跨列显示**：`grid-column: span 2;`

### IP 标签 (.ip-tag)

```css
.ip-tag {
  display: inline-flex;
  padding: 2px 5px;
  background: var(--bg-secondary);
  border: 1px solid var(--gray-dark);
  font-size: 9px;
  color: var(--green);
}
```

**前缀**：`◆` 符号（6px，黄色）

### 按钮 (.btn)

**主按钮** (.btn-primary)：
- 背景：--yellow
- 文字：--bg-primary（黑色）
- 悬停：--yellow-dim + 发光阴影

**次按钮** (.btn-secondary)：
- 背景：透明
- 边框：1px solid --gray-dark
- 悬停：边框变绿，文字变绿

### 地图占位 (.map-placeholder)

```css
.map-placeholder {
  min-height: 100px;
  background: 
    linear-gradient(135deg, rgba(0, 208, 132, 0.05) 0%, transparent 50%),
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(51, 51, 53, 0.3) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(51, 51, 53, 0.3) 20px);
}
```

**标记点** (.map-marker)：
- 12px x 12px 绿色方块
- 脉冲扩散动画（20px 和 28px 两层波纹）
- 右下角坐标文字

---

## 动效规范

### 脉冲动画 (pulse)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
/* 用于：状态指示器 (2s ease-in-out infinite) */
```

### 扫描线动画 (scan)

```css
@keyframes scan {
  0% { transform: translateY(0); }
  100% { transform: translateY(500px); }
}
/* 用于：装饰扫描线 (3s linear infinite) */
```

### 波纹动画 (ripple)

```css
@keyframes ripple {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}
/* 用于：地图标记点扩散效果 (2s ease-out infinite) */
```

### 悬停效果

- 数据行：`background: rgba(245, 197, 24, 0.05);`
- 主按钮：`box-shadow: 0 0 10px rgba(245, 197, 24, 0.3);`
- 次按钮：`border-color: var(--green); color: var(--green);`

---

## 滚动条样式

```css
::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--gray-dark);
}
```

---

## 特殊文字样式

### 高亮值 (.value-highlight)
- 颜色：--yellow
- 字重：600

### 成功值 (.value-success)
- 颜色：--green

### 等宽值 (.value-mono)
- 字体：Share Tech Mono
- 字间距：0.3px

---

## 响应式适配

本设计针对固定宽度的浏览器插件面板（max-width: 360px），无需响应式断点。

---

## 组件复用清单

### React/Vue 组件建议

1. **Section** - 区块容器（标题 + 内容）
2. **TwoColGrid** - 两列网格布局
3. **DataItem** - 标签+值数据项
4. **IpTag** - IP 地址标签
5. **LocationMap** - 位置信息+地图组合
6. **MapChart** - 地图组件（需接入真实地图库）
7. **SecurityCard** - 安全状态卡片
8. **Button** - 按钮（primary/secondary）
9. **Scanline** - 扫描线装饰
10. **StatusIndicator** - 脉冲状态指示器

---

## 设计原则总结

1. **直角美学**：所有元素零圆角，强化科技感
2. **紧凑布局**：1px 间隙，最小化内边距（6-8px）
3. **信息密度**：两列网格最大化空间利用
4. **颜色编码**：黄=高亮/品牌，绿=成功/状态，灰=辅助
5. **等宽字体**：所有数据使用 Share Tech Mono
6. **装饰细节**：角落边框、扫描线、脉冲动画增强科技氛围