import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { useAppSelector } from '@R/typed-hooks';
import ChooseSportModal from '@S/choose-sport-modal/choose-sport-modal';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function SportsBtns({ isDisabled }: { isDisabled: boolean }) {
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const { sport } = useManualActivityParams();
  const { setSport } = useSetManualActivityParams();
  const { dark, colors } = useTheme();
  const chooseSportModal = useRef<BottomSheetModal>(null);
  const isSportPickerDisabled = isDisabledWhileSending || isDisabled;

  return (
    <>
      <TouchableRipple
        testID="manual-activity-sport-picker"
        disabled={isSportPickerDisabled}
        style={[
          styles.button,
          { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
          isSportPickerDisabled && styles.disabledButton,
        ]}
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        onPress={() => chooseSportModal.current?.present()}>
        <View style={styles.content}>
          <Icon source={sport === SPORTS_BTNS_VALUES.hike ? 'hiking' : sport} size={25} color={colors.onSurface} />
          <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
            {MAP_SPORT_TO_TITLE[sport][language]}
          </Text>
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
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 42,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  disabledButton: { opacity: 0.7 },
});
