import { KeyValueRow } from './KeyValueRow';

interface RowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

interface Props {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function KeyValueCard({ title, icon, children }: Props) {
  return (
    <div className="mt-4">
      <p className="text-left font-semibold mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

interface DataItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

interface DataCardProps {
  title: string;
  icon?: React.ReactNode;
  data: DataItem[];
}

export function DataCard({ title, icon, data }: DataCardProps) {
  return (
    <div className="mt-4">
      <p className="text-left font-semibold mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {data.map((item, index) => (
          <KeyValueRow
            key={index}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}
