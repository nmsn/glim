const yieldToMainThread = () => new Promise(resolve => setTimeout(resolve, 0))

export interface PageDetectionInput {
  frontendFrameworks: any[]
  uiFrameworks: any[]
  buildRuntime: any[]
  cdnProviders: any[]
  languages: any[]
  backendHints: any[]
}

export interface DetectionResult {
  url: string
  title: string
  generatedAt: string
  technologies: any[]
}

const compiledRulePatternCache = new WeakMap()
const compiledCombinedPatternCache = new WeakMap()
const ruleHintCache = new WeakMap()

const escapeRegExp = (value: string): string => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const compileRulePattern = (pattern: string, rule?: any): RegExp | null => {
  try {
    if (rule?.matchType === 'keyword') {
      return new RegExp(escapeRegExp(pattern), rule?.caseSensitive ? '' : 'i')
    }
    return new RegExp(pattern, rule?.caseSensitive ? '' : 'i')
  } catch {
    return null
  }
}

const getCompiledRulePatterns = (rule: any): RegExp[] => {
  if (!rule || typeof rule !== 'object') return []
  const patterns = rule.patterns || []
  const cached = compiledRulePatternCache.get(rule)
  if (cached && cached.source === patterns) return cached.compiled
  const compiled = patterns.map((p: string) => compileRulePattern(p, rule)).filter(Boolean) as RegExp[]
  compiledRulePatternCache.set(rule, { source: patterns, compiled })
  return compiled
}

const getCompiledCombinedPattern = (rule: any): RegExp | null => {
  if (!rule || rule.matchType !== 'keyword') return null
  const patterns = rule.patterns || []
  if (!patterns.length) return null
  const cached = compiledCombinedPatternCache.get(rule)
  if (cached && cached.source === patterns) return cached.compiled
  let compiled: RegExp | null = null
  try {
    const segments = patterns.map((p: string) => escapeRegExp(String(p || '').trim())).filter(Boolean)
    if (segments.length) compiled = new RegExp(segments.join('|'), 'i')
  } catch {
    compiled = null
  }
  compiledCombinedPatternCache.set(rule, { source: patterns, compiled })
  return compiled
}

const getRuleAutoHints = (rule: any): string[] => {
  if (!rule || typeof rule !== 'object') return []
  if (Array.isArray(rule.__hints) && rule.__hints.length) return rule.__hints
  const cached = ruleHintCache.get(rule)
  if (cached) return cached
  const patterns = rule.patterns || []
  const isKeyword = rule.matchType === 'keyword'
  const candidates: string[] = []
  const genericHintParts = new Set([
    'api', 'asset', 'assets', 'cache', 'cdn', 'common', 'content', 'css', 'data', 'file', 'files',
    'image', 'images', 'img', 'js', 'plugin', 'plugins', 'script', 'scripts', 'source', 'static',
    'style', 'styles', 'template', 'theme', 'themes', 'url', 'version'
  ])
  const normalizeHintCandidate = (value: string): string =>
    String(value || '').toLowerCase().replace(/\s+/g, ' ').replace(/^[^a-z0-9一-龥]+|[^a-z0-9一-龥]+$/g, '').trim()
  for (const pattern of patterns) {
    const text = String(pattern || '')
    if (!text) continue
    if (isKeyword) {
      const lower = normalizeHintCandidate(text)
      if (lower.length >= 4) candidates.push(lower)
      continue
    }
    for (const segment of text.replace(/\\[bBdDsSwW]/g, ' ').split(/[\\^$.|?*+()[\]{}]/)) {
      const lower = normalizeHintCandidate(segment)
      if (lower.length >= 4) candidates.push(lower)
    }
  }
  ruleHintCache.set(rule, candidates)
  return candidates
}

const passesRulePrefilter = (rule: any, lowerResources: string, lowerHtml: string): boolean => {
  if (!rule) return true
  if (Array.isArray(rule.resourceHints) && rule.resourceHints.length) return true
  const hints = getRuleAutoHints(rule)
  if (!hints.length) return true
  for (const hint of hints) {
    if (lowerResources.includes(hint) || lowerHtml.includes(hint)) return true
  }
  return false
}

