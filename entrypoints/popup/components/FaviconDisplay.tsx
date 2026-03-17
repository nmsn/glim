import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FaviconDisplayProps {
  faviconUrl: string | null;
  loading?: boolean;
  placement?: 'left' | 'right'; // 指定图标放置位置
}

export function FaviconDisplay({ faviconUrl, loading, placement = 'left' }: FaviconDisplayProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    if (!faviconUrl) return;
    
    try {
      await navigator.clipboard.writeText(faviconUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('无法复制图标地址:', err);
    }
  };
  
  if (loading) {
    return (
      <div className={`w-[16px] h-[16px] rounded bg-[var(--color-border)] animate-pulse ${placement === 'left' ? 'mr-[4px]' : 'ml-[4px]'}`} />
    );
  }
  
  if (!faviconUrl) {
    return null; // 如果没有图标，不显示任何内容
  }
  
  return (
    <div className="relative">
      <img 
        src={faviconUrl} 
        alt={t('app.favicon_alt') || "Favicon"} 
        className={`w-[16px] h-[16px] rounded cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={handleCopy}
      />
      {copied && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[var(--color-accent)] text-[var(--color-bg)] text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
          {t('app.copied') || '已复制!'}
        </div>
      )}
    </div>
  );
}