import { CircleLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { useTheme } from 'react-native-paper';
import { COLORS } from '@const/theme-colors';
import type { ActivityKilometreSplit } from '@S/card/types';

export default function MapKmSplit({ kilometresSplit }: { kilometresSplit: ActivityKilometreSplit[] }) {
  const { colors } = useTheme();
  const validKilometreSplits = (Array.isArray(kilometresSplit) ? kilometresSplit : []).filter(({ kilometerPoint }) => {
    const { longitude, latitude } = kilometerPoint?.coords ?? {};
    return Number.isFinite(longitude) && Number.isFinite(latitude);
  });
  const features = validKilometreSplits.map(({ kilometerPoint }, index) => ({
    type: 'Feature' as const,
    properties: { label: `${index + 1}`, sortKey: index },
    geometry: {
      type: 'Point' as const,
      coordinates: [kilometerPoint.coords.longitude, kilometerPoint.coords.latitude],
    },
  }));

  if (!features.length) {
    return null;
  }

  return (
    <ShapeSource
      id="kilometre-splits"
      shape={{
        type: 'FeatureCollection',
        features,
      }}>
      <CircleLayer
        id="kilometre-split-background"
        aboveLayerID="activity-route-line"
        style={{
          circleColor: COLORS.light.surface,
          circleRadius: 15,
          circleStrokeColor: colors.primary,
          circleStrokeWidth: 2,
          circleSortKey: ['get', 'sortKey'],
        }}
      />
      <SymbolLayer
        id="kilometre-split-label"
        aboveLayerID="kilometre-split-background"
        style={{
          textAllowOverlap: true,
          textColor: colors.primary,
          textField: ['get', 'label'],
          textIgnorePlacement: true,
          textPadding: 12,
          textSize: 12,
          symbolSortKey: ['get', 'sortKey'],
        }}
      />
    </ShapeSource>
  );
}
