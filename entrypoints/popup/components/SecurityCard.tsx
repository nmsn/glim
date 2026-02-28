import { useTranslation } from 'react-i18next';
import { GlowCard } from './GlowCard';
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
  const { t } = useTranslation();

  if (loading && !security) {
    return (
      <GlowCard title={t('security.title')} loading={loading}>
        <div className="flex flex-col gap-[4px]">
          {['Strict-Transport-Security', 'X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection', 'Content-Security-Policy'].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between p-[6px_8px] border border-[var(--color-border)] bg-[var(--color-hover)]"
            >
              <span className="text-[10px] text-[var(--color-muted)]">
                {name}
              </span>
              <span className="text-[10px] font-mono font-semibold text-[var(--color-muted)]">
                ...
              </span>
            </div>
          ))}
        </div>
      </GlowCard>
    );
  }

  if (!security) return null;

  const items: SecurityItem[] = [
    { enabled: security.strictTransportPolicy, name: t('security.strictTransportSecurity') },
    { enabled: security.xFrameOptions, name: t('security.xFrameOptions') },
    { enabled: security.xContentTypeOptions, name: t('security.xContentTypeOptions') },
    { enabled: security.xXSSProtection, name: t('security.xXssProtection') },
  ];

  return (
    <GlowCard title={t('security.title')} loading={loading}>
      <div className="flex flex-col gap-[4px]">
        {items.map((item) => (
          <div
            key={item.name}
            className={`
              flex items-center justify-between p-[6px_8px]
              border border-[var(--color-border)]
              ${item.enabled
                ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30'
                : 'bg-[var(--color-hover)]'
              }
            `}
          >
            <span className="text-[10px] text-[var(--color-muted)]">
              {item.name}
            </span>
            <span className={`tag ${item.enabled ? 'tag-success' : 'tag-warning'}`}>
              {item.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
        <div
          className={`
            flex items-center justify-between p-[6px_8px]
            border border-[var(--color-border)]
            ${security.contentSecurityPolicy
              ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30'
              : 'bg-[var(--color-hover)]'
            }
          `}
        >
          <span className="text-[10px] text-[var(--color-muted)]">
            {t('security.contentSecurityPolicy')}
          </span>
          <span className={`tag ${security.contentSecurityPolicy ? 'tag-success' : 'tag-warning'}`}>
            {security.contentSecurityPolicy ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </GlowCard>
  );
}
