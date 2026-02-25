import { SectionHeader } from './SectionHeader';

interface Props {
  headers: Record<string, string> | null;
  loading?: boolean;
}

export function HeadersCard({ headers, loading }: Props) {
  if (loading && !headers) {
    return (
      <div className="mt-[10px]">
        <div className="mb-2 pb-1 border-b border-gray-dark">
          <SectionHeader title="响应 Headers" loading={loading} />
        </div>
        <div className="border [border-color:var(--border-color)] p-[8px]">
          <div className="flex items-center gap-2">
            <div className="w-[8px] h-[8px] bg-yellow animate-pulse" />
            <span className="text-[10px] text-gray-medium">正在获取 Headers...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!headers) return null;

  const headerCount = Object.keys(headers).length;

  return (
    <div className="mt-[10px]">
      <div className="mb-2 pb-1 border-b border-gray-dark">
        <SectionHeader title="响应 Headers" loading={loading} />
      </div>

      <div className={`border [border-color:var(--border-color)] max-h-[200px] overflow-auto ${loading ? 'opacity-50' : ''}`}>
        {Object.entries(headers).map(([key, value], index) => (
          <div
            key={key}
            className={`
              p-[4px_6px] font-['var(--font-mono)'] text-[9px]
              ${index !== 0 ? 'border-t [border-color:var(--border-color)]' : ''}
              hover:bg-yellow/5
            `}
          >
            <span className="text-yellow font-medium">{key}:</span>
            <span className="text-gray-light break-all ml-1">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
