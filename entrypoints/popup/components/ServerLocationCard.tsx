import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlowCard } from './GlowCard';
import MapChart from './MapChart';
import { CharScan } from './CharScan';
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

function InfoRow({ label, value, className = '', wrap = false, alignTop = false }: { label: string; value: string; className?: string; wrap?: boolean; alignTop?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex ${alignTop ? 'items-start' : 'items-center'} justify-between gap-[8px] px-[8px] border-b border-[var(--color-border)] hover:bg-[var(--color-hover)] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-[9px] text-[var(--color-muted)] uppercase tracking-[0.3px] shrink-0 pt-[2px]">
        <CharScan text={label} className={isHovered ? 'animate' : ''} />
      </span>
      <span className={`text-[10px] text-[var(--color-fg)] font-mono text-right ${wrap ? 'break-all' : 'truncate'}`}>
        {value}
      </span>
    </div>
  );
}

export function ServerLocationCard({
  ipLocations,
  selectedIpIndex,
  onSelectIp,
  loading,
}: Props) {
  const { t } = useTranslation();
  const selectedIp = ipLocations[selectedIpIndex];

  if (loading && ipLocations.length === 0) {
    return (
      <GlowCard title={t('serverLocation.title')} loading={loading}>
        <div className="flex items-center justify-between gap-[8px] p-[4px_8px]">
          <span className="text-[9px] text-[var(--color-muted)] uppercase tracking-[0.3px]">状态</span>
          <span className="text-[10px] text-[var(--color-muted)]">正在获取服务器位置...</span>
        </div>
      </GlowCard>
    );
  }

  if (ipLocations.length === 0) return null;

  return (
    <GlowCard title={t('serverLocation.title')} loading={loading}>
      <>
        {ipLocations.length > 1 && (
          <div className="flex gap-[6px] mb-[4px] flex-wrap">
            {ipLocations.map((ipInfo, index) => (
              <button
                key={index}
                onClick={() => onSelectIp(index)}
                className={`
                  px-[6px] py-[2px] text-[9px] cursor-pointer transition-all font-mono
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
              <div className="flex items-center justify-between gap-[8px] p-[4px_8px]">
                <span className="text-[9px] text-[var(--color-muted)] uppercase tracking-[0.3px]">状态</span>
                <span className="text-[10px] text-[var(--color-muted)]">正在获取位置信息...</span>
              </div>
            )}

            {selectedIp.error && (
              <div className="flex items-center justify-between gap-[8px] p-[4px_8px]">
                <span className="text-[9px] text-[var(--color-muted)] uppercase tracking-[0.3px]">错误</span>
                <span className="text-[10px] text-[var(--color-accent)]">{selectedIp.error}</span>
              </div>
            )}

            {selectedIp.location && (
              <div className="flex">
                <div className="flex-1 flex flex-col border-r border-[var(--color-border)]">
                  <InfoRow
                    label={t('serverLocation.location')}
                    value={`${selectedIp.location.city}, ${selectedIp.location.country}`}
                    className="h-[24px]"
                  />
                  <InfoRow
                    label={t('serverLocation.coordinates')}
                    value={`${selectedIp.location.coords.lat.toFixed(4)}, ${selectedIp.location.coords.lon.toFixed(4)}`}
                    className="h-[24px]"
                  />
                  <InfoRow
                    label={t('serverLocation.ip')}
                    value={selectedIp.ip}
                    className="h-[24px]"
                  />
                  <InfoRow
                    label={t('serverLocation.isp')}
                    value={selectedIp.location.isp}
                    wrap={true}
                    alignTop={true}
                    className="flex-1 pt-[4px]"
                  />
                </div>
                <div className="w-[120px] h-[120px] shrink-0">
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
