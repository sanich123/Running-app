import { Camera } from '@rnmapbox/maps';
import type { RefObject } from 'react';
import { ActivityIndicator, IconButton, useTheme } from 'react-native-paper';

interface MapControlsProps {
  cameraRef: RefObject<Camera | null>;
  mapZoomLevel: number;
  isCenteringOnCurrentLocation: boolean;
  hasPoorLocationAccuracy: boolean;
  onZoomLevelChange: (zoomLevel: number) => void;
  onFollowUserLocationChange: (shouldFollow: boolean) => void;
  onCenterOnCurrentLocation: () => void;
}

export default function MapControls({
  cameraRef,
  mapZoomLevel,
  isCenteringOnCurrentLocation,
  hasPoorLocationAccuracy,
  onZoomLevelChange,
  onFollowUserLocationChange,
  onCenterOnCurrentLocation,
}: MapControlsProps) {
  const { colors } = useTheme();

  const changeZoom = (nextZoomLevel: number) => {
    onZoomLevelChange(nextZoomLevel);
    onFollowUserLocationChange(false);
    cameraRef.current?.setCamera({ zoomLevel: nextZoomLevel, animationMode: 'easeTo', animationDuration: 250 });
  };

  return (
    <>
      {hasPoorLocationAccuracy && (
        <IconButton
          testID="poor-location-accuracy"
          mode="contained-tonal"
          icon="map-marker-alert-outline"
          iconColor={colors.error}
          containerColor={colors.surface}
          size={24}
          accessibilityLabel="Низкая точность геопозиции"
        />
      )}
      <IconButton
        testID="increase-map-zoom"
        mode="contained-tonal"
        icon="plus"
        iconColor={colors.primary}
        containerColor={colors.surface}
        size={24}
        disabled={mapZoomLevel >= 20}
        onPress={() => changeZoom(Math.min(20, mapZoomLevel + 1))}
        accessibilityLabel="Увеличить масштаб карты"
      />
      <IconButton
        testID="decrease-map-zoom"
        mode="contained-tonal"
        icon="minus"
        iconColor={colors.primary}
        containerColor={colors.surface}
        size={24}
        disabled={mapZoomLevel <= 3}
        onPress={() => changeZoom(Math.max(3, mapZoomLevel - 1))}
        accessibilityLabel="Уменьшить масштаб карты"
      />
      <IconButton
        testID="move-to-current-location"
        mode="contained-tonal"
        icon={
          isCenteringOnCurrentLocation
            ? () => <ActivityIndicator size="small" testID="current-location-loading" />
            : 'crosshairs-gps'
        }
        iconColor={colors.primary}
        containerColor={colors.surface}
        size={24}
        disabled={isCenteringOnCurrentLocation}
        onPress={onCenterOnCurrentLocation}
        accessibilityLabel="Текущее местоположение"
      />
    </>
  );
}
