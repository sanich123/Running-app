import { useState } from 'react';
import { CircleLayer, MarkerView, ShapeSource } from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import type { SelectedKilometre } from './types';
import type { ActivityKilometreSplit } from '@S/card/types';

export default function RouteKilometreMarkers({
  kilometresSplit,
  kilometreUnit = 'km',
}: {
  kilometresSplit?: ActivityKilometreSplit[];
  kilometreUnit?: string;
} = {}) {
  const { colors } = useTheme();
  const { kilometresSplit: kilometreSplitsFromStore } = useAppSelector(({ location }) => location);
  const routeKilometreSplits = kilometresSplit ?? kilometreSplitsFromStore;
  const [selectedKilometre, setSelectedKilometre] = useState<SelectedKilometre | null>(null);
  const validKilometreSplits = (Array.isArray(routeKilometreSplits) ? routeKilometreSplits : []).filter(
    (
      split,
    ): split is ActivityKilometreSplit & {
      kilometerPoint: NonNullable<ActivityKilometreSplit['kilometerPoint']>;
    } => {
      const { longitude, latitude } = split.kilometerPoint?.coords ?? {};
      return Number.isFinite(longitude) && Number.isFinite(latitude);
    },
  );
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
    <>
      <ShapeSource
        id="kilometre-splits"
        hitbox={{ width: 44, height: 44 }}
        onPress={(event) => {
          const feature = event.features.find(({ properties }) => properties?.label !== undefined);
          if (!feature || feature.geometry.type !== 'Point') return;

          const number = Number(feature.properties?.label);
          if (!Number.isFinite(number)) return;

          const [longitude, latitude] = feature.geometry.coordinates;
          setSelectedKilometre((current) =>
            current?.number === number ? null : { coordinate: [longitude, latitude], number },
          );
        }}
        shape={{
          type: 'FeatureCollection',
          features,
        }}>
        <CircleLayer
          id="kilometre-split-background"
          aboveLayerID="activity-route-line"
          style={{
            circleColor: colors.primary,
            circleRadius: 5.5,
            circleStrokeColor: colors.primary,
            circleStrokeWidth: 1,
            circleSortKey: ['get', 'sortKey'],
          }}
        />
      </ShapeSource>
      {selectedKilometre ? (
        <MarkerView coordinate={selectedKilometre.coordinate} anchor={{ x: 0.5, y: 1 }} allowOverlap>
          <View
            pointerEvents="none"
            style={[styles.kilometreCallout, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <Text variant="labelSmall" style={{ color: colors.onSurface, fontWeight: '700' }}>
              {selectedKilometre.number} {kilometreUnit}
            </Text>
          </View>
        </MarkerView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  kilometreCallout: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
});
