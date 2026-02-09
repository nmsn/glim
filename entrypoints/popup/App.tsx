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

      // 获取 IP 地址
      const ips = await getIP(tab.url);

      if (ips.length > 0) {
        const initialIpLocations: IpLocationInfo[] = ips.map(ip => ({
          ip,
          location: null,
          loading: true,
        }));
        setIpLocations(initialIpLocations);

        // 并行获取所有 IP 的位置信息
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
      <div className="card" style={{ marginTop: '20px' }}>
        <button onClick={getCurrentTabInfo} disabled={!!loading}>
          {loading || '获取当前页面信息'}
        </button>

        {currentUrl && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p style={{ wordBreak: 'break-all', color: 'inherit' }}>
              <strong>当前地址:</strong> {currentUrl}
            </p>
          </div>
        )}

        {loading && (
          <p style={{ marginTop: '10px', color: 'inherit' }}>{loading}</p>
        )}

        {error && (
          <p style={{ marginTop: '10px', color: '#ff6b6b' }}>
            {error}
          </p>
        )}

        {ipLocations.length > 0 && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p><strong>服务器位置:</strong></p>

            {ipLocations.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '10px',
                marginBottom: '10px',
                flexWrap: 'wrap'
              }}>
                {ipLocations.map((ipInfo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIpIndex(index)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: selectedIpIndex === index
                        ? '1px solid oklch(0.7 0.15 140)'
                        : '1px solid oklch(0.85 0 0)',
                      backgroundColor: selectedIpIndex === index
                        ? 'oklch(0.25 0.1 140 / 0.3)'
                        : 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      transition: 'all 0.2s ease',
                    }}
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
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '6px',
                    border: '1px solid oklch(0.85 0 0)',
                  }}
                >
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '12px', color: 'inherit', fontSize: '14px' }}>
                    {selectedIp.ip}
                  </div>

                  {selectedIp.loading && (
                    <div style={{ color: 'inherit', fontSize: '14px' }}>
                      正在获取位置信息...
                    </div>
                  )}

                  {selectedIp.error && (
                    <div style={{ color: '#ff6b6b', fontSize: '14px' }}>
                      错误: {selectedIp.error}
                    </div>
                  )}

                  {selectedIp.location && (
                    <>
                      <div style={{ fontSize: '14px', color: 'inherit', marginBottom: '12px' }}>
                        <div style={{ marginBottom: '6px' }}>
                          <strong>📍 位置:</strong> {selectedIp.location.city}, {selectedIp.location.country}
                        </div>
                        <div style={{ marginBottom: '6px' }}>
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
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p><strong>页面信息:</strong></p>
            <div style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid oklch(0.85 0 0)',
            }}>
              <div style={{ marginBottom: '8px', color: 'inherit' }}>
                <strong>标题:</strong> {pageInfo.title}
              </div>
              <div style={{ marginBottom: '8px', color: 'inherit' }}>
                <strong>来源:</strong> {pageInfo.referrer || '(无)'}
              </div>
              <div style={{ marginBottom: '8px', color: 'inherit' }}>
                <strong>Content-Type:</strong> {pageInfo.contentType || '(无)'}
              </div>
              <div style={{ marginBottom: '8px', color: 'inherit' }}>
                <strong>字符编码:</strong> {pageInfo.charset || '(无)'}
              </div>
              <div style={{ color: 'inherit' }}>
                <strong>HTML 长度:</strong> {pageInfo.html.length} 字符
              </div>
            </div>
          </div>
        )}

        {hasSocialData && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p><strong>Social Meta Tags:</strong></p>
            <div style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid oklch(0.85 0 0)',
            }}>
              {socialTags?.title && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>标题:</strong> {socialTags.title}
                </div>
              )}
              {socialTags?.description && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>描述:</strong> {socialTags.description}
                </div>
              )}
              {socialTags?.ogTitle && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>OG 标题:</strong> {socialTags.ogTitle}
                </div>
              )}
              {socialTags?.ogDescription && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>OG 描述:</strong> {socialTags.ogDescription}
                </div>
              )}
              {socialTags?.ogImage && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>OG 图片:</strong>
                  <img
                    src={socialTags.ogImage}
                    alt="OG Image"
                    style={{ maxWidth: '100%', maxHeight: '100px', marginTop: '4px', display: 'block' }}
                  />
                </div>
              )}
              {socialTags?.twitterCard && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>Twitter Card:</strong> {socialTags.twitterCard}
                </div>
              )}
              {socialTags?.twitterTitle && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>Twitter 标题:</strong> {socialTags.twitterTitle}
                </div>
              )}
              {socialTags?.twitterImage && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>Twitter 图片:</strong>
                  <img
                    src={socialTags.twitterImage}
                    alt="Twitter Image"
                    style={{ maxWidth: '100%', maxHeight: '100px', marginTop: '4px', display: 'block' }}
                  />
                </div>
              )}
              {socialTags?.canonicalUrl && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>Canonical URL:</strong> {socialTags.canonicalUrl}
                </div>
              )}
              {socialTags?.themeColor && (
                <div style={{ marginBottom: '8px', color: 'inherit' }}>
                  <strong>主题色:</strong>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      backgroundColor: socialTags.themeColor,
                      marginLeft: '8px',
                      border: '1px solid oklch(0.85 0 0)',
                      verticalAlign: 'middle'
                    }}
                  />
                  {' '}{socialTags.themeColor}
                </div>
              )}
            </div>
          </div>
        )}

        {security && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p><strong>安全 Headers:</strong></p>
            <div style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid oklch(0.85 0 0)',
            }}>
              <div style={{ marginBottom: '8px', color: 'inherit' }}>
                <strong>HSTS (Strict-Transport-Security):</strong>{' '}
                {security.strictTransportPolicy ? '✅ 已启用' : '❌ 未启用'}
              </div>
              <div style={{ marginBottom: '8px', color: 'inherit' }}>
                <strong>X-Frame-Options:</strong>{' '}
                {security.xFrameOptions ? '✅ 已启用' : '❌ 未启用'}
              </div>
              <div style={{ marginBottom: '8px', color: 'inherit' }}>
                <strong>X-Content-Type-Options:</strong>{' '}
                {security.xContentTypeOptions ? '✅ 已启用' : '❌ 未启用'}
              </div>
              <div style={{ marginBottom: '8px', color: 'inherit' }}>
                <strong>X-XSS-Protection:</strong>{' '}
                {security.xXSSProtection ? '✅ 已启用' : '❌ 未启用'}
              </div>
              <div style={{ color: 'inherit' }}>
                <strong>CSP (Content-Security-Policy):</strong>{' '}
                {security.contentSecurityPolicy ? '✅ 已启用' : '❌ 未启用'}
              </div>
            </div>
          </div>
        )}

        {headers && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p><strong>响应 Headers:</strong></p>
            <div style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid oklch(0.85 0 0)',
              maxHeight: '200px',
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {Object.entries(headers).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '4px', color: 'inherit' }}>
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
