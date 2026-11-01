import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import MapControlButton from '@S/map-control-button/map-control-button';
import { useActivityNavigationContext } from '../../navigation-context';
import NavigationAlertsMuteButton from '../../navigation-settings/navigation-alerts-mute-button/navigation-alerts-mute-button';
import NavigationSettingsButton from '../../navigation-settings/navigation-settings-button/navigation-settings-button';
import { useActivityMapContext } from '../activity-map-context';
import {
  getNavigationRouteBounds,
  getNavigationRouteOfflineBounds,
  getOfflineMapBoundsCenter,
} from '../navigation/utils';
import type { OfflineBounds } from '@Routes/maps-page/const';

export default function NavigationControls() {
  const insets = useSafeAreaInsets();
  const navigation = useActivityNavigationContext();
  const { readVisibleBounds } = useActivityMapContext();
  const routeBounds = useMemo(
    () => getNavigationRouteBounds(navigation?.navigationRoute ?? null),
    [navigation?.navigationRoute],
  );
  const routeOfflineBounds = useMemo(
    () => (routeBounds && routeBounds.pointCount >= 2 ? getNavigationRouteOfflineBounds(routeBounds) : null),
    [routeBounds],
  );

  if (!navigation?.navigationTrackId) return null;
  const activeNavigation = navigation;

  async function openOfflineMapDownloader() {
    if (!routeOfflineBounds) return;
    const centerCoordinate = getOfflineMapBoundsCenter(routeOfflineBounds);
    let visibleBounds: OfflineBounds | null = null;
    try {
      visibleBounds = (await readVisibleBounds?.()) ?? null;
    } catch {
      // Use the route bounds when the map view is not ready to report its viewport.
    }
    activeNavigation.onDownloadOfflineMap(visibleBounds ?? routeOfflineBounds, centerCoordinate);
  }

  return (
    <>
      <View testID="navigation-actions" style={styles.navigationActions}>
        <MapControlButton
          testID="toggle-navigation-active"
          androidIcon={navigation.isNavigationActive ? 'pause' : 'play'}
          iosSymbol={navigation.isNavigationActive ? 'pause.fill' : 'play.fill'}
          onPress={navigation.onToggleNavigationActive}
          accessibilityLabel={
            navigation.isNavigationActive
              ? navigation.pauseNavigationLabel
              : navigation.hasNavigationStarted
                ? navigation.resumeNavigationLabel
                : navigation.startNavigationLabel
          }
        />
        <MapControlButton
          testID="finish-route-navigation"
          androidIcon="close"
          iosSymbol="xmark"
          onPress={navigation.onFinishNavigation}
          accessibilityLabel={navigation.finishNavigationLabel}
        />
        <MapControlButton
          testID="toggle-imported-route-visibility"
          androidIcon={navigation.isNavigationRouteVisible ? 'map' : 'map-outline'}
          iosSymbol={navigation.isNavigationRouteVisible ? 'map.fill' : 'map'}
          onPress={navigation.onToggleNavigationRouteVisibility}
          accessibilityLabel={
            navigation.isNavigationRouteVisible ? navigation.hideImportedRouteLabel : navigation.showImportedRouteLabel
          }
        />
        {routeOfflineBounds ? (
          <MapControlButton
            testID="download-offline-map-for-route"
            androidIcon="map"
            iosSymbol="map.fill"
            androidOverlayIcon="download"
            iosOverlaySymbol="arrow.down.to.line"
            onPress={() => void openOfflineMapDownloader()}
            accessibilityLabel={navigation.downloadOfflineMapLabel}
          />
        ) : null}
      </View>
      <View testID="navigation-preferences" style={[styles.navigationPreferences, { top: insets.top + 72 }]}>
        <NavigationSettingsButton />
        <NavigationAlertsMuteButton />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  navigationActions: { bottom: 24, gap: 6, left: 12, position: 'absolute' },
  navigationPreferences: { gap: 6, left: 12, position: 'absolute' },
});