const matchesResourceHints = (rule: any, text: string): boolean => {
  if (!Array.isArray(rule.resourceHints) || !rule.resourceHints.length) return true
  const value = String(text || '').toLowerCase()
  return rule.resourceHints.some((hint: string) => value.includes(String(hint || '').toLowerCase()))
}

const shouldMatchTarget = (rule: any, target: string): boolean => {
  if (!Array.isArray(rule.matchIn) || !rule.matchIn.length) return true
  if (target === 'resources') return rule.matchIn.some((item: string) => ['resources', 'url', 'dynamic'].includes(item))
  if (target === 'html') return rule.matchIn.some((item: string) => ['html', 'body', 'title'].includes(item))
  if (target === 'globals') return rule.matchIn.some((item: string) => ['html', 'body', 'resources', 'dynamic'].includes(item))
  return rule.matchIn.includes(target)
}

const hasGlobal = (path: string): boolean => {
  try {
    let value: any = window
    for (const key of path.split('.')) {
      if (value == null || !(key in value)) return false
      value = value[key]
    }
    return true
  } catch {
    return false
  }
}

const hasSelector = (selector: string): boolean => {
  try {
    return Boolean(document.querySelector(selector))
  } catch {
    return false
  }
}

const hasClassPrefix = (classes: Record<string, number>, prefix: string): boolean =>
  Object.keys(classes).some(name => name.startsWith(prefix))

const collectResources = () => {
  const scripts = [...document.scripts].map(s => s.src).filter(isInspectableResourceUrl)
  const stylesheets = [...document.querySelectorAll("link[rel~='stylesheet'], link[as='style']")]
    .map(l => (l as HTMLLinkElement).href).filter(isInspectableResourceUrl)
  const resourceTiming = performance.getEntriesByType('resource').map(e => e.name).filter(isInspectableResourceUrl)
  const images = [...document.images].map(i => i.currentSrc || i.src).filter(isInspectableResourceUrl).slice(0, 200)
  const all = unique([...scripts, ...stylesheets, ...resourceTiming, ...images])
  return { scripts, stylesheets, resourceTiming, images, all, text: all.join('\n').toLowerCase() }
}

const collectClassTokens = () => {
  const counts: Record<string, number> = {}
  const nodes = document.querySelectorAll('[class]')
  const limit = Math.min(nodes.length, 1000)
  for (let i = 0; i < limit; i++) {
    const list = nodes[i].classList
    if (list && list.length) {
      for (let j = 0; j < list.length; j++) {
        const token = list[j]
        if (token) counts[token] = (counts[token] || 0) + 1
      }
    }
  }
  return counts
}

const collectCssVariables = () => {
  const names = new Set<string>()
  const values: Record<string, string> = {}
  const targets = [document.documentElement, document.body].filter(Boolean)
  for (const target of targets) {
    try {
      const style = getComputedStyle(target)
      for (let index = 0; index < style.length; index++) {
        const name = style.item(index)
        if (!name || !name.startsWith('--')) continue
        names.add(name)
        if (!values[name]) values[name] = style.getPropertyValue(name).trim().slice(0, 160)
      }
    } catch { continue }
  }
  const orderedNames = [...names].slice(0, 500)
  return {
    names: orderedNames,
    values,
    text: orderedNames.map(name => `${name}: ${values[name] || ''}`).join('\n').toLowerCase()
  }
}

