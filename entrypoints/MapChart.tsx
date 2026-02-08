import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
} from 'react-simple-maps';

import colors from './colors';
import MapFeatures from '@/assets/map-features.json';

interface Props {
  lat: number,
  lon: number,
  label?: string,
};

const MapChart = (location: Props) => {
  const { lat, lon, label } = location;

  return (
    <ComposableMap
      projection="geoAzimuthalEqualArea"
      projectionConfig={{
        rotate: [0, 0, 0],
        center: [lon + 5, lat - 25],  // 地图中心偏移，使标记点在合适位置
        scale: 200
      }}
    >
      <Geographies
        geography={MapFeatures}  // 使用本地地图数据
        fill={colors.backgroundDarker}
        stroke={colors.primary}
        strokeWidth={0.5}
      >
        {({ geographies }: any) =>
          geographies.map((geo: any) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
      <Annotation
        subject={[lon, lat]}  // 服务器位置标记
        dx={-80}
        dy={-80}
        connectorProps={{
          stroke: colors.textColor,
          strokeWidth: 3,
          strokeLinecap: "round"
        }}
      >
        <text x="-8" textAnchor="end" fill={colors.textColor} fontSize={25}>
          {label || "Server"}
        </text>
      </Annotation>
    </ComposableMap>
  );
};

export default MapChart;