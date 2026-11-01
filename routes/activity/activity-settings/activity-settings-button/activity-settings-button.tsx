import { useRef } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { IOS_ACTIVITY_HEADER_ICON_COLOR } from '@Routes/activity/const';
import { getMapControlButtonStyle } from '@S/map-control-button/const';
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
        <IconButton
          testID="activity-settings-button"
          mode="contained-tonal"
          icon="cogs"
          iconColor={colors.onSurface}
          containerColor={colors.surface}
          size={24}
          style={getMapControlButtonStyle(40, colors.surface, colors.outlineVariant)}
          onPress={openActivitySettings}
          accessibilityLabel={ACTIVITY_SETTINGS[language].open}
        />
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
