import React, { useState } from 'react';
import { CharScan } from './CharScan';

interface Props {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function KeyValueRow({ label, value, icon, highlight }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        flex items-center justify-between gap-[8px]
        p-[4px_8px]
        bg-[var(--color-bg)]
        border-b border-[var(--color-border)]
        last:border-b-0
        transition-colors
        hover:bg-[var(--color-hover)]
        ${highlight ? 'bg-[var(--color-hover)]' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-[9px] text-[var(--color-muted)] uppercase tracking-[0.3px] shrink-0">
        {icon && <span className="mr-1">{icon}</span>}
        <CharScan text={label} className={isHovered ? 'animate' : ''} />
      </span>
      <span className="text-[10px] text-[var(--color-fg)] font-mono text-right truncate">
        {value}
      </span>
    </div>
  );
}
