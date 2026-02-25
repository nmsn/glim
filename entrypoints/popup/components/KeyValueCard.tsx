import { KeyValueRow } from './KeyValueRow';
import { SectionHeader } from './SectionHeader';

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

export function KeyValueCard({ title, icon, children, data, variant = 'default', loading }: Props) {
  return (
    <div className="mt-[10px]">
      <SectionHeader title={title} icon={icon} loading={loading} />

      {variant === 'grid' && data ? (
        <div className={`grid grid-cols-2 gap-[1px] bg-[var(--border-color)] border [border-color:var(--border-color)] ${loading ? 'opacity-50' : ''}`}>
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
        <div className={`flex flex-col gap-0 border [border-color:var(--border-color)] ${loading ? 'opacity-50' : ''}`}>
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
    </div>
  );
}
