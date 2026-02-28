import { useTranslation } from 'react-i18next';
import { GlowCard } from './GlowCard';
import { KeyValueRow } from './KeyValueRow';
import type { SocialTagResult } from '@/utils/social-tag';

interface Props {
  socialTags: SocialTagResult | null;
  loading?: boolean;
}

export function SocialTagsCard({ socialTags, loading }: Props) {
  const { t } = useTranslation();

  if (loading && !socialTags) {
    return (
      <GlowCard title={t('socialTags.title')} loading={loading}>
        <div className="flex items-center gap-2 p-[8px]">
          <div className="w-[8px] h-[8px] bg-[var(--color-accent)] animate-pulse" />
          <span className="text-[10px] text-[var(--color-muted)]">正在获取社交标签...</span>
        </div>
      </GlowCard>
    );
  }

  if (!socialTags) return null;

  const hasData = (
    socialTags.title ||
    socialTags.description ||
    socialTags.ogTitle ||
    socialTags.ogImage ||
    socialTags.twitterCard
  );

  if (!hasData) return null;

  return (
    <GlowCard title={t('socialTags.title')} loading={loading}>
      <>
        {(socialTags.ogImage || socialTags.twitterImage) && (
          <div className="mb-[8px] overflow-hidden border border-[var(--color-border)]">
            <img
              src={socialTags.ogImage || socialTags.twitterImage || ''}
              alt="Social Preview"
              className="w-full max-h-[120px] object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-0">
          {socialTags.title && (
            <KeyValueRow label={t('pageInfo.title_label')} value={socialTags.title} />
          )}
          {socialTags.description && (
            <KeyValueRow label={t('pageInfo.description')} value={socialTags.description} />
          )}
          {socialTags.ogTitle && (
            <KeyValueRow label={t('socialTags.ogTitle')} value={socialTags.ogTitle} />
          )}
          {socialTags.ogDescription && (
            <KeyValueRow label="OG Description" value={socialTags.ogDescription} />
          )}
          {socialTags.twitterCard && (
            <KeyValueRow label={t('socialTags.twitterCard')} value={socialTags.twitterCard} />
          )}
          {socialTags.twitterTitle && (
            <KeyValueRow label="Twitter Title" value={socialTags.twitterTitle} />
          )}
          {socialTags.canonicalUrl && (
            <KeyValueRow label="Canonical URL" value={socialTags.canonicalUrl} />
          )}
          {socialTags.themeColor && (
            <div className="flex items-center justify-between p-[6px_8px] border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-hover)]">
              <span className="text-[8px] text-[var(--color-muted)] uppercase tracking-[0.3px]">
                Theme Color
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="w-[12px] h-[12px] border border-[var(--color-border)]"
                  style={{ backgroundColor: socialTags.themeColor }}
                />
                <span className="text-[10px] text-[var(--color-fg)] font-mono">
                  {socialTags.themeColor}
                </span>
              </span>
            </div>
          )}
        </div>
      </>
    </GlowCard>
  );
}
