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
        bg-[var(--color-bg)]
        border-b border-[var(--color-border)]
        last:border-b-0
        transition-colors
        hover:bg-[var(--color-hover)]
        ${highlight ? 'bg-[var(--color-hover)]' : ''}
      `}
    >
      <span className="text-[8px] text-[var(--color-muted)] uppercase tracking-[0.3px]">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
      <span className="text-[10px] text-[var(--color-fg)] font-mono break-all">
        {value}
      </span>
    </div>
  );
}
