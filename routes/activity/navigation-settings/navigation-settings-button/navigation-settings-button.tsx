import { useState } from 'react';
import { BottomSheet, Host } from '@expo/ui';
import { SymbolView } from 'expo-symbols';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Icon, Switch, Text, TouchableRipple, useTheme } from 'react-native-paper';
import {
  setNavigationAlertDistanceMeters,
  setNavigationAlertRepeatIntervalMinutes,
  setNavigationAlertsMuted,
} from '@R/slices/settings/settings';
import {
  getNavigationAlertDistanceMeters,
  getNavigationAlertRepeatIntervalMinutes,
  MAX_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES,
  MIN_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES,
} from '@R/slices/settings/types';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import MapControlButton from '@S/map-control-button/map-control-button';
import { NAVIGATION_SETTINGS_COPY } from '../const';

export default function NavigationSettingsButton() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { language, navigationAlertDistanceMeters, navigationAlertRepeatIntervalMinutes, navigationAlertsMuted } =
    useAppSelector(({ settings }) => settings);
  const [isPresented, setIsPresented] = useState(false);
  const labels = NAVIGATION_SETTINGS_COPY[language];
  const alertDistance = getNavigationAlertDistanceMeters(navigationAlertDistanceMeters);
  const repeatInterval = getNavigationAlertRepeatIntervalMinutes(navigationAlertRepeatIntervalMinutes);

  return (
    <>
      <MapControlButton
        testID="activity-navigation-settings-button"
        androidIcon="cogs"
        iosSymbol="gearshape"
        accessibilityLabel={labels.open}
        onPress={() => setIsPresented(true)}
      />
      <Host>
        <BottomSheet
          isPresented={isPresented}
          onDismiss={() => setIsPresented(false)}
          snapPoints={[{ fraction: 0.58 }]}
          contentPadding={0}
          containerColor={colors.surface}
          testID="activity-navigation-settings-sheet">
          <ScrollView contentContainerStyle={styles.content}>
            <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
              {labels.title}
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                  {labels.distanceTitle}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {labels.distanceDescription}
                </Text>
              </View>
              <View style={styles.stepperControl}>
                <TouchableRipple
                  accessibilityLabel={labels.decreaseDistance}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: alertDistance <= 10 }}
                  disabled={alertDistance <= 10}
                  onPress={() => dispatch(setNavigationAlertDistanceMeters(Math.max(10, alertDistance - 10)))}
                  style={[styles.stepperButton, { backgroundColor: colors.surfaceVariant }]}
                  rippleColor={colors.primaryContainer}
                  testID="decrease-navigation-alert-distance">
                  <View style={styles.stepperButtonContent}>
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
                  style={[styles.stepperValue, { color: colors.onSurface }]}>
                  {alertDistance} {labels.meters}
                </Text>
                <TouchableRipple
                  accessibilityLabel={labels.increaseDistance}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: alertDistance >= 200 }}
                  disabled={alertDistance >= 200}
                  onPress={() => dispatch(setNavigationAlertDistanceMeters(Math.min(200, alertDistance + 10)))}
                  style={[styles.stepperButton, { backgroundColor: colors.surfaceVariant }]}
                  rippleColor={colors.primaryContainer}
                  testID="increase-navigation-alert-distance">
                  <View style={styles.stepperButtonContent}>
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
            <View style={styles.settingRow}>
              <Text variant="titleSmall" style={[styles.settingCopy, { color: colors.onSurface }]}>
                {labels.repeatTitle}
              </Text>
              <View style={styles.stepperControl}>
                <TouchableRipple
                  accessibilityLabel={labels.decreaseInterval}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: repeatInterval <= MIN_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES }}
                  disabled={repeatInterval <= MIN_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES}
                  onPress={() => dispatch(setNavigationAlertRepeatIntervalMinutes(repeatInterval - 1))}
                  style={[styles.stepperButton, { backgroundColor: colors.surfaceVariant }]}
                  rippleColor={colors.primaryContainer}
                  testID="decrease-navigation-alert-interval">
                  <View style={styles.stepperButtonContent}>
                    {Platform.OS === 'ios' ? (
                      <SymbolView name="minus" size={18} tintColor={colors.onSurfaceVariant} />
                    ) : (
                      <Icon source="minus" size={18} color={colors.onSurfaceVariant} />
                    )}
                  </View>
                </TouchableRipple>
                <Text
                  testID="navigation-alert-repeat-interval-value"
                  variant="titleSmall"
                  style={[styles.stepperValue, { color: colors.onSurface }]}>
                  {repeatInterval} {labels.minutes}
                </Text>
                <TouchableRipple
                  accessibilityLabel={labels.increaseInterval}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: repeatInterval >= MAX_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES }}
                  disabled={repeatInterval >= MAX_NAVIGATION_ALERT_REPEAT_INTERVAL_MINUTES}
                  onPress={() => dispatch(setNavigationAlertRepeatIntervalMinutes(repeatInterval + 1))}
                  style={[styles.stepperButton, { backgroundColor: colors.surfaceVariant }]}
                  rippleColor={colors.primaryContainer}
                  testID="increase-navigation-alert-interval">
                  <View style={styles.stepperButtonContent}>
                    {Platform.OS === 'ios' ? (
                      <SymbolView name="plus" size={18} tintColor={colors.onSurfaceVariant} />
                    ) : (
                      <Icon source="plus" size={18} color={colors.onSurfaceVariant} />
                    )}
                  </View>
                </TouchableRipple>
              </View>
            </View>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {labels.repeatDescription}
            </Text>
            <Divider />
            <View style={styles.voiceAlertsSetting}>
              <View style={styles.voiceAlertsRow}>
                <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                  {labels.voiceAlertsTitle}
                </Text>
                <Switch
                  accessibilityLabel={labels.voiceAlertsTitle}
                  color={colors.primary}
                  value={!navigationAlertsMuted}
                  onValueChange={(enabled) => {
                    dispatch(setNavigationAlertsMuted(!enabled));
                  }}
                  testID="navigation-alerts-enabled"
                />
              </View>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {labels.voiceAlertsDescription}
              </Text>
            </View>
          </ScrollView>
        </BottomSheet>
      </Host>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 20, paddingBottom: 36 },
  settingCopy: { flex: 1 },
  settingRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  stepperButton: { borderRadius: 18, height: 36, overflow: 'hidden', width: 36 },
  stepperButtonContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  stepperControl: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  stepperValue: { minWidth: 42, textAlign: 'center' },
  voiceAlertsRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  voiceAlertsSetting: { gap: 4 },
});