const getHtmlSample = (): string => {
  return String(document.documentElement?.outerHTML || '').replace(/data:[^"'()<>\s]+/gi, '[inline-data-url]').slice(0, 500000).toLowerCase()
}

const safeGlobalKeys = (): string[] => {
  try { return Object.keys(window).slice(0, 5000) } catch { return [] }
}

const isInspectableResourceUrl = (value: string): boolean => {
  const url = String(value || '').trim()
  return Boolean(url) && !/^(?:data|blob|javascript|about):/i.test(url)
}

const unique = <T>(items: T[]): T[] => [...new Set(items)]

const shortUrl = (raw: string): string => {
  try {
    const url = new URL(raw, location.href)
    return `${url.hostname}${url.pathname}`.slice(0, 96)
  } catch {
    return String(raw).slice(0, 96)
  }
}

const detectAtomicCssOrigin = (cssVariables: { names: string[] }): string => {
  let hasUn = false, hasTw = false
  for (const name of cssVariables.names) {
    if (!hasUn && name.startsWith('--un-')) hasUn = true
    if (!hasTw && name.startsWith('--tw-')) hasTw = true
    if (hasUn && hasTw) break
  }
  if (hasUn) return 'unocss'
  if (hasTw) return 'tailwind'
  return ''
}

const scoreTailwind = (classes: Record<string, number>): number => {
  const tokens = Object.keys(classes)
  let utilityScore = 0, specificScore = 0, bootstrapScore = 0, distinctUtilityCount = 0, count = 0
  const TAILWIND_PATTERN = /^(?:sm|md|lg|xl|2xl):|^-?(?:m|p|mt|mr|mb|ml|mx|my|pt|pr|pb|pl|px|py)-|^(?:text|bg|border|ring|shadow|rounded|grid|flex|items|justify|gap|space|w|h|min-w|max-w|min-h|max-h)-|^(?:hover|focus|active|disabled|dark):|\[[^\]]+\]/
  const TAILWIND_SPECIFIC_PATTERN = /^(?:sm|md|lg|xl|2xl|hover|focus|active|disabled|dark):|^\[[^\]]+\]$|^(?:text|bg|border|ring|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)$|^(?:grid-cols|grid-rows|gap|space-x|space-y)-\d+$|^(?:w|h|min-w|max-w|min-h|max-h)-(?:screen|full|fit|min|max|\d+\/\d+)$/
  for (const token of tokens) {
    if (count++ >= 5000) break
    if (/^(?:container|row|col|btn|navbar|card|dropdown|modal|form|input-group|table|alert|badge)/.test(token)) {
      bootstrapScore += Math.min(classes[token] || 0, 3)
    }
    if (TAILWIND_PATTERN.test(token)) {
      const c = classes[token] || 0
      utilityScore += Math.min(c, 3)
      distinctUtilityCount += 1
      if (TAILWIND_SPECIFIC_PATTERN.test(token)) specificScore += Math.min(c, 3)
    }
  }
  if (specificScore < 3 && bootstrapScore >= 8) return 0
  if (specificScore < 2 && (distinctUtilityCount < 14 || utilityScore < 24)) return 0
  return utilityScore + specificScore * 4
}

const hasReactDomMarker = (): boolean => {
  const nodes = [document.getElementById('root'), document.getElementById('__next'), document.body, ...document.querySelectorAll('[id], [class]')].filter((n): n is Element => n !== null).slice(0, 800)
  for (const node of nodes) {
    try {
      if (Object.keys(node as object).some(key => key.startsWith('__reactFiber$') || key.startsWith('__reactProps$') || key.startsWith('_reactRootContainer'))) return true
    } catch { continue }
  }
  return false
}

const extractVersionFromUrl = (rule: any, url: string): string => {
  if (!url || typeof url !== 'string') return ''
  const name = String(rule?.name || '').trim()
  if (!name) return ''
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const npmToken = name.toLowerCase().replace(/\.js$/i, '').replace(/\s*\/\s*.*$/, '').replace(/\s+/g, '-').replace(/[^a-z0-9@_-]/gi, '')
  const tokens = [npmToken, name.toLowerCase()].filter(Boolean)
  for (const token of tokens) {
    const esc = escape(token)
    const m1 = new RegExp('[/@]' + esc + '@(\\d+\\.\\d+(?:\\.\\d+)?)', 'i').exec(url)
    if (m1) return m1[1]
    const m2 = new RegExp('/' + esc + '/(\\d+\\.\\d+(?:\\.\\d+)?)/', 'i').exec(url)
    if (m2) return m2[1]
    const m3 = new RegExp('/' + esc + '[-._](\\d+\\.\\d+(?:\\.\\d+)?)\\.(?:min\\.)?(?:m?js|css)', 'i').exec(url)
    if (m3) return m3[1]
  }
  return ''
}

