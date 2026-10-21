import { useRef } from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import ActivityLocationInfoModal from '../activity-location-info-modal/activity-location-info-modal';
import ActivitySettings from '../activity-settings';
import { ACTIVITY_SETTINGS } from '../const';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function ActivitySettingsButton() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const activitySettingsModalRef = useRef<BottomSheetModal>(null);
  const activityLocationInfoModalRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <IconButton
        testID="activity-settings-button"
        mode="contained-tonal"
        icon="cogs"
        iconColor={colors.primary}
        containerColor={colors.surface}
        size={24}
        onPress={() => activitySettingsModalRef.current?.present()}
        accessibilityLabel={ACTIVITY_SETTINGS[language].open}
      />
      <ActivitySettings
        settingsModalRef={activitySettingsModalRef}
        locationInfoModalRef={activityLocationInfoModalRef}
      />
      <ActivityLocationInfoModal modalRef={activityLocationInfoModalRef} />
    </>
  );
}
