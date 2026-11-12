import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES, STATUSES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import ActivityRoutesButton from '@Routes/activity/activity-routes-button/activity-routes-button';
import ActivitySettingsButton from '@Routes/activity/activity-settings/activity-settings-button/activity-settings-button';
import { ACTIVITY_SETTINGS } from '@Routes/activity/activity-settings/const';
import CloseBtn from '@Routes/activity/close-btn/close-btn';
import ActivityErrorMsg from '@Routes/activity/error-msg/error-msg';
import IconChooseSport from '@Routes/activity/icon-choose-sport/icon-choose-sport';
import Map from '@Routes/activity/map/map';
import Metrics from '@Routes/activity/metrics/metrics';
import NavigationProvider from '@Routes/activity/navigation/navigation-provider/navigation-provider';
import PauseBtn from '@Routes/activity/pause-btn/pause-btn';
import ShowMapBtn from '@Routes/activity/show-map-btn/show-map-btn';
import StartBtn from '@Routes/activity/start-btn/start-btn';
import { IOS_HEADER_ITEM_SPACING, IOS_HEADER_ITEM_WIDTH_PROPS } from '@S/header-toolbar-const';
import useActivityTrackingLifecycle from './use-activity-tracking-lifecycle';

export default function Activity() {
  const { colors } = useTheme();
  const { activityStatus, isMapVisible } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ settings }) => settings);
  const { push } = useRouter();
  const [isLocationReadyForRecording, setIsLocationReadyForRecording] = useState(false);
  const [isTrackingActionInProgress, setIsTrackingActionInProgress] = useState(false);
  const openActivitySettings = useRef<() => void>(() => {});
  const { isLocationLoading } = useActivityTrackingLifecycle(isLocationReadyForRecording);
  const labels = LABELS[language];

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: isMapVisible,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: isMapVisible ? 'transparent' : colors.surfaceVariant },
          headerBackVisible: Platform.OS === 'ios' ? false : undefined,
          headerLeft: Platform.OS === 'ios' ? undefined : () => <CloseBtn />,
          headerUserInterfaceStyle: Platform.OS === 'ios' ? 'light' : undefined,
          headerRight:
            Platform.OS === 'ios'
              ? undefined
              : () => (
                  <View style={styles.headerActions}>
                    <ActivityRoutesButton />
                    <ActivitySettingsButton />
                  </View>
                ),
          unstable_headerLeftItems:
            Platform.OS === 'ios'
              ? () => [{ type: 'custom', element: <CloseBtn />, hidesSharedBackground: true }]
              : undefined,
        }}>
        {Platform.OS === 'ios' ? (
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="map"
              accessibilityLabel={labels.routes}
              onPress={() => push(`/${ROUTES.routes}`)}
            />
            <Stack.Toolbar.Spacer width={IOS_HEADER_ITEM_SPACING} />
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="gearshape"
              accessibilityLabel={ACTIVITY_SETTINGS[language].open}
              onPress={() => openActivitySettings.current()}
            />
          </Stack.Toolbar>
        ) : null}
      </Stack.Screen>
      {Platform.OS === 'ios' ? <ActivitySettingsButton openRef={openActivitySettings} showTrigger={false} /> : null}
      <NavigationProvider isLocationReady={isLocationReadyForRecording}>
        <SafeAreaView style={[styles.layout, { backgroundColor: colors.surfaceVariant }]} edges={['bottom']}>
          <View style={styles.map}>
            <View
              testID="activity-map-layer"
              style={[styles.mapLayer, !isMapVisible && styles.hiddenMapLayer]}
              pointerEvents={isMapVisible ? 'auto' : 'none'}>
              <Map onLocationReadinessChange={setIsLocationReadyForRecording} />
            </View>
            {activityStatus !== STATUSES.initial ? (
              <>
                <ActivityErrorMsg />
                <Metrics />
              </>
            ) : null}
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
      </NavigationProvider>
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
    height: Platform.OS === 'ios' ? '83%' : '78%',
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
    height: Platform.OS === 'ios' ? '17%' : '22%',
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 4,
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
