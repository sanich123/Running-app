import { useContext } from 'react';
import { SegmentedButtons } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { SaveSettingsContext } from '../../utils/context/settings';

export default function GenderBtns() {
  const { gender, isDisabled, setGender } = useContext(SaveSettingsContext);
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  return (
    <SegmentedButtons
      value={gender}
      onValueChange={(gender) => setGender(gender)}
      buttons={[
        {
          value: 'male',
          label: 'Male',
          icon: 'human-male',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
        {
          value: 'female',
          label: 'Female',
          icon: 'human-female',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
        {
          value: 'packman',
          label: 'Packman',
          icon: 'pac-man',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
      ]}
      style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
    />
  );
}
