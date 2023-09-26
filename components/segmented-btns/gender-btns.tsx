import { SaveSettingsContext } from '@u/context/settings';
import { useContext } from 'react';
import { SegmentedButtons } from 'react-native-paper';

export default function GenderBtns() {
  const { gender, isDisabled, setGender } = useContext(SaveSettingsContext);
  return (
    <SegmentedButtons
      value={gender}
      onValueChange={setGender}
      buttons={[
        {
          value: 'male',
          label: 'Male',
          icon: 'human-male',
          showSelectedCheck: true,
          disabled: isDisabled,
        },
        { value: 'female', label: 'Female', icon: 'human-female', showSelectedCheck: true, disabled: isDisabled },
        { value: 'packman', label: 'Packman', icon: 'pac-man', showSelectedCheck: true, disabled: isDisabled },
      ]}
      style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
    />
  );
}
