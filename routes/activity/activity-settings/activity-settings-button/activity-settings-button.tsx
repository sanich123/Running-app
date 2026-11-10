import { useRef } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import {
  ACTIVITY_HEADER_BUTTON_SIZE,
  IOS_ACTIVITY_HEADER_ICON_COLOR,
  getActivityHeaderButtonStyle,
  isActivityHeaderButtonTap,
} from '@Routes/activity/const';
import ActivityLocationInfoModal from '../activity-location-info-modal/activity-location-info-modal';
import ActivitySettings from '../activity-settings';
import { ACTIVITY_SETTINGS } from '../const';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function ActivitySettingsButton() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const activitySettingsModalRef = useRef<BottomSheetModal>(null);
  const activityLocationInfoModalRef = useRef<BottomSheetModal>(null);
  const openActivitySettings = () => activitySettingsModalRef.current?.present();

  return (
    <>
      {Platform.OS === 'ios' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ACTIVITY_SETTINGS[language].open}
          onPress={openActivitySettings}
          style={styles.iosHeaderButton}
          testID="activity-settings-button">
          <SymbolView name="gearshape" size={23} tintColor={IOS_ACTIVITY_HEADER_ICON_COLOR} weight="medium" />
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ACTIVITY_SETTINGS[language].open}
          android_ripple={{ color: colors.onSurface, radius: ACTIVITY_HEADER_BUTTON_SIZE / 2 }}
          onPress={(event) => {
            if (isActivityHeaderButtonTap(event)) {
              openActivitySettings();
            }
          }}
          style={getActivityHeaderButtonStyle(colors.surface, colors.outlineVariant)}
          testID="activity-settings-button">
          <Icon source="cogs" size={24} color={colors.onSurface} />
        </Pressable>
      )}
      <ActivitySettings
        settingsModalRef={activitySettingsModalRef}
        locationInfoModalRef={activityLocationInfoModalRef}
      />
      <ActivityLocationInfoModal modalRef={activityLocationInfoModalRef} />
    </>
  );
}

const styles = StyleSheet.create({
  iosHeaderButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
});
