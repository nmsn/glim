# Tech Stack 检测修复实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 Tech Stack 检测功能，使其能从活动标签页正确收集页面数据并展示

**Architecture:** 通过 content script 收集页面数据（document、scripts、styles 等），然后通过消息传递给 popup，最后在 popup 中运行检测逻辑

**Tech Stack:** WXT extension framework, React 19, TypeScript

---

## 文件结构

```
entrypoints/
├── content.ts          # 添加 collectPageData() 函数
└── popup/
    └── tabs/
        └── TechStackTab.tsx  # 修改为通过消息获取数据

utils/tech-stack/
├── page-detector.ts     # 添加 detectPageTechnologiesFromData() 函数
└── types.ts            # 添加 PageData 接口
```

---

## Task 1: 在 content.ts 中添加 collectPageData 函数

**Files:**
- Modify: `entrypoints/content.ts:47-67`

**Data Flow:**
content script 在页面上下文中运行，可访问真实的 document.window

- [ ] **Step 1: 添加 collectPageData 函数和消息处理**

在 `browser.runtime.onMessage.addListener` 的回调中添加新的消息类型处理:

```typescript
} else if (message.type === 'GET_PAGE_DATA') {
  try {
    const data = collectPageData();
    sendResponse({ success: true, data });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}
```

- [ ] **Step 2: 实现 collectPageData 函数**

在 `getPageInfoFromDOM` 函数之后添加:

```typescript
function collectPageData() {
  // 收集 scripts
  const scripts = [...document.scripts].map(s => s.src).filter(isInspectableUrl);

  // 收集 stylesheets
  const stylesheets = [...document.querySelectorAll("link[rel~='stylesheet'], link[as='style']")]
    .map(l => (l as HTMLLinkElement).href)
    .filter(isInspectableUrl);

  // 收集 resource timing
  let resourceTiming: string[] = [];
  try {
    resourceTiming = performance.getEntriesByType('resource').map(e => e.name).filter(isInspectableUrl);
  } catch {}

  // 收集 images
  const images = [...document.images].map(i => i.currentSrc || i.src).filter(isInspectableUrl).slice(0, 200);

  // 收集所有资源
  const allResources = [...new Set([...scripts, ...stylesheets, ...resourceTiming, ...images])];

  // 收集 class tokens
  const classTokens: Record<string, number> = {};
  const nodes = document.querySelectorAll('[class]');
  const limit = Math.min(nodes.length, 1000);
  for (let i = 0; i < limit; i++) {
    const list = nodes[i].classList;
    if (list && list.length) {
      for (let j = 0; j < list.length; j++) {
        const token = list[j];
        if (token) classTokens[token] = (classTokens[token] || 0) + 1;
      }
    }
  }

  // 收集 CSS 变量
  const cssNames: string[] = [];
  const cssValues: Record<string, string> = {};
  const targets = [document.documentElement, document.body].filter(Boolean);
  for (const target of targets) {
    try {
      const style = getComputedStyle(target);
      for (let index = 0; index < style.length; index++) {
        const name = style.item(index);
        if (name && name.startsWith('--')) {
          cssNames.push(name);
          if (!cssValues[name]) cssValues[name] = style.getPropertyValue(name).trim().slice(0, 160);
        }
      }
    } catch {}
  }

  // HTML sample
  const html = String(document.documentElement?.outerHTML || '')
    .replace(/data:[^"'()<>\s]+/gi, '[inline-data-url]')
    .slice(0, 500000).toLowerCase();

  // Global keys (限制数量避免过大)
  let globalKeys: string[] = [];
  try {
    globalKeys = Object.keys(window).slice(0, 5000);
  } catch {}

  return {
    url: window.location.href,
    title: document.title,
    scripts,
    stylesheets,
    resourceTiming,
    images,
    allResources,
    classes: classTokens,
    cssVariables: {
      names: cssNames.slice(0, 500),
      values: cssValues,
    },
    html,
    globalKeys,
  };
}

function isInspectableUrl(value: string): boolean {
  const url = String(value || '').trim();
  return Boolean(url) && !/^(?:data|blob|javascript|about):/i.test(url);
}
```

- [ ] **Step 3: 提交**

```bash
git add entrypoints/content.ts
git commit -m "feat(content): 添加 collectPageData 函数支持 Tech Stack 检测

收集页面的 scripts、stylesheets、classes、CSS 变量等信息，通过消息返回给 popup"
```

---

## Task 2: 在 types.ts 中添加 PageData 接口

**Files:**
- Modify: `utils/tech-stack/types.ts:85-89`

- [ ] **Step 1: 添加 PageData 接口**

在 `RuleConfig` 接口之后添加:

