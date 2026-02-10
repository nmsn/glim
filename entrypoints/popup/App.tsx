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
    return hasFetched ? '🔄 再次获取' : '获取当前页面信息';
  };

  return (
    <>
      <div className="card mt-5">
        <button
          onClick={getCurrentTabInfo}
          disabled={!!loading}
          className="px-4 py-2 rounded cursor-pointer transition-colors disabled:cursor-not-allowed"
        >
          {getButtonText()}
        </button>

        {currentUrl && (
          <div className="mt-[15px] text-left">
            <KeyValueRow
              label="当前地址"
              value={currentUrl}
              icon="🔗"
            />
          </div>
        )}

        {loading && (
          <p className="mt-[10px]">{loading}</p>
        )}

        {error && (
          <p className="mt-[10px] text-red-500">
            {error}
          </p>
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
      </div>
    </>
  );
}

export default App;
