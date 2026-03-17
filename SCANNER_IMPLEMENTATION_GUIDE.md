# PageGuard 网站扫描服务实现指南

本文档详细说明了如何实现 PageGuard 项目的两个核心扫描服务：
- **Lighthouse 扫描器**：调用 Google PageSpeed Insights API 进行完整审计
- **基础扫描器**：直接抓取网页进行基础 HTML 分析

---

## 目录

1. [架构概述](#架构概述)
2. [Lighthouse 扫描器实现](#lighthouse-扫描器实现)
3. [基础扫描器实现](#基础扫描器实现)
4. [类型定义](#类型定义)
5. [使用示例](#使用示例)
6. [注意事项](#注意事项)

---

## 架构概述

```
扫描请求
    │
    ├─ 有 API Key ──► Google PSI API ──► 完整 Lighthouse 评分
    │                                    │
    │                                    └─ 失败时降级 ──► 基础扫描器
    │
    └─ 无 API Key ───────────────────────────► 基础扫描器
                                             │
                                             └─ 直接抓取网页 HTML
                                                   │
                                                   ├─ SEO 分析
                                                   ├─ 可访问性分析
                                                   ├─ 性能分析
                                                   └─ 最佳实践分析
```

---

## Lighthouse 扫描器实现

### 功能说明

调用 Google PageSpeed Insights API 获取网站的完整 Lighthouse 审计结果，包括：
- Performance（性能）
- Accessibility（可访问性）
- SEO（搜索引擎优化）
- Best Practices（最佳实践）

### API 端点

```
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
```

### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `url` | string | 是 | 要扫描的网站地址 |
| `strategy` | string | 否 | 测试策略：`mobile` 或 `desktop` |
| `category` | string | 否 | 审计类别：`performance`, `accessibility`, `seo`, `best-practices`（可多次） |
| `key` | string | 否 | Google API Key |

### 完整实现代码

```typescript
import type { PageSpeedResult, ScanScores, ScanIssue } from "./types";
import { runBasicScan } from "./basic-scanner";

const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const CATEGORIES = ["performance", "accessibility", "seo", "best-practices"];

export async function runLighthouseScan(
  url: string,
  apiKey?: string,
): Promise<{
  scores: ScanScores;
  issues: ScanIssue[];
  rawCategories: Record<string, { score: number | null }>;
}> {
  // 降级策略：没有 API Key 时直接使用基础扫描
  if (!apiKey) {
    const result = await runBasicScan(url);
    return {
      ...result,
      rawCategories: {
        performance: { score: result.scores.performance / 100 },
        accessibility: { score: result.scores.accessibility / 100 },
        seo: { score: result.scores.seo / 100 },
        "best-practices": { score: result.scores.bestPractices / 100 },
      },
    };
  }

  // 构建 API 请求参数
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
  });
  for (const cat of CATEGORIES) {
    params.append("category", cat);
  }
  params.set("key", apiKey);

  // 调用 Google PSI API
  const response = await fetch(`${PSI_API}?${params.toString()}`);
  
  // 错误处理：API 失败时降级到基础扫描
  if (!response.ok) {
    const errorText = await response.text();
    console.warn(
      `PSI API error (${response.status}), falling back to basic scan: ${errorText.slice(0, 200)}`,
    );
    const result = await runBasicScan(url);
    return {
      ...result,
      rawCategories: {
        performance: { score: result.scores.performance / 100 },
        accessibility: { score: result.scores.accessibility / 100 },
        seo: { score: result.scores.seo / 100 },
        "best-practices": { score: result.scores.bestPractices / 100 },
      },
    };
  }

  // 解析 API 响应
  const data = (await response.json()) as PageSpeedResult;
  const cats = data.lighthouseResult.categories;
  const audits = data.lighthouseResult.audits;

  // 计算分数（0-100）
  const scores: ScanScores = {
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score ?? 0) * 100),
    overall: 0,
  };
  scores.overall = Math.round(
    (scores.performance +
      scores.accessibility +
      scores.seo +
      scores.bestPractices) /
      4,
  );

  // 提取问题列表
  const issues = extractIssues(audits);

  return { scores, issues, rawCategories: cats };
}
```

### 问题提取逻辑

```typescript
function extractIssues(
  audits: Record<
    string,
    {
      id: string;
      title: string;
      description: string;
      score: number | null;
      scoreDisplayMode: string;
      displayValue?: string;
    }
  >,
): ScanIssue[] {
  const issues: ScanIssue[] = [];

  for (const [_id, audit] of Object.entries(audits)) {
    // 跳过不适用或需要手动检查的审计项
    if (
      audit.scoreDisplayMode === "notApplicable" ||
      audit.scoreDisplayMode === "manual"
    ) {
      continue;
    }
    // 跳过分数为 null 或分数 >= 0.9（90分）的项
    if (audit.score === null || audit.score >= 0.9) {
      continue;
    }

    // 确定问题类别
    const category = categorizeAudit(audit.id);
    
    // 根据分数确定严重程度
    const severity: ScanIssue["severity"] =
      audit.score < 0.5 ? "critical" : audit.score < 0.9 ? "warning" : "info";

    issues.push({
      category,
      severity,
      title: audit.title,
      description: cleanDescription(audit.description),
      displayValue: audit.displayValue,
    });
  }

  // 按严重程度排序
  issues.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return issues.slice(0, 20); // 最多返回 20 个问题
}
```

### 问题分类规则

```typescript
function categorizeAudit(id: string): string {
  // 可访问性相关审计 ID
  const accessibilityIds = [
    "aria-", "button-name", "color-contrast", "document-title",
    "html-has-lang", "image-alt", "input-image-alt", "label",
    "link-name", "list", "listitem", "meta-viewport",
    "tabindex", "td-headers-attr", "th-has-data-cells",
    "valid-lang", "heading-order", "bypass", "frame-title",
  ];
  if (accessibilityIds.some((prefix) => id.startsWith(prefix)))
    return "Accessibility";

  // SEO 相关审计 ID
  const seoIds = [
    "meta-description", "document-title", "crawlable-anchors",
    "hreflang", "canonical", "robots-txt", "structured-data",
    "is-crawlable", "link-text", "font-size", "tap-targets",
  ];
  if (seoIds.some((prefix) => id.startsWith(prefix))) return "SEO";

  // 性能相关审计 ID
  const perfIds = [
    "first-contentful-paint", "largest-contentful-paint",
    "total-blocking-time", "cumulative-layout-shift", "speed-index",
    "interactive", "render-blocking", "unused-css", "unused-javascript",
    "modern-image-formats", "uses-optimized-images",
    "efficient-animated-content", "server-response-time", "redirects",
    "dom-size", "mainthread-work-breakdown", "bootup-time", "font-display",
  ];
  if (perfIds.some((prefix) => id.startsWith(prefix))) return "Performance";

  return "Best Practices";
}
```

### 描述清理

```typescript
function cleanDescription(desc: string): string {
  return desc
    .replace(/\[.*?\]\(.*?\)/g, "") // 移除 Markdown 链接
    .replace(/\s+/g, " ")           // 合并多余空格
    .trim()
    .slice(0, 200);                 // 限制长度
}
```

---

## 基础扫描器实现

### 功能说明

当 Google PSI API 不可用时，直接抓取目标网页的 HTML，通过正则表达式和基础分析生成评分。

### 完整实现代码

```typescript
import type { ScanScores, ScanIssue } from "./types";

export async function runBasicScan(url: string): Promise<{
  scores: ScanScores;
  issues: ScanIssue[];
}> {
  const startTime = Date.now();
  let html = "";
  let statusCode = 0;
  let isHttps = url.startsWith("https://");
  let contentLength = 0;
  let hasCSP = false;
  let hasXContentType = false;

  try {
    // 抓取网页
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PageGuard/1.0; +https://pageguard.dev)",
        Accept: "text/html",
      },
      redirect: "follow", // 跟随重定向
    });
    
    const responseTime = Date.now() - startTime;
    statusCode = response.status;
    html = await response.text();
    contentLength = html.length;
    isHttps = response.url.startsWith("https://");
    hasCSP = response.headers.has("content-security-policy");
    hasXContentType = response.headers.has("x-content-type-options");

    const issues: ScanIssue[] = [];

    // === SEO 分析 ===
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    const metaDescMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i,
    );
    const metaDesc = metaDescMatch ? metaDescMatch[1] : "";
    const h1Count = (html.match(/<h1[/\s>]/gi) || []).length;
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);

    let seoScore = 100;
    
    // 检查页面标题
    if (!title) {
      seoScore -= 30;
      issues.push({
        category: "SEO",
        severity: "critical",
        title: "Missing page title",
        description: "Every page needs a unique <title> tag for search engines to index it.",
      });
    } else if (title.length < 20 || title.length > 70) {
      seoScore -= 10;
      issues.push({
        category: "SEO",
        severity: "warning",
        title: "Page title length",
        description: `Title is ${title.length} characters. Optimal is 30–70 characters for search snippets.`,
        displayValue: `${title.length} chars`,
      });
    }
    
    // 检查 meta 描述
    if (!metaDesc) {
      seoScore -= 20;
      issues.push({
        category: "SEO",
        severity: "warning",
        title: "Missing meta description",
        description: "Add a meta description tag to control how your page appears in search results.",
      });
    } else if (metaDesc.length < 70 || metaDesc.length > 160) {
      seoScore -= 5;
      issues.push({
        category: "SEO",
        severity: "info",
        title: "Meta description length",
        description: `Description is ${metaDesc.length} characters. Optimal is 70–160 characters.`,
        displayValue: `${metaDesc.length} chars`,
      });
    }
    
    // 检查 H1 标签
    if (h1Count === 0) {
      seoScore -= 15;
      issues.push({
        category: "SEO",
        severity: "warning",
        title: "Missing H1 heading",
        description: "Every page should have exactly one H1 heading that describes its main topic.",
      });
    } else if (h1Count > 1) {
      seoScore -= 10;
      issues.push({
        category: "SEO",
        severity: "warning",
        title: "Multiple H1 headings",
        description: `Found ${h1Count} H1 headings. Use exactly one H1 per page.`,
        displayValue: `${h1Count} H1 tags`,
      });
    }

    // === 可访问性分析 ===
    const viewportMatch = html.match(/<meta[^>]+name=["']viewport["'][^>]*>/i);
    const htmlLangMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const imgsWithoutAlt = imgTags.filter(
      (tag) => !tag.includes("alt=") || /alt=["']\s*["']/.test(tag),
    ).length;

    let a11yScore = 100;
    
    // 检查 viewport meta 标签
    if (!viewportMatch) {
      a11yScore -= 30;
      issues.push({
        category: "Accessibility",
        severity: "critical",
        title: "Missing viewport meta tag",
        description: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to make your site mobile-friendly.',
      });
    }
    
    // 检查 html lang 属性
    if (!htmlLangMatch) {
      a11yScore -= 20;
      issues.push({
        category: "Accessibility",
        severity: "warning",
        title: "Missing html lang attribute",
        description: 'Add a lang attribute to the <html> tag, e.g. <html lang="en">, to help screen readers.',
      });
    }
    
    // 检查图片 alt 属性
    if (imgsWithoutAlt > 0) {
      const penalty = Math.min(30, imgsWithoutAlt * 10);
      a11yScore -= penalty;
      issues.push({
        category: "Accessibility",
        severity: imgsWithoutAlt > 2 ? "critical" : "warning",
        title: "Images missing alt text",
        description: "Images without alt text are invisible to screen readers. Add descriptive alt attributes.",
        displayValue: `${imgsWithoutAlt} of ${imgTags.length} images`,
      });
    }

    // === 性能分析 ===
    const scriptTags = html.match(/<script[^>]*>/gi) || [];
    const renderBlockingScripts = scriptTags.filter(
      (tag) =>
        !tag.includes("async") &&
        !tag.includes("defer") &&
        !tag.includes('type="module"') &&
        !tag.includes("type='module'"),
    ).length;

    let perfScore = 100;
    
    // 检查服务器响应时间
    if (responseTime > 3000) {
      perfScore -= 40;
      issues.push({
        category: "Performance",
        severity: "critical",
        title: "Slow server response time",
        description: `Server took ${(responseTime / 1000).toFixed(1)}s to respond. Aim for under 600ms.`,
        displayValue: `${(responseTime / 1000).toFixed(1)}s`,
      });
    } else if (responseTime > 1500) {
      perfScore -= 20;
      issues.push({
        category: "Performance",
        severity: "warning",
        title: "Slow server response time",
        description: `Server took ${(responseTime / 1000).toFixed(1)}s to respond. Aim for under 600ms.`,
        displayValue: `${(responseTime / 1000).toFixed(1)}s`,
      });
    }
    
    // 检查页面大小
    if (contentLength > 500_000) {
      perfScore -= 20;
      issues.push({
        category: "Performance",
        severity: "warning",
        title: "Large page size",
        description: `Page HTML is ${Math.round(contentLength / 1024)}KB. Large pages load slowly on mobile connections.`,
        displayValue: `${Math.round(contentLength / 1024)}KB`,
      });
    }
    
    // 检查渲染阻塞脚本
    if (renderBlockingScripts > 3) {
      perfScore -= 20;
      issues.push({
        category: "Performance",
        severity: "warning",
        title: "Render-blocking scripts",
        description: `Found ${renderBlockingScripts} synchronous scripts in <head>. Add async or defer attributes to prevent render-blocking.`,
        displayValue: `${renderBlockingScripts} scripts`,
      });
    }

    // === 最佳实践分析 ===
    let bpScore = 100;
    
    // 检查 HTTPS
    if (!isHttps) {
      bpScore -= 40;
      issues.push({
        category: "Best Practices",
        severity: "critical",
        title: "Not using HTTPS",
        description: "Your site is not using HTTPS. This hurts SEO rankings and exposes users to security risks.",
      });
    }
    
    // 检查 CSP 头
    if (!hasCSP) {
      bpScore -= 15;
      issues.push({
        category: "Best Practices",
        severity: "warning",
        title: "Missing Content Security Policy",
        description: "Add a Content-Security-Policy header to protect against XSS attacks.",
      });
    }
    
    // 检查 X-Content-Type-Options 头
    if (!hasXContentType) {
      bpScore -= 10;
      issues.push({
        category: "Best Practices",
        severity: "info",
        title: "Missing X-Content-Type-Options header",
        description: 'Add X-Content-Type-Options: nosniff to prevent MIME type sniffing attacks.',
      });
    }
    
    // 检查 canonical URL
    if (!canonicalMatch) {
      bpScore -= 10;
      issues.push({
        category: "Best Practices",
        severity: "info",
        title: "Missing canonical URL",
        description: 'Add <link rel="canonical" href="..."> to tell search engines the preferred URL for this page.',
      });
    }

    // 限制分数范围 0-100
    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
    const scores: ScanScores = {
      performance: clamp(perfScore),
      accessibility: clamp(a11yScore),
      seo: clamp(seoScore),
      bestPractices: clamp(bpScore),
      overall: 0,
    };
    scores.overall = clamp(
      (scores.performance +
        scores.accessibility +
        scores.seo +
        scores.bestPractices) /
        4,
    );

    // 按严重程度排序
    issues.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

    return { scores, issues: issues.slice(0, 20) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to fetch ${url}: ${message}`);
  }
}
```

### 基础扫描检查项汇总

| 类别 | 检查项 | 扣分规则 |
|------|---------|---------|
| **SEO** | 页面标题 | 缺失: -30, 长度不当: -10 |
| | Meta 描述 | 缺失: -20, 长度不当: -5 |
| | H1 标签 | 缺失: -15, 多个: -10 |
| **可访问性** | Viewport meta 标签 | 缺失: -30 |
| | HTML lang 属性 | 缺失: -20 |
| | 图片 alt 属性 | 每个缺失: -10 (最多 -30) |
| **性能** | 响应时间 | >3s: -40, >1.5s: -20 |
| | 页面大小 | >500KB: -20 |
| | 阻塞脚本 | >3 个: -20 |
| **最佳实践** | HTTPS | 未使用: -40 |
| | CSP 头 | 缺失: -15 |
| | X-Content-Type-Options 头 | 缺失: -10 |
| | Canonical URL | 缺失: -10 |

---

## 类型定义

### ScanScores

```typescript
export interface ScanScores {
  performance: number;      // 性能分数 (0-100)
  accessibility: number;    // 可访问性分数 (0-100)
  seo: number;             // SEO 分数 (0-100)
  bestPractices: number;    // 最佳实践分数 (0-100)
  overall: number;         // 总体分数 (0-100)
}
```

### ScanIssue

```typescript
export interface ScanIssue {
  category: string;        // 问题类别: "Performance", "Accessibility", "SEO", "Best Practices"
  severity: "critical" | "warning" | "info";  // 严重程度
  title: string;           // 问题标题
  description: string;    // 问题描述
  displayValue?: string;    // 显示值（如 "2.5s", "3 scripts"）
}
```

### PageSpeedResult

```typescript
export interface PageSpeedResult {
  lighthouseResult: {
    categories: Record<string, {
      id: string;
      title: string;
      score: number | null;
    }>;
    audits: Record<string, {
      id: string;
      title: string;
      description: string;
      score: number | null;
      scoreDisplayMode: string;
      displayValue?: string;
    }>;
    finalUrl: string;
    fetchTime: string;
  };
}
```

---

## 使用示例

### 基础使用

```typescript
import { runLighthouseScan } from "./services/lighthouse";

// 使用 Google PSI API
const result = await runLighthouseScan(
  "https://example.com",
  process.env.GOOGLE_PSI_API_KEY  // 可选
);

console.log("Scores:", result.scores);
console.log("Issues:", result.issues);
```

### 降级策略示例

```typescript
async function scanWebsite(url: string) {
  try {
    // 尝试使用 Google PSI API
    const result = await runLighthouseScan(url, process.env.GOOGLE_PSI_API_KEY);
    return result;
  } catch (error) {
    console.error("PSI API failed, using fallback:", error);
    // 自动降级到基础扫描
    return await runBasicScan(url);
  }
}
```

### 在 Cloudflare Workers 中使用

```typescript
import { runLighthouseScan } from "./services/lighthouse";

export default {
  async fetch(request, env) {
    const url = new URL(request.url).searchParams.get("url");
    
    const result = await runLighthouseScan(url, env.GOOGLE_PSI_API_KEY);
    
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
```

---

## 注意事项

### Google PSI API 限制

| 限制项 | 说明 |
|---------|------|
| **配额** | 免费版：25,000 请求/天 |
| **速率限制** | 可能触发 429 错误 |
| **响应时间** | 通常 5-30 秒 |
| **超时处理** | Cloudflare Workers 有 25 秒 CPU 时间限制 |

### 基础扫描器限制

| 限制项 | 说明 |
|---------|------|
| **准确性** | 基于 HTML 正则匹配，不如 Lighthouse 精确 |
| **JavaScript** | 无法执行 JS，只能分析静态 HTML |
| **真实性能** | 只能测量响应时间，无法测量 Core Web Vitals |
| **适用场景** | 作为 PSI API 的降级方案 |

### 最佳实践

1. **始终实现降级策略**：PSI API 可能因配额、网络问题失败
2. **缓存结果**：避免重复扫描同一 URL
3. **异步执行**：扫描耗时较长，应在后台执行
4. **错误处理**：捕获并记录所有异常
5. **超时控制**：设置合理的超时时间（如 30 秒）

### 安全建议

```typescript
// 1. 验证 URL 格式
function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

// 2. 限制响应大小
const MAX_HTML_SIZE = 10 * 1024 * 1024; // 10MB
if (contentLength > MAX_HTML_SIZE) {
  throw new Error("Page too large");
}

// 3. 设置超时
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
} catch {
  throw new Error("Request timeout");
}
```

---

## 扩展建议

### 添加更多检查项

```typescript
// 检查结构化数据
const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>/gi);
if (!jsonLdMatch) {
  issues.push({
    category: "SEO",
    severity: "info",
    title: "Missing structured data",
    description: "Add JSON-LD structured data for better search engine understanding.",
  });
}

// 检查 Open Graph 标签
const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]*>/i);
if (!ogTitleMatch) {
  issues.push({
    category: "SEO",
    severity: "info",
    title: "Missing Open Graph tags",
    description: "Add Open Graph meta tags for better social media sharing.",
  });
}
```

### 支持自定义评分规则

```typescript
interface ScoringRules {
  [key: string]: {
    weight: number;      // 权重
    penalty: number;     // 扣分
    threshold?: number;  // 阈值
  };
}

const rules: ScoringRules = {
  "missing-title": { weight: 1.0, penalty: 30 },
  "slow-response": { weight: 1.0, penalty: 40, threshold: 3000 },
  // ...
};
```

---

## 相关资源

- [Google PageSpeed Insights API 文档](https://developers.google.com/speed/docs/insights/v5/get-started)
- [Lighthouse 审计列表](https://github.com/GoogleChrome/lighthouse/tree/main/lighthouse-core/audits)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 指南](https://www.w3.org/WAI/WCAG21/quickref/)
