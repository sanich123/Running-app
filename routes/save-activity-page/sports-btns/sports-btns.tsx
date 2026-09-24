import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { useAppSelector } from '@R/typed-hooks';
import ChooseSportModal from '@S/choose-sport-modal/choose-sport-modal';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function SportsBtns() {
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { sport } = useManualActivityParams();
  const { setSport } = useSetManualActivityParams();
  const { dark, colors } = useTheme();
  const chooseSportModal = useRef<BottomSheetModal>(null);
  const isSportPickerDisabled = isSavingDisabled;

  return (
    <>
      <TouchableRipple
        testID="manual-activity-sport-picker"
        disabled={isSportPickerDisabled}
        style={[
          styles.button,
          { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
          isSportPickerDisabled && styles.disabledButton,
        ]}
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        onPress={() => chooseSportModal.current?.present()}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Icon source={sport === SPORTS_BTNS_VALUES.hike ? 'hiking' : sport} size={22} color={colors.onPrimary} />
          </View>
          <Text variant="titleSmall" style={{ color: colors.onPrimaryContainer, flex: 1 }}>
            {MAP_SPORT_TO_TITLE[sport][language]}
          </Text>
          <Icon source="check-circle" size={24} color={colors.primary} />
        </View>
      </TouchableRipple>
      <ChooseSportModal
        chooseSportModalRef={chooseSportModal}
        isDisabled={isSportPickerDisabled}
        selectedSport={sport}
        onSportChange={setSport}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 56,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 10,
  },
  iconContainer: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  disabledButton: { opacity: 0.7 },
});
