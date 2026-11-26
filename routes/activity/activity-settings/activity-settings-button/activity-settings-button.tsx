import { useCallback, useEffect, useRef } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import {
  ANDROID_ACTIVITY_HEADER_BACKGROUND_COLOR,
  ANDROID_ACTIVITY_HEADER_ICON_COLOR,
  ANDROID_ACTIVITY_HEADER_OUTLINE_COLOR,
  ACTIVITY_HEADER_BUTTON_SIZE,
  IOS_ACTIVITY_HEADER_ICON_COLOR,
  getActivityHeaderButtonStyle,
  isActivityHeaderButtonTap,
} from '@Routes/activity/const';
import ActivityLocationInfoModal from '../activity-location-info-modal/activity-location-info-modal';
import ActivitySettings from '../activity-settings';
import { ACTIVITY_SETTINGS } from '../const';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function ActivitySettingsButton({
  openRef,
  showTrigger = true,
}: {
  openRef?: { current: () => void };
  showTrigger?: boolean;
}) {
  const { language } = useAppSelector(({ settings }) => settings);
  const activitySettingsModalRef = useRef<BottomSheetModal>(null);
  const activityLocationInfoModalRef = useRef<BottomSheetModal>(null);
  const openActivitySettings = useCallback(() => activitySettingsModalRef.current?.present(), []);

  useEffect(() => {
    if (!openRef) return;
    openRef.current = openActivitySettings;
    return () => {
      openRef.current = () => {};
    };
  }, [openActivitySettings, openRef]);

  return (
    <>
      {showTrigger && Platform.OS === 'ios' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ACTIVITY_SETTINGS[language].open}
          onPress={openActivitySettings}
          style={styles.iosHeaderButton}
          testID="activity-settings-button">
          <SymbolView name="gearshape" size={24} tintColor={IOS_ACTIVITY_HEADER_ICON_COLOR} weight="medium" />
        </Pressable>
      ) : showTrigger ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ACTIVITY_SETTINGS[language].open}
          android_ripple={{ color: ANDROID_ACTIVITY_HEADER_OUTLINE_COLOR, radius: ACTIVITY_HEADER_BUTTON_SIZE / 2 }}
          onPress={(event) => {
            if (isActivityHeaderButtonTap(event)) {
              openActivitySettings();
            }
          }}
          style={getActivityHeaderButtonStyle(
            ANDROID_ACTIVITY_HEADER_BACKGROUND_COLOR,
            ANDROID_ACTIVITY_HEADER_OUTLINE_COLOR,
          )}
          testID="activity-settings-button">
          <Icon source="cogs" size={24} color={ANDROID_ACTIVITY_HEADER_ICON_COLOR} />
        </Pressable>
      ) : null}
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
