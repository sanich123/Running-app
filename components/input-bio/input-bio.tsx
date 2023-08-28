import { useContext } from 'react';
import { TextInput } from 'react-native-paper';

import { SaveSettingsContext } from '../../utils/context/settings';

export default function InputBio() {
  const { bio, setBio, isDisabled } = useContext(SaveSettingsContext);
  return (
    <TextInput
      mode="outlined"
      style={{ width: 365 }}
      label="Bio"
      placeholder="Type a few words about yourself"
      multiline
      numberOfLines={4}
      value={bio}
      onChangeText={(bio) => setBio(bio)}
      disabled={isDisabled}
    />
  );
}
