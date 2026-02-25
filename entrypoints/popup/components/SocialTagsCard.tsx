import { SectionHeader } from './SectionHeader';
import { KeyValueRow } from './KeyValueRow';
import type { SocialTagResult } from '@/utils/social-tag';

interface Props {
  socialTags: SocialTagResult | null;
  loading?: boolean;
}

export function SocialTagsCard({ socialTags, loading }: Props) {
  if (loading && !socialTags) {
    return (
      <div className="mt-[10px]">
        <SectionHeader title="社交标签" loading={loading} />
        <div className="border [border-color:var(--border-color)] p-[8px]">
          <div className="flex items-center gap-2">
            <div className="w-[8px] h-[8px] bg-yellow animate-pulse" />
            <span className="text-[10px] text-gray-medium">正在获取社交标签...</span>
          </div>
        </div>
      </div>
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
    <div className="mt-[10px]">
      <SectionHeader title="社交标签" loading={loading} />

      {(socialTags.ogImage || socialTags.twitterImage) && (
        <div className="mb-[8px] overflow-hidden border [border-color:var(--border-color)]">
          <img
            src={socialTags.ogImage || socialTags.twitterImage || ''}
            alt="Social Preview"
            className="w-full max-h-[120px] object-cover"
          />
        </div>
      )}

      <div className={`border [border-color:var(--border-color)] ${loading ? 'opacity-50' : ''}`}>
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
          <div className="flex items-center justify-between p-[6px_8px] border-b [border-color:var(--border-color)] last:border-b-0 hover:bg-yellow/5">
            <span className="text-[8px] text-gray-medium uppercase tracking-[0.3px]">
              主题色
            </span>
            <span className="flex items-center gap-2">
              <span
                className="w-[12px] h-[12px] border [border-color:var(--border-color)]"
                style={{ backgroundColor: socialTags.themeColor }}
              />
              <span className="text-[10px] [color:var(--text-primary)] font-['var(--font-mono)']">
                {socialTags.themeColor}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
