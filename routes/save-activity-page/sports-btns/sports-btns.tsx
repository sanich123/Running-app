import { useRef } from 'react';
import { View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import ChooseSportModal from '@Routes/activity/choose-sport-modal/choose-sport-modal';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { SPORTS_BTNS_VALUES } from './const';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function SportsBtns({ isDisabled }: { isDisabled: boolean }) {
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { sport } = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);
  const { language } = useAppSelector(({ language }) => language);
  const { dark, colors } = useTheme();
  const chooseSportModal = useRef<BottomSheetModal>(null);

  return (
    <>
      <TouchableRipple
        testID="manual-activity-sport-picker"
        disabled={isDisabledWhileSending || isDisabled}
        style={{
          display: 'flex',
          paddingVertical: 10,
          marginTop: 10,
          borderRadius: 5,
          paddingLeft: 10,
          borderWidth: 0.4,
          borderColor: colors.onBackground,
        }}
        borderless
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        onPress={() => chooseSportModal.current?.present()}>
        <View style={{ display: 'flex', flexDirection: 'row', columnGap: 10, alignItems: 'center' }}>
          <Icon source={sport === SPORTS_BTNS_VALUES.hike ? 'hiking' : sport} size={25} />
          <Text variant="bodyMedium">{MAP_SPORT_TO_TITLE[sport][language]}</Text>
        </View>
      </TouchableRipple>
      <ChooseSportModal chooseSportModalRef={chooseSportModal} />
    </>
  );
}
