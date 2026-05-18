import type { TechnologyRecord, Confidence } from './types'

const strongerConfidence = (a: Confidence, b: Confidence): Confidence => {
  const ranks: Record<Confidence, number> = { 高: 3, 中: 2, 低: 1 }
  return (ranks[b] || 1) > (ranks[a] || 1) ? b : a
}

const normalizeTechName = (name: unknown): string =>
  String(name || '').toLowerCase().replace(/[^a-z0-9一-龥]+/g, '')

const frontendAliasTechnologies: Record<string, { category: string; name: string }> = {
  angular: { category: '前端框架', name: 'Angular' },
  jquery: { category: '前端框架', name: 'jQuery' },
  jquerycompat: { category: '前端框架', name: 'jQuery' },
  preact: { category: '前端框架', name: 'Preact' },
  react: { category: '前端框架', name: 'React' },
  svelte: { category: '前端框架', name: 'Svelte' },
  twitterbootstrap: { category: 'UI / CSS 框架', name: 'Bootstrap' },
  vue: { category: '前端框架', name: 'Vue' },
  vuejs: { category: '前端框架', name: 'Vue' }
}

const phpRuntimeTechnologyNames = new Set([
  'WordPress', 'ThinkPHP', 'Discuz!', 'phpBB', 'Drupal', 'Joomla', 'Typecho',
  'Z-BlogPHP', 'Emlog', 'Magento', 'OpenCart', 'PrestaShop', 'DedeCMS',
  'EmpireCMS', 'PHPCMS', 'PHPWind', 'Laravel', 'Symfony', 'Yii', 'CodeIgniter', 'CakePHP'
].map(normalizeTechName))

const isPhpRuntimeSource = (item: TechnologyRecord): boolean => {
  const cat = item?.category
  const name = item?.name
  return typeof cat === 'string' && phpRuntimeTechnologyNames.has(normalizeTechName(name))
}

const isFrontendFallback = (item: TechnologyRecord): boolean =>
  item?.category === '前端库' && /^疑似前端库:/i.test(String(item?.name || '').trim())

const compareSemver = (a: string, b: string): number => {
  const parse = (s: string) => String(s || '').split('.').map(x => parseInt(x, 10) || 0)
  const aa = parse(a), bb = parse(b)
  const len = Math.max(aa.length, bb.length)
  for (let i = 0; i < len; i++) {
    const av = aa[i] || 0, bv = bb[i] || 0
    if (av !== bv) return av - bv
  }
  return 0
}

export const mergeTechnologyRecords = (items: TechnologyRecord[]): TechnologyRecord[] => {
  const map = new Map<string, TechnologyRecord>()
  for (const item of items) {
    const key = `${item.category}::${item.name}`.toLowerCase()
    const current = map.get(key) || { ...item, evidence: [] }
    if (!current.url && item.url) current.url = item.url
    if (item.version && (!current.version || compareSemver(item.version, current.version) > 0)) {
      current.version = item.version
    }
    for (const evidence of item.evidence || []) {
      const existingEvidence = current.evidence || []
      if (!existingEvidence.includes(evidence)) existingEvidence.push(evidence)
      current.evidence = existingEvidence
    }
    current.confidence = strongerConfidence(current.confidence || '低', item.confidence || '低')
    map.set(key, current)
  }
  // 推断 PHP 运行时
  const hasPhp = [...map.values()].some(t => t.category === '开发语言 / 运行时' && normalizeTechName(t.name) === normalizeTechName('PHP'))
  if (!hasPhp) {
    const phpSource = [...map.values()].find(isPhpRuntimeSource)
    if (phpSource) {
      const name = String(phpSource.name || '').trim()
      const evidence = phpSource.category === '后端 / 服务器框架'
        ? `由 ${name} 后端框架推断 PHP 后端运行时`
        : `由 ${name} 技术线索推断 PHP 后端运行时`
      map.set('开发语言 / 运行时::PHP', {
        category: '开发语言 / 运行时', name: 'PHP', confidence: '中',
        evidence: [evidence], source: '派生推断'
      })
    }
  }
  return [...map.values()]
}