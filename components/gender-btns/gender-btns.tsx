import { useAppSelector } from '@R/typed-hooks';
import { SegmentedButtons } from 'react-native-paper';

import { GENDER_BTNS, GENDER_BTNS_VALUES, GenderBtnsProps } from './const';

export default function GenderBtns({ gender, isDisabled, setGender }: GenderBtnsProps) {
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  return (
    <SegmentedButtons
      value={gender}
      onValueChange={(gender: GENDER_BTNS_VALUES) => setGender(gender)}
      buttons={[
        {
          value: GENDER_BTNS_VALUES.male,
          label: GENDER_BTNS[language].maleLabel,
          icon: 'human-male',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
        {
          value: GENDER_BTNS_VALUES.female,
          label: GENDER_BTNS[language].femaleLabel,
          icon: 'human-female',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
        {
          value: GENDER_BTNS_VALUES.packman,
          label: GENDER_BTNS[language].packmanLabel,
          icon: 'pac-man',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
      ]}
      style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
    />
  );
}
