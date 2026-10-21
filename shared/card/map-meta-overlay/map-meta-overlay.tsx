import { View, StyleSheet } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { getEmotionBadge, getWeatherIcon } from './utils';
import type { MapMetaOverlayProps } from './types';

export default function MapMetaOverlay({
  locationName,
  weatherTemperature,
  weatherWindSpeed,
  weatherCode,
  emotion,
}: MapMetaOverlayProps) {
  const normalizedLocationName = locationName?.trim();
  const hasTemperature = typeof weatherTemperature === 'number' && Number.isFinite(weatherTemperature);
  const hasWindSpeed = typeof weatherWindSpeed === 'number' && Number.isFinite(weatherWindSpeed);
  const emotionBadge = getEmotionBadge(emotion);

  if (!normalizedLocationName && !hasTemperature && !hasWindSpeed && !emotionBadge) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      {normalizedLocationName ? (
        <View style={[styles.item, styles.locationItem]}>
          <Icon source="map-marker" size={14} color={styles.icon.color} />
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.text, styles.locationText]}>
            {normalizedLocationName}
          </Text>
        </View>
      ) : null}
      {hasTemperature ? (
        <View style={styles.item}>
          <Icon source={getWeatherIcon(weatherCode)} size={14} color={styles.icon.color} />
          <Text style={styles.text}>{`${Math.round(weatherTemperature!)}°C`}</Text>
        </View>
      ) : null}
      {hasWindSpeed ? (
        <View style={styles.item}>
          <Icon source="weather-windy" size={14} color={styles.icon.color} />
          <Text style={styles.text}>{`${Math.round(weatherWindSpeed!)} м/с`}</Text>
        </View>
      ) : null}
      {emotionBadge ? (
        <View accessible accessibilityLabel="Эмоция тренировки" testID="map-emotion-icon" style={styles.emotionItem}>
          <Icon source={emotionBadge.icon} size={15} color={emotionBadge.color} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 17, 22, 0.5)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 7,
    left: 8,
    maxWidth: '90%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    position: 'absolute',
    top: 6,
    zIndex: 2,
  },
  item: { alignItems: 'center', flexDirection: 'row', gap: 3, minWidth: 0 },
  locationItem: { flexShrink: 1, maxWidth: '55%' },
  emotionItem: { alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#FFFFFF' },
  locationText: { flexShrink: 1 },
  text: { color: '#FFFFFF', flexShrink: 1, fontFamily: FONT_FAMILIES.medium, fontSize: 12 },
});
