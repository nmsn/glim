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
    <div className="mt-4">
      <p className="text-left font-semibold mb-3 flex items-center gap-2">
        <span>📱</span>
        社交预览
      </p>

      {(socialTags.ogImage || socialTags.twitterImage) && (
        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <img
            src={socialTags.ogImage || socialTags.twitterImage || ''}
            alt="Social Preview"
            className="w-full max-h-[150px] object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {socialTags.title && (
          <KeyValueRow label="标题" value={socialTags.title} icon="📝" />
        )}
        {socialTags.description && (
          <KeyValueRow label="描述" value={socialTags.description} icon="📃" />
        )}
        {socialTags.ogTitle && (
          <KeyValueRow label="OG 标题" value={socialTags.ogTitle} icon="🔵" />
        )}
        {socialTags.ogDescription && (
          <KeyValueRow label="OG 描述" value={socialTags.ogDescription} icon="🔵" />
        )}
        {socialTags.twitterCard && (
          <KeyValueRow label="Twitter Card" value={socialTags.twitterCard} icon="🐦" />
        )}
        {socialTags.twitterTitle && (
          <KeyValueRow label="Twitter 标题" value={socialTags.twitterTitle} icon="🐦" />
        )}
        {socialTags.canonicalUrl && (
          <KeyValueRow label="Canonical URL" value={socialTags.canonicalUrl} icon="🔗" />
        )}
        {socialTags.themeColor && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-white/60 rounded-xl shadow-sm">
            <span className="text-lg">🎨</span>
            <span className="text-xs font-bold text-gray-500 min-w-[80px]">主题色</span>
            <span className="flex-1 text-right flex items-center justify-end gap-2">
              <span
                className="w-6 h-6 rounded-lg border border-gray-200 shadow-sm"
                style={{ backgroundColor: socialTags.themeColor }}
              />
              <span className="text-sm font-semibold text-gray-800 font-mono">
                {socialTags.themeColor}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
