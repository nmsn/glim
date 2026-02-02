import { useState } from 'react';
import { browser } from 'wxt/browser';
import { getResponseHeaders } from '@/utils/headers';
import { getPageInfo } from '@/utils/page-info';
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
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');

  const getCurrentTabInfo = async () => {
    setLoading('获取中...');
    setError('');
    setPageInfo(null);
    setHeaders(null);

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setCurrentUrl('无法获取当前页面地址');
        setLoading('');
        return;
      }

      setCurrentUrl(tab.url);

      const info = await getPageInfo();
      setPageInfo(info);

      const responseHeaders = await getResponseHeaders(tab.url);
      setHeaders(responseHeaders);

    } catch (err: any) {
      setError('获取信息失败: ' + err.message);
    } finally {
      setLoading('');
    }
  };

  return (
    <>
      <h1>WXT + React</h1>
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
