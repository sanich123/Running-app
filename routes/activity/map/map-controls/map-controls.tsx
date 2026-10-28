import { ActivityIndicator, IconButton, useTheme } from 'react-native-paper';
import { useActivityMapContext } from '../activity-map-context';

export default function MapControls() {
  const { colors } = useTheme();
  const {
    mapControls: { mapZoomLevel, isCenteringOnCurrentLocation, onZoomIn, onZoomOut, onCenterOnCurrentLocation },
  } = useActivityMapContext();

  return (
    <>
      <IconButton
        testID="increase-map-zoom"
        mode="contained-tonal"
        icon="plus"
        iconColor={colors.primary}
        containerColor={colors.surface}
        size={24}
        disabled={mapZoomLevel >= 20}
        onPress={onZoomIn}
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
        onPress={onZoomOut}
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
