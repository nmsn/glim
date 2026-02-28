import { useTranslation } from 'react-i18next';
import { GlowCard } from './GlowCard';

interface Props {
  headers: Record<string, string> | null;
  loading?: boolean;
}

export function HeadersCard({ headers, loading }: Props) {
  const { t } = useTranslation();

  if (loading && !headers) {
    return (
      <GlowCard title={t('headers.title')} loading={loading}>
        <div className="flex items-center gap-2 p-[8px]">
          <div className="w-[8px] h-[8px] bg-[var(--color-accent)] animate-pulse" />
          <span className="text-[10px] text-[var(--color-muted)]">正在获取 Headers...</span>
        </div>
      </GlowCard>
    );
  }

  if (!headers) return null;

  return (
    <GlowCard title={t('headers.title')} loading={loading}>
      <div className="">
        {Object.entries(headers).map(([key, value], index) => (
          <div
            key={key}
            className={`
              p-[4px_6px] font-mono text-[9px]
              ${index !== 0 ? 'border-t border-[var(--color-border)]' : ''}
              hover:bg-[var(--color-hover)]
            `}
          >
            <span className="text-[var(--color-accent)] font-medium">{key}:</span>
            <span className="text-[var(--color-fg)] break-all ml-1 opacity-80">{value}</span>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}