const matchCssVariables = (rule: any, cssVariables: { names: string[] }): { confidence: string; evidence: string } | null => {
  if (!Array.isArray(rule.cssVariables) || !rule.cssVariables.length || !cssVariables?.names?.length) return null
  const normalizedNames = new Set(cssVariables.names.map(n => n.toLowerCase()))
  const matched = rule.cssVariables.filter((name: string) => normalizedNames.has(String(name).toLowerCase()))
  const minMatches = Math.max(1, Number(rule.minCssVariableMatches || 1))
  if (matched.length < minMatches) return null
  const preview = matched.slice(0, 6).join(', ')
  const suffix = matched.length > 6 ? ` 等 ${matched.length} 个` : ''
  return { confidence: rule.confidence || '高', evidence: `CSS 变量匹配 ${preview}${suffix}` }
}

interface Collector { (category: string, name: string, confidence: string, evidence?: string, extras?: { version?: string }): void }

const matchJsonRule = (rule: any, context: any): { confidence: string; evidence: string; version?: string } | null => {
  const ruleResourceOnly = rule?.resourceOnly === true
  const globalName = !ruleResourceOnly && shouldMatchTarget(rule, 'globals') ? (rule.globals || []).find((name: string) => hasGlobal(name)) : null
  if (globalName) {
    return { confidence: '高', evidence: `存在 window.${globalName}` }
  }
  const selector = !ruleResourceOnly && shouldMatchTarget(rule, 'selectors') ? (rule.selectors || []).find((s: string) => hasSelector(s)) : null
  if (selector) return { confidence: '高', evidence: `DOM 匹配 ${selector}` }
  const classPrefix = !ruleResourceOnly ? (rule.classPrefixes || []).find((p: string) => context.classes && hasClassPrefix(context.classes, p)) : null
  if (classPrefix) return { confidence: '高', evidence: `存在 ${classPrefix}* 类名` }
  const className = !ruleResourceOnly ? (rule.classNames || []).find((n: string) => context.classes && context.classes[n] > 0) : null
  if (className) return { confidence: '高', evidence: `存在 ${className} 类名` }
  const cssVarMatch = ruleResourceOnly ? null : matchCssVariables(rule, context.cssVariables)
  if (cssVarMatch) return cssVarMatch
  if (!matchesResourceHints(rule, context.resources?.text || context.text || '')) return null
  const lowerHtml = (context.text || '').toLowerCase()
  if (!passesRulePrefilter(rule, context.resources?.text || '', lowerHtml)) return null
  const matchResource = shouldMatchTarget(rule, 'resources')
  const matchHtml = !ruleResourceOnly && !context.resourceOnly && shouldMatchTarget(rule, 'html')
  const allResources = context.resources?.all || []
  const formatUrlEvidence = (resource: string) => resource === location.href ? `页面 URL 匹配 ${shortUrl(resource)}` : `资源 URL 匹配 ${shortUrl(resource)}`
  const combined = getCompiledCombinedPattern(rule)
  if (combined) {
    if (matchResource) {
      const resource = allResources.find((url: string) => { combined.lastIndex = 0; return combined.test(url) })
      if (resource) return { confidence: rule.confidence || '高', evidence: formatUrlEvidence(resource), version: extractVersionFromUrl(rule, resource) }
    }
    if (matchHtml) { combined.lastIndex = 0; if (combined.test(lowerHtml)) return { confidence: rule.confidence || '中', evidence: '页面源码包含规则特征' } }
    return null
  }
  const patterns = getCompiledRulePatterns(rule)
  for (const pattern of patterns) {
    if (matchResource) {
      const resource = allResources.find((url: string) => { pattern.lastIndex = 0; return pattern.test(url) })
      if (resource) return { confidence: rule.confidence || '高', evidence: formatUrlEvidence(resource), version: extractVersionFromUrl(rule, resource) }
    }
    if (matchHtml) { pattern.lastIndex = 0; if (pattern.test(lowerHtml)) return { confidence: rule.confidence || '中', evidence: '页面源码包含规则特征' } }
  }
  return null
}

