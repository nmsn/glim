interface Props {
  headers: Record<string, string>;
}

export function HeadersCard({ headers }: Props) {
  return (
    <div className="mt-4">
      <p className="text-left font-semibold mb-3 flex items-center gap-2">
        <span>📋</span>
        响应 Headers
        <span className="ml-auto text-xs font-normal text-gray-500">
          {Object.keys(headers).length} 项
        </span>
      </p>

      <div className="p-3 rounded-lg border border-gray-200 max-h-[200px] overflow-auto font-mono text-xs">
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="mb-1">
            <span className="text-purple-600 font-bold">{key}:</span>{' '}
            <span className="text-gray-800 break-all">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
