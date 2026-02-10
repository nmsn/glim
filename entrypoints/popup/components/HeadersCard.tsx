import { SectionHeader } from './SectionHeader';

interface Props {
  headers: Record<string, string>;
}

export function HeadersCard({ headers }: Props) {
  const headerCount = Object.keys(headers).length;

  return (
    <div className="mt-[10px]">
      {/* 区块标题 */}
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-[var(--gray-dark)]">
        <SectionHeader title="响应 Headers" icon="◆" />
        <span className="text-[8px] text-[var(--gray-medium)]">
          {headerCount} 项
        </span>
      </div>

      {/* Headers 列表 */}
      <div className="border border-[var(--border-color)] max-h-[200px] overflow-auto">
        {Object.entries(headers).map(([key, value], index) => (
          <div
            key={key}
            className={`
              p-[4px_6px] font-[var(--font-mono)] text-[9px]
              ${index !== 0 ? 'border-t border-[var(--border-color)]' : ''}
              hover:bg-[rgba(245,197,24,0.05)]
            `}
          >
            <span className="text-[var(--yellow)] font-medium">{key}:</span>
            <span className="text-[var(--gray-light)] break-all ml-1">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
