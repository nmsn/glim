import { matchesHeaderPatterns, lower, createCollector } from './rule-matcher'
import type { TechnologyRecord } from './types'

const ALLOWLIST_STYLE_HEADERS = new Set([
  'content-security-policy', 'content-security-policy-report-only', 'report-to', 'reporting-endpoints',
  'permissions-policy', 'feature-policy', 'expect-ct', 'nel'
])

const SPOOF_INDICATOR_HEADERS = [
  'server', 'x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version', 'x-drupal-cache',
  'x-drupal-dynamic-cache', 'x-generator', 'x-powered-cms', 'x-varnish', 'x-rails-version',
  'x-runtime', 'x-php-version', 'x-jenkins', 'x-cocoon-version'
]

const SPOOF_PRONE_CATEGORIES = new Set(['网站程序', '后端 / 服务器框架', 'CMS / 电商平台'])

const normalizeHeaders = (responseHeaders: Array<{ name: string; value: string }>): Record<string, string> => {
  const map: Record<string, string> = {}
  for (const header of responseHeaders || []) {
    const name = (header.name || '').toLowerCase()
    if (!name) continue
    const value = header.value || ''
    if (map[name]) map[name] += `, ${value}`
    else map[name] = value
  }
  return map
}

const extractServerVersion = (value: string): string => {
  const match = /\/(\d+(?:\.\d+){1,3})/.exec(String(value || ''))
  return match ? match[1] : ''
}

const attachServerVersion = (techs: TechnologyRecord[], rawHeaderValue: string, headerName: 'server' | 'x-powered-by') => {
  if (!rawHeaderValue) return
  const primarySegment = String(rawHeaderValue).split(',')[0]?.trim() || ''
  if (!primarySegment) return
  const version = extractServerVersion(primarySegment)
  if (!version) return
  const prefix = headerName + ':'
  for (const tech of techs) {
    if (tech.version) continue
    const evidence = Array.isArray(tech.evidence) ? tech.evidence : []
    if (evidence.some((e: string) => String(e || '').toLowerCase().startsWith(prefix))) {
      tech.version = version
    }
  }
}

const markSpoofedHeaderDetections = (technologies: TechnologyRecord[], headers: Record<string, string>): void => {
  let count = 0
  for (const name of SPOOF_INDICATOR_HEADERS) {
    const value = headers[name]
    if (typeof value === 'string' && value.trim()) count += 1
  }
  const serverHasMultiple = typeof headers.server === 'string' && headers.server.includes(',')
  if (count < 4 && !serverHasMultiple) return
  const SPOOF_NOTICE = '响应头里同时出现多种不同主体身份字段，识别结果可能被伪造'
  for (const tech of technologies) {
    if (!SPOOF_PRONE_CATEGORIES.has(tech.category)) continue
    tech.confidence = '低'
    const evidence: string[] = Array.isArray(tech.evidence) ? tech.evidence : []
    if (!evidence.some((line: string) => line?.includes(SPOOF_NOTICE))) {
      tech.evidence = [SPOOF_NOTICE, ...evidence]
    }
  }
}

interface HeaderRules {
  serverProducts?: any[]
  poweredByProducts?: any[]
  headerPatterns?: any[]
  cdnProviders?: any[]
  languages?: any[]
  websitePrograms?: any[]
  interestingHeaders?: string[]
  unknownCdnPatterns?: string[]
}

const applyHeaderValueRuleList = (
  add: (category: string, name: string, confidence: string, evidence?: string, extras?: { url?: string }) => void,
  rules: any[],
  value: string,
  rawValue: string,
  headerName: string
) => {
  if (!value || !Array.isArray(rules) || !rules.length) return
  const isSplitField = headerName === 'server' || headerName === 'x-powered-by'
  const primaryValue = isSplitField ? value.split(',')[0].trim() : value
  if (!primaryValue) return
  const displayValue = isSplitField ? (rawValue?.split(',')[0]?.trim() ?? rawValue) : rawValue
  for (const rule of rules) {
    if (!matchesHeaderPatterns(rule.patterns, primaryValue, rule)) continue
    const evidence = rule.evidence || `${headerName}: ${displayValue}`
    add(rule.category || '其他库', rule.name, rule.confidence || '高', evidence, rule.url ? { url: rule.url } : undefined)
    if (isSplitField) break
  }
}

