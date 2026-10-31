import { useCallback, useRef } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import { SymbolView } from 'expo-symbols';
import { KeyboardAwareScrollView, type KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { Platform, StyleSheet, View } from 'react-native';
import { Divider, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { setNavigationAlertDistanceMeters } from '@R/slices/settings/settings';
import { getNavigationAlertDistanceMeters } from '@R/slices/settings/types';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_SETTINGS } from './const';
import RemindersSettings from './reminders-settings/reminders-settings';
import VoiceSettings from './voice-settings/voice-settings';
import type { ActivitySettingsProps } from './types';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export default function ActivitySettings({
  settingsModalRef,
  locationInfoModalRef: providedLocationInfoModalRef,
}: ActivitySettingsProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { language, navigationAlertDistanceMeters } = useAppSelector(({ settings }) => settings);
  const settingsScrollViewRef = useRef<KeyboardAwareScrollViewRef>(null);
  const fallbackLocationInfoModalRef = useRef<BottomSheetModal>(null);
  const locationInfoModalRef = providedLocationInfoModalRef ?? fallbackLocationInfoModalRef;
  const labels = ACTIVITY_SETTINGS[language];
  const routeAlertDistance = getNavigationAlertDistanceMeters(navigationAlertDistanceMeters);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );

  const scrollToReminderFields = useCallback(() => {
    const scrollToEnd = () => settingsScrollViewRef.current?.scrollTo({ y: 10000, animated: true });

    requestAnimationFrame(() => {
      scrollToEnd();
      requestAnimationFrame(scrollToEnd);
    });
  }, []);

  return (
    <BottomSheetModal
      ref={settingsModalRef}
      index={0}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      <KeyboardAwareScrollView
        ref={settingsScrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        mode="layout"
        bottomOffset={24}
        ScrollViewComponent={BottomSheetScrollView as never}>
        <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
          {labels.title}
        </Text>

        <View style={styles.navigationAlertRow}>
          <View style={styles.rowCopy}>
            <Text variant="titleSmall" style={{ color: colors.onSurface }}>
              {labels.navigationAlertTitle}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {labels.navigationAlertDescription}
            </Text>
          </View>
          <View style={styles.distanceControl}>
            <TouchableRipple
              accessibilityLabel={labels.navigationAlertDistanceDecrease}
              accessibilityRole="button"
              accessibilityState={{ disabled: routeAlertDistance <= 10 }}
              disabled={routeAlertDistance <= 10}
              onPress={() => dispatch(setNavigationAlertDistanceMeters(Math.max(10, routeAlertDistance - 10)))}
              style={[styles.distanceButton, { backgroundColor: colors.surfaceVariant }]}
              rippleColor={colors.primaryContainer}>
              <View style={styles.distanceButtonContent}>
                {Platform.OS === 'ios' ? (
                  <SymbolView name="minus" size={18} tintColor={colors.onSurfaceVariant} />
                ) : (
                  <Icon source="minus" size={18} color={colors.onSurfaceVariant} />
                )}
              </View>
            </TouchableRipple>
            <Text
              testID="navigation-alert-distance-value"
              variant="titleSmall"
              style={[styles.distanceValue, { color: colors.onSurface }]}>
              {routeAlertDistance} {labels.meters}
            </Text>
            <TouchableRipple
              accessibilityLabel={labels.navigationAlertDistanceIncrease}
              accessibilityRole="button"
              accessibilityState={{ disabled: routeAlertDistance >= 200 }}
              disabled={routeAlertDistance >= 200}
              onPress={() => dispatch(setNavigationAlertDistanceMeters(Math.min(200, routeAlertDistance + 10)))}
              style={[styles.distanceButton, { backgroundColor: colors.surfaceVariant }]}
              rippleColor={colors.primaryContainer}>
              <View style={styles.distanceButtonContent}>
                {Platform.OS === 'ios' ? (
                  <SymbolView name="plus" size={18} tintColor={colors.onSurfaceVariant} />
                ) : (
                  <Icon source="plus" size={18} color={colors.onSurfaceVariant} />
                )}
              </View>
            </TouchableRipple>
          </View>
        </View>
        <Divider />
        <VoiceSettings />
        <Divider />
        <RemindersSettings scrollToReminderFields={scrollToReminderFields} />
        <Divider />
        <TouchableRipple
          testID="activity-location-info-button"
          borderless
          onPress={() => locationInfoModalRef.current?.present()}
          style={styles.locationInfoRow}>
          <View style={styles.locationInfoRowContent}>
            <View style={styles.rowCopy}>
              <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                {labels.locationTrackingInfoTitle}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {labels.locationTrackingInfoDescription}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </View>
        </TouchableRipple>
      </KeyboardAwareScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, padding: 20, paddingBottom: 36 },
  locationInfoRow: { borderRadius: 12, overflow: 'hidden' },
  locationInfoRowContent: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: 8 },
  navigationAlertRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: 4 },
  distanceControl: { alignItems: 'center', flexDirection: 'row', gap: 0 },
  distanceButton: { borderRadius: 18, height: 36, overflow: 'hidden', width: 36 },
  distanceButtonContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  distanceValue: { minWidth: 42, textAlign: 'center' },
  rowCopy: { flex: 1, gap: 2 },
});
