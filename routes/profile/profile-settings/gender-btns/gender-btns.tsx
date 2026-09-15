import { SegmentedButtons } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { GENDER_BTNS, GENDER_BTNS_VALUES } from './const';
import { useProfileFormParams, useSetProfileFormParams } from '../profile-settings-params';

export default function GenderBtns({ isDisabled }: { isDisabled: boolean }) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { gender } = useProfileFormParams();
  const { setGender } = useSetProfileFormParams();

  return (
    <SegmentedButtons
      value={gender}
      onValueChange={setGender}
      buttons={[
        {
          value: GENDER_BTNS_VALUES.male,
          label: GENDER_BTNS[language].maleLabel,
          icon: 'human-male',
          showSelectedCheck: true,
          disabled: isDisabled,
        },
        {
          value: GENDER_BTNS_VALUES.female,
          label: GENDER_BTNS[language].femaleLabel,
          icon: 'human-female',
          showSelectedCheck: true,
          disabled: isDisabled,
        },
      ]}
      style={{ width: '100%' }}
    />
  );
}
