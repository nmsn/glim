interface Props {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function KeyValueRow({ label, value, icon, highlight }: Props) {
  return (
    <div
      className={`
        flex flex-col gap-[2px]
        p-[6px_8px]
        [background:var(--bg-primary)]
        border-b [border-color:var(--border-color)]
        last:border-b-0
        transition-colors
        hover:bg-yellow/5
        ${highlight ? 'bg-green/5' : ''}
      `}
    >
      <span className="text-[8px] text-gray-medium uppercase tracking-[0.3px]">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
      <span className="text-[10px] [color:var(--text-primary)] font-['var(--font-mono)'] break-all">
        {value}
      </span>
    </div>
  );
}
