import { SectionHeader } from './SectionHeader';

interface Props {
  headers: Record<string, string>;
}

export function HeadersCard({ headers }: Props) {
  const headerCount = Object.keys(headers).length;

  return (
    <div className="mt-[10px]">
      <div className="mb-2 pb-1 border-b border-gray-dark">
        <SectionHeader title="响应 Headers" />
      </div>

      <div className="border [border-color:var(--border-color)] max-h-[200px] overflow-auto">
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
