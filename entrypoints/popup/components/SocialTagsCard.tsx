import { SectionHeader } from './SectionHeader';
import { KeyValueRow } from './KeyValueRow';
import type { SocialTagResult } from '@/utils/social-tag';

interface Props {
  socialTags: SocialTagResult;
}

export function SocialTagsCard({ socialTags }: Props) {
  const hasData = (
    socialTags.title ||
    socialTags.description ||
    socialTags.ogTitle ||
    socialTags.ogImage ||
    socialTags.twitterCard
  );

  if (!hasData) return null;

  return (
    <div className="mt-[10px]">
      <SectionHeader title="社交标签" />

      {(socialTags.ogImage || socialTags.twitterImage) && (
        <div className="mb-[8px] overflow-hidden border border-[var(--border-color)]">
          <img
            src={socialTags.ogImage || socialTags.twitterImage || ''}
            alt="Social Preview"
            className="w-full max-h-[120px] object-cover"
          />
        </div>
      )}

      <div className="border border-[var(--border-color)]">
        {socialTags.title && (
          <KeyValueRow label="标题" value={socialTags.title} />
        )}
        {socialTags.description && (
          <KeyValueRow label="描述" value={socialTags.description} />
        )}
        {socialTags.ogTitle && (
          <KeyValueRow label="OG 标题" value={socialTags.ogTitle} />
        )}
        {socialTags.ogDescription && (
          <KeyValueRow label="OG 描述" value={socialTags.ogDescription} />
        )}
        {socialTags.twitterCard && (
          <KeyValueRow label="Twitter Card" value={socialTags.twitterCard} />
        )}
        {socialTags.twitterTitle && (
          <KeyValueRow label="Twitter 标题" value={socialTags.twitterTitle} />
        )}
        {socialTags.canonicalUrl && (
          <KeyValueRow label="Canonical URL" value={socialTags.canonicalUrl} />
        )}
        {socialTags.themeColor && (
          <div className="flex items-center justify-between p-[6px_8px] border-b border-[var(--border-color)] last:border-b-0 hover:bg-[rgba(245,197,24,0.05)]">
            <span className="text-[8px] text-[var(--gray-medium)] uppercase tracking-[0.3px]">
              主题色
            </span>
            <span className="flex items-center gap-2">
              <span
                className="w-[12px] h-[12px] border border-[var(--border-color)]"
                style={{ backgroundColor: socialTags.themeColor }}
              />
              <span className="text-[10px] text-[var(--text-primary)] font-[var(--font-mono)]">
                {socialTags.themeColor}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
