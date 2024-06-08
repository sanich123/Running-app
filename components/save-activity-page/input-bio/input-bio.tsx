import { saveBio } from '@R/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';

import { INPUT_BIO, INPUT_BIO_TEST_ID } from './const';

export default function InputBio({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSendingProfile, settings } = useAppSelector(({ profile }) => profile);
  const [bio, setBio] = useState(settings?.bio);

  return (
    <TextInput
      testID={INPUT_BIO_TEST_ID}
      mode="outlined"
      style={{ width: '100%' }}
      label={INPUT_BIO[language].label}
      placeholder={INPUT_BIO[language].placeholder}
      multiline
      numberOfLines={4}
      value={bio}
      onChangeText={(bio) => {
        setBio(bio);
        dispatch(saveBio(bio));
      }}
      disabled={isDisabled || isDisabledWhileSendingProfile}
    />
  );
}
