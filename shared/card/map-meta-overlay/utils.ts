import {
  EMOTIONS_BTNS_ICONS,
  EMOTIONS_BTNS_VALUES,
  normalizeEmotion,
} from '@Routes/save-activity-page/emotion-btns/const';

export function getEmotionBadge(emotion?: string | null) {
  const normalizedEmotion = normalizeEmotion(emotion);
  if (normalizedEmotion === EMOTIONS_BTNS_VALUES.good) {
    return { color: '#F7C744', icon: EMOTIONS_BTNS_ICONS.iconHappy };
  }
  if (normalizedEmotion === EMOTIONS_BTNS_VALUES.fucked) {
    return { color: '#FF8A65', icon: EMOTIONS_BTNS_ICONS.iconFucked };
  }
  if (normalizedEmotion === EMOTIONS_BTNS_VALUES.normal) {
    return { color: '#AAB4C3', icon: EMOTIONS_BTNS_ICONS.iconNeutral };
  }
  return null;
}

export function getWeatherIcon(weatherCode?: number | null) {
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
