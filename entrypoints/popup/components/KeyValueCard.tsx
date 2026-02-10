import { KeyValueRow } from './KeyValueRow';

interface DataItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

interface Props {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  data?: DataItem[];
}

export function KeyValueCard({ title, icon, children, data }: Props) {
  return (
    <div className="mt-4">
      <p className="text-left font-semibold mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {data ? (
          data.map((item, index) => (
            <KeyValueRow
              key={index}
              label={item.label}
              value={item.value}
              icon={item.icon}
            />
          ))
        ) : (
          children
        )}
      </div>
    </div>
  );
}