const applyHeaderRuleList = (
  add: (category: string, name: string, confidence: string, evidence?: string) => void,
  rules: any[],
  defaultCategory: string,
  headerBlob: string,
  sourceLabel: string,
  lowerHeaderBlob: string
) => {
  if (!Array.isArray(rules) || !rules.length) return
  for (const rule of rules) {
    const hints = rule.__hints || []
    if (hints.length && !hints.some((hint: string) => lowerHeaderBlob.includes(hint))) continue
    const matched = (rule.patterns || []).some((pattern: string) => {
      try { return new RegExp(pattern, 'i').test(headerBlob) } catch { return false }
    })
    if (matched) {
      add(rule.category || defaultCategory, rule.name, rule.confidence || '中', rule.evidence || `${sourceLabel} 匹配`)
    }
  }
}

export const detectFromHeaders = (
  headers: Record<string, string>,
  url: string,
  headerRules: HeaderRules = {}
): TechnologyRecord[] => {
  const technologies: TechnologyRecord[] = []
  const add = createCollector(technologies, '响应头')
  const server = lower(headers.server)
  const poweredBy = lower(headers['x-powered-by'])
  const headerBlob = Object.entries(headers)
    .filter(([name]) => !ALLOWLIST_STYLE_HEADERS.has(name.toLowerCase()))
    .map(([name, value]) => `${name}: ${value}`)
    .join('\n') + `\nurl: ${url || ''}`
  const lowerHeaderBlob = lower(headerBlob)
  applyHeaderValueRuleList(add, headerRules.serverProducts || [], server, headers.server, 'server')
  applyHeaderValueRuleList(add, headerRules.poweredByProducts || [], poweredBy, headers['x-powered-by'], 'x-powered-by')
  attachServerVersion(technologies, headers.server, 'server')
  attachServerVersion(technologies, headers['x-powered-by'], 'x-powered-by')
  applyHeaderRuleList(add, headerRules.headerPatterns || [], '其他库', headerBlob, 'JSON 响应头规则', lowerHeaderBlob)
  const hasUnknownCdn = headerRules.unknownCdnPatterns &&
    (headerRules.unknownCdnPatterns as any[]).some((p: any) => new RegExp(p, 'i').test(lowerHeaderBlob)) &&
    !technologies.some(t => t.category === 'CDN / 托管');
  if (hasUnknownCdn) {
    add('CDN / 托管', '未知 / 自定义 CDN', '低', '响应头包含 CDN 或 Edge 缓存线索')
  }
  applyHeaderRuleList(add, headerRules.cdnProviders || [], 'CDN / 托管', headerBlob, 'JSON CDN 响应头规则', lowerHeaderBlob)
  applyHeaderRuleList(add, headerRules.languages || [], '开发语言 / 运行时', headerBlob, 'JSON 语言响应头规则', lowerHeaderBlob)
  applyHeaderRuleList(add, headerRules.websitePrograms || [], '网站程序', headerBlob, 'JSON 网站程序响应头规则', lowerHeaderBlob)
  markSpoofedHeaderDetections(technologies, headers)
  return technologies
}

export const buildHeaderRecord = (
  details: { url: string; type: string; method: string; statusCode: number; responseHeaders: Array<{ name: string; value: string }>; statusLine?: string },
  headerRules: HeaderRules
) => {
  const normalizedHeaders = normalizeHeaders(details.responseHeaders)
  const headers: Record<string, string> = {}
  for (const name of (headerRules.interestingHeaders || [])) {
    if (normalizedHeaders[name]) headers[name] = normalizedHeaders[name]
  }
  const httpProtocol = /^HTTP\/([0-9.]+)/i.exec(String(details.statusLine || ''))?.[1]?.toLowerCase() || ''
  return {
    url: details.url,
    type: details.type,
    method: details.method,
    statusCode: details.statusCode,
    httpProtocol,
    time: Date.now(),
    headers,
    technologies: detectFromHeaders(normalizedHeaders, details.url, headerRules)
  }
}