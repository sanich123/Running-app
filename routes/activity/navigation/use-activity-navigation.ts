import { useCallback, useMemo, useState } from 'react';
import { STATUSES } from '@const/enums';
import { setNavigationTrackId } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { MAPS_PAGE_COPY, type OfflineBounds } from '@Routes/maps-page/const';
import useNavigationAlerts from './use-navigation-alerts';
import useNavigationRoute from './use-navigation-route';
import { ACTIVITY_SETTINGS } from '../activity-settings/const';
import { NAVIGATION_SETTINGS_COPY } from '../navigation-settings/const';
import type { ActivityNavigationContextValue } from '../navigation-context';

export default function useActivityNavigation(isLocationReady: boolean) {
  const dispatch = useAppDispatch();
  const { activityStatus, lastPosition, navigationTrackId } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ settings }) => settings);
  const {
    activityVoiceIdentifier,
    navigationAlertDistanceMeters,
    navigationAlertRepeatIntervalMinutes,
    navigationAlertsMuted,
    navigationHapticsEnabled = false,
  } = useAppSelector(({ activitySettings }) => activitySettings);
  const activitySettingsLabels = ACTIVITY_SETTINGS[language];
  const mapsPageCopy = MAPS_PAGE_COPY[language];
  const [hiddenNavigationTrackId, setHiddenNavigationTrackId] = useState<string | null>(null);
  const [navigationSession, setNavigationSession] = useState<{
    trackId: string;
    isActive: boolean;
    hasStarted: boolean;
  } | null>(null);
  const [isFinishDialogVisible, setIsFinishDialogVisible] = useState(false);
  const [offlineMapRequest, setOfflineMapRequest] = useState<{
    bounds: OfflineBounds;
    centerCoordinate: [number, number];
  } | null>(null);
  const [isOfflineMapSheetVisible, setIsOfflineMapSheetVisible] = useState(false);
  const activeNavigationSession =
    navigationTrackId && navigationSession?.trackId === navigationTrackId ? navigationSession : null;
  const isNavigationActive = Boolean(activeNavigationSession?.isActive);
  const hasNavigationStarted = Boolean(activeNavigationSession?.hasStarted);
  const isNavigationRouteVisible = Boolean(navigationTrackId && hiddenNavigationTrackId !== navigationTrackId);
  const isRecording = activityStatus === STATUSES.started || activityStatus === STATUSES.continued;
  const { route: activeNavigationRoute, currentPosition } = useNavigationRoute({
    navigationTrackId,
    isNavigationActive,
    isLocationReady,
    isRecording,
    recordingPosition: lastPosition,
  });

  useNavigationAlerts({
    navigationTrackId,
    isNavigationActive,
    navigationAlertsMuted,
    navigationRoute: activeNavigationRoute,
    currentPosition,
    navigationAlertDistanceMeters,
    navigationAlertRepeatIntervalMinutes,
    language,
    activityVoiceIdentifier,
    navigationHapticsEnabled,
  });

  const toggleNavigation = useCallback(() => {
    if (!navigationTrackId) return;
    setNavigationSession({ trackId: navigationTrackId, isActive: !isNavigationActive, hasStarted: true });
  }, [isNavigationActive, navigationTrackId]);

  const toggleNavigationRouteVisibility = useCallback(() => {
    setHiddenNavigationTrackId(isNavigationRouteVisible ? navigationTrackId : null);
  }, [isNavigationRouteVisible, navigationTrackId]);

  const finishNavigation = useCallback(() => setIsFinishDialogVisible(true), []);

  const openOfflineMapDownloader = useCallback((bounds: OfflineBounds, centerCoordinate: [number, number]) => {
    setOfflineMapRequest({ bounds, centerCoordinate });
    setIsOfflineMapSheetVisible(true);
  }, []);

  const contextValue = useMemo<ActivityNavigationContextValue>(
    () => ({
      navigationTrackId,
      navigationRoute: activeNavigationRoute,
      isNavigationActive,
      hasNavigationStarted,
      isNavigationRouteVisible,
      startNavigationLabel: NAVIGATION_SETTINGS_COPY[language].startNavigation,
      pauseNavigationLabel: NAVIGATION_SETTINGS_COPY[language].pauseNavigation,
      resumeNavigationLabel: NAVIGATION_SETTINGS_COPY[language].resumeNavigation,
      finishNavigationLabel: activitySettingsLabels.finishNavigation,
      showImportedRouteLabel: activitySettingsLabels.showImportedRoute,
      hideImportedRouteLabel: activitySettingsLabels.hideImportedRoute,
      downloadOfflineMapLabel: activitySettingsLabels.downloadOfflineMapForRoute,
      onToggleNavigationActive: toggleNavigation,
      onToggleNavigationRouteVisibility: toggleNavigationRouteVisibility,
      onFinishNavigation: finishNavigation,
      onDownloadOfflineMap: openOfflineMapDownloader,
    }),
    [
      activeNavigationRoute,
      activitySettingsLabels.downloadOfflineMapForRoute,
      activitySettingsLabels.finishNavigation,
      activitySettingsLabels.hideImportedRoute,
      activitySettingsLabels.showImportedRoute,
      finishNavigation,
      hasNavigationStarted,
      isNavigationActive,
      isNavigationRouteVisible,
      language,
      navigationTrackId,
      openOfflineMapDownloader,
      toggleNavigation,
      toggleNavigationRouteVisibility,
    ],
  );

  const confirmFinishNavigation = useCallback(() => {
    dispatch(setNavigationTrackId(null));
    setNavigationSession(null);
    setHiddenNavigationTrackId(null);
    setIsFinishDialogVisible(false);
  }, [dispatch]);

  return {
    contextValue,
    finishDialog: {
      visible: isFinishDialogVisible,
      labels: activitySettingsLabels,
      onDismiss: () => setIsFinishDialogVisible(false),
      onConfirm: confirmFinishNavigation,
    },
    offlineMap: {
      request: offlineMapRequest,
      visible: isOfflineMapSheetVisible,
      copy: mapsPageCopy,
      onClose: () => setIsOfflineMapSheetVisible(false),
      onDownloaded: async () => setIsOfflineMapSheetVisible(false),
    },
  };
}
