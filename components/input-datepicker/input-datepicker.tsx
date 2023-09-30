import { useContext } from 'react';
import { View } from 'react-native';
import { DatePickerInput } from 'react-native-paper-dates';
import { useDispatch, useSelector } from 'react-redux';

import { saveBirthday } from '../../redux/profile/profile';
import { SaveSettingsContext } from '../../utils/context/settings';

export default function InputDatepicker() {
  const { birthday, setBirthday, isDisabled } = useContext(SaveSettingsContext);
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  return (
    <View style={{ width: '100%', paddingRight: 15, paddingLeft: 15 }}>
      <DatePickerInput
        locale="en-GB"
        label="Birthdate"
        value={birthday}
        onChange={(date) => setBirthday(date)}
        inputMode="start"
        mode="outlined"
        disabled={isDisabled || isDisabledWhileSendingProfile}
      />
    </View>
  );
}
