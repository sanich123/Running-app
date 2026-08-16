import { MarkerView } from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import type { LocationObject } from 'expo-location';

function PauseMarker({ location, isResume }: { location: LocationObject; isResume: boolean }) {
  const { colors } = useTheme();
  const markerColor = isResume ? colors.primary : colors.tertiary;

  return (
    <MarkerView
      coordinate={[location.coords.longitude, location.coords.latitude]}
      anchor={{ x: 0.5, y: 1 }}
      allowOverlap>
      <View style={styles.wrapper}>
        <View style={[styles.marker, { backgroundColor: colors.surface, borderColor: markerColor }]}>
          <Icon source={isResume ? 'play' : 'pause'} size={18} color={markerColor} />
        </View>
      </View>
    </MarkerView>
  );
}

export default function PauseMarkers({ locations }: { locations: LocationObject[][] }) {
  const markers = locations.flatMap((segment, index) => {
    if (index === 0) {
      return [];
    }

    const pauseLocation = locations[index - 1]?.at(-1);
    const resumeLocation = segment[0];
    return [
      pauseLocation ? <PauseMarker key={`pause-${index}`} location={pauseLocation} isResume={false} /> : null,
      resumeLocation ? <PauseMarker key={`resume-${index}`} location={resumeLocation} isResume /> : null,
    ];
  });

  return <>{markers}</>;
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  marker: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    elevation: 4,
    height: 32,
    justifyContent: 'center',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: 32,
  },
});
