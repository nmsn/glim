interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-1 mb-[6px] pb-1 border-b border-[var(--gray-dark)]">
      {/* 装饰性竖线图标 */}
      {icon ? (
        <span className="text-[var(--green)] text-[10px]">{icon}</span>
      ) : (
        <div className="w-[2px] h-[10px] bg-[var(--green)]" />
      )}
      {/* 标题文字 */}
      <h2 className="font-[var(--font-display)] text-[10px] font-medium text-[var(--text-primary)] uppercase tracking-[0.5px]">
        {title}
      </h2>
    </div>
  );
}
