import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import MapControlButton from '@S/map-control-button/map-control-button';
import type { MapControlsProps } from './types';

export default function MapControls({
  mapStyle,
  copy,
  onZoomIn,
  onZoomOut,
  onMapStyleChange,
  canZoomIn,
  canZoomOut,
  bottomOffset,
  isDisabled = false,
  testIdPrefix = 'activity-route',
  children,
}: MapControlsProps) {
  const { top } = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, bottomOffset === undefined ? { top: top + 112 } : { bottom: bottomOffset }]}>
      <MapControlButton
        androidIcon="map-outline"
        iosSymbol="map"
        onPress={() => onMapStyleChange('map')}
        disabled={isDisabled}
        accessibilityLabel={copy.map}
        selected={mapStyle === 'map'}
        testID={`${testIdPrefix}-style-map`}
      />
      <MapControlButton
        androidIcon="satellite-variant"
        iosSymbol="globe.americas"
        onPress={() => onMapStyleChange('satellite')}
        disabled={isDisabled}
        accessibilityLabel={copy.satellite}
        selected={mapStyle === 'satellite'}
        testID={`${testIdPrefix}-style-satellite`}
      />
      <MapControlButton
        androidIcon="plus"
        iosSymbol="plus"
        onPress={() => onZoomIn?.()}
        disabled={isDisabled || !canZoomIn}
        accessibilityLabel={copy.zoomIn}
        testID={`${testIdPrefix}-zoom-in`}
      />
      <MapControlButton
        androidIcon="minus"
        iosSymbol="minus"
        onPress={() => onZoomOut?.()}
        disabled={isDisabled || !canZoomOut}
        accessibilityLabel={copy.zoomOut}
        testID={`${testIdPrefix}-zoom-out`}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8, position: 'absolute', right: 12, zIndex: 10 },
});
