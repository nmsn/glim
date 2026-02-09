import { useState } from 'react';
import { browser } from 'wxt/browser';
import { getResponseHeaders } from '@/utils/headers';
import { getPageInfo } from '@/utils/page-info';
import { checkSecurityHeaders, type SecurityHeaders } from '@/utils/http-security';
import { getSocialTagsFromContent } from '@/utils/social-tag-popup';
import type { SocialTagResult } from '@/utils/social-tag';
import { getIP } from '@/utils/get-ip';
import { getServerLocation, type ServerLocation } from '@/utils/server-location';
import MapChart from './MapChart';
import './App.css';

interface PageInfoResult {
  url: string;
  title: string;
  html: string;
  referrer: string;
  contentType: string | null;
  charset: string | null;
}

interface IpLocationInfo {
  ip: string;
  location: ServerLocation | null;
  loading: boolean;
  error?: string;
}

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [pageInfo, setPageInfo] = useState<PageInfoResult | null>(null);
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [security, setSecurity] = useState<SecurityHeaders | null>(null);
  const [socialTags, setSocialTags] = useState<SocialTagResult | null>(null);
  const [ipLocations, setIpLocations] = useState<IpLocationInfo[]>([]);
  const [selectedIpIndex, setSelectedIpIndex] = useState<number>(0);
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');

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

    } catch (err: any) {
      setError('获取信息失败: ' + err.message);
    } finally {
      setLoading('');
    }
  };

  const hasSocialData = socialTags && (
    socialTags.title ||
    socialTags.description ||
    socialTags.ogTitle ||
    socialTags.ogImage ||
    socialTags.twitterCard
  );

  return (
    <>
      <div className="card mt-5">
        <button
          onClick={getCurrentTabInfo}
          disabled={!!loading}
          className="px-4 py-2 rounded cursor-pointer transition-colors disabled:cursor-not-allowed"
        >
          {loading || '获取当前页面信息'}
        </button>

        {currentUrl && (
          <div className="mt-[15px] text-left">
            <p className="break-all">
              <strong>当前地址:</strong> {currentUrl}
            </p>
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
          <div className="mt-[15px] text-left">
            <p><strong>服务器位置:</strong></p>

            {ipLocations.length > 1 && (
              <div className="flex gap-2 mt-2.5 mb-2.5 flex-wrap">
                {ipLocations.map((ipInfo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIpIndex(index)}
                    className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-all font-mono
                      ${selectedIpIndex === index
                        ? 'border border-teal-500 bg-teal-500/30'
                        : 'border border-gray-200 bg-transparent'
                      }`}
                  >
                    {ipInfo.ip}
                  </button>
                ))}
              </div>
            )}

            {(() => {
              const selectedIp = ipLocations[selectedIpIndex];
              if (!selectedIp) return null;

              return (
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="font-mono font-bold mb-3 text-sm">
                    {selectedIp.ip}
                  </div>

                  {selectedIp.loading && (
                    <div className="text-sm">
                      正在获取位置信息...
                    </div>
                  )}

                  {selectedIp.error && (
                    <div className="text-red-500 text-sm">
                      错误: {selectedIp.error}
                    </div>
                  )}

                  {selectedIp.location && (
                    <>
                      <div className="text-sm mb-3">
                        <div className="mb-1.5">
                          <strong>📍 位置:</strong> {selectedIp.location.city}, {selectedIp.location.country}
                        </div>
                        <div className="mb-1.5">
                          <strong>🌐 坐标:</strong> {selectedIp.location.coords.lat}, {selectedIp.location.coords.lon}
                        </div>
                        <div>
                          <strong>🏢 ISP:</strong> {selectedIp.location.isp}
                        </div>
                      </div>
                      <MapChart
                        lat={selectedIp.location.coords.lat}
                        lon={selectedIp.location.coords.lon}
                        label={selectedIp.location.city}
                      />
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {pageInfo && (
          <div className="mt-[15px] text-left">
            <p><strong>页面信息:</strong></p>
            <div className="mt-2.5 p-3 rounded-lg border border-gray-200">
              <div className="mb-2">
                <strong>标题:</strong> {pageInfo.title}
              </div>
              <div className="mb-2">
                <strong>来源:</strong> {pageInfo.referrer || '(无)'}
              </div>
              <div className="mb-2">
                <strong>Content-Type:</strong> {pageInfo.contentType || '(无)'}
              </div>
              <div className="mb-2">
                <strong>字符编码:</strong> {pageInfo.charset || '(无)'}
              </div>
              <div>
                <strong>HTML 长度:</strong> {pageInfo.html.length} 字符
              </div>
            </div>
          </div>
        )}

        {hasSocialData && (
          <div className="mt-[15px] text-left">
            <p><strong>Social Meta Tags:</strong></p>
            <div className="mt-2.5 p-3 rounded-lg border border-gray-200">
              {socialTags?.title && (
                <div className="mb-2">
                  <strong>标题:</strong> {socialTags.title}
                </div>
              )}
              {socialTags?.description && (
                <div className="mb-2">
                  <strong>描述:</strong> {socialTags.description}
                </div>
              )}
              {socialTags?.ogTitle && (
                <div className="mb-2">
                  <strong>OG 标题:</strong> {socialTags.ogTitle}
                </div>
              )}
              {socialTags?.ogDescription && (
                <div className="mb-2">
                  <strong>OG 描述:</strong> {socialTags.ogDescription}
                </div>
              )}
              {socialTags?.ogImage && (
                <div className="mb-2">
                  <strong>OG 图片:</strong>
                  <img
                    src={socialTags.ogImage}
                    alt="OG Image"
                    className="max-w-full max-h-[100px] mt-1 block"
                  />
                </div>
              )}
              {socialTags?.twitterCard && (
                <div className="mb-2">
                  <strong>Twitter Card:</strong> {socialTags.twitterCard}
                </div>
              )}
              {socialTags?.twitterTitle && (
                <div className="mb-2">
                  <strong>Twitter 标题:</strong> {socialTags.twitterTitle}
                </div>
              )}
              {socialTags?.twitterImage && (
                <div className="mb-2">
                  <strong>Twitter 图片:</strong>
                  <img
                    src={socialTags.twitterImage}
                    alt="Twitter Image"
                    className="max-w-full max-h-[100px] mt-1 block"
                  />
                </div>
              )}
              {socialTags?.canonicalUrl && (
                <div className="mb-2">
                  <strong>Canonical URL:</strong> {socialTags.canonicalUrl}
                </div>
              )}
              {socialTags?.themeColor && (
                <div className="mb-2">
                  <strong>主题色:</strong>
                  <span
                    className="inline-block w-4 h-4 ml-2 border border-gray-200 align-middle"
                    style={{ backgroundColor: socialTags.themeColor }}
                  />
                  {' '}{socialTags.themeColor}
                </div>
              )}
            </div>
          </div>
        )}

        {security && (
          <div className="mt-[15px] text-left">
            <p><strong>安全 Headers:</strong></p>
            <div className="mt-2.5 p-3 rounded-lg border border-gray-200">
              <div className="mb-2">
                <strong>HSTS (Strict-Transport-Security):</strong>{' '}
                {security.strictTransportPolicy ? '✅ 已启用' : '❌ 未启用'}
              </div>
              <div className="mb-2">
                <strong>X-Frame-Options:</strong>{' '}
                {security.xFrameOptions ? '✅ 已启用' : '❌ 未启用'}
              </div>
              <div className="mb-2">
                <strong>X-Content-Type-Options:</strong>{' '}
                {security.xContentTypeOptions ? '✅ 已启用' : '❌ 未启用'}
              </div>
              <div className="mb-2">
                <strong>X-XSS-Protection:</strong>{' '}
                {security.xXSSProtection ? '✅ 已启用' : '❌ 未启用'}
              </div>
              <div>
                <strong>CSP (Content-Security-Policy):</strong>{' '}
                {security.contentSecurityPolicy ? '✅ 已启用' : '❌ 未启用'}
              </div>
            </div>
          </div>
        )}

        {headers && (
          <div className="mt-[15px] text-left">
            <p><strong>响应 Headers:</strong></p>
            <div className="mt-2.5 p-3 rounded-lg border border-gray-200 max-h-[200px] overflow-auto font-mono text-xs">
              {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
