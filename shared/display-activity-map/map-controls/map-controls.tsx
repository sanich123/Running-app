import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
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
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, bottomOffset === undefined ? { top: top + 112 } : { bottom: bottomOffset }]}>
      <View style={styles.layerButtons}>
        <IconButton
          icon="map-outline"
          iconColor={mapStyle === 'map' ? colors.onPrimary : colors.onSurfaceVariant}
          size={22}
          style={[styles.layerButton, { backgroundColor: mapStyle === 'map' ? colors.primary : colors.surfaceVariant }]}
          onPress={() => onMapStyleChange('map')}
          disabled={isDisabled}
          accessibilityLabel={copy.map}
          accessibilityState={{ selected: mapStyle === 'map' }}
          testID={`${testIdPrefix}-style-map`}
        />
        <IconButton
          icon="satellite-variant"
          iconColor={mapStyle === 'satellite' ? colors.onPrimary : colors.onSurfaceVariant}
          size={22}
          style={[
            styles.layerButton,
            { backgroundColor: mapStyle === 'satellite' ? colors.primary : colors.surfaceVariant },
          ]}
          onPress={() => onMapStyleChange('satellite')}
          disabled={isDisabled}
          accessibilityLabel={copy.satellite}
          accessibilityState={{ selected: mapStyle === 'satellite' }}
          testID={`${testIdPrefix}-style-satellite`}
        />
      </View>
      <View style={[styles.zoomGroup, { backgroundColor: colors.surface }]}>
        <IconButton
          icon="plus"
          iconColor={colors.onSurface}
          disabled={isDisabled || !canZoomIn}
          size={22}
          style={styles.zoomButton}
          onPress={onZoomIn}
          accessibilityLabel={copy.zoomIn}
          testID={`${testIdPrefix}-zoom-in`}
        />
        <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
        <IconButton
          icon="minus"
          iconColor={colors.onSurface}
          disabled={isDisabled || !canZoomOut}
          size={22}
          style={styles.zoomButton}
          onPress={onZoomOut}
          accessibilityLabel={copy.zoomOut}
          testID={`${testIdPrefix}-zoom-out`}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8, position: 'absolute', right: 12, zIndex: 10 },
  layerButtons: { alignItems: 'center', gap: 8 },
  layerButton: {
    borderRadius: 12,
    elevation: 4,
    height: 44,
    margin: 0,
    opacity: 0.88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    width: 44,
  },
  zoomGroup: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
    opacity: 0.88,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  zoomButton: { height: 40, margin: 0, width: 44 },
  divider: { height: StyleSheet.hairlineWidth, width: 24 },
});
