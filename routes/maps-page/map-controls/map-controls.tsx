import { StyleSheet, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export default function MapControls({
  copy,
  isSatellite,
  is3d,
  onToggleMapStyle,
  onTogglePitch,
  onLocate,
  onSearch,
}: {
  copy: { satellite: string; street: string; switchTo2d: string; switchTo3d: string; locate: string; search: string };
  isSatellite: boolean;
  is3d: boolean;
  onToggleMapStyle: () => void;
  onTogglePitch: () => void;
  onLocate: () => void;
  onSearch: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.controls}>
      <IconButton
        accessibilityLabel={isSatellite ? copy.satellite : copy.street}
        icon="layers-outline"
        mode="contained"
        onPress={onToggleMapStyle}
        style={[styles.button, { backgroundColor: colors.elevation.level3 }]}
        testID="toggle-map-style"
      />
      <IconButton
        accessibilityLabel={is3d ? copy.switchTo2d : copy.switchTo3d}
        icon={is3d ? 'numeric-2-box-outline' : 'numeric-3-box-outline'}
        mode="contained"
        onPress={onTogglePitch}
        style={[styles.button, { backgroundColor: colors.elevation.level3 }]}
        testID="toggle-map-pitch"
      />
      <IconButton
        accessibilityLabel={copy.locate}
        icon="crosshairs-gps"
        mode="contained"
        onPress={onLocate}
        style={[styles.button, { backgroundColor: colors.elevation.level3 }]}
        testID="center-map-on-location"
      />
      <IconButton
        accessibilityLabel={copy.search}
        icon="magnify"
        mode="contained"
        onPress={onSearch}
        style={[styles.button, { backgroundColor: colors.elevation.level3 }]}
        testID="open-map-search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 8 },
  button: { borderRadius: 24, margin: 0 },
});
