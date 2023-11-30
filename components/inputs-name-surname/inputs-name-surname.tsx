import { useAuth } from '@A/context/auth-context';
import { saveName, saveSurname } from '@R/profile/profile';
import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

import { NAME_SURNAME, NAME_TEST_ID, SURNAME_TEST_ID } from './const';

export default function InputsNameSurname({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { data: profileInfo } = useGetUserProfileByIdQuery(`${user?.id}`);
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const [name, setName] = useState(profileInfo?.name);
  const [surname, setSurname] = useState(profileInfo?.surname);

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID={NAME_TEST_ID}
        mode="outlined"
        style={{ width: '50%' }}
        label={NAME_SURNAME[language].nameLabel}
        placeholder={NAME_SURNAME[language].namePlaceholder}
        value={name}
        onChangeText={(name) => {
          setName(name);
          dispatch(saveName(name));
        }}
        disabled={isDisabled || isDisabledWhileSendingProfile}
      />
      <TextInput
        testID={SURNAME_TEST_ID}
        mode="outlined"
        style={{ width: '50%' }}
        label={NAME_SURNAME[language].surnameLabel}
        placeholder={NAME_SURNAME[language].surnamePlaceholder}
        value={surname}
        onChangeText={(surname) => {
          setSurname(surname);
          dispatch(saveSurname(surname));
        }}
        disabled={isDisabled || isDisabledWhileSendingProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 15,
    marginRight: 15,
  },
});
