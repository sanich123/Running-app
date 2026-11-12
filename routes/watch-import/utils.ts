import { createElement } from 'react';
import type { ReactNode } from 'react';
import { Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { errorToast } from '@S/error-toast/error-toast';

const APPLE_HEALTH_WORKOUTS_URL = 'x-apple-health://SampleType/HKWorkoutTypeIdentifier';
const APPLE_HEALTH_URL = 'x-apple-health://';
const APPLE_HEALTH_LINK_PATTERN = /(Apple Health)/g;
const APPLE_HEALTH_LINK_PHRASES = new Set(['Apple Health']);

export async function openExternalLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch (error) {
    errorToast('', error);
  }
}

export async function openAppleHealth() {
  try {
    await Linking.openURL(APPLE_HEALTH_WORKOUTS_URL);
  } catch {
    try {
      await Linking.openURL(APPLE_HEALTH_URL);
    } catch (error) {
      errorToast('', error);
    }
  }
}

export function renderAppleHealthLinks(text: string, color: string): ReactNode[] {
  return text.split(APPLE_HEALTH_LINK_PATTERN).map((part, index) =>
    APPLE_HEALTH_LINK_PHRASES.has(part)
      ? createElement(Text, {
          key: `apple-health-link-${index}`,
          children: part,
          accessibilityRole: 'link',
          onPress: () => void openAppleHealth(),
          style: { color, textDecorationLine: 'underline' },
        })
      : part,
  );
}
