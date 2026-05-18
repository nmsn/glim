export type Confidence = '高' | '中' | '低'

export interface RawJsonRule {
  name: string
  category?: string
  kind?: string
  confidence?: Confidence
  matchType?: 'regex' | 'keyword'
  patterns?: string[]
  selectors?: string[]
  globals?: string[]
  matchIn?: string[]
  cssVariables?: string[]
  classPrefixes?: string[]
  classNames?: string[]
  minCssVariableMatches?: number
  minPatternMatches?: number
  resourceOnly?: boolean
  versionFrom?: string
  url?: string
  evidence?: string
  source?: string
}

export interface TechnologyRecord {
  category: string
  name: string
  kind?: string
  confidence: Confidence
  evidence?: string[]
  sources?: string[]
  source?: string
  url?: string
  version?: string
}

export interface ResourceDomain {
  domain: string
  count: number
}

export interface PageResources {
  total: number
  scripts: string[]
  stylesheets: string[]
  themeAssetUrls: string[]
  resourceDomains: ResourceDomain[]
  cssVariableCount: number
  metaGenerator: string | null
  manifest: string | null
}

export interface PageDetectionInput {
  url: string
  frontendFrameworks: any[]
  uiFrameworks: any[]
  buildRuntime: any[]
  cdnProviders: any[]
  backendHints: any[]
  languages: any[]
}

export interface PageDetectionResult {
  url: string
  title: string
  generatedAt: string
  technologies: TechnologyRecord[]
  resources: PageResources
}

export interface DynamicSnapshot {
  startedAt: number
  updatedAt: number
  url: string
  title: string
  resources: string[]
  scripts: string[]
  stylesheets: string[]
  iframes: string[]
  feedLinks: Array<{ href: string; type?: string; title?: string }>
  domMarkers: string[]
  mutationCount: number
  resourceCount: number
}

export interface RuleConfig {
  schemaVersion?: number
  [key: string]: unknown
}

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