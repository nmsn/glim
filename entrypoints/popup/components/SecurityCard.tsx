import { SectionHeader } from './SectionHeader';
import type { SecurityHeaders } from '@/utils/http-security';

interface Props {
  security: SecurityHeaders;
}

interface SecurityItem {
  label: string;
  enabled: boolean;
  name: string;
}

export function SecurityCard({ security }: Props) {
  const items: SecurityItem[] = [
    { label: 'HSTS', enabled: security.strictTransportPolicy, name: 'Strict-Transport-Security' },
    { label: 'X-Frame', enabled: security.xFrameOptions, name: 'X-Frame-Options' },
    { label: 'X-Content', enabled: security.xContentTypeOptions, name: 'X-Content-Type-Options' },
    { label: 'X-SS', enabled: security.xXSSProtection, name: 'X-XSS-Protection' },
  ];

  return (
    <div className="mt-[10px]">
      <SectionHeader title="安全检测" />

      <div className="flex gap-[8px] p-[8px] border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        {items.map((item) => (
          <div
            key={item.label}
            className={`
              flex-1 flex flex-col items-center p-[8px]
              border border-[var(--border-color)]
              ${item.enabled
                ? 'bg-[rgba(0,208,132,0.1)] border-[var(--green-dim)]'
                : 'bg-[var(--bg-primary)]'
              }
            `}
          >
            <span className="text-[8px] text-[var(--gray-medium)] uppercase tracking-[0.3px] mb-[4px]">
              {item.label}
            </span>
            <span className={`
              text-[10px] font-[var(--font-mono)] font-semibold
              ${item.enabled ? 'text-[var(--green)]' : 'text-[var(--yellow)]'}
            `}>
              {item.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
      </div>

      <div
        className={`
          mt-[1px] flex items-center justify-between p-[6px_8px]
          border border-[var(--border-color)]
          ${security.contentSecurityPolicy
            ? 'bg-[rgba(0,208,132,0.1)]'
            : 'bg-[var(--bg-primary)]'
          }
        `}
      >
        <span className="text-[8px] text-[var(--gray-medium)] uppercase tracking-[0.3px]">
          CSP
        </span>
        <span className={`
          text-[10px] font-[var(--font-mono)] font-semibold
          ${security.contentSecurityPolicy ? 'text-[var(--green)]' : 'text-[var(--yellow)]'}
        `}>
          {security.contentSecurityPolicy ? '已启用' : '未启用'}
        </span>
      </div>
    </div>
  );
}
