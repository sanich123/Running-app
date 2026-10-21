import { MarkerView } from '@rnmapbox/maps';
import { View, StyleSheet } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { DISPLAY_ACTIVITY_MAP_TEXT } from '../../const';
import { MARKER_CONFIG } from '../const';
import type { ActivityMapMarkerType } from '../const';
import type { ActivityLocation } from '@S/card/types';

export default function ActivityMapMarker({
  location,
  type,
}: {
  location: ActivityLocation;
  type: ActivityMapMarkerType;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { icon, testId } = MARKER_CONFIG[type];
  const markerColor = type === 'start' ? colors.tertiary : colors.error;

  return (
    <MarkerView
      coordinate={[location.coords.longitude, location.coords.latitude]}
      anchor={{ x: 0.5, y: 0.5 }}
      allowOverlap>
      <View
        testID={testId}
        style={[styles.marker, { backgroundColor: colors.surface, borderColor: markerColor }]}
        accessibilityLabel={
          type === 'start' ? DISPLAY_ACTIVITY_MAP_TEXT[language].start : DISPLAY_ACTIVITY_MAP_TEXT[language].end
        }>
        <Icon source={icon} size={11} color={markerColor} />
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
    height: 22,
    justifyContent: 'center',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 22,
  },
});
