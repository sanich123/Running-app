import { useCallback, useMemo, useRef } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import MapControlButton from '@S/map-control-button/map-control-button';
import { useActivityNavigationContext } from '../../navigation-context';
import { NAVIGATION_SETTINGS_COPY } from '../../navigation-settings/const';
import NavigationSettingsPanel from '../../navigation-settings/navigation-settings-panel/navigation-settings-panel';
import { useActivityMapContext } from '../activity-map-context';
import {
  getNavigationRouteBounds,
  getNavigationRouteOfflineBounds,
  getOfflineMapBoundsCenter,
} from '../navigation/utils';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { OfflineBounds } from '@Routes/maps-page/const';

export default function NavigationControls() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const navigationModalRef = useRef<BottomSheetModal>(null);
  const navigation = useActivityNavigationContext();
  const { readVisibleBounds } = useActivityMapContext();
  const labels = NAVIGATION_SETTINGS_COPY[language];
  const routeBounds = useMemo(
    () => getNavigationRouteBounds(navigation?.navigationRoute ?? null),
    [navigation?.navigationRoute],
  );
  const routeOfflineBounds = useMemo(
    () => (routeBounds && routeBounds.pointCount >= 2 ? getNavigationRouteOfflineBounds(routeBounds) : null),
    [routeBounds],
  );
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );

  if (!navigation?.navigationTrackId) return null;
  const activeNavigation = navigation;
  const navigationToggleLabel = activeNavigation.isNavigationActive
    ? activeNavigation.pauseNavigationLabel
    : activeNavigation.hasNavigationStarted
      ? activeNavigation.resumeNavigationLabel
      : activeNavigation.startNavigationLabel;

  async function openOfflineMapDownloader() {
    if (!routeOfflineBounds) return;
    const centerCoordinate = getOfflineMapBoundsCenter(routeOfflineBounds);
    let visibleBounds: OfflineBounds | null = null;
    try {
      visibleBounds = (await readVisibleBounds?.()) ?? null;
    } catch {
      // Use the route bounds when the map view is not ready to report its viewport.
    }
    navigationModalRef.current?.dismiss();
    activeNavigation.onDownloadOfflineMap(visibleBounds ?? routeOfflineBounds, centerCoordinate);
  }

  return (
    <>
      <View style={styles.navigationLauncher} testID="navigation-launcher">
        <MapControlButton
          testID="open-navigation-controls"
          androidIcon="navigation"
          iosSymbol="location.north.line"
          accessibilityLabel={labels.openNavigation}
          onPress={() => navigationModalRef.current?.present()}
          selected={activeNavigation.isNavigationActive}
        />
      </View>
      <BottomSheetModal
        ref={navigationModalRef}
        index={0}
        snapPoints={['72%']}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.primary }}>
        <BottomSheetScrollView contentContainerStyle={styles.navigationSheet} testID="navigation-modal">
          <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
            {labels.modalTitle}
          </Text>
          <NavigationSettingsPanel />
          <Divider />
          <Text variant="titleMedium" style={{ color: colors.onSurface }}>
            {labels.actionsTitle}
          </Text>
          <View style={styles.navigationActions} testID="navigation-actions">
            <Button
              accessibilityLabel={navigationToggleLabel}
              icon={activeNavigation.isNavigationActive ? 'pause' : 'play'}
              mode="contained"
              onPress={activeNavigation.onToggleNavigationActive}
              testID="toggle-navigation-active">
              {navigationToggleLabel}
            </Button>
            <Button
              accessibilityLabel={activeNavigation.finishNavigationLabel}
              icon="close"
              mode="outlined"
              onPress={activeNavigation.onFinishNavigation}
              testID="finish-route-navigation">
              {activeNavigation.finishNavigationLabel}
            </Button>
            <Button
              accessibilityLabel={
                activeNavigation.isNavigationRouteVisible
                  ? activeNavigation.hideImportedRouteLabel
                  : activeNavigation.showImportedRouteLabel
              }
              icon={activeNavigation.isNavigationRouteVisible ? 'map' : 'map-outline'}
              mode="outlined"
              onPress={activeNavigation.onToggleNavigationRouteVisibility}
              testID="toggle-imported-route-visibility">
              {activeNavigation.isNavigationRouteVisible
                ? activeNavigation.hideImportedRouteLabel
                : activeNavigation.showImportedRouteLabel}
            </Button>
            {routeOfflineBounds ? (
              <Button
                accessibilityLabel={activeNavigation.downloadOfflineMapLabel}
                icon="map"
                mode="outlined"
                onPress={() => void openOfflineMapDownloader()}
                testID="download-offline-map-for-route">
                {activeNavigation.downloadOfflineMapLabel}
              </Button>
            ) : null}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  navigationLauncher: { bottom: 24, left: 12, position: 'absolute' },
  navigationSheet: { gap: 16, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  navigationActions: { gap: 8 },
});
