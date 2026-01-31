import { useState } from 'react';
import { browser } from 'wxt/browser';
import { getIPAddress } from '@/utils/get-ip';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const getCurrentTabUrlAndIP = async () => {
    setLoading(true);
    setError('');
    setIpAddresses([]);

    try {
      // 获取当前标签页 URL
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setCurrentUrl('无法获取当前页面地址');
        setLoading(false);
        return;
      }

      setCurrentUrl(tab.url);

      // 获取 IP 地址
      const ips = await getIPAddress(tab.url);
      if (ips.length > 0) {
        setIpAddresses(ips);
      } else {
        setError('无法获取该域名的 IP 地址');
      }
    } catch (err) {
      setError('获取信息失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> */}
      <h1>WXT + React</h1>
      <div className="card" style={{ marginTop: '20px' }}>
        <button onClick={getCurrentTabUrlAndIP} disabled={loading}>
          {loading ? '获取中...' : '获取当前页面地址和 IP'}
        </button>

        {currentUrl && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p style={{ wordBreak: 'break-all' }}>
              <strong>当前地址:</strong> {currentUrl}
            </p>
          </div>
        )}

        {ipAddresses.length > 0 && (
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <p><strong>IP 地址:</strong></p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              {ipAddresses.map((ip, index) => (
                <li key={index}>{ip}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p style={{ marginTop: '10px', color: '#ff6b6b' }}>
            {error}
          </p>
        )}
      </div>
    </>
  );
}

export default App;
