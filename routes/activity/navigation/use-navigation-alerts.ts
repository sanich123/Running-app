import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import {
  getNavigationAlertDistanceMeters,
  getNavigationAlertRepeatIntervalMinutes,
} from '@R/slices/activity-settings/types';
import {
  getDistanceToRouteMeters,
  MAX_CONFIDENT_NAVIGATION_ACCURACY_METERS,
  MAX_NUMERIC_NAVIGATION_ALERT_DISTANCE_METERS,
  NAVIGATION_ALERT_REARM_DISTANCE_METERS,
} from '@U/activity-track/route-proximity';
import { speakActivityMessage, stopActivitySpeech } from '@U/speech/activity-voice';
import type { ActivityLocation } from '@S/card/types';
import type { LocationObject } from 'expo-location';

export default function useNavigationAlerts({
  navigationTrackId,
  isNavigationActive,
  navigationAlertsMuted,
  navigationHapticsEnabled,
  navigationRoute,
  currentPosition,
  navigationAlertDistanceMeters,
  navigationAlertRepeatIntervalMinutes,
  language,
  activityVoiceIdentifier,
}: {
  navigationTrackId: string | null;
  isNavigationActive: boolean;
  navigationAlertsMuted: boolean;
  navigationHapticsEnabled: boolean;
  navigationRoute: ActivityLocation[] | null;
  currentPosition: LocationObject | null;
  navigationAlertDistanceMeters: number;
  navigationAlertRepeatIntervalMinutes: number;
  language: LANGUAGES;
  activityVoiceIdentifier: string | null;
}) {
  const lastVoiceAlertAt = useRef<number | null>(null);
  const lastHapticAlertAt = useRef<number | null>(null);

  useEffect(() => {
    lastVoiceAlertAt.current = null;
    lastHapticAlertAt.current = null;
  }, [navigationTrackId]);

  useEffect(() => {
    if (!navigationTrackId || navigationAlertsMuted || !isNavigationActive) stopActivitySpeech();
  }, [isNavigationActive, navigationAlertsMuted, navigationTrackId]);

  useEffect(() => {
    if (!navigationTrackId || !isNavigationActive || !navigationRoute?.length || !currentPosition) return;

    const { accuracy } = currentPosition.coords;
    if (
      typeof accuracy !== 'number' ||
      !Number.isFinite(accuracy) ||
      accuracy > MAX_CONFIDENT_NAVIGATION_ACCURACY_METERS
    ) {
      return;
    }

    const distanceFromRoute = getDistanceToRouteMeters(currentPosition, navigationRoute);
    if (distanceFromRoute === null) return;

    const alertDistance = getNavigationAlertDistanceMeters(navigationAlertDistanceMeters);
    if (distanceFromRoute <= alertDistance - NAVIGATION_ALERT_REARM_DISTANCE_METERS) {
      lastVoiceAlertAt.current = null;
      lastHapticAlertAt.current = null;
      return;
    }
    if (distanceFromRoute <= alertDistance) return;

    const alertTimestamp = Date.now();
    const repeatIntervalMilliseconds =
      getNavigationAlertRepeatIntervalMinutes(navigationAlertRepeatIntervalMinutes) * 60_000;
    const shouldVibrate =
      navigationHapticsEnabled &&
      (lastHapticAlertAt.current === null || alertTimestamp - lastHapticAlertAt.current >= repeatIntervalMilliseconds);
    const shouldSpeak =
      !navigationAlertsMuted &&
      (lastVoiceAlertAt.current === null || alertTimestamp - lastVoiceAlertAt.current >= repeatIntervalMilliseconds);
    if (!shouldVibrate && !shouldSpeak) return;

    if (shouldVibrate) {
      lastHapticAlertAt.current = alertTimestamp;
      const hapticAlert =
        Platform.OS === 'android'
          ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press)
          : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      void hapticAlert.catch(() => undefined);
    }
    if (!shouldSpeak) return;

    lastVoiceAlertAt.current = alertTimestamp;

    const roundedDistance = Math.max(10, Math.round(distanceFromRoute / 10) * 10);
    const text =
      distanceFromRoute > MAX_NUMERIC_NAVIGATION_ALERT_DISTANCE_METERS
        ? language === LANGUAGES.russian
          ? 'Вы находитесь очень далеко от маршрута.'
          : 'You are very far from the route.'
        : language === LANGUAGES.russian
          ? `Вы находитесь примерно в ${roundedDistance} метрах от маршрута.`
          : `You are about ${roundedDistance} metres from the route.`;
    speakActivityMessage(text, language, activityVoiceIdentifier);
  }, [
    activityVoiceIdentifier,
    currentPosition,
    isNavigationActive,
    language,
    navigationAlertDistanceMeters,
    navigationAlertRepeatIntervalMinutes,
    navigationAlertsMuted,
    navigationHapticsEnabled,
    navigationRoute,
    navigationTrackId,
  ]);
}
