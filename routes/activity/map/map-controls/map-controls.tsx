import MapControlButton from '@S/map-control-button/map-control-button';
import { useActivityMapContext } from '../activity-map-context';

export default function MapControls() {
  const {
    mapControls: { mapZoomLevel, isCenteringOnCurrentLocation, onZoomIn, onZoomOut, onCenterOnCurrentLocation },
  } = useActivityMapContext();

  return (
    <>
      <MapControlButton
        testID="increase-map-zoom"
        androidIcon="plus"
        androidAppearance="light"
        iosSymbol="plus"
        disabled={mapZoomLevel >= 20}
        onPress={onZoomIn}
        accessibilityLabel="Увеличить масштаб карты"
      />
      <MapControlButton
        testID="decrease-map-zoom"
        androidIcon="minus"
        androidAppearance="light"
        iosSymbol="minus"
        disabled={mapZoomLevel <= 3}
        onPress={onZoomOut}
        accessibilityLabel="Уменьшить масштаб карты"
      />
      <MapControlButton
        testID="move-to-current-location"
        androidIcon="crosshairs-gps"
        androidAppearance="light"
        iosSymbol="scope"
        loading={isCenteringOnCurrentLocation}
        loadingTestID="current-location-loading"
        onPress={onCenterOnCurrentLocation}
        accessibilityLabel="Текущее местоположение"
      />
    </>
  );
}
