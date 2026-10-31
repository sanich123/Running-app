import { useEffect, useRef, useState } from 'react';
import { Accuracy, watchPositionAsync, type LocationObject } from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LANGUAGES, STATUSES } from '@const/enums';
import { setNavigationTrackId } from '@R/slices/location/location';
import { getNavigationAlertDistanceMeters } from '@R/slices/settings/types';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ActivityRoutesButton from '@Routes/activity/activity-routes-button/activity-routes-button';
import ActivitySettingsButton from '@Routes/activity/activity-settings/activity-settings-button/activity-settings-button';
import CloseBtn from '@Routes/activity/close-btn/close-btn';
import IconChooseSport from '@Routes/activity/icon-choose-sport/icon-choose-sport';
import Map from '@Routes/activity/map/map';
import Metrics from '@Routes/activity/metrics/metrics';
import PauseBtn from '@Routes/activity/pause-btn/pause-btn';
import ShowMapBtn from '@Routes/activity/show-map-btn/show-map-btn';
import StartBtn from '@Routes/activity/start-btn/start-btn';
import { MAPS_PAGE_COPY, type OfflineBounds } from '@Routes/maps-page/const';
import MapRegionDownloader from '@Routes/maps-page/offline-maps-tab/map-region-downloader/map-region-downloader';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import {
  getDistanceToRouteMeters,
  MAX_CONFIDENT_NAVIGATION_ACCURACY_METERS,
  NAVIGATION_ALERT_REARM_DISTANCE_METERS,
} from '@U/activity-track/route-proximity';
import { readSavedActivityTrack } from '@U/activity-track/track-library';
import { speakActivityMessage } from '@U/speech/activity-voice';
import { ACTIVITY_SETTINGS } from './activity-settings/const';
import useActivityTrackingLifecycle from './use-activity-tracking-lifecycle';
import type { ActivityLocation } from '@S/card/types';

