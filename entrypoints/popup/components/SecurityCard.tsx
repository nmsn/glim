import { SectionHeader } from './SectionHeader';
import type { SecurityHeaders } from '@/utils/http-security';

interface Props {
  security: SecurityHeaders | null;
  loading?: boolean;
}

interface SecurityItem {
  enabled: boolean;
  name: string;
}

export function SecurityCard({ security, loading }: Props) {
  if (loading && !security) {
    return (
      <div className="mt-[10px]">
        <SectionHeader title="安全检测" loading={loading} />
        <div className="flex flex-col gap-[4px] p-[8px] border [border-color:var(--border-color)] [background:var(--bg-secondary)] opacity-50">
          {['Strict-Transport-Security', 'X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection', 'Content-Security-Policy'].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between p-[6px_8px] border [border-color:var(--border-color)] [background:var(--bg-primary)]"
            >
              <span className="text-[10px] text-gray-medium">
                {name}
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
    { enabled: security.strictTransportPolicy, name: 'Strict-Transport-Security' },
    { enabled: security.xFrameOptions, name: 'X-Frame-Options' },
    { enabled: security.xContentTypeOptions, name: 'X-Content-Type-Options' },
    { enabled: security.xXSSProtection, name: 'X-XSS-Protection' },
  ];

  return (
    <div className="mt-[10px]">
      <SectionHeader title="安全检测" loading={loading} />

      <div className={`flex flex-col gap-[4px] p-[8px] border [border-color:var(--border-color)] [background:var(--bg-secondary)] ${loading ? 'opacity-50' : ''}`}>
        {items.map((item) => (
          <div
            key={item.name}
            className={`
              flex items-center justify-between p-[6px_8px]
              border [border-color:var(--border-color)]
              ${item.enabled
                ? 'bg-green/10 border-green-dim'
                : '[background:var(--bg-primary)]'
              }
            `}
          >
            <span className="text-[10px] text-gray-medium">
              {item.name}
            </span>
            <span className={`
              text-[10px] font-['var(--font-mono)'] font-semibold
              ${item.enabled ? 'text-green' : 'text-yellow'}
            `}>
              {item.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
        <div
          className={`
            flex items-center justify-between p-[6px_8px]
            border [border-color:var(--border-color)]
            ${security.contentSecurityPolicy
              ? 'bg-green/10 border-green-dim'
              : '[background:var(--bg-primary)]'
            }
          `}
        >
          <span className="text-[10px] text-gray-medium">
            Content-Security-Policy
          </span>
          <span className={`
            text-[10px] font-['var(--font-mono)'] font-semibold
            ${security.contentSecurityPolicy ? 'text-green' : 'text-yellow'}
          `}>
            {security.contentSecurityPolicy ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
}
