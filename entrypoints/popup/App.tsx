import { useState } from 'react';
import { browser } from 'wxt/browser';
import { getIPAddress } from '@/utils/get-ip';
import getServerLocation from '@/utils/server-location';
import './App.css';

interface ServerLocation {
  city: string;
  country: string;
  coords: {
    lat: number;
    lon: number;
  };
  isp: string;
}

interface IpLocationInfo {
  ip: string;
  location: ServerLocation | null;
  loading: boolean;
  error?: string;
}

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [ipLocations, setIpLocations] = useState<IpLocationInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const getCurrentTabUrlAndIP = async () => {
    setLoading(true);
    setError('');
    setIpLocations([]);

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setCurrentUrl('无法获取当前页面地址');
        setLoading(false);
        return;
      }

      setCurrentUrl(tab.url);

      const ips = await getIPAddress(tab.url);

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
      } else {
        setError('无法获取该域名的 IP 地址');
      }
    } catch (err: any) {
      setError('获取信息失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

        {ipLocations.length > 0 && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p><strong>IP 地址及服务器位置:</strong></p>
            <div style={{ marginTop: '10px' }}>
              {ipLocations.map((ipInfo, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    marginBottom: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '8px' }}>
                    {ipInfo.ip}
                  </div>

                  {ipInfo.loading && (
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      正在获取位置信息...
                    </div>
                  )}

                  {ipInfo.error && (
                    <div style={{ color: '#ff6b6b', fontSize: '14px' }}>
                      错误: {ipInfo.error}
                    </div>
                  )}

                  {ipInfo.location && (
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>📍 位置:</strong> {ipInfo.location.city}, {ipInfo.location.country}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>🌐 坐标:</strong> {ipInfo.location.coords.lat}, {ipInfo.location.coords.lon}
                      </div>
                      <div>
                        <strong>🏢 ISP:</strong> {ipInfo.location.isp}
                      </div>
                    </div>
                  )}

                  {!ipInfo.loading && !ipInfo.error && !ipInfo.location && (
                    <div style={{ color: '#ff6b6b', fontSize: '14px' }}>
                      未能获取位置信息
                    </div>
                  )}
                </div>
              ))}
            </div>
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
