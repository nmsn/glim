import { KeyValueRow } from './KeyValueRow';
import type { SecurityHeaders } from '@/utils/http-security';

interface Props {
  security: SecurityHeaders;
}

interface SecurityItem {
  label: string;
  enabled: boolean;
  icon: string;
  name: string;
}

export function SecurityCard({ security }: Props) {
  const items: SecurityItem[] = [
    { label: 'HSTS', enabled: security.strictTransportPolicy, icon: '🔒', name: 'Strict-Transport-Security' },
    { label: 'X-Frame', enabled: security.xFrameOptions, icon: '🖼️', name: 'X-Frame-Options' },
    { label: 'X-Content', enabled: security.xContentTypeOptions, icon: '📋', name: 'X-Content-Type-Options' },
    { label: 'X-SS', enabled: security.xXSSProtection, icon: '🛡️', name: 'X-XSS-Protection' },
  ];

  return (
    <div className="mt-4">
      <p className="text-left font-semibold mb-3 flex items-center gap-2">
        <span>🛡️</span>
        安全检测
      </p>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex flex-col items-center px-3 py-3 rounded-xl ${
              item.enabled
                ? 'bg-green-200/40'
                : 'bg-yellow-200/50'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-bold text-gray-500 uppercase">{item.label}</span>
            <span className="text-xs font-semibold text-gray-800 mt-1">
              {item.enabled ? '✅ 已启用' : '❌ 未启用'}
            </span>
          </div>
        ))}
      </div>

      <div
        className={`flex flex-col items-center px-3 py-3 rounded-xl ${
          security.contentSecurityPolicy
            ? 'bg-green-200/40'
            : 'bg-yellow-200/50'
        }`}
      >
        <span className="text-xl mb-1">📜</span>
        <span className="text-xs font-bold text-gray-500 uppercase">CSP</span>
        <span className="text-xs font-semibold text-gray-800 mt-1">
          {security.contentSecurityPolicy ? '✅ 已启用' : '❌ 未启用'}
        </span>
      </div>
    </div>
  );
}
