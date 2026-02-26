import { KeyValueRow } from './KeyValueRow';
import { GlowCard } from './GlowCard';

interface DataItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
}

interface Props {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  data?: DataItem[];
  variant?: 'default' | 'grid';
  loading?: boolean;
}

export function KeyValueCard({ title, children, data, variant = 'default', loading }: Props) {
  return (
    <GlowCard title={title} loading={loading}>
      {variant === 'grid' && data ? (
        <div className="grid grid-cols-2 gap-[1px] bg-[var(--color-border)]">
          {data.map((item, index) => (
            <KeyValueRow
              key={index}
              label={item.label}
              value={item.value}
              icon={item.icon}
              highlight={item.highlight}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {data ? (
            data.map((item, index) => (
              <KeyValueRow
                key={index}
                label={item.label}
                value={item.value}
                icon={item.icon}
                highlight={item.highlight}
              />
            ))
          ) : (
            children
          )}
        </div>
      )}
    </GlowCard>
  );
}
