import { GlowCard } from './GlowCard';
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

  if (loading && ipLocations.length === 0) {
    return (
      <GlowCard title="服务器位置" loading={loading}>
        <div className="flex items-center gap-2 p-[8px]">
          <div className="w-[8px] h-[8px] bg-[var(--color-accent)] animate-pulse" />
          <span className="text-[10px] text-[var(--color-muted)]">正在获取服务器位置...</span>
        </div>
      </GlowCard>
    );
  }

  if (ipLocations.length === 0) return null;

  return (
    <GlowCard title="服务器位置" loading={loading}>
      <>
        {ipLocations.length > 1 && (
          <div className="flex gap-[6px] mb-[8px] flex-wrap">
            {ipLocations.map((ipInfo, index) => (
              <button
                key={index}
                onClick={() => onSelectIp(index)}
                className={`
                  px-[8px] py-[4px] text-[9px] cursor-pointer transition-all font-mono
                  border border-[var(--color-border)]
                  ${selectedIpIndex === index
                    ? 'bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]'
                    : 'transparent text-[var(--color-fg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                  }
                `}
              >
                {ipInfo.ip}
              </button>
            ))}
          </div>
        )}

        {selectedIp && (
          <div className="border border-[var(--color-border)]">
            {selectedIp.loading && (
              <div className="p-[8px] text-[10px] text-[var(--color-muted)]">
                正在获取位置信息...
              </div>
            )}

            {selectedIp.error && (
              <div className="p-[8px] text-[10px] text-[var(--color-accent)]">
                错误: {selectedIp.error}
              </div>
            )}

            {selectedIp.location && (
              <div className="grid grid-cols-[100px_1fr] gap-[1px] bg-[var(--color-border)]">
                <div className="bg-[var(--color-bg)]">
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

                <div className="bg-[var(--color-bg)] min-h-[100px]">
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
      </>
    </GlowCard>
  );
}
