import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
} from 'react-simple-maps';

import MapFeatures from '@/assets/map-features.json';

interface Props {
  lat: number;
  lon: number;
  label?: string;
}

const MapChart = ({ lat, lon, label }: Props) => {
  return (
    <ComposableMap
      projection="geoAzimuthalEqualArea"
      projectionConfig={{
        rotate: [0, 0, 0],
        center: [lon + 5, lat - 25],
        scale: 300
      }}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Geographies
        geography={MapFeatures}
        fill="var(--color-hover)"
        stroke="var(--color-muted)"
        strokeWidth={0.5}
      >
        {({ geographies }: { geographies: any[] }) =>
          geographies.map((geo: any) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
      <Annotation
        subject={[lon, lat]}
        dx={-30}
        dy={-30}
        connectorProps={{
          stroke: "var(--color-accent)",
          strokeWidth: 1.5,
          strokeLinecap: "round"
        }}
      >
        <text x="-4" textAnchor="end" fill="var(--color-accent)" fontSize={48} fontWeight="bold" style={{ textShadow: '0 0 4px var(--color-accent)' }}>
          {label || "Server"}
        </text>
      </Annotation>
    </ComposableMap>
  );
};

export default MapChart;
