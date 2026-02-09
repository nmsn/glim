interface Props {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export function KeyValueRow({ label, value, icon }: Props) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 bg-white/60 rounded-xl shadow-sm">
      {icon && <span className="text-lg">{icon}</span>}
      <span className="text-xs font-bold text-gray-500 min-w-[80px]">{label}</span>
      <span className="text-sm font-semibold text-gray-800 flex-1 text-right break-all">
        {value}
      </span>
    </div>
  );
}