export default function Activity() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { activityStatus, isMapVisible, lastPosition, navigationTrackId } = useAppSelector(({ location }) => location);
  const { activityVoiceIdentifier, language, navigationAlertDistanceMeters } = useAppSelector(
    ({ settings }) => settings,
  );
  const activitySettingsLabels = ACTIVITY_SETTINGS[language];
  const mapsPageCopy = MAPS_PAGE_COPY[language];
  const [isLocationReadyForRecording, setIsLocationReadyForRecording] = useState(false);
  const [isTrackingActionInProgress, setIsTrackingActionInProgress] = useState(false);
  const [guidancePosition, setGuidancePosition] = useState<LocationObject | null>(null);
  const [hiddenNavigationTrackId, setHiddenNavigationTrackId] = useState<string | null>(null);
  const [isFinishNavigationDialogVisible, setIsFinishNavigationDialogVisible] = useState(false);
  const [offlineMapRequest, setOfflineMapRequest] = useState<{
    bounds: OfflineBounds;
    centerCoordinate: [number, number];
  } | null>(null);
  const [isOfflineMapSheetVisible, setIsOfflineMapSheetVisible] = useState(false);
  const [navigationRoute, setNavigationRoute] = useState<{ trackId: string; locations: ActivityLocation[] } | null>(
    null,
  );
  const didAnnounceRouteDeviation = useRef(false);
  const { isLocationLoading } = useActivityTrackingLifecycle(isLocationReadyForRecording);

  useEffect(() => {
    if (!navigationTrackId) return;
    let isCurrent = true;
    void readSavedActivityTrack(navigationTrackId).then(
      (locations) => {
        if (isCurrent) setNavigationRoute({ trackId: navigationTrackId, locations });
      },
      () => {
        if (isCurrent) setNavigationRoute({ trackId: navigationTrackId, locations: [] });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [navigationTrackId]);

  useEffect(() => {
    didAnnounceRouteDeviation.current = false;
  }, [navigationTrackId]);

  useEffect(() => {
    const isRecording = activityStatus === STATUSES.started || activityStatus === STATUSES.continued;
    if (!navigationTrackId || !isLocationReadyForRecording || isRecording) return;

    let isCurrent = true;
    let subscription: { remove: () => void } | null = null;
    void watchPositionAsync(
      { accuracy: Accuracy.BestForNavigation, distanceInterval: 5, timeInterval: 3000 },
      (position) => setGuidancePosition(position),
    ).then(
      (nextSubscription) => {
        if (isCurrent) subscription = nextSubscription;
        else nextSubscription.remove();
      },
      () => undefined,
    );

    return () => {
      isCurrent = false;
      subscription?.remove();
    };
  }, [activityStatus, isLocationReadyForRecording, navigationTrackId]);

  const activeNavigationRoute = navigationRoute?.trackId === navigationTrackId ? navigationRoute.locations : null;
  const isRecording = activityStatus === STATUSES.started || activityStatus === STATUSES.continued;
  const currentGuidancePosition = isRecording ? lastPosition : (guidancePosition ?? lastPosition);

  useEffect(() => {
    if (!navigationTrackId || !activeNavigationRoute?.length || !currentGuidancePosition) return;

    const { accuracy } = currentGuidancePosition.coords;
    if (
      typeof accuracy !== 'number' ||
      !Number.isFinite(accuracy) ||
      accuracy > MAX_CONFIDENT_NAVIGATION_ACCURACY_METERS ||
      currentGuidancePosition.mocked === true ||
      ('mocked' in currentGuidancePosition.coords && currentGuidancePosition.coords.mocked === true)
    ) {
      return;
    }

    const distanceFromRoute = getDistanceToRouteMeters(currentGuidancePosition, activeNavigationRoute);
    if (distanceFromRoute === null) return;

    const alertDistance = getNavigationAlertDistanceMeters(navigationAlertDistanceMeters);
    if (distanceFromRoute <= alertDistance - NAVIGATION_ALERT_REARM_DISTANCE_METERS) {
      didAnnounceRouteDeviation.current = false;
      return;
    }
    if (distanceFromRoute <= alertDistance || didAnnounceRouteDeviation.current) return;

    didAnnounceRouteDeviation.current = true;
    const roundedDistance = Math.max(10, Math.round(distanceFromRoute / 10) * 10);
    const text =
      language === LANGUAGES.russian
        ? `Вы находитесь примерно в ${roundedDistance} метрах от маршрута.`
        : `You are about ${roundedDistance} metres from the route.`;
    speakActivityMessage(text, language, activityVoiceIdentifier);
  }, [
    activityVoiceIdentifier,
    activeNavigationRoute,
    currentGuidancePosition,
    language,
    navigationAlertDistanceMeters,
    navigationTrackId,
  ]);

  const isNavigationRouteVisible = Boolean(navigationTrackId && hiddenNavigationTrackId !== navigationTrackId);

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
          headerLeft: () => <CloseBtn />,
          headerRight: () => (
            <View style={styles.headerActions}>
              <ActivityRoutesButton />
              <ActivitySettingsButton />
            </View>
          ),
        }}
      />
      <SafeAreaView style={[styles.layout, { backgroundColor: colors.surfaceVariant }]} edges={['bottom']}>
        <View style={styles.map}>
          <View
            testID="activity-map-layer"
            style={[styles.mapLayer, !isMapVisible && styles.hiddenMapLayer]}
            pointerEvents={isMapVisible ? 'auto' : 'none'}>
            <Map
              onLocationReadinessChange={setIsLocationReadyForRecording}
              navigationRoute={activeNavigationRoute ?? undefined}
              hasNavigationTrack={Boolean(navigationTrackId)}
              isNavigationRouteVisible={isNavigationRouteVisible}
              showImportedRouteLabel={activitySettingsLabels.showImportedRoute}
              hideImportedRouteLabel={activitySettingsLabels.hideImportedRoute}
              finishNavigationLabel={activitySettingsLabels.finishNavigation}
              downloadOfflineMapLabel={activitySettingsLabels.downloadOfflineMapForRoute}
              onToggleNavigationRouteVisibility={() =>
                setHiddenNavigationTrackId(isNavigationRouteVisible ? navigationTrackId : null)
              }
              onFinishNavigation={() => {
                setIsFinishNavigationDialogVisible(true);
              }}
              onDownloadOfflineMap={(bounds, centerCoordinate) => {
                setOfflineMapRequest({ bounds, centerCoordinate });
                setIsOfflineMapSheetVisible(true);
              }}
            />
          </View>
          {activityStatus !== STATUSES.initial ? <Metrics /> : null}
        </View>
        <View style={[styles.metricsLayout, { backgroundColor: colors.surfaceVariant }]}>
          <View style={styles.metrics}>
            {activityStatus === STATUSES.initial ? (
              <IconChooseSport
                disabled={!isLocationReadyForRecording || isLocationLoading || isTrackingActionInProgress}
              />
            ) : null}
            {activityStatus === STATUSES.paused ? <PauseBtn /> : null}
            <StartBtn
              isReadyToRecordLocation={isLocationReadyForRecording}
              isGettingLocation={isLocationLoading}
              onTrackingActionInProgressChange={setIsTrackingActionInProgress}
            />
            {activityStatus !== STATUSES.initial ? <ShowMapBtn /> : null}
          </View>
        </View>
      </SafeAreaView>
      <ConfirmDialog
        visible={isFinishNavigationDialogVisible}
        title={activitySettingsLabels.finishNavigationConfirmTitle}
        message={activitySettingsLabels.finishNavigationConfirmMessage}
        confirmText={activitySettingsLabels.finishNavigationConfirmAction}
        cancelText={activitySettingsLabels.finishNavigationCancel}
        onDismiss={() => setIsFinishNavigationDialogVisible(false)}
        onConfirm={() => {
          dispatch(setNavigationTrackId(null));
          setHiddenNavigationTrackId(null);
          setIsFinishNavigationDialogVisible(false);
        }}
      />
      {offlineMapRequest && isOfflineMapSheetVisible ? (
        <MapRegionDownloader
          embedded
          centerCoordinate={offlineMapRequest.centerCoordinate}
          copy={mapsPageCopy}
          initialVisibleBounds={offlineMapRequest.bounds}
          onClose={() => setIsOfflineMapSheetVisible(false)}
          onDownloaded={async () => setIsOfflineMapSheetVisible(false)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 0 },
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    height: Platform.OS === 'ios' ? '80%' : '75%',
    width: '100%',
  },
  mapLayer: {
    flex: 1,
  },
  hiddenMapLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0,
  },
  metricsLayout: {
    height: Platform.OS === 'ios' ? '20%' : '25%',
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  metrics: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    transform: Platform.OS === 'ios' ? [{ translateY: -10 }] : undefined,
  },
});
