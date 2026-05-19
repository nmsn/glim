import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Package, Layers, Server, Code2, RefreshCw } from 'lucide-react';
import type { TechnologyRecord, Confidence } from '@/utils/tech-stack/types';
import { GlowCard } from './GlowCard';

interface TechStackCardProps {
  technologies: TechnologyRecord[];
  loading?: boolean;
  onRefresh?: () => void;
}

const CONFIDENCE_ORDER: Record<Confidence, number> = { 高: 3, 中: 2, 低: 1 };

const categoryIcons: Record<string, React.ReactNode> = {
  '前端框架': <Code2 className="w-3 h-3" />,
  'UI / CSS 框架': <Layers className="w-3 h-3" />,
  '前端库': <Package className="w-3 h-3" />,
  '开发语言 / 运行时': <Server className="w-3 h-3" />,
  '后端 / 服务器框架': <Server className="w-3 h-3" />,
};

const confidenceStyle: Record<Confidence, string> = {
  高: 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]',
  中: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  低: 'bg-[var(--color-muted)]/10 border-[var(--color-muted)]/30 text-[var(--color-muted)]',
};

interface TechItemProps {
  tech: TechnologyRecord;
  getConfidenceLabel: (confidence: Confidence) => string;
}

function TechItem({ tech, getConfidenceLabel }: TechItemProps) {
  const [expanded, setExpanded] = useState(false);
  const evidence = tech.evidence || [];

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        onClick={() => evidence.length > 1 && setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-[var(--color-accent)]/5 transition-colors ${evidence.length <= 1 ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span className="text-[11px] text-[var(--color-fg)] font-medium flex-1 truncate">
          {tech.name}
        </span>
        {tech.version && (
          <span className="text-[9px] text-[var(--color-muted)] font-mono">
            v{tech.version}
          </span>
        )}
        <span className={`px-1 py-0.5 text-[9px] font-mono border ${confidenceStyle[tech.confidence]}`}>
          {getConfidenceLabel(tech.confidence)}
        </span>
        {evidence.length > 1 && (
          <span className="text-[var(--color-muted)]">
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
      </button>
      {expanded && evidence.length > 0 && (
        <div className="px-3 py-1.5 bg-[var(--color-bg)]">
          {evidence.map((e, i) => (
            <div key={i} className="text-[9px] text-[var(--color-muted)] font-mono leading-relaxed">
              {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByCategory(techs: TechnologyRecord[]): Record<string, TechnologyRecord[]> {
  const groups: Record<string, TechnologyRecord[]> = {};
  for (const tech of techs) {
    const cat = tech.category || '其他';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(tech);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => {
      const ca = CONFIDENCE_ORDER[a.confidence] || 0;
      const cb = CONFIDENCE_ORDER[b.confidence] || 0;
      if (ca !== cb) return cb - ca;
      return (a.name || '').localeCompare(b.name || '');
    });
  }
  return groups;
}

export function TechStackCard({ technologies, loading, onRefresh }: TechStackCardProps) {
  const { t } = useTranslation();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['前端框架', 'UI / CSS 框架', '前端库', '开发语言 / 运行时', '后端 / 服务器框架']));

  const grouped = useMemo(() => groupByCategory(technologies), [technologies]);

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      '前端框架': t('techStack.categories.frontend'),
      'UI / CSS 框架': t('techStack.categories.uiFramework'),
      '前端库': t('techStack.categories.library'),
      '开发语言 / 运行时': t('techStack.categories.runtime'),
      '后端 / 服务器框架': t('techStack.categories.backend'),
      '网站程序': t('techStack.categories.cms'),
      'CDN / 托管': t('techStack.categories.cdn'),
    };
    return labels[cat] || cat;
  };

  const getConfidenceLabel = (confidence: Confidence) => {
    const labels: Record<Confidence, string> = {
      高: t('techStack.confidence.high'),
      中: t('techStack.confidence.medium'),
      低: t('techStack.confidence.low'),
    };
    return labels[confidence];
  };

  return (
    <GlowCard title={t('techStack.title')} loading={loading}>
      <div className="space-y-[6px]">
        {/* Refresh button */}
        <div className="flex justify-end px-1">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono border transition-all cursor-pointer
              ${loading
                ? 'border-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
              }
            `}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('techStack.refresh')}</span>
          </button>
        </div>
        {loading && technologies.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-[10px] text-[var(--color-muted)] animate-pulse">{t('techStack.detecting')}</span>
          </div>
        ) : technologies.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-[10px] text-[var(--color-muted)]">{t('techStack.noData')}</span>
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              {Object.keys(grouped).map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={`
                    flex items-center gap-1 px-2 py-1 text-[9px] font-mono border transition-all
                    ${expandedCats.has(cat)
                      ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                    }
                  `}
                >
                  {categoryIcons[cat]}
                  <span>{getCategoryLabel(cat)}</span>
                  <span className="opacity-60">({grouped[cat].length})</span>
                </button>
              ))}
            </div>
            {/* Tech list */}
            <div>
              {Object.keys(grouped).filter(cat => expandedCats.has(cat)).map(cat => (
                <div key={cat}>
                  {grouped[cat].map((tech, i) => (
                    <TechItem key={`${cat}-${i}-${tech.name}`} tech={tech} getConfidenceLabel={getConfidenceLabel} />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </GlowCard>
  );
}