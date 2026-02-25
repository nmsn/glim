import { SectionHeader } from './SectionHeader';
import { KeyValueRow } from './KeyValueRow';
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
  loading?: boolean;
}

export function ServerLocationCard({
  ipLocations,
  selectedIpIndex,
  onSelectIp,
  loading,
}: Props) {
  const selectedIp = ipLocations[selectedIpIndex];

  return (
    <div className="mt-[10px]">
      <SectionHeader title="服务器位置" loading={loading} />

      {loading && ipLocations.length === 0 && (
        <div className="border [border-color:var(--border-color)] [background:var(--bg-secondary)] p-[8px]">
          <div className="flex items-center gap-2">
            <div className="w-[8px] h-[8px] bg-yellow animate-pulse" />
            <span className="text-[10px] text-gray-medium">正在获取服务器位置...</span>
          </div>
        </div>
      )}

      {ipLocations.length > 1 && (
        <div className="flex gap-[6px] mb-[8px] flex-wrap">
          {ipLocations.map((ipInfo, index) => (
            <button
              key={index}
              onClick={() => onSelectIp(index)}
              className={`
                px-[8px] py-[4px] text-[9px] cursor-pointer transition-all font-['var(--font-mono)']
                border [border-color:var(--border-color)]
                ${selectedIpIndex === index
                  ? 'bg-yellow [color:var(--bg-primary)] border-yellow'
                  : 'transparent text-gray-light hover:border-green hover:text-green'
                }
              `}
            >
              {ipInfo.ip}
            </button>
          ))}
        </div>
      )}

      {selectedIp && (
        <div className="border [border-color:var(--border-color)] [background:var(--bg-secondary)]">
          {selectedIp.loading && (
            <div className="p-[8px] text-[10px] text-gray-medium">
              正在获取位置信息...
            </div>
          )}

          {selectedIp.error && (
            <div className="p-[8px] text-[10px] text-yellow">
              错误: {selectedIp.error}
            </div>
          )}

          {selectedIp.location && (
            <div className="grid grid-cols-[100px_1fr] gap-[1px] bg-[var(--border-color)]">
              <div className="[background:var(--bg-primary)]">
                <KeyValueRow
                  label="位置"
                  value={`${selectedIp.location.city}, ${selectedIp.location.country}`}
                />
                <KeyValueRow
                  label="坐标"
                  value={`${selectedIp.location.coords.lat.toFixed(4)}, ${selectedIp.location.coords.lon.toFixed(4)}`}
                />
                <KeyValueRow
                  label="ISP"
                  value={selectedIp.location.isp}
                />
                <KeyValueRow
                  label="IP"
                  value={selectedIp.ip}
                />
              </div>

              <div className="[background:var(--bg-primary)] min-h-[100px]">
                <MapChart
                  lat={selectedIp.location.coords.lat}
                  lon={selectedIp.location.coords.lon}
                  label={selectedIp.location.city}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
