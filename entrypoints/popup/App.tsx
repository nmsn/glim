import { useState, useEffect, useCallback } from 'react';
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

interface LoadingState {
  url: boolean;
  ip: boolean;
  pageInfo: boolean;
  headers: boolean;
  security: boolean;
  socialTags: boolean;
}

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [security, setSecurity] = useState<SecurityHeaders | null>(null);
  const [socialTags, setSocialTags] = useState<SocialTagResult | null>(null);
  const [ipLocations, setIpLocations] = useState<IpLocationInfo[]>([]);
  const [selectedIpIndex, setSelectedIpIndex] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [loading, setLoading] = useState<LoadingState>({
    url: true,
    ip: false,
    pageInfo: false,
    headers: false,
    security: false,
    socialTags: false,
  });

  const fetchAllData = useCallback(async () => {
    setError('');
    setHasFetched(false);
    setPageInfo(null);
    setHeaders(null);
    setSecurity(null);
    setSocialTags(null);
    setIpLocations([]);
    setSelectedIpIndex(0);

    setLoading(prev => ({ ...prev, url: true }));

    let tabUrl = '';

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setCurrentUrl('无法获取当前页面地址');
        setLoading(prev => ({ ...prev, url: false }));
        return;
      }
      tabUrl = tab.url;
      setCurrentUrl(tabUrl);
    } catch (err: any) {
      setError('获取标签页失败: ' + err.message);
      setLoading(prev => ({ ...prev, url: false }));
      return;
    }

    setLoading(prev => ({ ...prev, url: false }));

    setLoading(prev => ({ ...prev, ip: true, pageInfo: true, headers: true, security: true, socialTags: true }));

    const fetchIP = async () => {
      try {
        const ips = await getIP(tabUrl);

        if (ips.length > 0) {
          const initialIpLocations: IpLocationInfo[] = ips.map(ip => ({
            ip,
            location: null,
            loading: true,
          }));
          setIpLocations(initialIpLocations);

          ips.forEach(async (ip, index) => {
            try {
              const location = await getServerLocation(ip);
              setIpLocations(prev => {
                const updated = [...prev];
                if (updated[index]) {
                  updated[index] = {
                    ...updated[index],
                    location,
                    loading: false,
                  };
                }
                return updated;
              });
            } catch (err: any) {
              setIpLocations(prev => {
                const updated = [...prev];
                if (updated[index]) {
                  updated[index] = {
                    ...updated[index],
                    loading: false,
                    error: err.message || '获取位置信息失败',
                  };
                }
                return updated;
              });
            }
          });
        }
      } catch (err: any) {
        console.error('IP fetch error:', err);
      } finally {
        setLoading(prev => ({ ...prev, ip: false }));
      }
    };

    const fetchPageInfo = async () => {
      try {
        const info = await getPageInfo();
        setPageInfo(info);
      } catch (err: any) {
        console.error('Page info error:', err);
      } finally {
        setLoading(prev => ({ ...prev, pageInfo: false }));
      }
    };

    const fetchHeaders = async () => {
      try {
        const responseHeaders = await getResponseHeaders(tabUrl);
        setHeaders(responseHeaders);
      } catch (err: any) {
        console.error('Headers error:', err);
      } finally {
        setLoading(prev => ({ ...prev, headers: false }));
      }
    };

    const fetchSecurity = async () => {
      try {
        const securityHeaders = await checkSecurityHeaders(tabUrl);
        setSecurity(securityHeaders);
      } catch (err: any) {
        console.error('Security error:', err);
      } finally {
        setLoading(prev => ({ ...prev, security: false }));
      }
    };

    const fetchSocialTags = async () => {
      try {
        const tags = await getSocialTagsFromContent();
        setSocialTags(tags);
      } catch (err: any) {
        console.error('Social tags error:', err);
      } finally {
        setLoading(prev => ({ ...prev, socialTags: false }));
      }
    };

    await Promise.all([
      fetchIP(),
      fetchPageInfo(),
      fetchHeaders(),
      fetchSecurity(),
      fetchSocialTags(),
    ]);

    setHasFetched(true);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const hasSocialData = socialTags && (
    socialTags.title ||
    socialTags.description ||
    socialTags.ogTitle ||
    socialTags.ogImage ||
    socialTags.twitterCard
  );

  const isLoading = Object.values(loading).some(v => v);

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

        <div className="mt-[8px] pl-[10px] border-l-2 border-green">
          <div className="text-[9px] text-gray-medium uppercase tracking-[0.3px] mb-[2px]">
            当前地址
          </div>
          <div className="text-[9px] [color:var(--text-primary)] font-['var(--font-mono)'] break-all">
            {loading.url ? (
              <span className="text-gray-medium">加载中...</span>
            ) : (
              currentUrl || '未知'
            )}
          </div>
        </div>
      </header>

      <main className="space-y-[10px]">
        {error && (
          <div className="p-[8px] border border-yellow bg-yellow/10">
            <span className="text-[10px] text-yellow font-['var(--font-mono)']">
              {error}
            </span>
          </div>
        )}

        {(loading.ip || ipLocations.length > 0) && (
          <ServerLocationCard
            ipLocations={ipLocations}
            selectedIpIndex={selectedIpIndex}
            onSelectIp={setSelectedIpIndex}
            loading={loading.ip}
          />
        )}

        {(loading.pageInfo || pageInfo) && (
          <PageInfoCard pageInfo={pageInfo} loading={loading.pageInfo} />
        )}

        {(loading.socialTags || hasSocialData) && socialTags && (
          <SocialTagsCard socialTags={socialTags} loading={loading.socialTags} />
        )}

        {(loading.security || security) && (
          <SecurityCard security={security} loading={loading.security} />
        )}

        {(loading.headers || headers) && (
          <HeadersCard headers={headers} loading={loading.headers} />
        )}
      </main>

      <footer className="mt-[12px] pt-[8px] border-t border-gray-dark">
        <button
          onClick={fetchAllData}
          disabled={isLoading}
          className={`
            w-full p-[8px] text-[9px] font-['var(--font-display)'] uppercase tracking-[0.5px]
            border transition-all cursor-pointer
            ${isLoading
              ? 'border-gray-dark text-gray-medium cursor-not-allowed'
              : hasFetched
                ? 'border-gray-dark text-gray-light hover:border-green hover:text-green'
                : 'bg-yellow [color:var(--bg-primary)] border-yellow hover:bg-yellow-dim'
            }
          `}
        >
          {isLoading ? '获取中...' : hasFetched ? '再次获取' : '获取当前页面信息'}
        </button>
      </footer>
    </div>
  );
}

export default App;
