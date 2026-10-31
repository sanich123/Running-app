import { StyleSheet, View } from 'react-native';
import MapControlButton from '@S/map-control-button/map-control-button';

export default function MapControls({
  copy,
  isSatellite,
  is3d,
  onToggleMapStyle,
  onTogglePitch,
  onLocate,
  onSearch,
  onZoomIn,
  onZoomOut,
}: {
  copy: {
    satellite: string;
    street: string;
    switchTo2d: string;
    switchTo3d: string;
    locate: string;
    search: string;
    zoomIn: string;
    zoomOut: string;
  };
  isSatellite: boolean;
  is3d: boolean;
  onToggleMapStyle: () => void;
  onTogglePitch: () => void;
  onLocate: () => void;
  onSearch: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}) {
  return (
    <View style={styles.controls}>
      <MapControlButton
        accessibilityLabel={isSatellite ? copy.satellite : copy.street}
        androidIcon="layers-outline"
        iosSymbol="square.3.layers.3d"
        onPress={onToggleMapStyle}
        selected={isSatellite}
        testID="toggle-map-style"
      />
      <MapControlButton
        accessibilityLabel={is3d ? copy.switchTo2d : copy.switchTo3d}
        androidIcon={is3d ? 'numeric-2-box-outline' : 'numeric-3-box-outline'}
        iosSymbol={is3d ? '2.square' : '3.square'}
        onPress={onTogglePitch}
        selected={is3d}
        testID="toggle-map-pitch"
      />
      <MapControlButton
        accessibilityLabel={copy.locate}
        androidIcon="crosshairs-gps"
        iosSymbol="scope"
        onPress={onLocate}
        testID="center-map-on-location"
      />
      <MapControlButton
        accessibilityLabel={copy.search}
        androidIcon="magnify"
        iosSymbol="magnifyingglass"
        onPress={onSearch}
        testID="open-map-search"
      />
      <MapControlButton
        accessibilityLabel={copy.zoomIn}
        androidIcon="plus"
        iosSymbol="plus"
        onPress={() => onZoomIn?.()}
        testID="zoom-map-in"
      />
      <MapControlButton
        accessibilityLabel={copy.zoomOut}
        androidIcon="minus"
        iosSymbol="minus"
        onPress={() => onZoomOut?.()}
        testID="zoom-map-out"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 6 },
});