```typescript
export interface PageData {
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

- [ ] **Step 2: 提交**

```bash
git add utils/tech-stack/types.ts
git commit -m "feat(tech-stack): 添加 PageData 接口定义

用于 content script 和 popup 之间的数据传递"
```

---

## Task 3: 添加 detectPageTechnologiesFromData 函数

**Files:**
- Modify: `utils/tech-stack/page-detector.ts`

- [ ] **Step 1: 在文件开头添加 PageData 导入**

在 `import type { RuleConfig } from './types'` 之后添加:

```typescript
import type { RuleConfig, PageData, TechnologyRecord } from './types';
```

- [ ] **Step 2: 在 detectPageTechnologies 函数之前添加新函数**

```typescript
export function detectPageTechnologiesFromData(
  data: PageData,
  rules: RuleConfig
): TechnologyRecord[] {
  const technologies: TechnologyRecord[] = [];

  const add: (category: string, name: string, confidence: string, evidence?: string, extras?: { version?: string }) => void =
    (category, name, confidence, evidence, extras) => {
      const tech: TechnologyRecord = {
        category,
        name,
        confidence: confidence as any,
        evidence: evidence ? [evidence] : [],
        source: '页面扫描',
      };
      if (extras?.version) tech.version = extras.version;
      technologies.push(tech);
    };

  const resources = {
    scripts: data.scripts,
    stylesheets: data.stylesheets,
    resourceTiming: data.resourceTiming,
    images: data.images,
    all: data.allResources,
    text: data.allResources.join('\n').toLowerCase(),
  };

  const cssVariables = {
    names: data.cssVariables.names,
    values: data.cssVariables.values,
    text: data.cssVariables.names.map(n => `${n}: ${data.cssVariables.values[n] || ''}`).join('\n').toLowerCase(),
  };

  const globalKeys = data.globalKeys;
  const lowerHtml = data.html;

  // 检测 React
  if (hasReactDomMarkerFromData(data)) {
    add('前端框架', 'React', '高', 'DOM 节点存在 React Fiber 标记');
  }

  // 检测前端框架
  detectJsonRuleList(add, (rules as any).frontendFrameworks || [], {
    defaultCategory: '前端框架',
    resources,
    classes: data.classes,
    cssVariables,
    text: `${resources.text}\n${lowerHtml}\n${globalKeys.join('\n')}`,
    html: lowerHtml,
    resourceConfidence: '中',
    sourceLabel: 'JSON 前端框架规则',
  });

  // 检测 UI 框架
  const atomicOrigin = detectAtomicCssOrigin(cssVariables);
  if (atomicOrigin === 'unocss') add('UI / CSS 框架', 'UnoCSS', '高', '存在 --un-* CSS 变量');
  else if (atomicOrigin === 'tailwind') add('UI / CSS 框架', 'Tailwind CSS', '高', '存在 --tw-* CSS 变量');
  else if (scoreTailwind(data.classes) >= 10) add('UI / CSS 框架', 'Tailwind CSS', '中', '存在大量 Tailwind 风格原子类名');

  detectJsonRuleList(add, (rules as any).uiFrameworks || [], {
    defaultCategory: 'UI / CSS 框架',
    resources,
    classes: data.classes,
    cssVariables,
    text: `${resources.text}\n${lowerHtml}\n${cssVariables.text}`,
    html: lowerHtml,
    sourceLabel: 'JSON UI 框架规则',
  });

  // 检测构建运行时
  detectJsonRuleList(add, (rules as any).buildRuntime || [], {
    defaultCategory: '构建与运行时',
    resources,
    classes: data.classes,
    cssVariables,
    text: `${resources.text}\n${lowerHtml}\n${globalKeys.join('\n')}`,
    html: lowerHtml,
    sourceLabel: 'JSON 构建运行时规则',
  });

  // 检测 CDN
  detectJsonRuleList(add, (rules as any).cdnProviders || [], {
    defaultCategory: 'CDN / 托管',
    resources,
    classes: data.classes,
    cssVariables,
    text: resources.text,
    html: lowerHtml,
    resourceOnly: true,
    sourceLabel: 'JSON CDN 规则',
  });

  // 检测后端框架
  detectJsonRuleList(add, (rules as any).backendHints || [], {
    defaultCategory: '后端 / 服务器框架',
    resources,
    classes: data.classes,
    text: `${data.url}\n${resources.text}\n${lowerHtml}`,
    html: lowerHtml,
    sourceLabel: 'JSON 后端规则',
  });

  // 检测语言
  detectJsonRuleList(add, (rules as any).languages || [], {
    defaultCategory: '开发语言 / 运行时',
    resources,
    classes: data.classes,
    text: `${resources.text}\n${lowerHtml}`,
    html: lowerHtml,
    sourceLabel: 'JSON 语言规则',
  });

  return technologies;
}
```

- [ ] **Step 3: 添加辅助函数**

在 `hasReactDomMarker` 函数之后添加:

```typescript
function hasReactDomMarkerFromData(data: PageData): boolean {
  // 由于没有直接访问 DOM，通过检测全局变量判断 React
  return data.globalKeys.some(key => key.startsWith('__reactFiber$') || key.startsWith('__reactProps$'));
}
```

- [ ] **Step 4: 添加 detectJsonRuleList 和 detectAtomicCssOrigin 函数**

从原 `detectPageTechnologies` 函数中提取需要用到的辅助函数（确保它们在文件中的作用域正确）

- [ ] **Step 5: 提交**

```bash
git add utils/tech-stack/page-detector.ts
git commit -m "feat(tech-stack): 添加 detectPageTechnologiesFromData 函数

