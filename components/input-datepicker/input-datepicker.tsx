import { useContext } from 'react';
import { View } from 'react-native';
import { DatePickerInput } from 'react-native-paper-dates';

import { SaveSettingsContext } from '../../utils/context/settings';

export default function InputDatepicker() {
  const { birthday, setBirthday, isDisabled } = useContext(SaveSettingsContext);

  return (
    <View style={{ width: '100%', paddingRight: 15, paddingLeft: 15 }}>
      <DatePickerInput
        locale="en-GB"
        label="Birthdate"
        value={birthday}
        onChange={(date) => setBirthday(date)}
        inputMode="start"
        mode="outlined"
        disabled={isDisabled}
      />
    </View>
  );
}
