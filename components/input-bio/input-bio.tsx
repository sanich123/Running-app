import { useAppSelector } from '@R/typed-hooks';
import { TextInput } from 'react-native-paper';

import { INPUT_BIO, INPUT_BIO_TEST_ID, InputBioProps } from './const';

export default function InputBio({ bio, setBio, isDisabled }: InputBioProps) {
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  return (
    <TextInput
      testID={INPUT_BIO_TEST_ID}
      mode="outlined"
      style={{ width: 365 }}
      label={INPUT_BIO[language].label}
      placeholder={INPUT_BIO[language].placeholder}
      multiline
      numberOfLines={4}
      value={bio}
      onChangeText={(bio) => setBio(bio)}
      disabled={isDisabled || isDisabledWhileSendingProfile}
    />
  );
}