const detectJsonRuleList = (add: Collector, rules: any[], context: any) => {
  if (!Array.isArray(rules) || !rules.length) return
  for (const rule of rules) {
    const match = matchJsonRule(rule, context)
    if (!match) continue
    add(rule.category || context.defaultCategory || '其他库', rule.name, match.confidence, match.evidence, match.version ? { version: match.version } : undefined)
  }
}

export async function detectPageTechnologies(input: PageDetectionInput): Promise<DetectionResult> {
  const technologies: any[] = []
  const add: Collector = (category, name, confidence, evidence, extras) => {
    const tech: any = { category, name, confidence, evidence: evidence ? [String(evidence)] : [], source: '页面扫描' }
    if (extras?.version) tech.version = extras.version
    technologies.push(tech)
  }
  const resources = collectResources()
  const classTokens = collectClassTokens()
  const cssVariables = collectCssVariables()
  const htmlSample = getHtmlSample()
  const globalKeys = safeGlobalKeys()
  const lowerHtml = htmlSample.toLowerCase()
  await yieldToMainThread()
  if (hasReactDomMarker()) add('前端框架', 'React', '高', 'DOM 节点存在 React Fiber 标记')
  detectJsonRuleList(add, input.frontendFrameworks || [], {
    defaultCategory: '前端框架', resources, classes: classTokens, cssVariables,
    text: `${resources.text}\n${lowerHtml}\n${globalKeys.join('\n')}`, html: lowerHtml,
    resourceConfidence: '中', sourceLabel: 'JSON 前端框架规则'
  })
  detectJsonRuleList(add, input.uiFrameworks || [], {
    defaultCategory: 'UI / CSS 框架', resources, classes: classTokens, cssVariables,
    text: `${resources.text}\n${lowerHtml}\n${cssVariables.text}`, html: lowerHtml,
    resourceConfidence: '中', sourceLabel: 'JSON UI 框架规则'
  })
  await yieldToMainThread()
  const atomicOrigin = detectAtomicCssOrigin(cssVariables)
  if (atomicOrigin === 'unocss') add('UI / CSS 框架', 'UnoCSS', '高', '存在 --un-* CSS 变量')
  else if (atomicOrigin === 'tailwind') add('UI / CSS 框架', 'Tailwind CSS', '高', '存在 --tw-* CSS 变量')
  else if (scoreTailwind(classTokens) >= 10) add('UI / CSS 框架', 'Tailwind CSS', '中', '存在大量 Tailwind 风格原子类名')
  detectJsonRuleList(add, input.buildRuntime || [], {
    defaultCategory: '构建与运行时', resources, classes: classTokens, cssVariables,
    text: `${resources.text}\n${lowerHtml}\n${globalKeys.join('\n')}`, html: lowerHtml,
    sourceLabel: 'JSON 构建运行时规则'
  })
  await yieldToMainThread()
  detectJsonRuleList(add, input.cdnProviders || [], {
    defaultCategory: 'CDN / 托管', resources, classes: classTokens, cssVariables,
    text: resources.text, html: lowerHtml, resourceOnly: true,
    sourceLabel: 'JSON CDN 规则'
  })
  detectJsonRuleList(add, input.backendHints || [], {
    defaultCategory: '后端 / 服务器框架', resources, classes: classTokens,
    text: `${location.href}\n${resources.text}\n${lowerHtml}`, html: lowerHtml,
    sourceLabel: 'JSON 后端规则'
  })
  await yieldToMainThread()
  detectJsonRuleList(add, input.languages || [], {
    defaultCategory: '开发语言 / 运行时', resources, classes: classTokens,
    text: `${resources.text}\n${lowerHtml}`, html: lowerHtml,
    sourceLabel: 'JSON 语言规则'
  })
  return { url: location.href, title: document.title, generatedAt: new Date().toISOString(), technologies }
}