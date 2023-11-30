import { useAuth } from '@A/context/auth-context';
import { saveBio } from '@R/profile/profile';
import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';

import { INPUT_BIO, INPUT_BIO_TEST_ID } from './const';

export default function InputBio({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { data: profileInfo } = useGetUserProfileByIdQuery(`${user?.id}`);
  const [bio, setBio] = useState(profileInfo?.bio);
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TextInput
      testID={INPUT_BIO_TEST_ID}
      mode="outlined"
      style={{ width: '93%' }}
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
