import { useRef } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { MAP_CONTROL_BUTTON_BACKGROUND } from '@S/map-control-button/const';
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
          style={{
            alignItems: 'center',
            backgroundColor: MAP_CONTROL_BUTTON_BACKGROUND,
            borderRadius: 20,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}
          testID="activity-settings-button">
          <SymbolView name="gearshape" size={23} tintColor={colors.primary} weight="medium" />
        </Pressable>
      ) : (
        <IconButton
          testID="activity-settings-button"
          mode="contained-tonal"
          icon="cogs"
          iconColor={colors.primary}
          containerColor={MAP_CONTROL_BUTTON_BACKGROUND}
          size={24}
          style={{ margin: 0 }}
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
