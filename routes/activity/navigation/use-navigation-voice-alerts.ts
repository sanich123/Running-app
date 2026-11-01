import { useEffect, useRef } from 'react';
import { LANGUAGES } from '@const/enums';
import { getNavigationAlertDistanceMeters, getNavigationAlertRepeatIntervalMinutes } from '@R/slices/settings/types';
import {
  getDistanceToRouteMeters,
  MAX_CONFIDENT_NAVIGATION_ACCURACY_METERS,
  MAX_NUMERIC_NAVIGATION_ALERT_DISTANCE_METERS,
  NAVIGATION_ALERT_REARM_DISTANCE_METERS,
} from '@U/activity-track/route-proximity';
import { speakActivityMessage, stopActivitySpeech } from '@U/speech/activity-voice';
import type { ActivityLocation } from '@S/card/types';
import type { LocationObject } from 'expo-location';

export default function useNavigationVoiceAlerts({
  navigationTrackId,
  isNavigationActive,
  navigationAlertsMuted,
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
  navigationRoute: ActivityLocation[] | null;
  currentPosition: LocationObject | null;
  navigationAlertDistanceMeters: number;
  navigationAlertRepeatIntervalMinutes: number;
  language: LANGUAGES;
  activityVoiceIdentifier: string | null;
}) {
  const lastAnnouncementAt = useRef<number | null>(null);

  useEffect(() => {
    lastAnnouncementAt.current = null;
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
      lastAnnouncementAt.current = null;
      return;
    }
    if (distanceFromRoute <= alertDistance || navigationAlertsMuted) return;

    const announcementTimestamp = Date.now();
    const repeatIntervalMilliseconds =
      getNavigationAlertRepeatIntervalMinutes(navigationAlertRepeatIntervalMinutes) * 60_000;
    const lastAnnouncementTimestamp = lastAnnouncementAt.current;
    if (
      lastAnnouncementTimestamp !== null &&
      announcementTimestamp - lastAnnouncementTimestamp < repeatIntervalMilliseconds
    ) {
      return;
    }

    lastAnnouncementAt.current = announcementTimestamp;
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
    navigationRoute,
    navigationTrackId,
  ]);
}