支持基于预收集的页面数据进行技术栈检测，不再直接访问 document"
```

---

## Task 4: 修改 TechStackTab 使用消息获取数据

**Files:**
- Modify: `entrypoints/popup/tabs/TechStackTab.tsx`

- [ ] **Step 1: 修改导入和组件逻辑**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { TechStackCard } from '../components/TechStackCard';
import { loadRules } from '@/utils/tech-stack/rule-loader';
import { detectFromHeaders } from '@/utils/tech-stack/header-detector';
import { detectPageTechnologiesFromData } from '@/utils/tech-stack/page-detector';
import { mergeTechnologyRecords } from '@/utils/tech-stack/merge';
import { getResponseHeaders } from '@/utils/headers';
import type { RuleConfig, TechnologyRecord, PageData } from '@/utils/tech-stack/types';
import { browser } from 'wxt/browser';

interface TechStackTabProps {
  tabUrl: string;
}

export function TechStackTab({ tabUrl }: TechStackTabProps) {
  const [technologies, setTechnologies] = useState<TechnologyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const runDetection = useCallback(async () => {
    setLoading(true);
    setTechnologies([]);

    try {
      // 1. 加载规则
      const rules = await loadRules() as RuleConfig;

      // 2. 获取页面数据（通过 content script）
      let pageData: PageData | null = null;
      try {
        const response = await browser.tabs.sendMessage(
          { type: 'GET_PAGE_DATA' },
          { frameId: 0 }
        );
        if (response?.success && response.data) {
          pageData = response.data;
        }
      } catch (err) {
        console.error('获取页面数据失败:', err);
      }

      // 3. 并行执行页面检测和 header 检测
      const [pageTechnologies, headerRecords] = await Promise.all([
        pageData
          ? Promise.resolve(detectPageTechnologiesFromData(pageData, rules))
          : Promise.resolve([]),
        getResponseHeaders(tabUrl).catch(() => null),
      ]);

      // 4. Header 检测
      const headerTechs = headerRecords
        ? detectFromHeaders(headerRecords, tabUrl, {
            serverProducts: (rules as any).serverProducts || [],
            poweredByProducts: (rules as any).poweredByProducts || [],
            headerPatterns: (rules as any).headerPatterns || [],
            cdnProviders: (rules as any).cdnProviders || [],
            languages: (rules as any).languages || [],
            websitePrograms: (rules as any).websitePrograms || [],
            interestingHeaders: (rules as any).interestingHeaders || [],
          })
        : [];

      // 5. 合并结果
      const merged = mergeTechnologyRecords([
        ...pageTechnologies,
        ...headerTechs,
      ]);

      setTechnologies(merged);
    } catch (err) {
      console.error('Tech stack detection error:', err);
    } finally {
      setLoading(false);
    }
  }, [tabUrl]);

  useEffect(() => {
    runDetection();
  }, [runDetection]);

  return (
    <TechStackCard technologies={technologies} loading={loading} />
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add entrypoints/popup/tabs/TechStackTab.tsx
git commit -m "feat(tech-stack): 修改 TechStackTab 通过 content script 获取页面数据

通过 browser.tabs.sendMessage 向 content script 请求页面数据，然后调用 detectPageTechnologiesFromData 进行检测"
```

---

## 自检清单

- [ ] Spec coverage: 设计文档中的每个要求都有对应的任务实现
- [ ] Placeholder scan: 无 "TBD"、"TODO"、"待实现" 等占位符
- [ ] Type consistency: `PageData` 接口在 types.ts 中定义，在 content.ts 和 page-detector.ts 中使用，名称一致
- [ ] 函数签名: `detectPageTechnologiesFromData(data: PageData, rules: RuleConfig): TechnologyRecord[]`
- [ ] 消息类型: `GET_PAGE_DATA` 在 content.ts 中定义并处理

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-18-tech-stack-detection-fix-plan.md`**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?