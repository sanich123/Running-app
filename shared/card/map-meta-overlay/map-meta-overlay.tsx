import { View, StyleSheet } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';

type MapMetaOverlayProps = {
  locationName?: string | null;
  weatherTemperature?: number | null;
  weatherWindSpeed?: number | null;
  weatherCode?: number | null;
};

export default function MapMetaOverlay({
  locationName,
  weatherTemperature,
  weatherWindSpeed,
  weatherCode,
}: MapMetaOverlayProps) {
  const normalizedLocationName = locationName?.trim();
  const hasTemperature = typeof weatherTemperature === 'number' && Number.isFinite(weatherTemperature);
  const hasWindSpeed = typeof weatherWindSpeed === 'number' && Number.isFinite(weatherWindSpeed);

  if (!normalizedLocationName && !hasTemperature && !hasWindSpeed) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      {normalizedLocationName ? (
        <View style={[styles.item, styles.locationItem]}>
          <Icon source="map-marker" size={16} color={styles.icon.color} />
          <Text numberOfLines={1} style={styles.text}>
            {normalizedLocationName}
          </Text>
        </View>
      ) : null}
      {hasTemperature ? (
        <View style={styles.item}>
          <Icon source={getWeatherIcon(weatherCode)} size={16} color={styles.icon.color} />
          <Text style={styles.text}>{`${Math.round(weatherTemperature!)}°C`}</Text>
        </View>
      ) : null}
      {hasWindSpeed ? (
        <View style={styles.item}>
          <Icon source="weather-windy" size={16} color={styles.icon.color} />
          <Text style={styles.text}>{`${Math.round(weatherWindSpeed!)} м/с`}</Text>
        </View>
      ) : null}
    </View>
  );
}

function getWeatherIcon(weatherCode?: number | null) {
  if (weatherCode === 0) return 'weather-sunny';
  if (weatherCode === 1 || weatherCode === 2) return 'weather-partly-cloudy';
  if (weatherCode === 3) return 'weather-cloudy';
  if (weatherCode === 45 || weatherCode === 48) return 'weather-fog';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode ?? -1)) {
    return 'weather-rainy';
  }
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode ?? -1)) return 'weather-snowy';
  if ([95, 96, 99].includes(weatherCode ?? -1)) return 'weather-lightning-rainy';
  return 'thermometer';
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 17, 22, 0.76)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    left: 12,
    maxWidth: '92%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    top: 12,
    zIndex: 2,
  },
  item: { alignItems: 'center', flexDirection: 'row', gap: 4, minWidth: 0 },
  locationItem: { flexShrink: 1 },
  icon: { color: '#FFFFFF' },
  text: { color: '#FFFFFF', flexShrink: 1, fontFamily: FONT_FAMILIES.medium, fontSize: 13 },
});
