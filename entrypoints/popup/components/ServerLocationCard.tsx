
import { KeyValueCard } from './KeyValueCard';
import MapChart from './MapChart';
import type { ServerLocation } from '@/utils/server-location';

interface IpLocationInfo {
  ip: string;
  location: ServerLocation | null;
  loading: boolean;
  error?: string;
}

interface Props {
  ipLocations: IpLocationInfo[];
  selectedIpIndex: number;
  onSelectIp: (index: number) => void;
}

export function ServerLocationCard({
  ipLocations,
  selectedIpIndex,
  onSelectIp,
}: Props) {
  const selectedIp = ipLocations[selectedIpIndex];

  return (
    <div className="mt-4">
      <p className="text-left font-semibold mb-3 flex items-center gap-2">
        <span>🌍</span>
        服务器位置
      </p>

      {ipLocations.length > 1 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {ipLocations.map((ipInfo, index) => (
            <button
              key={index}
              onClick={() => onSelectIp(index)}
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

      {selectedIp && (
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="font-mono font-bold mb-3 text-sm">
            {selectedIp.ip}
          </div>

          {selectedIp.loading && (
            <div className="text-sm text-gray-500">
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
              <KeyValueCard
                title=""
                icon=""
                data={[
                  { label: '位置', value: `${selectedIp.location.city}, ${selectedIp.location.country}`, icon: '📍' },
                  { label: '坐标', value: `${selectedIp.location.coords.lat}, ${selectedIp.location.coords.lon}`, icon: '🌐' },
                  { label: 'ISP', value: selectedIp.location.isp, icon: '🏢' },
                ]}
              />
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <MapChart
                  lat={selectedIp.location.coords.lat}
                  lon={selectedIp.location.coords.lon}
                  label={selectedIp.location.city}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
