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
        bg-[var(--bg-primary)]
        border-b border-[var(--border-color)]
        last:border-b-0
        transition-colors
        hover:bg-[rgba(245,197,24,0.05)]
        ${highlight ? 'bg-[rgba(0,208,132,0.05)]' : ''}
      `}
    >
      <span className="text-[8px] text-[var(--gray-medium)] uppercase tracking-[0.3px]">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
      <span className="text-[10px] text-[var(--text-primary)] font-[var(--font-mono)] break-all">
        {value}
      </span>
    </div>
  );
}
