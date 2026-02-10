import { useState, useEffect } from 'react';
import { browser } from 'wxt/browser';
import { getResponseHeaders } from '@/utils/headers';
import { getPageInfo, type PageInfo } from '@/utils/page-info';
import { checkSecurityHeaders, type SecurityHeaders } from '@/utils/http-security';
import { getSocialTagsFromContent } from '@/utils/social-tag-popup';
import type { SocialTagResult } from '@/utils/social-tag';
import { getIP } from '@/utils/get-ip';
import { getServerLocation, type ServerLocation } from '@/utils/server-location';
import { ServerLocationCard } from './components/ServerLocationCard';
import { PageInfoCard } from './components/PageInfoCard';
import { SocialTagsCard } from './components/SocialTagsCard';
import { SecurityCard } from './components/SecurityCard';
import { HeadersCard } from './components/HeadersCard';
import { KeyValueRow } from './components/KeyValueRow';
import './App.css';

interface IpLocationInfo {
  ip: string;
  location: ServerLocation | null;
  loading: boolean;
  error?: string;
}

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [security, setSecurity] = useState<SecurityHeaders | null>(null);
  const [socialTags, setSocialTags] = useState<SocialTagResult | null>(null);
  const [ipLocations, setIpLocations] = useState<IpLocationInfo[]>([]);
  const [selectedIpIndex, setSelectedIpIndex] = useState<number>(0);
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const getCurrentTabInfo = async () => {
    setLoading('获取中...');
    setError('');
    setPageInfo(null);
    setHeaders(null);
    setSecurity(null);
    setSocialTags(null);
    setIpLocations([]);
    setSelectedIpIndex(0);

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setCurrentUrl('无法获取当前页面地址');
        setLoading('');
        return;
      }

      setCurrentUrl(tab.url);

      const ips = await getIP(tab.url);

      if (ips.length > 0) {
        const initialIpLocations: IpLocationInfo[] = ips.map(ip => ({
          ip,
          location: null,
          loading: true,
        }));
        setIpLocations(initialIpLocations);

        const locationPromises = ips.map(async (ip, index) => {
          try {
            const location = await getServerLocation(ip);
            setIpLocations(prev => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                location,
                loading: false,
              };
              return updated;
            });
          } catch (err: any) {
            setIpLocations(prev => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                loading: false,
                error: err.message || '获取位置信息失败',
              };
              return updated;
            });
          }
        });

        await Promise.all(locationPromises);
      }

      const [info, responseHeaders, securityHeaders, tags] = await Promise.all([
        getPageInfo(),
        getResponseHeaders(tab.url),
        checkSecurityHeaders(tab.url),
        getSocialTagsFromContent().catch(() => null)
      ]);

      setPageInfo(info);
      setHeaders(responseHeaders);
      setSecurity(securityHeaders);
      setSocialTags(tags);
      setHasFetched(true);

    } catch (err: any) {
      setError('获取信息失败: ' + err.message);
    } finally {
      setLoading('');
    }
  };

  // 组件挂载时自动执行获取
  useEffect(() => {
    getCurrentTabInfo();
  }, []);

  const hasSocialData = socialTags && (
    socialTags.title ||
    socialTags.description ||
    socialTags.ogTitle ||
    socialTags.ogImage ||
    socialTags.twitterCard
  );

  // 按钮文案：首次获取中显示"获取中..."，已获取过显示"再次获取"
  const getButtonText = () => {
    if (loading) return loading;
    return hasFetched ? '再次获取' : '获取当前页面信息';
  };

  return (
    <div className="min-w-[360px] min-h-[600px] bg-[var(--bg-primary)] p-[8px] relative">
      {/* 扫描线装饰 */}
      <div className="scanline" />

      {/* 头部 */}
      <header className="border-b border-[var(--yellow)] pb-[8px] mb-[10px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 状态指示器 */}
            <div className="flex gap-[4px]">
              <div className="w-[6px] h-[6px] bg-[var(--green)] animate-pulse" />
              <div className="w-[6px] h-[6px] bg-[var(--yellow)] animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="w-[6px] h-[6px] bg-[var(--gray-medium)] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            {/* 标题 */}
            <h1 className="font-[var(--font-display)] text-[12px] font-semibold text-[var(--yellow)] uppercase tracking-[1px]">
              GLIM
            </h1>
          </div>
          {/* 版本号 */}
          <span className="text-[8px] text-[var(--gray-medium)] font-[var(--font-mono)]">v1.0.0</span>
        </div>

        {/* 当前 URL */}
        {currentUrl && (
          <div className="mt-[8px] pl-[10px] border-l-2 border-[var(--green)]">
            <div className="text-[9px] text-[var(--gray-medium)] uppercase tracking-[0.3px] mb-[2px]">
              当前地址
            </div>
            <div className="text-[9px] text-[var(--text-primary)] font-[var(--font-mono)] break-all">
              {currentUrl}
            </div>
          </div>
        )}
      </header>

      {/* 内容区 */}
      <main className="space-y-[10px]">
        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center gap-2 p-[8px] border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="w-[8px] h-[8px] bg-[var(--yellow)] animate-pulse" />
            <span className="text-[10px] text-[var(--gray-light)] font-[var(--font-mono)]">
              {loading}
            </span>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="p-[8px] border border-[var(--yellow)] bg-[rgba(245,197,24,0.1)]">
            <span className="text-[10px] text-[var(--yellow)] font-[var(--font-mono)]">
              {error}
            </span>
          </div>
        )}

        {/* 服务器位置 */}
        {ipLocations.length > 0 && (
          <ServerLocationCard
            ipLocations={ipLocations}
            selectedIpIndex={selectedIpIndex}
            onSelectIp={setSelectedIpIndex}
          />
        )}

        {/* 页面信息 */}
        {pageInfo && (
          <PageInfoCard pageInfo={pageInfo} />
        )}

        {/* 社交标签 */}
        {hasSocialData && socialTags && (
          <SocialTagsCard socialTags={socialTags} />
        )}

        {/* 安全检测 */}
        {security && (
          <SecurityCard security={security} />
        )}

        {/* 响应头 */}
        {headers && (
          <HeadersCard headers={headers} />
        )}
      </main>

      {/* 底部按钮 */}
      <footer className="mt-[12px] pt-[8px] border-t border-[var(--gray-dark)]">
        <button
          onClick={getCurrentTabInfo}
          disabled={!!loading}
          className={`
            w-full p-[8px] text-[9px] font-[var(--font-display)] uppercase tracking-[0.5px]
            border transition-all cursor-pointer
            ${loading
              ? 'border-[var(--gray-dark)] text-[var(--gray-medium)] cursor-not-allowed'
              : hasFetched
                ? 'border-[var(--gray-dark)] text-[var(--gray-light)] hover:border-[var(--green)] hover:text-[var(--green)]'
                : 'bg-[var(--yellow)] text-[var(--bg-primary)] border-[var(--yellow)] hover:bg-[var(--yellow-dim)]'
            }
          `}
        >
          {getButtonText()}
        </button>
      </footer>
    </div>
  );
}

export default App;
