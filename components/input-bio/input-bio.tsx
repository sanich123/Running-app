import { useContext } from 'react';
import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { SaveSettingsContext } from '../../utils/context/settings';

export default function InputBio() {
  const { bio, setBio, isDisabled } = useContext(SaveSettingsContext);
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  return (
    <TextInput
      testID="inputBio"
      mode="outlined"
      style={{ width: 365 }}
      label="Bio"
      placeholder="Type a few words about yourself"
      multiline
      numberOfLines={4}
      value={bio}
      onChangeText={(bio) => setBio(bio)}
      disabled={isDisabled || isDisabledWhileSendingProfile}
    />
  );
}
