import { MarkerView } from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import type { LocationObject } from 'expo-location';

function formatPauseTime(timestamp: number, language: LANGUAGES) {
  return new Date(timestamp).toLocaleTimeString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function PauseMarker({ location, isResume, language }: { location: LocationObject; isResume: boolean; language: LANGUAGES }) {
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
        {!isResume && (
          <Text style={[styles.time, { color: colors.onSurface }]}>{formatPauseTime(location.timestamp, language)}</Text>
        )}
      </View>
    </MarkerView>
  );
}

export default function PauseMarkers({ locations }: { locations: LocationObject[][] }) {
  const { language } = useAppSelector(({ language }) => language);
  const markers = locations.flatMap((segment, index) => {
    if (index === 0) {
      return [];
    }

    const pauseLocation = locations[index - 1]?.at(-1);
    const resumeLocation = segment[0];
    return [
      pauseLocation ? <PauseMarker key={`pause-${index}`} location={pauseLocation} isResume={false} language={language} /> : null,
      resumeLocation ? (
        <PauseMarker key={`resume-${index}`} location={resumeLocation} isResume language={language} />
      ) : null,
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
  time: { backgroundColor: 'white', borderRadius: 4, fontSize: 11, marginTop: 2, paddingHorizontal: 3 },
});
