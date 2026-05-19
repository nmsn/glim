# Tech Stack 检测修复设计

## 问题

Tech Stack 页面没有数据，原因是 `detectPageTechnologies()` 直接访问 `document` 和 `window` 获取页面信息，但该函数运行在 popup 弹窗上下文中，而非用户正在访问的活动标签页。

## 目标

修复 Tech Stack 检测，使其能从活动标签页正确收集页面数据并展示。

## 方案 A：Content Script 数据收集 + Popup 检测

### 架构

```
┌─────────────────────────────────────────────────────────┐
│  TechStackTab (popup)                                    │
│  1. 通过 browser.tabs.sendMessage('GET_PAGE_DATA')       │
│     向 content script 请求页面数据                       │
│  2. 接收数据后，在本地运行检测逻辑                       │
│     （复用 page-detector.ts 逻辑）                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  content script (entrypoints/content.ts)                │
│  添加 collectPageData() 函数：                          │
│  - 收集 document.scripts、link[rel=stylesheet] 等       │
│  - 收集 [class] 属性样本                                │
│  - 收集 CSS 变量                                        │
│  - 返回结构化数据                                       │
└─────────────────────────────────────────────────────────┘
```

### 数据流

1. `TechStackTab` 切换到 tech-stack 标签时，发送消息请求页面数据
2. `content script` 收到消息，收集页面信息，返回给 popup
3. `TechStackTab` 接收数据，将其传给修改后的检测函数
4. 检测函数基于传入的数据运行，不再直接访问 `document`

### 文件改动

| 文件 | 改动说明 |
|------|----------|
| `entrypoints/content.ts` | 添加 `collectPageData()` 函数，监听 `GET_PAGE_DATA` 消息 |
| `utils/tech-stack/page-detector.ts` | 添加 `detectPageTechnologiesFromData()` 函数，接受预收集的数据作为输入 |
| `entrypoints/popup/tabs/TechStackTab.tsx` | 通过 `browser.tabs.sendMessage()` 请求数据，调用新的检测函数 |

### collectPageData() 返回数据结构

```typescript
interface PageData {
  url: string;
  title: string;
  scripts: string[];
  stylesheets: string[];
  resourceTiming: string[];
  images: string[];
  allResources: string[];
  classes: Record<string, number>;
  cssVariables: { names: string[]; values: Record<string, string> };
  html: string;
  globalKeys: string[];
}
```

### 检测函数签名变更

```typescript
// 新增函数：基于预收集数据检测
function detectPageTechnologiesFromData(
  data: PageData,
  rules: RuleConfig
): TechnologyRecord[]

// 原函数保留但仅供 content script 使用
function detectPageTechnologies(input: PageDetectionInput): Promise<DetectionResult>
```

## 实现步骤

1. 在 `entrypoints/content.ts` 中添加 `collectPageData()` 函数
2. 在 `utils/tech-stack/page-detector.ts` 中添加 `detectPageTechnologiesFromData()` 函数
3. 修改 `entrypoints/popup/tabs/TechStackTab.tsx`，通过消息获取页面数据并调用新的检测函数

## 兼容性

- 保持现有的 `getResponseHeaders()` 机制不变
- Header 检测逻辑保持不变
- 仅修复页面扫描部分的数据来源问题