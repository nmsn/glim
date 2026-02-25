import { SectionHeader } from './SectionHeader';
import type { SecurityHeaders } from '@/utils/http-security';

interface Props {
  security: SecurityHeaders | null;
  loading?: boolean;
}

interface SecurityItem {
  label: string;
  enabled: boolean;
  name: string;
}

export function SecurityCard({ security, loading }: Props) {
  if (loading && !security) {
    return (
      <div className="mt-[10px]">
        <SectionHeader title="安全检测" loading={loading} />
        <div className="flex gap-[8px] p-[8px] border [border-color:var(--border-color)] [background:var(--bg-secondary)] opacity-50">
          {['HSTS', 'X-Frame', 'X-Content', 'X-SS'].map((label) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center p-[8px] border [border-color:var(--border-color)] [background:var(--bg-primary)]"
            >
              <span className="text-[8px] text-gray-medium uppercase tracking-[0.3px] mb-[4px]">
                {label}
              </span>
              <span className="text-[10px] font-['var(--font-mono)'] font-semibold text-gray-medium">
                ...
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!security) return null;

  const items: SecurityItem[] = [
    { label: 'HSTS', enabled: security.strictTransportPolicy, name: 'Strict-Transport-Security' },
    { label: 'X-Frame', enabled: security.xFrameOptions, name: 'X-Frame-Options' },
    { label: 'X-Content', enabled: security.xContentTypeOptions, name: 'X-Content-Type-Options' },
    { label: 'X-SS', enabled: security.xXSSProtection, name: 'X-XSS-Protection' },
  ];

  return (
    <div className="mt-[10px]">
      <SectionHeader title="安全检测" loading={loading} />

      <div className={`flex gap-[8px] p-[8px] border [border-color:var(--border-color)] [background:var(--bg-secondary)] ${loading ? 'opacity-50' : ''}`}>
        {items.map((item) => (
          <div
            key={item.label}
            className={`
              flex-1 flex flex-col items-center p-[8px]
              border [border-color:var(--border-color)]
              ${item.enabled
                ? 'bg-green/10 border-green-dim'
                : '[background:var(--bg-primary)]'
              }
            `}
          >
            <span className="text-[8px] text-gray-medium uppercase tracking-[0.3px] mb-[4px]">
              {item.label}
            </span>
            <span className={`
              text-[10px] font-['var(--font-mono)'] font-semibold
              ${item.enabled ? 'text-green' : 'text-yellow'}
            `}>
              {item.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
      </div>

      <div
        className={`
          mt-[1px] flex items-center justify-between p-[6px_8px]
          border [border-color:var(--border-color)]
          ${security.contentSecurityPolicy
            ? 'bg-green/10'
            : '[background:var(--bg-primary)]'
          }
          ${loading ? 'opacity-50' : ''}
        `}
      >
        <span className="text-[8px] text-gray-medium uppercase tracking-[0.3px]">
          CSP
        </span>
        <span className={`
          text-[10px] font-['var(--font-mono)'] font-semibold
          ${security.contentSecurityPolicy ? 'text-green' : 'text-yellow'}
        `}>
          {security.contentSecurityPolicy ? '已启用' : '未启用'}
        </span>
      </div>
    </div>
  );
}
