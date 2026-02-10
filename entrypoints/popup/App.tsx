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
import './style.css';

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

  const getButtonText = () => {
    if (loading) return loading;
    return hasFetched ? '再次获取' : '获取当前页面信息';
  };

  return (
    <div className="min-w-[360px] min-h-[600px] [background:var(--bg-primary)] p-[8px] relative font-['var(--font-mono)']">
      <div className="scanline" />

      <header className="border-b border-yellow pb-[8px] mb-[10px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="status-indicator" />
            <h1 className="font-[family-name:var(--font-display)] text-[12px] font-semibold text-yellow uppercase tracking-[1px]">
              GLIM
            </h1>
          </div>
        </div>

        {currentUrl && (
          <div className="mt-[8px] pl-[10px] border-l-2 border-green">
            <div className="text-[9px] text-gray-medium uppercase tracking-[0.3px] mb-[2px]">
              当前地址
            </div>
            <div className="text-[9px] [color:var(--text-primary)] font-['var(--font-mono)'] break-all">
              {currentUrl}
            </div>
          </div>
        )}
      </header>

      <main className="space-y-[10px]">
        {loading && (
          <div className="flex items-center gap-2 p-[8px] border [border-color:var(--border-color)] [background:var(--bg-secondary)]">
            <div className="w-[8px] h-[8px] bg-yellow animate-pulse" />
            <span className="text-[10px] text-gray-light font-['var(--font-mono)']">
              {loading}
            </span>
          </div>
        )}

        {error && (
          <div className="p-[8px] border border-yellow bg-yellow/10">
            <span className="text-[10px] text-yellow font-['var(--font-mono)']">
              {error}
            </span>
          </div>
        )}

        {ipLocations.length > 0 && (
          <ServerLocationCard
            ipLocations={ipLocations}
            selectedIpIndex={selectedIpIndex}
            onSelectIp={setSelectedIpIndex}
          />
        )}

        {pageInfo && (
          <PageInfoCard pageInfo={pageInfo} />
        )}

        {hasSocialData && socialTags && (
          <SocialTagsCard socialTags={socialTags} />
        )}

        {security && (
          <SecurityCard security={security} />
        )}

        {headers && (
          <HeadersCard headers={headers} />
        )}
      </main>

      <footer className="mt-[12px] pt-[8px] border-t border-gray-dark">
        <button
          onClick={getCurrentTabInfo}
          disabled={!!loading}
          className={`
            w-full p-[8px] text-[9px] font-['var(--font-display)'] uppercase tracking-[0.5px]
            border transition-all cursor-pointer
            ${loading
              ? 'border-gray-dark text-gray-medium cursor-not-allowed'
              : hasFetched
                ? 'border-gray-dark text-gray-light hover:border-green hover:text-green'
                : 'bg-yellow [color:var(--bg-primary)] border-yellow hover:bg-yellow-dim'
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
