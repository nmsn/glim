import { useState } from 'react';
import { browser } from 'wxt/browser';
import { getResponseHeaders } from '@/utils/headers';
import { getPageInfo } from '@/utils/page-info';
import { checkSecurityHeaders, type SecurityHeaders } from '@/utils/http-security';
import { getSocialTagsFromContent } from '@/utils/social-tag-popup';
import type { SocialTagResult } from '@/utils/social-tag';
import './App.css';

interface PageInfoResult {
  url: string;
  title: string;
  html: string;
  referrer: string;
  contentType: string | null;
  charset: string | null;
}

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [pageInfo, setPageInfo] = useState<PageInfoResult | null>(null);
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [security, setSecurity] = useState<SecurityHeaders | null>(null);
  const [socialTags, setSocialTags] = useState<SocialTagResult | null>(null);
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');

  const getCurrentTabInfo = async () => {
    setLoading('获取中...');
    setError('');
    setPageInfo(null);
    setHeaders(null);
    setSecurity(null);
    setSocialTags(null);

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setCurrentUrl('无法获取当前页面地址');
        setLoading('');
        return;
      }

      setCurrentUrl(tab.url);

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
