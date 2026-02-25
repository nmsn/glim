interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function SectionHeader({ title, icon, loading }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-1 mb-[6px] pb-1 border-b border-gray-dark">
      {loading ? (
        <div className="w-[2px] h-[10px] bg-yellow animate-pulse" />
      ) : icon ? (
        <span className="text-green text-[10px]">{icon}</span>
      ) : (
        <div className="w-[2px] h-[10px] bg-green" />
      )}
      <h2 className="font-['var(--font-display)'] text-[10px] font-medium [color:var(--text-primary)] uppercase tracking-[0.5px]">
        {title}
      </h2>
      {loading && (
        <div className="ml-auto w-[8px] h-[8px] bg-yellow animate-pulse" />
      )}
    </div>
  );
}
