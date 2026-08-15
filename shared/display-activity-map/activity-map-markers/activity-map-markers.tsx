import { MarkerView } from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import type { ActivityLocation } from '@S/card/types';

type ActivityMapMarkerType = 'start' | 'end';

const MARKER_CONFIG: Record<ActivityMapMarkerType, { icon: 'play' | 'stop'; testId: string }> = {
  start: { icon: 'play', testId: 'activity-map-start-marker' },
  end: { icon: 'stop', testId: 'activity-map-end-marker' },
};

function ActivityMapMarker({ location, type }: { location: ActivityLocation; type: ActivityMapMarkerType }) {
  const { colors } = useTheme();
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
        accessibilityLabel={type === 'start' ? 'Начало тренировки' : 'Конец тренировки'}>
        <Icon source={icon} size={22} color={markerColor} />
      </View>
    </MarkerView>
  );
}

export default function ActivityMapMarkers({ locations }: { locations: ActivityLocation[] }) {
  if (locations.length < 2) {
    return null;
  }

  return (
    <>
      <ActivityMapMarker location={locations[0]} type="start" />
      <ActivityMapMarker location={locations[locations.length - 1]} type="end" />
    </>
  );
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    elevation: 5,
    height: 44,
    justifyContent: 'center',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 44,
  },
});
