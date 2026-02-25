# TerminalStart UI 设计规范完整版

> 基于 [TerminalStart](https://github.com/TheCSir/TerminalStart) 项目的设计风格规范
> 
> 版本: 1.0 | 适用于: React + Tailwind CSS 项目

---

## 目录

1. [设计理念](#1-设计理念)
2. [色彩系统](#2-色彩系统)
3. [排版规范](#3-排版规范)
4. [CSS 变量](#4-css-变量)
5. [边框发光效果](#5-边框发光效果)
6. [文字发光效果](#6-文字发光效果)
7. [链接动画](#7-链接动画)
8. [CRT 复古效果](#8-crt-复古效果)
9. [滚动条样式](#9-滚动条样式)
10. [组件圆角](#10-组件圆角)
11. [动画时长参考](#11-动画时长参考)
12. [实用 CSS 类](#12-实用-css-类)
13. [完整 CSS 代码](#13-完整-css-代码)
14. [使用示例](#14-使用示例)

---

## 1. 设计理念

- **终端美学**: 模仿经典命令行界面，使用等宽字体
- **暗色优先**: 默认深色主题，支持多款配色变体
- **发光强调**: 使用 `text-shadow` 和边框发光突出重点
- **克制动画**: 时长较短 (200-800ms)，不喧宾夺主
- **可配置性**: 所有效果可单独开关

---

## 2. 色彩系统

### 2.1 CSS 变量色彩

每个主题定义以下 6 个颜色变量：

| 变量 | 用途 | 描述 |
|------|------|------|
| `--color-bg` | 背景色 | 主背景颜色 |
| `--color-fg` | 前景色 | 主要文字颜色 |
| `--color-muted` | 弱化色 | 次要文字、图标 |
| `--color-border` | 边框色 | 组件边框、分割线 |
| `--color-accent` | 强调色 | 交互高亮、发光效果 |
| `--color-hover` | 悬停色 | 悬停状态背景 |

### 2.2 推荐配色方案

以下是 6 个精选主题的配色值：

#### Darkish (默认)
```css
--color-bg: #0d0d0d;
--color-fg: #e0e0e0;
--color-muted: #777777;
--color-border: #333333;
--color-accent: #ffffff;
--color-hover: #222222;
```

#### Nord
```css
--color-bg: #2e3440;
--color-fg: #d8dee9;
--color-muted: #4c566a;
--color-border: #434c5e;
--color-accent: #88c0d0;
--color-hover: #3b4252;
```

#### Dracula
```css
--color-bg: #282a36;
--color-fg: #f8f8f2;
--color-muted: #6272a4;
--color-border: #44475a;
--color-accent: #bd93f9;
--color-hover: #44475a;
```

#### Cyberpunk
```css
--color-bg: #000b1e;
--color-fg: #00f3ff;
--color-muted: #054863;
--color-border: #003a5c;
--color-accent: #ff003c;
--color-hover: #001a3d;
```

#### CRT (绿)
```css
--color-bg: #050505;
--color-fg: #33ff33;
--color-muted: #1b5e20;
--color-border: #2e7d32;
--color-accent: #69f0ae;
--color-hover: #0a1a0b;
```

---

## 3. 排版规范

### 3.1 字体

| 用途 | 字体 | 来源 |
|------|------|------|
| 默认正文 | `"JetBrains Mono", "Fira Code", monospace` | Google Fonts |
| 数字时钟 | `'DSEG7 Classic', monospace` | DSEG Font |
| 代码/设置 | `"JetBrains Mono", monospace` | 同上 |

### 3.2 字号

| 元素 | Tailwind 类 | 字号 |
|------|-------------|------|
| 主应用 | `text-sm` | 14px |
| Widget 标题 | `text-sm` | 14px |
| 链接 | `text-sm` | 14px |
| 辅助文字 | `text-xs` | 12px |
| 极小提示 | `text-[10px]` | 10px |

### 3.3 文字样式规范

```css
/* 标题 - 小写加粗 */
.widget-title {
  text-transform: lowercase;
  font-weight: bold;
}

/* 分类标题 - 大写加宽 */
.category-header {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

---

## 4. CSS 变量

### 4.1 必需变量

```css
:root {
  /* 主题色 (必需) */
  --color-bg: #0d0d0d;
  --color-fg: #e0e0e0;
  --color-muted: #777777;
  --color-border: #333333;
  --color-accent: #ffffff;
  --color-hover: #222222;
  
  /* 组件圆角 (可选，默认 0) */
  --widget-radius: 0px;
}
```

### 4.2 Tailwind 配置

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      textShadow: {
        glow: '0 0 5px var(--color-accent)',
      }
    }
  }
}
```

---

## 5. 边框发光效果

### 5.1 核心原理

使用 SVG `stroke-dasharray` 和 `stroke-dashoffset` 实现从隐藏到显示的边框动画。
**特点**: 标题位于左上角边框上，边框发光从标题右侧开始顺时针环绕，形成"贯穿"效果。

### 5.2 HTML 结构

```jsx
<div className="widget-glow border border-[var(--color-border)]">
  {/* 标题栏 - 跨在边框上 */}
  <div className="widget-title-bar">
    <div className="widget-title">search.ai</div>
    <div className="widget-close">[x]</div>
  </div>
  
  {/* SVG 边框发光 - 从标题右侧开始 */}
  <svg style={{ position: 'absolute', top: -1, left: -1, width: w, height: h }}>
    <path
      d={d}  // 从标题结束位置开始
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="1"
    />
  </svg>
  
  {/* 内容 */}
  <div>...</div>
</div>
```

### 5.3 CSS 样式

```css
/* 容器 */
.widget-glow {
  position: relative;
  overflow: visible;
}

/* 标题栏 - 跨在顶部边框上 */
.widget-title-bar {
  position: absolute;
  top: -0.6rem;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  z-index: 20;
  pointer-events: none;
}

/* 标题 */
.widget-title {
  background: var(--color-bg);
  padding: 0 0.5rem;
  margin-left: 0.75rem;
  color: var(--color-muted);
  font-weight: bold;
  text-transform: lowercase;
  transition: color 300ms, text-shadow 300ms;
}

/* 关闭按钮 */
.widget-close {
  background: var(--color-bg);
  padding: 0 0.5rem;
  margin-right: 0.75rem;
  color: var(--color-muted);
  cursor: pointer;
}

.widget-close:hover {
  color: #ff4444;
}

/* 悬停时标题发光 */
.widget-glow:hover .widget-title {
  color: var(--color-accent);
  text-shadow: 0 0 8px var(--color-accent);
}

/* SVG 边框 */
.widget-glow-border path {
  stroke-dashoffset: var(--perimeter);
  opacity: 0;
  transition: opacity 0.3s ease, stroke-dashoffset 0s linear 0.3s;
}

.widget-glow:hover .widget-glow-border path {
  stroke-dashoffset: 0;
  opacity: 1;
  transition: stroke-dashoffset 0.8s ease-out, opacity 0.1s ease;
}
```

### 5.4 计算周长和路径 (JavaScript/TypeScript)

```js
const calculateBorderPath = (width, height, titleEnd = 0) => {
  const w = width;
  const h = height;
  const r = 0; // 圆角半径
  
  // 起始点：标题右侧（或左上角）
  const sx = titleEnd > 0 ? Math.max(titleEnd, 0.5 + r) : 0.5 + r;
  
  let d = '';
  if (r <= 0) {
    // 无圆角：从标题结束位置顺时针绘制
    d = `M${sx},0.5 L${w - 0.5},0.5 L${w - 0.5},${h - 0.5} L0.5,${h - 0.5} L0.5,0.5 L${sx},0.5`;
  }
  
  // 周长计算（减去标题间隙）
  const perimeter = titleEnd > 0
    ? 2 * (w - 1) + 2 * (h - 1) - (titleEnd - 0.5)
    : 2 * (w - 1) + 2 * (h - 1);
    
  return { d, perimeter };
};
```

---

## 6. 文字发光效果

### 6.1 基础发光

```css
/* 基础发光 - 5px 模糊 */
text-shadow: 0 0 5px var(--color-accent);

/* 强发光 - 8px 模糊 */
text-shadow: 0 0 8px var(--color-accent);

/* 极强发光 - 12px 模糊 */
text-shadow: 0 0 12px var(--color-accent);
```

### 6.2 标题悬停发光

```css
.widget-glow:hover .widget-title {
  color: var(--color-accent);
  text-shadow: 0 0 8px var(--color-accent);
  transition: color 300ms, text-shadow 300ms;
}
```

### 6.3 CRT 数字发光

```css
.font-digital {
  font-family: 'DSEG7 Classic', monospace;
  text-shadow: 0 0 5px currentColor;
  letter-spacing: 0.05em;
  font-style: italic;
}
```

---

## 7. 链接动画

### 7.1 箭头旋转动画

```css
/* 箭头退出 - 360° 旋转缩小 */
@keyframes arrow-exit {
  0%   { transform: rotate(0deg) scale(1);   text-shadow: 0 0 8px var(--color-accent); }
  50%  { transform: rotate(180deg) scale(0.85); text-shadow: 0 0 6px var(--color-accent); }
  80%  { transform: rotate(360deg) scale(1.1);  text-shadow: 0 0 3px var(--color-accent); }
  100% { transform: rotate(360deg) scale(1);   text-shadow: 0 0 0 transparent; }
}

/* 箭头进入 - 360° 旋转放大 */
@keyframes arrow-enter {
  0%   { transform: rotate(0deg) scale(1);    text-shadow: 0 0 0 transparent; }
  20%  { transform: rotate(72deg) scale(1.1);  text-shadow: 0 0 4px var(--color-accent); }
  50%  { transform: rotate(180deg) scale(0.85); text-shadow: 0 0 6px var(--color-accent); }
  100% { transform: rotate(360deg) scale(1);    text-shadow: 0 0 8px var(--color-accent); }
}

/* 箭头滚动 - 滑出再滑入 */
@keyframes arrow-scroll {
  0%  { transform: translateX(0) rotate(0); opacity: 1; }
  40% { transform: translateX(12px) rotate(0); opacity: 0; }
  41% { transform: translateX(-8px) rotate(0); opacity: 0; }
  75% { transform: translateX(0) rotate(0); opacity: 1; }
  100%{ transform: translateX(0) rotate(0); opacity: 1; }
}

/* 应用 */
.link-arrow {
  display: inline-block;
  animation: arrow-exit 400ms ease-out;
}

a:hover .link-arrow {
  animation: arrow-enter 400ms ease-out, 
             arrow-scroll 1s ease-in-out 400ms infinite;
}
```

### 7.2 分类前缀动画

```css
@keyframes prefix-enter {
  0%   { transform: scale(1);   text-shadow: 0 0 0 transparent; }
  50%  { transform: scale(1.3); text-shadow: 0 0 12px var(--color-accent); }
  100% { transform: scale(1);   text-shadow: 0 0 8px var(--color-accent); }
}

.category-prefix {
  display: inline-block;
}

.link-group:hover .category-prefix {
  animation: prefix-enter 300ms ease-out;
}
```

### 7.3 逐字符扫描动画

```css
/* HTML: <span style="--char-index: 0">H</span><span style="--char-index: 1">e</span>... */

@keyframes char-scan {
  0%   { color: var(--color-muted); text-shadow: none; }
  50%  { color: var(--color-accent); text-shadow: 0 0 6px var(--color-accent); }
  100% { color: rgba(255, 255, 255, 0.6); text-shadow: none; }
}

.category-char {
  display: inline-block;
}

.link-group:hover .category-char {
  animation: char-scan 300ms step-end both;
  animation-delay: calc(var(--char-index) * 40ms);
}
```

---

## 8. CRT 复古效果

### 8.1 完整 CRT 效果

```css
/* 基础 CRT 文字效果 */
.theme-crt {
  text-shadow: 1px 0 0 rgba(255, 0, 0, 0.4), 
               -1px 0 0 rgba(0, 0, 255, 0.4);
  overflow: hidden;
}

/* 屏幕边缘暗化 */
.crt-curve-container {
  position: fixed;
  inset: 0;
  z-index: 9990;
  pointer-events: none;
  background: radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.4);
}

/* 扫描线 */
.crt-scanlines {
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.3));
  background-size: 100% 4px;
  position: fixed;
  inset: 0;
  z-index: 9992;
  pointer-events: none;
}

/* 扫描线下移动画 */
.crt-scanlines::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 15vh;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0));
  animation: scanline-drop 8s linear infinite;
}

@keyframes scanline-drop {
  0%   { top: -20%; }
  100% { top: 120%; }
}

/* 噪点效果 */
.crt-noise {
  position: fixed;
  inset: 0;
  z-index: 9993;
  pointer-events: none;
  opacity: 0.05;
  background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 3px 3px;
  animation: crt-noise-anim 0.5s infinite linear;
}

@keyframes crt-noise-anim {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(-3px, 3px); }
  50%  { transform: translate(3px, -3px); }
  75%  { transform: translate(-3px, -3px); }
  100% { transform: translate(0, 0); }
}

/* 屏幕闪烁 */
.crt-flicker {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.01);
  z-index: 9994;
  pointer-events: none;
  animation: crt-flicker-anim 0.1s infinite;
}

@keyframes crt-flicker-anim {
  0%   { opacity: 0.98; }
  50%  { opacity: 1.0; }
  100% { opacity: 0.99; }
}
```

### 8.2 使用方法

```jsx
{isCrt && (
  <>
    <div className="crt-curve-container"></div>
    <div className="crt-scanlines"></div>
    <div className="crt-noise"></div>
    <div className="crt-flicker"></div>
  </>
)}
```

---

## 9. 滚动条样式

```css
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 0px;  /* 方形滚动条是特点 */
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}
```

---

## 10. 组件圆角

```css
:root {
  --widget-radius: 0px;  /* 默认方形 */
}

/* 应用圆角 */
.widget-rounded {
  border-radius: var(--widget-radius) !important;
  transition: border-radius 200ms ease;
}

/* 强制方形 */
.no-radius {
  border-radius: 0px !important;
}
```

### 圆角配置范围

```js
// 可配置 0-24px
const widgetRadius = 0;  // 0 = 方形
const widgetRadius = 4;  // 轻微圆角
const widgetRadius = 12; // 中等圆角
const widgetRadius = 24; // 非常圆
```

---

## 11. 动画时长参考

| 效果 | 时长 | 缓动函数 |
|------|------|----------|
| 颜色过渡 (标准) | 200ms | ease |
| 颜色过渡 (快速) | 20ms | - |
| 边框发光 | 800ms | ease-out |
| 边框显现 | 300ms | ease |
| 标题过渡 | 300ms | ease |
| 链接箭头进入 | 400ms | ease-out |
| 链接箭头循环 | 1000ms (延迟400ms) | ease-in-out |
| 字符扫描 | 300ms | step-end |
| 前缀放大 | 300ms | ease-out |
| 布局过渡 | 200ms | ease |
| 扫描线下移 | 8000ms | linear (循环) |
| 噪点抖动 | 500ms | linear (循环) |
| 屏幕闪烁 | 100ms | - |

---

## 12. 实用 CSS 类

```css
/* 强制方形边框 */
.no-radius {
  border-radius: 0px !important;
}

/* 应用主题圆角 */
.widget-rounded {
  border-radius: var(--widget-radius) !important;
}

/* 启用边框发光 */
.widget-glow {
  position: relative;
}

/* Widget 标题样式 */
.widget-title {
  color: var(--color-muted);
  font-weight: bold;
  text-transform: lowercase;
  transition: color 300ms, text-shadow 300ms;
}

/* 禁用链接动画 */
.links-static .link-arrow {
  animation: none !important;
  text-shadow: none !important;
  transform: none !important;
}

/* 数字时钟字体 */
.font-digital {
  font-family: 'DSEG7 Classic', monospace;
  text-shadow: 0 0 5px currentColor;
  letter-spacing: 0.05em;
  font-style: italic;
}

/* 发光文字 (Tailwind) */
.text-shadow-glow {
  text-shadow: 0 0 5px var(--color-accent);
}
```

---

## 13. 完整 CSS 代码

### 13.1 基础样式 (可直接复制)

```css
/* ===== 基础变量 ===== */
:root {
  --color-bg: #0d0d0d;
  --color-fg: #e0e0e0;
  --color-muted: #777777;
  --color-border: #333333;
  --color-accent: #ffffff;
  --color-hover: #222222;
  --widget-radius: 0px;
}

/* ===== 基础组件 ===== */
.widget-rounded {
  border-radius: var(--widget-radius) !important;
  transition: border-radius 200ms ease;
}

.no-radius {
  border-radius: 0px !important;
}

/* ===== 边框发光 ===== */
.widget-glow {
  position: relative;
}

.widget-glow-border {
  stroke-dashoffset: var(--perimeter);
  opacity: 0;
  transition: opacity 0.3s ease, stroke-dashoffset 0s linear 0.3s;
}

.widget-glow:hover .widget-glow-border {
  stroke-dashoffset: 0;
  opacity: 1;
  transition: stroke-dashoffset 0.8s ease-out, opacity 0.1s ease;
}

.widget-glow:hover .widget-title {
  color: var(--color-accent);
  text-shadow: 0 0 8px var(--color-accent);
}

/* ===== 文字发光 ===== */
.text-glow {
  text-shadow: 0 0 5px var(--color-accent);
}

.text-glow-strong {
  text-shadow: 0 0 8px var(--color-accent);
}

/* ===== 链接动画 ===== */
.link-arrow {
  display: inline-block;
  transition: color 20ms;
  animation: arrow-exit 400ms ease-out;
}

a:hover .link-arrow {
  text-shadow: 0 0 8px var(--color-accent);
  animation: arrow-enter 400ms ease-out,
             arrow-scroll 1s ease-in-out 400ms infinite;
}

@keyframes arrow-enter {
  0%   { transform: rotate(0deg) scale(1);    text-shadow: 0 0 0 transparent; }
  20%  { transform: rotate(72deg) scale(1.1);  text-shadow: 0 0 4px var(--color-accent); }
  50%  { transform: rotate(180deg) scale(0.85); text-shadow: 0 0 6px var(--color-accent); }
  100% { transform: rotate(360deg) scale(1);   text-shadow: 0 0 8px var(--color-accent); }
}

@keyframes arrow-scroll {
  0%  { transform: translateX(0) rotate(0); opacity: 1; }
  40% { transform: translateX(12px) rotate(0); opacity: 0; }
  41% { transform: translateX(-8px) rotate(0); opacity: 0; }
  75% { transform: translateX(0) rotate(0); opacity: 1; }
  100%{ transform: translateX(0) rotate(0); opacity: 1; }
}

@keyframes arrow-exit {
  0%   { transform: rotate(0deg) scale(1);   text-shadow: 0 0 8px var(--color-accent); }
  50%  { transform: rotate(180deg) scale(0.85); text-shadow: 0 0 6px var(--color-accent); }
  80%  { transform: rotate(360deg) scale(1.1);  text-shadow: 0 0 3px var(--color-accent); }
  100% { transform: rotate(360deg) scale(1);   text-shadow: 0 0 0 transparent; }
}

/* ===== 分类动画 ===== */
.category-prefix {
  display: inline-block;
  transition: opacity 200ms ease;
}

.link-group:hover .category-prefix {
  opacity: 1;
  text-shadow: 0 0 8px var(--color-accent);
  animation: prefix-enter 300ms ease-out;
}

@keyframes prefix-enter {
  0%   { transform: scale(1);   text-shadow: 0 0 0 transparent; }
  50%  { transform: scale(1.3); text-shadow: 0 0 12px var(--color-accent); }
  100% { transform: scale(1);   text-shadow: 0 0 8px var(--color-accent); }
}

.category-char {
  display: inline-block;
  transition: color 200ms ease;
}

.link-group:hover .category-char {
  animation: char-scan 300ms step-end both;
  animation-delay: calc(var(--char-index) * 40ms);
}

@keyframes char-scan {
  0%   { color: var(--color-muted); text-shadow: none; }
  50%  { color: var(--color-accent); text-shadow: 0 0 6px var(--color-accent); }
  100% { color: rgba(255, 255, 255, 0.6); text-shadow: none; }
}

/* ===== 滚动条 ===== */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 0px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}

/* ===== 布局过渡 ===== */
.react-grid-layout {
  position: relative;
  transition: height 200ms ease;
}

.react-grid-item {
  transition: all 200ms ease;
}

/* ===== 数字时钟 ===== */
.font-digital {
  font-family: 'DSEG7 Classic', monospace;
  text-shadow: 0 0 5px currentColor;
  letter-spacing: 0.05em;
  font-style: italic;
}
```

### 13.2 CRT 效果 (可选)

```css
/* ===== CRT 效果 ===== */
.theme-crt {
  text-shadow: 1px 0 0 rgba(255, 0, 0, 0.4), -1px 0 0 rgba(0, 0, 255, 0.4);
  overflow: hidden;
}

.crt-curve-container {
  position: fixed;
  inset: 0;
  z-index: 9990;
  pointer-events: none;
  background: radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.4);
}

.crt-scanlines {
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.3));
  background-size: 100% 4px;
  position: fixed;
  inset: 0;
  z-index: 9992;
  pointer-events: none;
}

.crt-scanlines::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 15vh;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0));
  animation: scanline-drop 8s linear infinite;
}

@keyframes scanline-drop {
  0%   { top: -20%; }
  100% { top: 120%; }
}

.crt-noise {
  position: fixed;
  inset: 0;
  z-index: 9993;
  pointer-events: none;
  opacity: 0.05;
  background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 3px 3px;
  animation: crt-noise-anim 0.5s infinite linear;
}

@keyframes crt-noise-anim {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(-3px, 3px); }
  50%  { transform: translate(3px, -3px); }
  75%  { transform: translate(-3px, -3px); }
  100% { transform: translate(0, 0); }
}

.crt-flicker {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.01);
  z-index: 9994;
  pointer-events: none;
  animation: crt-flicker-anim 0.1s infinite;
}

@keyframes crt-flicker-anim {
  0%   { opacity: 0.98; }
  50%  { opacity: 1.0; }
  100% { opacity: 0.99; }
}
```

---

## 14. 使用示例

### 14.1 快速开始

1. 复制上面的 CSS 到你的项目
2. 设置 CSS 变量
3. 使用对应类名

### 14.2 示例: 终端风格卡片

```jsx
import './terminal.css';

function TerminalCard({ title, children }) {
  return (
    <div className="widget-glow border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <div className="widget-title mb-2">{title}</div>
      <div>{children}</div>
    </div>
  );
}
```

### 14.3 示例: 带发光效果的链接

```jsx
function GlowLink({ href, children }) {
  return (
    <a href={href} className="group flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-fg)]">
      <span className="link-arrow">›</span>
      <span>{children}</span>
    </a>
  );
}
```

### 14.4 示例: 带分类的链接组

```jsx
function LinkGroup({ category, links }) {
  return (
    <div className="link-group">
      <h4 className="category-header">
        <span className="category-prefix text-[var(--color-accent)]">//</span>
        {category.split('').map((char, i) => (
          <span key={i} className="category-char" style={{ '--char-index': i }}>{char}</span>
        ))}
      </h4>
      {links.map(link => (
        <GlowLink key={link.url} href={link.url}>{link.label}</GlowLink>
      ))}
    </div>
  );
}
```

---

## 附录: 字体资源

### JetBrains Mono
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### DSEG (数字时钟)
```html
<link href="https://fonts.googleapis.com/css2?family=DSEG7+Classic&display=swap" rel="stylesheet">
```
或从 [GitHub](https://github.com/keshikan/DSEG) 下载

---

*文档生成时间: 2026-02-25*
*基于 TerminalStart v2.2 分析生成*
