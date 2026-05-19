import { useState, useMemo } from 'react';
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

const categoryLabel: Record<string, string> = {
  '前端框架': 'Frontend',
  'UI / CSS 框架': 'UI Framework',
  '前端库': 'Library',
  '开发语言 / 运行时': 'Runtime',
  '后端 / 服务器框架': 'Backend',
  '网站程序': 'CMS',
  'CDN / 托管': 'CDN',
};

const confidenceColor: Record<Confidence, string> = {
  高: 'text-[var(--color-accent)]',
  中: 'text-yellow-500',
  低: 'text-[var(--color-muted)]',
};

interface TechItemProps {
  tech: TechnologyRecord;
}

function TechItem({ tech }: TechItemProps) {
  const [expanded, setExpanded] = useState(false);
  const evidence = tech.evidence || [];

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        onClick={() => evidence.length > 1 && setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-[var(--color-accent)]/5 transition-colors ${evidence.length <= 1 ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span className={`font-mono text-[10px] ${confidenceColor[tech.confidence]}`}>
          {tech.confidence}
        </span>
        <span className="text-[11px] text-[var(--color-fg)] font-medium flex-1 truncate">
          {tech.name}
        </span>
        {tech.version && (
          <span className="text-[9px] text-[var(--color-muted)] font-mono">
            v{tech.version}
          </span>
        )}
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

  const displayTechs = useMemo(() => {
    const cats = Object.keys(grouped);
    if (cats.length === 0) return null;
    const cat = cats.find(c => c === '前端框架') || cats[0];
    return grouped[cat] || [];
  }, [grouped]);

  return (
    <GlowCard title="Tech Stack" loading={loading}>
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
            <span>Refresh</span>
          </button>
        </div>
        {loading && technologies.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-[10px] text-[var(--color-muted)] animate-pulse">Detecting...</span>
          </div>
        ) : technologies.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-[10px] text-[var(--color-muted)]">No tech stack detected</span>
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
                  <span>{categoryLabel[cat] || cat}</span>
                  <span className="opacity-60">({grouped[cat].length})</span>
                </button>
              ))}
            </div>
            {/* Tech list */}
            <div>
              {Object.keys(grouped).filter(cat => expandedCats.has(cat)).map(cat => (
                <div key={cat}>
                  {grouped[cat].map((tech, i) => (
                    <TechItem key={`${cat}-${i}-${tech.name}`} tech={tech} />
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